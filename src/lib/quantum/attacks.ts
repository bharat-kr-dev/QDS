import { StateVector } from './statevector';
import type { Rng } from './prng';
import { sampleIndex } from './prng';
import { BASIS_LABELS } from './types';
import type {
  AttackConfig,
  BasisType,
  DecoyStateData,
  ForgeryStrategy,
} from './types';
import { computeQber, type QberReport, type StateMixture } from '../security/qber';
import {
  CHANNEL_LOSS,
  DECOY_SIGNAL_INTENSITY,
  DECOY_WEAK_INTENSITY,
  PHASE_ANGLES,
  REPLAY_WINDOW_SECONDS,
} from '../config';

/*
  What an adversary can actually do to a teleported signature.

  Every attack here except the replay returns the state Bob receives; the
  error rate is then measured by the same function verification uses. No
  branch of this file computes its own error rate, because two formulas that
  are supposed to agree eventually will not, and the discrepancy shows up as
  a page contradicting the page beside it.

  The one attack that returns a mixture rather than a single state is
  intercept-resend, and necessarily so: the adversary draws a random outcome
  and prepares from it, so what arrives at Bob is one branch of a
  distribution, not a definite state. Averaging the branches analytically
  gives the rate Bob would measure; sampling would make the number jitter
  from render to render.
*/

/** Branches used to discretise the continuous phase-diffusion distribution. */
const NOISE_SAMPLES = 16;

/** Terms kept in the Poisson sums. Beyond this the weights are negligible. */
const POISSON_TERMS = 14;

/** Optical misalignment floor, in percent — the error a clean link still shows. */
const MISALIGNMENT_QBER = 1.2;

export interface AttackBranch {
  probability: number;
  state: StateVector;
  label: string;
  basis?: BasisType;
  outcome?: 0 | 1;
}

/**
 * Bob's qubit at the two moments an adversary can reach it.
 *
 * The distinction matters and is not cosmetic. An adversary who intercepts
 * the qubit in transit acts *before* Bob applies his correction — so her
 * damage is passed through the correction along with everything else. An
 * adversary who presents a complete forged packet acts *after*, because she
 * is not participating in the protocol at all.
 *
 * Getting this wrong is not a rounding error. A forgery that substitutes
 * X|ψ⟩ for |ψ⟩ is restored perfectly by a correction of X, so a forgery
 * staged on the wrong side of the correction vanishes whenever the syndrome
 * happens to invert it.
 */
export interface ChannelState {
  /** Immediately after Alice's measurement, before the correction. */
  intermediate: StateVector;
  /** After the correction — the signature the verifier examines. */
  final: StateVector;
}

/** Which side of Bob's correction an attack takes effect on. */
export type AttackStage = 'intermediate' | 'final';

export interface AttackSimulation {
  config: AttackConfig;
  /** The state Alice meant to transmit. */
  intended: StateVector;
  /** Everything Bob might receive, weighted. */
  received: StateMixture;
  /** Most probable branch — the one drawn on the Bloch sphere. */
  representative: StateVector;
  /** Weighted fidelity Σ pᵢ |⟨ψ|φᵢ⟩|². */
  fidelity: number;
  /** The full branch list, when the attack admitted more than one. */
  branches: AttackBranch[];
  /**
   * Where this attack took hold. `intermediate` means the caller must still
   * apply the correction to `received`; `final` means `received` is already
   * the finished signature.
   */
  stage: AttackStage;
  /** What the adversary did, if she did anything observable. */
  eve?: {
    basis: BasisType;
    outcome: 0 | 1;
    outcomeLabel: string;
    /** True when the basis was drawn at random rather than fixed. */
    basisWasRandom: boolean;
  };
  report: QberReport;
  /** One line: the mechanism. */
  mechanism: string;
  /** One line: what a defender would notice. */
  observation: string;
}

/** Box–Muller. Consumes two draws from the caller's stream. */
function gaussian(rng: Rng): number {
  let u = rng();
  while (u <= Number.EPSILON) u = rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Fidelity between a pure state and a mixture: F = ⟨ψ|ρ|ψ⟩ = Σ pᵢ|⟨ψ|φᵢ⟩|².
 */
function mixtureFidelity(expected: StateVector, mixture: StateMixture): number {
  let f = 0;
  for (const { probability, state } of mixture.branches) {
    f += probability * expected.fidelity(state);
  }
  return Math.min(1, Math.max(0, f));
}

/** The eigenstate a projective measurement in `basis` collapses to. */
function eigenstate(basis: BasisType, outcome: 0 | 1): StateVector {
  if (basis === 'Z') return outcome === 0 ? StateVector.zero() : StateVector.one();
  if (basis === 'X') return outcome === 0 ? StateVector.plus() : StateVector.minus();
  return outcome === 0 ? StateVector.plusI() : StateVector.minusI();
}

/**
 * The state orthogonal to `state`: |ψ⊥⟩ = −β*|0⟩ + α*|1⟩.
 *
 * Not to be confused with X|ψ⟩, which is a different state entirely. X is
 * only the orthogonal partner for states along the Z axis — for |+⟩ it is
 * the identity, so a forgery built on it would reproduce the original
 * exactly and report no error at all.
 */
function orthogonalTo(state: StateVector): StateVector {
  const [alpha, beta] = state.amplitudes;
  return new StateVector([beta.conj().neg(), alpha.conj()]);
}

function outcomeLabel(basis: BasisType, outcome: 0 | 1): string {
  const labels = BASIS_LABELS[basis];
  return outcome === 0 ? labels.zero : labels.one;
}

/** The three bases an adversary without prior knowledge would consider. */
const ALL_BASES: readonly BasisType[] = ['Z', 'X', 'Y'];

/**
 * Intercept-resend, enumerated exactly.
 *
 * When the intercept basis is left random, Eve succeeds in guessing the
 * receiver's basis one time in three, and on the other two she prepares an
 * eigenstate of a basis the receiver is not measuring in. That leaves the
 * receiver maximally uncertain, so the error rate is far above the bound.
 *
 * Note the case that surprises people: against an eigenstate, an adversary
 * who happens to measure in the matching basis learns the state and disturbs
 * nothing at all. That is a real result, not a bug — the strategy is silent
 * by luck, not by stealth, and repeating it exposes it.
 */
function interceptResend(
  intended: StateVector,
  config: AttackConfig,
  rng: Rng,
): { branches: AttackBranch[]; mechanism: string; observation: string } {
  const basisWasRandom = config.interceptBasis === 'RANDOM' || !config.interceptBasis;
  const candidates: readonly BasisType[] = basisWasRandom ? ALL_BASES : [config.interceptBasis as BasisType];

  const branches: AttackBranch[] = [];

  for (const basis of candidates) {
    const p = intended.basisProbabilities(basis);
    const basisWeight = 1 / candidates.length;

    for (const outcome of [0, 1] as const) {
      const prob = basisWeight * (outcome === 0 ? p.zero : p.one);
      if (prob <= 1e-12) continue;
      branches.push({
        probability: prob,
        state: eigenstate(basis, outcome),
        label: `${basis}: ${outcomeLabel(basis, outcome)}`,
        basis,
        outcome,
      });
    }
  }

  const mechanism = basisWasRandom
    ? 'Eve measures in a basis she picks at random, then prepares a fresh qubit in whatever she measured. She guesses the receiver’s basis one time in three.'
    : `Eve measures in ${config.interceptBasis}, then prepares a fresh qubit in whatever she measured. A fixed basis is a poor strategy — the receiver’s basis choices are not known in advance.`;

  // Averaging over her basis choice makes the ensemble a symmetric shrink of
  // the Bloch vector to a third of its length. The deviation along each axis
  // is therefore proportional to the component along that axis, which is why
  // a state lying near an axis can survive interception nearly intact in that
  // basis while the others betray it.
  const observation =
    'The deviation in each basis tracks the Bloch component along that axis — the ensemble is the original vector shrunk to a third. A state near an axis is barely marked in that basis and heavily marked in the others, so it is the conjugate bases that expose an interception.';

  return { branches, mechanism, observation };
}

function forge(intended: StateVector, strategy: ForgeryStrategy, rng: Rng): AttackBranch {
  if (strategy === 'orthogonal_guess') {
    // Maximally wrong: the state that shares no amplitude with the original.
    return { probability: 1, state: orthogonalTo(intended), label: 'orthogonal guess' };
  }

  if (strategy === 'phase_guess') {
    // Populations reproduced exactly, relative phase inverted. Invisible to a
    // Z-basis population check; only the conjugate bases disagree.
    const phaseFlipped = intended.applyZ();
    return { probability: 1, state: phaseFlipped, label: 'phase-inverted guess' };
  }

  // Uniform over the Bloch sphere. The average fidelity of an independent
  // guess to a fixed state is 1/2, so this is the expected cost of guessing.
  const cosTheta = 2 * rng() - 1;
  const theta = Math.acos(cosTheta);
  const phi = 2 * Math.PI * rng();
  return { probability: 1, state: StateVector.fromAngles(theta, phi), label: 'random guess' };
}

function phaseDrift(intended: StateVector, spreadRad: number, rng: Rng): AttackBranch[] {
  // Each sample is one realisation of the phase noise; equal weights make the
  // mixture stand in for the distribution. Deterministic given the seed.
  const branches: AttackBranch[] = [];
  for (let i = 0; i < NOISE_SAMPLES; i++) {
    const theta = gaussian(rng) * spreadRad;
    branches.push({
      probability: 1 / NOISE_SAMPLES,
      state: intended.applyPhase(theta),
      label: `${((theta * 180) / Math.PI).toFixed(1)}°`,
    });
  }
  return branches;
}

function assemble(
  config: AttackConfig,
  intended: StateVector,
  branches: AttackBranch[],
  report: QberReport,
  mechanism: string,
  observation: string,
  stage: AttackStage,
  eve?: AttackSimulation['eve'],
): AttackSimulation {
  // Drop zero-weight branches, then renormalise so the mixture sums to one.
  const kept = branches.filter((b) => b.probability > 1e-12);
  const total = kept.reduce((s, b) => s + b.probability, 0);
  const normalised = kept.map((b) => ({ ...b, probability: b.probability / total }));

  const mixture: StateMixture = {
    branches: normalised.map((b) => ({ probability: b.probability, state: b.state })),
  };

  // The most probable branch, used for the Bloch display. Deterministic, so
  // the sphere does not jump around between renders at a fixed seed.
  let best = normalised[0];
  for (const b of normalised) if (b.probability > best.probability) best = b;

  return {
    config,
    intended,
    received: mixture,
    representative: best.state,
    fidelity: mixtureFidelity(intended, mixture),
    branches: normalised,
    stage,
    eve,
    report,
    mechanism,
    observation,
  };
}

export interface SimulateOptions {
  rng: Rng;
}

export function simulateAttack(
  intended: StateVector,
  config: AttackConfig,
  { rng }: SimulateOptions,
): AttackSimulation {
  /* ---- Undisturbed, or drifting ------------------------------------- */

  if (config.type === 'none' || config.type === 'noise') {
    const level = config.type === 'none' ? 0 : Math.max(0, Math.min(1, config.noiseLevel));

    if (level === 0) {
      const report = computeQber(intended, intended);
      return assemble(
        config,
        intended,
        [{ probability: 1, state: intended, label: 'clean' }],
        report,
        'No adversary on the link. The channel is treated as ideal.',
        'Every basis matches prediction to the limit of the arithmetic.',
        'intermediate',
      );
    }

    // Phase diffusion: the relative phase wanders by a normal deviate whose
    // spread grows with the noise level. A phase rotation cannot move the
    // populations along its own axis, so Z stays clean and the conjugate
    // bases carry the whole signature.
    const branches = phaseDrift(intended, (level * Math.PI) / 2, rng);
    const report = computeQber(intended, { branches: branches.map((b) => ({ probability: b.probability, state: b.state })) });

    return assemble(
      config,
      intended,
      branches,
      report,
      `Channel dephasing at ${(level * 100).toFixed(0)}%: the relative phase wanders by a random angle on each transmission.`,
      `Z populations are untouched; the deviation lives entirely in X and Y, which is what a rotation about the phase axis does.`,
      'intermediate',
    );
  }

  /* ---- Interception -------------------------------------------------- */

  if (config.type === 'intercept_resend') {
    const { branches, mechanism, observation } = interceptResend(intended, config, rng);

    // Draw one branch for the narrative, weighted by its probability.
    const drawn = branches[sampleIndex(rng, branches.map((b) => b.probability))];
    const report = computeQber(intended, {
      branches: branches.map((b) => ({ probability: b.probability, state: b.state })),
    });

    return assemble(
      config,
      intended,
      branches,
      report,
      mechanism,
      observation,
      'intermediate',
      {
        basis: drawn.basis!,
        outcome: drawn.outcome!,
        outcomeLabel: outcomeLabel(drawn.basis!, drawn.outcome!),
        basisWasRandom: config.interceptBasis === 'RANDOM' || !config.interceptBasis,
      },
    );
  }

  /* ---- Forgery ------------------------------------------------------- */

  if (config.type === 'forgery') {
    const branch = forge(intended, config.forgeryStrategy, rng);
    const report = computeQber(intended, branch.state);

    const mechanisms: Record<ForgeryStrategy, string> = {
      random_state:
        'The forgery is drawn uniformly from the Bloch sphere. With no knowledge of the intended state, the best an adversary can do on average is 1/2 fidelity.',
      orthogonal_guess:
        'The forgery is the state orthogonal to the intended one — the furthest point available, at zero fidelity.',
      phase_guess:
        'The forgery reproduces the intended populations exactly and inverts the relative phase. A check that only inspects Z-basis populations would pass it.',
    };

    const observations: Record<ForgeryStrategy, string> = {
      random_state: 'The received state sits somewhere unrelated on the sphere. Detection is immediate and does not depend on which basis the verifier picks.',
      orthogonal_guess:
        'The received state is antipodal to the intended one. This is the easiest case to detect, and the least likely to be attempted.',
      phase_guess:
        'Detection depends entirely on the conjugate bases. If X and Y agree with prediction, the forgery has succeeded.',
    };

    // Report the case where the forgery coincides with the truth rather than
    // letting a fidelity of 1.0 read as a bug.
    const coincided = report.qber < 1e-9;
    const observation = coincided
      ? 'The forged state happens to coincide with the intended one — the intended state has no relative phase for this strategy to invert. Nothing is detectable because nothing is wrong.'
      : observations[config.forgeryStrategy];

    return assemble(
      config,
      intended,
      [branch],
      report,
      mechanisms[config.forgeryStrategy],
      observation,
      'final',
    );
  }

  /* ---- Replay -------------------------------------------------------- */

  if (config.type === 'replay') {
    const report = computeQber(intended, intended);
    const fresh = config.nonceValid && config.replayDelaySeconds <= REPLAY_WINDOW_SECONDS;

    return assemble(
      config,
      intended,
      [{ probability: 1, state: intended, label: 'captured packet' }],
      report,
      fresh
        ? `The packet is replayed after ${config.replayDelaySeconds}s, inside the ${REPLAY_WINDOW_SECONDS}s window. It is indistinguishable from a genuine transmission.`
        : `A genuine packet captured ${config.replayDelaySeconds}s ago is re-injected. The state is authentic; only its age gives it away.`,
      fresh
        ? 'Nothing marks this as a replay, because within the window there is nothing to mark. Freshness is enforced by the clock, not by the state.'
        : 'The quantum state is perfect — fidelity 1.000, no basis disturbed. Replay is invisible to every measurement, which is exactly why the protocol cannot rely on measurement alone to catch it.',
      'final',
    );
  }

  /* ---- Phase shift --------------------------------------------------- */

  // Falls through to the deterministic rotation. Kept explicit so an
  // unrecognised type cannot silently become a no-op.
  const angleDeg = PHASE_ANGLES.includes(config.phaseAngleDeg as (typeof PHASE_ANGLES)[number])
    ? config.phaseAngleDeg
    : 45;
  const rotated = intended.applyPhase((angleDeg * Math.PI) / 180);
  const report = computeQber(intended, rotated);

  return assemble(
    config,
    intended,
    [{ probability: 1, state: rotated, label: `R_z(${angleDeg}°)` }],
    report,
    `A phase rotation of ${angleDeg}° is applied to the channel — the relative phase is shifted, the populations are not.`,
    angleDeg === 180
      ? 'A half turn inverts the relative phase outright, which lands on the orthogonal state when the populations are equal.'
      : 'Z is untouched by construction. Only the bases that are sensitive to relative phase can see this at all.',
    'intermediate',
  );
}

/* ---------------------------------------------------------------------
   Decoy states
   --------------------------------------------------------------------- */

function poisson(n: number, mu: number): number {
  let factorial = 1;
  for (let i = 2; i <= n; i++) factorial *= i;
  return (Math.exp(-mu) * Math.pow(mu, n)) / factorial;
}

/**
 * Yield of an n-photon pulse: the chance at least one photon survives.
 *
 * Under photon-number splitting the adversary blocks the single-photon
 * pulses — she cannot split one photon — and forwards the rest intact. So
 * Y₁ collapses toward zero while Yₙ for n ≥ 2 rises toward unity. That
 * asymmetry is the entire signature, and it is why this attack adds no
 * errors: the pulses she forwards are undisturbed.
 */
function pulseYield(n: number, transmission: number, pns: boolean): number {
  if (pns) {
    if (n === 1) return 0;
    if (n >= 2) return 1;
  }
  return 1 - Math.pow(1 - transmission, n);
}

/** Overall gain: the probability a pulse of intensity mu produces a detection. */
function gain(mu: number, transmission: number, pns: boolean): number {
  let total = 0;
  for (let n = 1; n <= POISSON_TERMS; n++) {
    total += poisson(n, mu) * pulseYield(n, transmission, pns);
  }
  return total;
}

/**
 * Decoy-state analysis.
 *
 * Two intensities are sent, and their gains are compared against Poisson
 * photon statistics. A single-photon yield lower bound is then estimated
 * from the pair; if that bound collapses, single-photon pulses are being
 * blocked somewhere, which is what photon-number splitting looks like.
 *
 * The bound is the standard one. Note what it does under attack: the
 * estimate goes *negative*, which is how decoy-state QKD detects the attack
 * in practice — not a threshold crossing but a contradiction with the
 * assumption that yields are probabilities.
 */
export function analyseDecoyStates(
  signalIntensity: number = DECOY_SIGNAL_INTENSITY,
  decoyIntensity: number = DECOY_WEAK_INTENSITY,
  channelLoss: number = CHANNEL_LOSS,
  eavesdropperPresent: boolean = false,
): DecoyStateData {
  const transmission = 1 - channelLoss;
  const mu = signalIntensity;
  const nu = decoyIntensity;

  const signalGain = gain(mu, transmission, eavesdropperPresent);
  const decoyGain = gain(nu, transmission, eavesdropperPresent);

  const signalYield = signalGain / mu;
  const decoyYield = decoyGain / nu;

  // Single-photon yield lower bound from the μ and ν gains, with the
  // vacuum yield taken as zero (no dark counts are modelled here).
  const denominator = mu * nu - nu * nu;
  const singlePhotonYield =
    denominator > 0
      ? (mu / denominator) *
        (decoyGain * Math.exp(nu) - signalGain * Math.exp(mu) * ((nu * nu) / (mu * mu)))
      : 0;

  // A yield cannot be negative; a negative estimate means the data is
  // inconsistent with any physical yield, which is the detection signal.
  const pnsDetected = singlePhotonYield < transmission * 0.5;

  return {
    signalIntensity: mu,
    decoyIntensity: nu,
    signalGain,
    decoyGain,
    // Photon-number splitting forwards every multi-photon pulse unchanged, so
    // it contributes no errors of its own. Both rates sit at the optical
    // misalignment floor with or without the adversary — that is the point.
    signalQber: MISALIGNMENT_QBER,
    decoyQber: MISALIGNMENT_QBER,
    singlePhotonYield: Math.max(0, singlePhotonYield),
    yieldRatioSignal: signalYield,
    yieldRatioDecoy: decoyYield,
    pnsDetected,
  };
}
