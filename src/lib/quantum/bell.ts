import { Complex } from './complex';
import { StateVector } from './statevector';
import { BellStateInfo, BellStateKey } from './types';

const invSqrt2 = 1 / Math.SQRT2;

export const BELL_STATES: Record<BellStateKey, BellStateInfo> = {
  PHI_PLUS: {
    key: 'PHI_PLUS',
    symbol: '|Φ⁺⟩',
    name: 'Bell State Phi-Plus',
    formula: '|Φ⁺⟩ = (|00⟩ + |11⟩) / √2',
    circuitDescription: 'Hadamard on Qubit A → CNOT with control Qubit A and target Qubit B',
    stateVector: [
      { re: invSqrt2, im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: invSqrt2, im: 0 },
    ],
    concurrence: 1.0,
    entanglementEntropy: 1.0,
    correlations: {
      zz: 1.0,  // Perfect correlated outcomes in Z basis
      xx: 1.0,  // Perfect correlated outcomes in X basis
      yy: -1.0, // Anti-correlated in Y basis
    },
    explanation:
      'Maximally entangled state where both qubits are always measured in the exact same state (|00⟩ or |11⟩ in Z-basis) with 50% probability each.',
    whyItMatters:
      'Standard EPR channel resource used in Bennett-Brassard quantum teleportation. Enables Alice and Bob to share non-local correlations without sending quantum information.',
  },
  PHI_MINUS: {
    key: 'PHI_MINUS',
    symbol: '|Φ⁻⟩',
    name: 'Bell State Phi-Minus',
    formula: '|Φ⁻⟩ = (|00⟩ - |11⟩) / √2',
    circuitDescription: 'Pauli-Z on Qubit A → Hadamard on Qubit A → CNOT (A → B)',
    stateVector: [
      { re: invSqrt2, im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: -invSqrt2, im: 0 },
    ],
    concurrence: 1.0,
    entanglementEntropy: 1.0,
    correlations: {
      zz: 1.0,
      xx: -1.0,
      yy: 1.0,
    },
    explanation:
      'Maximally entangled state with a relative π phase between the |00⟩ and |11⟩ components.',
    whyItMatters:
      'Differentiates from |Φ⁺⟩ by a single Pauli-Z phase flip. Useful for demonstrating phase-flip errors and syndrome detection.',
  },
  PSI_PLUS: {
    key: 'PSI_PLUS',
    symbol: '|Ψ⁺⟩',
    name: 'Bell State Psi-Plus',
    formula: '|Ψ⁺⟩ = (|01⟩ + |10⟩) / √2',
    circuitDescription: 'Pauli-X on Qubit B → Hadamard on Qubit A → CNOT (A → B)',
    stateVector: [
      { re: 0, im: 0 },
      { re: invSqrt2, im: 0 },
      { re: invSqrt2, im: 0 },
      { re: 0, im: 0 },
    ],
    concurrence: 1.0,
    entanglementEntropy: 1.0,
    correlations: {
      zz: -1.0, // Perfectly anti-correlated in Z basis (|01> or |10>)
      xx: 1.0,
      yy: 1.0,
    },
    explanation:
      'Maximally entangled anti-correlated state: if Alice measures 0, Bob always gets 1, and vice-versa.',
    whyItMatters:
      'Used in symmetric quantum key distribution protocols and anti-correlated quantum signature schemes.',
  },
  PSI_MINUS: {
    key: 'PSI_MINUS',
    symbol: '|Ψ⁻⟩',
    name: 'Bell State Psi-Minus (Singlet)',
    formula: '|Ψ⁻⟩ = (|01⟩ - |10⟩) / √2',
    circuitDescription: 'Pauli-X and Pauli-Z on Qubit B → Hadamard on Qubit A → CNOT (A → B)',
    stateVector: [
      { re: 0, im: 0 },
      { re: invSqrt2, im: 0 },
      { re: -invSqrt2, im: 0 },
      { re: 0, im: 0 },
    ],
    concurrence: 1.0,
    entanglementEntropy: 1.0,
    correlations: {
      zz: -1.0,
      xx: -1.0,
      yy: -1.0, // Invariant under all rotation bases (rotational singlet)
    },
    explanation:
      'The legendary singlet state with total spin zero. It is completely spherically symmetric and invariant under identical unitary rotations.',
    whyItMatters:
      'Crucial for reference-frame-independent quantum communication and foundational tests of Bell inequality violation (CHSH $S = 2\\sqrt{2} \\approx 2.828$).',
  },
};

export function getBellStateVector(key: BellStateKey): StateVector {
  const info = BELL_STATES[key];
  return new StateVector(info.stateVector.map((c) => Complex.from(c)));
}

export function calculateCHSH(key: BellStateKey): { sValue: number; bellViolation: boolean; maxClassicalBound: number; tsirelsonBound: number } {
  // In an ideal Bell state, the CHSH parameter reaches Tsirelson's bound 2*sqrt(2) = 2.828
  // Classical local hidden variable bound is |S| <= 2
  const sValue = 2 * Math.SQRT2;
  return {
    sValue: Number(sValue.toFixed(4)),
    bellViolation: true,
    maxClassicalBound: 2.0,
    tsirelsonBound: Number((2 * Math.SQRT2).toFixed(4)),
  };
}
