import { Complex } from './complex';
import {
  BasisType,
  BlochCoordinates,
  ComplexNumber,
  MeasurementResult,
  QubitState,
} from './types';

export class StateVector {
  readonly amplitudes: Complex[];
  readonly numQubits: number;

  constructor(amplitudes: (Complex | ComplexNumber)[]) {
    this.amplitudes = amplitudes.map((a) => Complex.from(a));
    const len = this.amplitudes.length;
    this.numQubits = Math.round(Math.log2(len));
    if (1 << this.numQubits !== len) {
      throw new Error(`StateVector length (${len}) must be a power of 2.`);
    }
  }

  static fromQubit(alpha: Complex | ComplexNumber, beta: Complex | ComplexNumber): StateVector {
    const a = Complex.from(alpha);
    const b = Complex.from(beta);
    const norm = Math.sqrt(a.magSq() + b.magSq());
    if (norm === 0) {
      return new StateVector([Complex.one(), Complex.zero()]);
    }
    return new StateVector([a.div(norm), b.div(norm)]);
  }

  static fromAngles(theta: number, phi: number): StateVector {
    // |psi> = cos(theta/2)|0> + e^(i phi) sin(theta/2)|1>
    const alpha = new Complex(Math.cos(theta / 2), 0);
    const beta = Complex.polar(Math.sin(theta / 2), phi);
    return new StateVector([alpha, beta]);
  }

  static zero(): StateVector {
    return new StateVector([Complex.one(), Complex.zero()]);
  }

  static one(): StateVector {
    return new StateVector([Complex.zero(), Complex.one()]);
  }

  static plus(): StateVector {
    const invSqrt2 = 1 / Math.SQRT2;
    return new StateVector([new Complex(invSqrt2, 0), new Complex(invSqrt2, 0)]);
  }

  static minus(): StateVector {
    const invSqrt2 = 1 / Math.SQRT2;
    return new StateVector([new Complex(invSqrt2, 0), new Complex(-invSqrt2, 0)]);
  }

  static plusI(): StateVector {
    const invSqrt2 = 1 / Math.SQRT2;
    return new StateVector([new Complex(invSqrt2, 0), new Complex(0, invSqrt2)]);
  }

  static minusI(): StateVector {
    const invSqrt2 = 1 / Math.SQRT2;
    return new StateVector([new Complex(invSqrt2, 0), new Complex(0, -invSqrt2)]);
  }

  normalize(): StateVector {
    const normSq = this.amplitudes.reduce((sum, a) => sum + a.magSq(), 0);
    const norm = Math.sqrt(normSq);
    if (norm === 0 || Math.abs(norm - 1) < 1e-12) return this;
    return new StateVector(this.amplitudes.map((a) => a.div(norm)));
  }

  tensorProduct(other: StateVector): StateVector {
    const newAmps: Complex[] = [];
    for (const a of this.amplitudes) {
      for (const b of other.amplitudes) {
        newAmps.push(a.mul(b));
      }
    }
    return new StateVector(newAmps);
  }

  getSingleQubitBloch(): BlochCoordinates {
    if (this.numQubits !== 1) {
      throw new Error('Bloch sphere representation only applies to single-qubit states.');
    }
    const [alpha, beta] = this.amplitudes;
    const p0 = alpha.magSq();
    const p1 = beta.magSq();

    // Remove global phase so alpha is real and non-negative
    const globalPhase = alpha.phase();
    const a0 = alpha.mul(Complex.polar(1, -globalPhase)).re;
    const b0 = beta.mul(Complex.polar(1, -globalPhase));

    const theta = 2 * Math.acos(Math.min(1, Math.max(0, a0)));
    const phi = (b0.phase() + 2 * Math.PI) % (2 * Math.PI);

    // Bloch vector components
    // x = 2 * Re(alpha * conj(beta))
    // y = 2 * Im(conj(alpha) * beta)
    // z = |alpha|^2 - |beta|^2
    const aTimesConjB = alpha.mul(beta.conj());
    const x = 2 * aTimesConjB.re;
    const y = -2 * aTimesConjB.im; // or 2 * (conj(alpha)*beta).im
    const z = p0 - p1;

    return {
      theta,
      phi,
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      z: Number(z.toFixed(4)),
      p0: Number(p0.toFixed(4)),
      p1: Number(p1.toFixed(4)),
    };
  }

  // Unitary operations
  applyPauliI(): StateVector {
    return new StateVector([...this.amplitudes]);
  }

  applyPauliX(): StateVector {
    if (this.numQubits !== 1) throw new Error('Single qubit operation');
    return new StateVector([this.amplitudes[1], this.amplitudes[0]]);
  }

  applyPauliY(): StateVector {
    if (this.numQubits !== 1) throw new Error('Single qubit operation');
    // Y = [[0, -i], [i, 0]]
    return new StateVector([
      this.amplitudes[1].mul(new Complex(0, -1)),
      this.amplitudes[0].mul(new Complex(0, 1)),
    ]);
  }

  applyPauliZ(): StateVector {
    if (this.numQubits !== 1) throw new Error('Single qubit operation');
    return new StateVector([this.amplitudes[0], this.amplitudes[1].mul(-1)]);
  }

  applyHadamard(): StateVector {
    if (this.numQubits !== 1) throw new Error('Single qubit operation');
    const invSqrt2 = 1 / Math.SQRT2;
    const [a, b] = this.amplitudes;
    return new StateVector([
      a.add(b).mul(invSqrt2),
      a.sub(b).mul(invSqrt2),
    ]);
  }

  applyPhaseShift(thetaRad: number): StateVector {
    if (this.numQubits !== 1) throw new Error('Single qubit operation');
    // [[1, 0], [0, e^(i theta)]]
    const [a, b] = this.amplitudes;
    return new StateVector([
      a,
      b.mul(Complex.polar(1, thetaRad)),
    ]);
  }

  applyPauliCorrection(correction: 'I' | 'X' | 'Z' | 'XZ'): StateVector {
    switch (correction) {
      case 'I':
        return this.applyPauliI();
      case 'X':
        return this.applyPauliX();
      case 'Z':
        return this.applyPauliZ();
      case 'XZ':
        // X followed by Z: Z * X = [[0, 1], [-1, 0]]
        return this.applyPauliX().applyPauliZ();
    }
  }

  // Calculate quantum fidelity F = |<psi|phi>|^2
  fidelity(other: StateVector): number {
    if (this.amplitudes.length !== other.amplitudes.length) {
      return 0;
    }
    let innerProduct = Complex.zero();
    for (let i = 0; i < this.amplitudes.length; i++) {
      innerProduct = innerProduct.add(this.amplitudes[i].conj().mul(other.amplitudes[i]));
    }
    return Math.min(1, Math.max(0, innerProduct.magSq()));
  }

  // Projective measurement probabilities in basis Z, X, Y
  getBasisProbabilities(basis: BasisType): { outcome0: number; outcome1: number } {
    if (this.numQubits !== 1) throw new Error('Single qubit measurement');
    const [alpha, beta] = this.amplitudes;

    if (basis === 'Z') {
      return {
        outcome0: alpha.magSq(),
        outcome1: beta.magSq(),
      };
    } else if (basis === 'X') {
      // |+> = (|0>+|1>)/sqrt(2), |-> = (|0>-|1>)/sqrt(2)
      // <+|psi> = (alpha + beta)/sqrt(2)
      // <-|psi> = (alpha - beta)/sqrt(2)
      const invSqrt2 = 1 / Math.SQRT2;
      const ampPlus = alpha.add(beta).mul(invSqrt2);
      const ampMinus = alpha.sub(beta).mul(invSqrt2);
      return {
        outcome0: ampPlus.magSq(),
        outcome1: ampMinus.magSq(),
      };
    } else {
      // Y basis: |+i> = (|0>+i|1>)/sqrt(2), |-i> = (|0>-i|1>)/sqrt(2)
      // <+i|psi> = (alpha - i beta)/sqrt(2)
      // <-i|psi> = (alpha + i beta)/sqrt(2)
      const invSqrt2 = 1 / Math.SQRT2;
      const iBeta = beta.mul(new Complex(0, 1));
      const ampPlusI = alpha.sub(iBeta).mul(invSqrt2);
      const ampMinusI = alpha.add(iBeta).mul(invSqrt2);
      return {
        outcome0: ampPlusI.magSq(),
        outcome1: ampMinusI.magSq(),
      };
    }
  }

  // Simulate N shots of projective measurement with realistic statistical noise
  measure(basis: BasisType, shots: number = 1000): MeasurementResult {
    const theoretical = this.getBasisProbabilities(basis);
    const labels =
      basis === 'Z'
        ? { '0': '|0⟩', '1': '|1⟩' }
        : basis === 'X'
        ? { '0': '|+⟩', '1': '|-⟩' }
        : { '0': '|i⟩', '1': '|-i⟩' };

    let count0 = 0;
    for (let i = 0; i < shots; i++) {
      if (Math.random() < theoretical.outcome0) {
        count0++;
      }
    }
    const count1 = shots - count0;
    const prob0 = count0 / shots;
    const prob1 = count1 / shots;

    // Error percentage compared to theoretical
    const err0 = Math.abs(prob0 - theoretical.outcome0);
    const err1 = Math.abs(prob1 - theoretical.outcome1);
    const errorPercentage = ((err0 + err1) / 2) * 100;

    return {
      basis,
      shots,
      counts: {
        [labels['0']]: count0,
        [labels['1']]: count1,
      },
      probabilities: {
        [labels['0']]: Number(prob0.toFixed(4)),
        [labels['1']]: Number(prob1.toFixed(4)),
      },
      theoreticalProbabilities: {
        [labels['0']]: Number(theoretical.outcome0.toFixed(4)),
        [labels['1']]: Number(theoretical.outcome1.toFixed(4)),
      },
      errorPercentage: Number(errorPercentage.toFixed(2)),
    };
  }

  getKetString(): string {
    if (this.numQubits === 1) {
      const [a, b] = this.amplitudes;
      const aFmt = a.format(3);
      const bFmt = b.format(3);
      return `(${aFmt})|0⟩ + (${bFmt})|1⟩`;
    }
    return this.amplitudes
      .map((amp, idx) => {
        const bin = idx.toString(2).padStart(this.numQubits, '0');
        return `(${amp.format(3)})|${bin}⟩`;
      })
      .join(' + ');
  }

  toQubitState(id: string, name: string, description: string): QubitState {
    if (this.numQubits !== 1) throw new Error('Must be single qubit');
    const bloch = this.getSingleQubitBloch();
    return {
      id,
      name,
      alpha: this.amplitudes[0].toObject(),
      beta: this.amplitudes[1].toObject(),
      bloch,
      ketString: this.getKetString(),
      latexString: `|\\psi\\rangle = ${this.amplitudes[0].format(2)}|0\\rangle + ${this.amplitudes[1].format(2)}|1\\rangle`,
      description,
    };
  }
}

// Preset standard states
export const PRESET_STATES: Record<string, () => StateVector> = {
  zero: () => StateVector.zero(),
  one: () => StateVector.one(),
  plus: () => StateVector.plus(),
  minus: () => StateVector.minus(),
  plusI: () => StateVector.plusI(),
  minusI: () => StateVector.minusI(),
};
