// Quantum Simulation & QDS Types

export interface ComplexNumber {
  re: number;
  im: number;
}

export type BasisType = 'Z' | 'X' | 'Y';

export type BellStateKey = 'PHI_PLUS' | 'PHI_MINUS' | 'PSI_PLUS' | 'PSI_MINUS';

export interface BlochCoordinates {
  theta: number; // Polar angle [0, pi]
  phi: number;   // Azimuthal angle [0, 2pi)
  x: number;     // Bloch sphere X coordinate [-1, 1]
  y: number;     // Bloch sphere Y coordinate [-1, 1]
  z: number;     // Bloch sphere Z coordinate [-1, 1]
  p0: number;    // |0> probability |alpha|^2
  p1: number;    // |1> probability |beta|^2
}

export interface QubitState {
  id: string;
  name: string;
  alpha: ComplexNumber;
  beta: ComplexNumber;
  bloch: BlochCoordinates;
  ketString: string;
  latexString: string;
  description: string;
}

export interface BellStateInfo {
  key: BellStateKey;
  symbol: string;
  name: string;
  formula: string;
  circuitDescription: string;
  stateVector: [ComplexNumber, ComplexNumber, ComplexNumber, ComplexNumber];
  concurrence: number;
  entanglementEntropy: number;
  correlations: {
    zz: number;
    xx: number;
    yy: number;
  };
  explanation: string;
  whyItMatters: string;
}

export type TeleportationStepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface TeleportationStepInfo {
  step: TeleportationStepIndex;
  title: string;
  shortDesc: string;
  detailedExplanation: string;
  mathState: string;
  circuitHighlight: string;
  senderState: string;
  channelState: string;
  receiverState: string;
  classicalBits?: [number, number];
  pauliCorrection?: 'I' | 'X' | 'Z' | 'XZ';
}

export interface MeasurementResult {
  basis: BasisType;
  shots: number;
  counts: { [outcome: string]: number };
  probabilities: { [outcome: string]: number };
  theoreticalProbabilities: { [outcome: string]: number };
  errorPercentage: number;
}

export type AttackType =
  | 'none'
  | 'intercept_resend'
  | 'forgery'
  | 'replay'
  | 'phase_shift'
  | 'noise';

export interface AttackConfig {
  type: AttackType;
  name: string;
  enabled: boolean;
  interceptBasis?: BasisType | 'RANDOM';
  phaseAngleDeg?: number; // 0 to 180 degrees
  noiseLevel?: number;    // 0.0 to 1.0 (0% to 100%)
  forgeryStrategy?: 'random_state' | 'orthogonal_guess' | 'partial_basis_knowledge';
  replayDelaySeconds?: number;
  nonceValid?: boolean;
}

export type VerificationVerdict = 'VALID' | 'SUSPICIOUS' | 'INVALID' | 'TAMPERED';

export interface VerificationResult {
  verdict: VerificationVerdict;
  fidelity: number;
  qber: number;
  threshold: number;
  mubDisturbanceDetected: boolean;
  mubScores: {
    zBasisError: number;
    xBasisError: number;
    yBasisError: number;
  };
  pauliCorrectionApplied: 'I' | 'X' | 'Z' | 'XZ';
  pauliCorrectionCorrect: boolean;
  freshnessValid: boolean;
  scientificDiagnosis: {
    summary: string;
    details: string;
    cause: string;
    recommendedAction: string;
  };
}

export interface DecoyStateData {
  signalIntensity: number; // mu
  decoyIntensity: number;  // nu
  signalGain: number;
  decoyGain: number;
  signalQBER: number;
  decoyQBER: number;
  estimatedSinglePhotonYield: number;
  pnsAttackDetected: boolean;
  explanation: string;
}

export interface ExperimentRecord {
  id: string;
  timestamp: number;
  name: string;
  inputState: {
    name: string;
    alpha: ComplexNumber;
    beta: ComplexNumber;
    bloch: BlochCoordinates;
  };
  bellState: BellStateKey;
  attackConfig: AttackConfig;
  shots: number;
  classicalBits: [number, number];
  pauliCorrection: 'I' | 'X' | 'Z' | 'XZ';
  fidelity: number;
  qber: number;
  verdict: VerificationVerdict;
  notes?: string;
}
