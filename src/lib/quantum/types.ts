/*
  Shared vocabulary for the simulator.

  These types are the contract between the physics (src/lib) and the
  interface (src/app). Anything a page renders as a *number* originates here.
  Human-readable prose lives in src/content, deliberately not in this file.
*/

export interface ComplexNumber {
  re: number;
  im: number;
}

/** The three mutually unbiased measurement bases. */
export type BasisType = 'Z' | 'X' | 'Y';

export const BASIS_LABELS: Record<BasisType, { zero: string; one: string; axis: string }> = {
  Z: { zero: '|0⟩', one: '|1⟩', axis: 'computational' },
  X: { zero: '|+⟩', one: '|−⟩', axis: 'diagonal' },
  Y: { zero: '|i⟩', one: '|−i⟩', axis: 'circular' },
};

export type BellStateKey = 'PHI_PLUS' | 'PHI_MINUS' | 'PSI_PLUS' | 'PSI_MINUS';

/** The four Pauli corrections, in the convention the protocol labels them. */
export type PauliCorrection = 'I' | 'X' | 'Z' | 'XZ';

export interface BlochCoordinates {
  theta: number;
  phi: number;
  x: number;
  y: number;
  z: number;
  /** Probability of measuring |0⟩ along Z. */
  p0: number;
  /** Probability of measuring |1⟩ along Z. */
  p1: number;
}

export interface QubitState {
  id: string;
  name: string;
  alpha: ComplexNumber;
  beta: ComplexNumber;
  bloch: BlochCoordinates;
  /** Human-readable superposition, e.g. "0.866|0⟩ + 0.5|1⟩". */
  ket: string;
}

export interface BellStateInfo {
  key: BellStateKey;
  symbol: string;
  formula: string;
  /** Preparation circuit, as a gate sequence. */
  preparation: string;
  amplitudes: [ComplexNumber, ComplexNumber, ComplexNumber, ComplexNumber];
  /** Computed from the amplitudes, never asserted. */
  concurrence: number;
  entanglementEntropy: number;
  /** ⟨σi ⊗ σj⟩ correlations. */
  correlations: { zz: number; xx: number; yy: number };
  /** CHSH parameter S = 2√(u₁² + u₂²), Tsirelson bound 2√2. */
  chsh: number;
  violatesBell: boolean;
}

export type TeleportationStepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface TeleportationStepInfo {
  step: TeleportationStepIndex;
  title: string;
  /** One line: what happens at this stage. */
  summary: string;
  /** The state as written at the end of this stage. */
  state: string;
  /** Where Alice, the channel, and Bob stand after this stage. */
  sender: string;
  channel: string;
  receiver: string;
  classicalBits?: [number, number];
  pauliCorrection?: PauliCorrection;
}

export interface MeasurementResult {
  basis: BasisType;
  shots: number;
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  theoretical: Record<string, number>;
  /** Mean absolute deviation from theory, in percentage points. */
  deviation: number;
}

export type AttackType =
  | 'none'
  | 'intercept_resend'
  | 'forgery'
  | 'replay'
  | 'phase_shift'
  | 'noise';

export type ForgeryStrategy = 'random_state' | 'orthogonal_guess' | 'phase_guess';

export interface AttackConfig {
  type: AttackType;
  interceptBasis: BasisType | 'RANDOM';
  phaseAngleDeg: number;
  /** Channel noise intensity, 0–1. */
  noiseLevel: number;
  forgeryStrategy: ForgeryStrategy;
  replayDelaySeconds: number;
  nonceValid: boolean;
}

export type VerificationVerdict = 'VALID' | 'SUSPICIOUS' | 'INVALID' | 'TAMPERED';

export interface VerificationResult {
  verdict: VerificationVerdict;
  /** F = |⟨ψ_expected|ψ_received⟩|² */
  fidelity: number;
  /** Quantum bit error rate, measured by sifting — not inferred from fidelity. */
  qber: number;
  threshold: number;
  mubDisturbanceDetected: boolean;
  mub: Record<BasisType, MubCheck>;
  pauliCorrectionApplied: PauliCorrection;
  pauliCorrectionCorrect: boolean;
  freshnessValid: boolean;
  cause: string;
  action: string;
}

export interface MubCheck {
  basis: BasisType;
  expected: { zero: number; one: number };
  observed: { zero: number; one: number };
  /** Statistical distance from the expected distribution, 0–1. */
  deviation: number;
  disturbed: boolean;
}

export interface DecoyStateData {
  signalIntensity: number;
  decoyIntensity: number;
  signalGain: number;
  decoyGain: number;
  signalQber: number;
  decoyQber: number;
  singlePhotonYield: number;
  /** Ratio Q_μ/μ against Q_ν/ν; a large split indicates photon-number splitting. */
  yieldRatioSignal: number;
  yieldRatioDecoy: number;
  pnsDetected: boolean;
}

export interface ExperimentRecord {
  id: string;
  timestamp: number;
  name: string;
  seed: number;
  input: {
    alpha: ComplexNumber;
    beta: ComplexNumber;
    bloch: BlochCoordinates;
  };
  bellKey: BellStateKey;
  attack: AttackConfig;
  shots: number;
  classicalBits: [number, number];
  pauliCorrection: PauliCorrection;
  fidelity: number;
  qber: number;
  verdict: VerificationVerdict;
}
