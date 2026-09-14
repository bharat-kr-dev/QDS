import { Complex } from './complex';
import { StateVector } from './statevector';
import { BELL_STATE_NOTES } from '../../content/protocol';
import type { BellStateInfo, BellStateKey } from './types';

const INV_SQRT2 = 1 / Math.SQRT2;

/**
 * The amplitudes of each Bell state, written out over |00⟩, |01⟩, |10⟩, |11⟩.
 *
 * Everything else about these states — concurrence, entropy, correlations,
 * the CHSH parameter — is computed from these four numbers by `describe()`.
 * An earlier version of this file stored those values as literals alongside
 * the amplitudes, which meant the displayed figure and the underlying state
 * could drift apart without anything failing. Deriving them removes that
 * possibility.
 */
const BELL_AMPLITUDES: Record<BellStateKey, [Complex, Complex, Complex, Complex]> = {
  PHI_PLUS: [
    new Complex(INV_SQRT2, 0),
    Complex.ZERO,
    Complex.ZERO,
    new Complex(INV_SQRT2, 0),
  ],
  PHI_MINUS: [
    new Complex(INV_SQRT2, 0),
    Complex.ZERO,
    Complex.ZERO,
    new Complex(-INV_SQRT2, 0),
  ],
  PSI_PLUS: [
    Complex.ZERO,
    new Complex(INV_SQRT2, 0),
    new Complex(INV_SQRT2, 0),
    Complex.ZERO,
  ],
  PSI_MINUS: [
    Complex.ZERO,
    new Complex(INV_SQRT2, 0),
    new Complex(-INV_SQRT2, 0),
    Complex.ZERO,
  ],
};

const BELL_FORMULAS: Record<BellStateKey, { symbol: string; formula: string; preparation: string }> = {
  PHI_PLUS: {
    symbol: '|Φ⁺⟩',
    formula: '( |00⟩ + |11⟩ ) / √2',
    preparation: 'H on A, then CNOT from A to B',
  },
  PHI_MINUS: {
    symbol: '|Φ⁻⟩',
    formula: '( |00⟩ − |11⟩ ) / √2',
    preparation: 'Z on A, then H on A, then CNOT from A to B',
  },
  PSI_PLUS: {
    symbol: '|Ψ⁺⟩',
    formula: '( |01⟩ + |10⟩ ) / √2',
    preparation: 'X on B, then H on A, then CNOT from A to B',
  },
  PSI_MINUS: {
    symbol: '|Ψ⁻⟩',
    formula: '( |01⟩ − |10⟩ ) / √2',
    preparation: 'X and Z on B, then H on A, then CNOT from A to B',
  },
};

function describe(key: BellStateKey): BellStateInfo {
  const state = new StateVector(BELL_AMPLITUDES[key]);
  const correlations = state.correlationMatrix();
  const chsh = state.chsh();

  return {
    key,
    symbol: BELL_FORMULAS[key].symbol,
    formula: BELL_FORMULAS[key].formula,
    preparation: BELL_FORMULAS[key].preparation,
    amplitudes: BELL_AMPLITUDES[key].map((c) => c.toObject()) as BellStateInfo['amplitudes'],
    concurrence: Number(state.concurrence().toFixed(6)),
    entanglementEntropy: Number(state.entanglementEntropy().toFixed(6)),
    correlations: {
      zz: Number(correlations[2][2].toFixed(6)),
      xx: Number(correlations[0][0].toFixed(6)),
      yy: Number(correlations[1][1].toFixed(6)),
    },
    chsh: chsh.s,
    violatesBell: chsh.violatesBell,
  };
}

/** All four Bell states, fully described. Computed once at module load. */
export const BELL_STATES: Record<BellStateKey, BellStateInfo> = {
  PHI_PLUS: describe('PHI_PLUS'),
  PHI_MINUS: describe('PHI_MINUS'),
  PSI_PLUS: describe('PSI_PLUS'),
  PSI_MINUS: describe('PSI_MINUS'),
};

export const BELL_STATE_KEYS: readonly BellStateKey[] = [
  'PHI_PLUS',
  'PHI_MINUS',
  'PSI_PLUS',
  'PSI_MINUS',
];

export function getBellStateVector(key: BellStateKey): StateVector {
  return new StateVector(BELL_AMPLITUDES[key]);
}

/** Prose for the state selector. Kept beside the physics it describes. */
export { BELL_STATE_NOTES };
