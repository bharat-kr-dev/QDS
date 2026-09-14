import { Complex } from './complex';
import { getBellStateVector } from './bell';
import { StateVector } from './statevector';
import { PROTOCOL_STAGES } from '../../content/protocol';
import { sampleIndex, type Rng } from './prng';
import type {
  BellStateKey,
  PauliCorrection,
  TeleportationStepIndex,
  TeleportationStepInfo,
} from './types';

const PAULI_CORRECTIONS: readonly PauliCorrection[] = ['I', 'X', 'Z', 'XZ'];

/**
 * The four Bell-basis outcomes of Alice's measurement, in the order this
 * simulator labels them. Each entry pairs the two classical bits the outcome
 * produces with the Bell state Alice's two qubits are projected onto.
 *
 *   index  bits   project onto
 *     0    00     |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
 *     1    01     |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2
 *     2    10     |Φ⁻⟩ = (|00⟩ − |11⟩)/√2
 *     3    11     |Ψ⁻⟩ = (|01⟩ − |10⟩)/√2
 */
const BELL_OUTCOMES: readonly {
  bits: [number, number];
  coefficients: [Complex, Complex, Complex, Complex];
}[] = [
  {
    bits: [0, 0],
    coefficients: [new Complex(1 / Math.SQRT2, 0), Complex.ZERO, Complex.ZERO, new Complex(1 / Math.SQRT2, 0)],
  },
  {
    bits: [0, 1],
    coefficients: [Complex.ZERO, new Complex(1 / Math.SQRT2, 0), new Complex(1 / Math.SQRT2, 0), Complex.ZERO],
  },
  {
    bits: [1, 0],
    coefficients: [new Complex(1 / Math.SQRT2, 0), Complex.ZERO, Complex.ZERO, new Complex(-1 / Math.SQRT2, 0)],
  },
  {
    bits: [1, 1],
    coefficients: [Complex.ZERO, new Complex(1 / Math.SQRT2, 0), new Complex(-1 / Math.SQRT2, 0), Complex.ZERO],
  },
];

export interface TeleportationRunResult {
  input: StateVector;
  bellKey: BellStateKey;
  /** The three-qubit state |ψ⟩₁ ⊗ |Bell⟩₂₃ before Alice measures. */
  jointState: StateVector;
  /** Winnowed from the joint state — never assumed to be uniform. */
  outcomeProbabilities: number[];
  outcomeIndex: number;
  classicalBits: [number, number];
  /** Bob's qubit immediately after Alice's measurement, before correction. */
  intermediateState: StateVector;
  pauliCorrectionRequired: PauliCorrection;
  bobState: StateVector;
  fidelity: number;
  /**
   * How far the recovered state sits from the input, beyond the correction
   * itself. Zero in an ideal run; a non-zero value means the algebra did not
   * close and the run should not be trusted.
   */
  residual: number;
  /** The full decoding table for the chosen resource, derived not asserted. */
  correctionSchedule: Record<string, PauliCorrection>;
  steps: Record<TeleportationStepIndex, TeleportationStepInfo>;
}

/**
 * Projects a three-qubit state onto one Bell outcome of qubits 1 and 2,
 * returning the unnormalised state left on qubit 3.
 *
 * Amplitudes are indexed big-endian — index = b₁·4 + b₂·2 + b₃ — so qubit 1
 * is the most significant bit.
 */
function projectOntoBellOutcome(
  joint: StateVector,
  coefficients: readonly Complex[],
): StateVector {
  const outcome: Complex[] = [];
  for (let b3 = 0; b3 < 2; b3++) {
    let amplitude = Complex.ZERO;
    for (let b1 = 0; b1 < 2; b1++) {
      for (let b2 = 0; b2 < 2; b2++) {
        const pairIndex = b1 * 2 + b2;
        const coefficient = coefficients[pairIndex];
        if (coefficient.isZero()) continue;
        amplitude = amplitude.add(
          coefficient.conj().mul(joint.amplitudes[b1 * 4 + b2 * 2 + b3]),
        );
      }
    }
    outcome.push(amplitude);
  }
  return new StateVector(outcome);
}

/**
 * Finds which Pauli operation turns `from` into `to`, up to global phase.
 *
 * Derived rather than tabulated. The textbook table — 00→I, 01→X, 10→Z,
 * 11→XZ — is the schedule for a |Φ⁺⟩ resource specifically, and the previous
 * version of this simulator applied it regardless of which Bell state was
 * selected, so changing the resource on screen changed nothing in the result.
 * Solving for the correction makes the schedule a consequence of the state
 * rather than an assumption about it.
 */
export function solveCorrection(
  from: StateVector,
  to: StateVector,
): { correction: PauliCorrection; fidelity: number } {
  let best: PauliCorrection = 'I';
  let bestFidelity = -1;

  for (const correction of PAULI_CORRECTIONS) {
    const candidate = from.applyCorrection(correction);
    const fidelity = to.fidelity(candidate);
    if (fidelity > bestFidelity) {
      bestFidelity = fidelity;
      best = correction;
    }
  }

  return { correction: best, fidelity: bestFidelity };
}

export interface TeleportationOptions {
  bellKey?: BellStateKey;
  /** Forces a specific measurement outcome instead of sampling one. */
  forcedOutcomeIndex?: number;
  rng: Rng;
}

export function runTeleportation(
  input: StateVector,
  options: TeleportationOptions,
): TeleportationRunResult {
  const { bellKey = 'PHI_PLUS', forcedOutcomeIndex, rng } = options;

  if (input.numQubits !== 1) {
    throw new Error(`Teleportation takes a single-qubit input, got ${input.numQubits}.`);
  }

  // Step 3: the composite state of Alice's qubit and the shared pair.
  const jointState = input.tensor(getBellStateVector(bellKey));

  // Step 4: Alice projects her two qubits onto each Bell outcome in turn,
  // which yields both the probabilities and the post-measurement states.
  const branches = BELL_OUTCOMES.map((outcome) => {
    const unnormalised = projectOntoBellOutcome(jointState, outcome.coefficients);
    const weight = unnormalised.normSquared();
    return { outcome, unnormalised, weight, normalised: unnormalised.normalize() };
  });

  const totalWeight = branches.reduce((sum, branch) => sum + branch.weight, 0);
  const outcomeProbabilities = branches.map((branch) =>
    totalWeight > 0 ? branch.weight / totalWeight : 0,
  );

  // Step 5: the outcome Alice reads, sampled from those probabilities.
  const outcomeIndex =
    forcedOutcomeIndex !== undefined
      ? Math.min(3, Math.max(0, forcedOutcomeIndex))
      : sampleIndex(rng, outcomeProbabilities);

  const branch = branches[outcomeIndex];
  const intermediateState = branch.normalised;

  // Step 7: the correction Bob needs, solved against the input state.
  const solved = solveCorrection(intermediateState, input);
  const bobState = intermediateState.applyCorrection(solved.correction);
  const fidelity = input.fidelity(bobState);

  // The corrective schedule for this resource, solved across all four
  // outcomes so the interface can display the real table.
  const correctionSchedule: Record<string, PauliCorrection> = {};
  for (const candidate of branches) {
    const bits = `${candidate.outcome.bits[0]}${candidate.outcome.bits[1]}`;
    correctionSchedule[bits] = solveCorrection(candidate.normalised, input).correction;
  }

  const bits = branch.outcome.bits;
  const residual = Number(Math.max(0, 1 - solved.fidelity).toExponential(2));
  const alpha = input.amplitudes[0].toCoefficient(3);
  const beta = input.amplitudes[1].toCoefficient(3);
  const recovered = `${bobState.amplitudes[0].toCoefficient(3)}|0⟩ + ${bobState.amplitudes[1].toCoefficient(3)}|1⟩`;
  const bitString = `${bits[0]}${bits[1]}`;

  const steps = buildSteps({
    stage: PROTOCOL_STAGES,
    inputKet: `${alpha}|0⟩ + ${beta}|1⟩`,
    bitString,
    bits,
    correction: solved.correction,
    recovered,
    fidelity,
  });

  return {
    input,
    bellKey,
    jointState,
    outcomeProbabilities,
    outcomeIndex,
    classicalBits: bits,
    intermediateState,
    pauliCorrectionRequired: solved.correction,
    bobState,
    fidelity,
    residual,
    correctionSchedule,
    steps,
  };
}

function buildSteps(args: {
  stage: typeof PROTOCOL_STAGES;
  inputKet: string;
  bitString: string;
  bits: [number, number];
  correction: PauliCorrection;
  recovered: string;
  fidelity: number;
}): Record<TeleportationStepIndex, TeleportationStepInfo> {
  const { inputKet, bitString, bits, correction, recovered, fidelity } = args;

  return {
    1: {
      step: 1,
      title: args.stage[1].title,
      summary: args.stage[1].summary,
      state: inputKet,
      sender: `Holds ${inputKet}`,
      channel: 'Idle',
      receiver: 'Holds nothing yet',
    },
    2: {
      step: 2,
      title: args.stage[2].title,
      summary: args.stage[2].summary,
      state: 'Paired halves of one Bell state, one per site',
      sender: 'Holds the pair’s first half',
      channel: 'Pair distributed',
      receiver: 'Holds the pair’s second half',
    },
    3: {
      step: 3,
      title: args.stage[3].title,
      summary: args.stage[3].summary,
      state: 'A single three-qubit state',
      sender: 'Two qubits under control',
      channel: 'Entanglement in place',
      receiver: 'One qubit, correlated with Alice’s',
    },
    4: {
      step: 4,
      title: args.stage[4].title,
      summary: args.stage[4].summary,
      state: 'Projected onto one of four Bell outcomes',
      sender: 'Measurement performed',
      channel: 'Superposition consumed',
      receiver: 'State determined but not yet known',
    },
    5: {
      step: 5,
      title: args.stage[5].title,
      summary: args.stage[5].summary,
      state: `Outcome recorded as ${bitString}`,
      sender: `Reads ${bitString}`,
      channel: 'Nothing sent yet',
      receiver: 'Still without the outcome',
      classicalBits: bits,
    },
    6: {
      step: 6,
      title: args.stage[6].title,
      summary: args.stage[6].summary,
      state: `Two bits in transit: ${bitString}`,
      sender: 'Measurement complete',
      channel: `Carrying ${bitString}`,
      receiver: 'Outcome received',
      classicalBits: bits,
    },
    7: {
      step: 7,
      title: args.stage[7].title,
      summary: args.stage[7].summary,
      state: `Applies ${correction}, which ${bitString} calls for`,
      sender: 'Done',
      channel: 'Idle',
      receiver: `Applies ${correction}`,
      classicalBits: bits,
      pauliCorrection: correction,
    },
    8: {
      step: 8,
      title: args.stage[8].title,
      summary: args.stage[8].summary,
      state: recovered,
      sender: 'Original qubit consumed',
      channel: 'Idle',
      receiver: recovered,
      classicalBits: bits,
      pauliCorrection: correction,
    },
    9: {
      step: 9,
      title: args.stage[9].title,
      summary: args.stage[9].summary,
      state: `Fidelity ${(fidelity * 100).toFixed(2)}%`,
      sender: 'Measured',
      channel: 'Assessed',
      receiver: 'State accepted or rejected',
      classicalBits: bits,
      pauliCorrection: correction,
    },
  };
}

/**
 * The decoding table for a resource, as data.
 *
 * Exposed because the table is the protocol: showing it as a consequence of
 * the chosen Bell state is more instructive than showing a fixed legend and
 * hoping the reader does not notice it never changes.
 */
export function correctionScheduleFor(bellKey: BellStateKey): Record<string, PauliCorrection> {
  const probe = StateVector.qubit(Complex.polar(1, 0.7), Complex.polar(0.5, 2.1));
  const rng = () => 0;
  return runTeleportation(probe, { bellKey, forcedOutcomeIndex: 0, rng }).correctionSchedule;
}
