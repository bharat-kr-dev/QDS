import { Complex } from './complex';
import { sampleIndex, type Rng } from './prng';
import {
  BASIS_LABELS,
  type BasisType,
  type BlochCoordinates,
  type ComplexNumber,
  type MeasurementResult,
  type QubitState,
} from './types';

const INV_SQRT2 = 1 / Math.SQRT2;

/** Density-matrix eigenvalues below this are treated as zero. */
const NEGLIGIBLE = 1e-9;

/**
 * A pure state vector over n qubits, stored as 2ⁿ amplitudes.
 *
 * Qubit ordering is big-endian: for a three-qubit state the index is
 * b₁·4 + b₂·2 + b₃, so qubit 1 is the most significant bit. Everything that
 * couples qubits — the Bell measurement, the partial trace — depends on this
 * convention holding, so it is stated once here and relied on everywhere.
 */
export class StateVector {
  readonly amplitudes: readonly Complex[];
  readonly numQubits: number;

  constructor(amplitudes: readonly (Complex | ComplexNumber | number)[]) {
    if (amplitudes.length === 0) {
      throw new Error('A state vector needs at least one amplitude.');
    }
    const length = amplitudes.length;
    const qubits = Math.round(Math.log2(length));
    if (2 ** qubits !== length) {
      throw new Error(`State vector length ${length} is not a power of two.`);
    }
    this.amplitudes = amplitudes.map((a) => Complex.from(a));
    this.numQubits = qubits;
  }

  get dimension(): number {
    return this.amplitudes.length;
  }

  /* ---- Construction --------------------------------------------------- */

  /** Builds |ψ⟩ = α|0⟩ + β|1⟩, normalising whatever it is handed. */
  static qubit(alpha: Complex | ComplexNumber | number, beta: Complex | ComplexNumber | number): StateVector {
    const a = Complex.from(alpha);
    const b = Complex.from(beta);
    const norm = Math.sqrt(a.absSq() + b.absSq());
    if (norm < NEGLIGIBLE) return new StateVector([Complex.ONE, Complex.ZERO]);
    return new StateVector([a.div(norm), b.div(norm)]);
  }

  /** |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ — a point on the Bloch sphere. */
  static fromAngles(theta: number, phi: number): StateVector {
    return new StateVector([
      new Complex(Math.cos(theta / 2), 0),
      Complex.polar(Math.sin(theta / 2), phi),
    ]);
  }

  static zero(): StateVector {
    return new StateVector([Complex.ONE, Complex.ZERO]);
  }

  static one(): StateVector {
    return new StateVector([Complex.ZERO, Complex.ONE]);
  }

  static plus(): StateVector {
    return new StateVector([new Complex(INV_SQRT2, 0), new Complex(INV_SQRT2, 0)]);
  }

  static minus(): StateVector {
    return new StateVector([new Complex(INV_SQRT2, 0), new Complex(-INV_SQRT2, 0)]);
  }

  static plusI(): StateVector {
    return new StateVector([new Complex(INV_SQRT2, 0), new Complex(0, INV_SQRT2)]);
  }

  static minusI(): StateVector {
    return new StateVector([new Complex(INV_SQRT2, 0), new Complex(0, -INV_SQRT2)]);
  }

  /**
   * Rebuilds a state that has already been normalised, without renormalising.
   * Used when reconstructing a collapsed branch whose length is meaningful as
   * a probability amplitude and must not be scaled away.
   */
  static raw(amplitudes: readonly (Complex | ComplexNumber | number)[]): StateVector {
    return new StateVector(amplitudes);
  }

  /* ---- Structure ------------------------------------------------------ */

  normalize(): StateVector {
    const normSq = this.amplitudes.reduce((sum, a) => sum + a.absSq(), 0);
    const norm = Math.sqrt(normSq);
    if (norm < NEGLIGIBLE || Math.abs(norm - 1) < 1e-12) return this;
    return new StateVector(this.amplitudes.map((a) => a.div(norm)));
  }

  /** |⟨ψ|ψ⟩|² — a sanity check that a state is physical. */
  normSquared(): number {
    return this.amplitudes.reduce((sum, a) => sum + a.absSq(), 0);
  }

  tensor(other: StateVector): StateVector {
    const out: Complex[] = [];
    for (const a of this.amplitudes) {
      for (const b of other.amplitudes) {
        out.push(a.mul(b));
      }
    }
    return new StateVector(out);
  }

  /* ---- Gates ---------------------------------------------------------- */

  private requireQubit(): void {
    if (this.numQubits !== 1) {
      throw new Error(`Single-qubit operation applied to a ${this.numQubits}-qubit state.`);
    }
  }

  applyX(): StateVector {
    this.requireQubit();
    return new StateVector([this.amplitudes[1], this.amplitudes[0]]);
  }

  applyY(): StateVector {
    this.requireQubit();
    // Y = [[0, −i], [i, 0]]
    return new StateVector([
      this.amplitudes[1].mul(new Complex(0, -1)),
      this.amplitudes[0].mul(new Complex(0, 1)),
    ]);
  }

  applyZ(): StateVector {
    this.requireQubit();
    return new StateVector([this.amplitudes[0], this.amplitudes[1].neg()]);
  }

  applyH(): StateVector {
    this.requireQubit();
    const [a, b] = this.amplitudes;
    return new StateVector([a.add(b).mul(INV_SQRT2), a.sub(b).mul(INV_SQRT2)]);
  }

  /** R_z(θ) = diag(1, e^{iθ}) — rotates the relative phase only. */
  applyPhase(theta: number): StateVector {
    this.requireQubit();
    return new StateVector([this.amplitudes[0], this.amplitudes[1].mul(Complex.polar(1, theta))]);
  }

  /**
   * Applies the Pauli correction named by the classical syndrome.
   *
   * XZ is read left to right — X applied after Z. Note XZ equals −iY, so the
   * set {I, X, Z, XZ} is the whole Pauli group up to global phase, which is
   * precisely the freedom a correction is allowed to have: a correction that
   * differs from the needed one by a global phase is still correct.
   */
  applyCorrection(correction: 'I' | 'X' | 'Z' | 'XZ'): StateVector {
    switch (correction) {
      case 'X':
        return this.applyX();
      case 'Z':
        return this.applyZ();
      case 'XZ':
        return this.applyX().applyZ();
      default:
        return this;
    }
  }

  /* ---- Inner products ------------------------------------------------- */

  /** ⟨ψ|φ⟩. */
  innerProduct(other: StateVector): Complex {
    if (this.dimension !== other.dimension) return Complex.ZERO;
    let acc = Complex.ZERO;
    for (let i = 0; i < this.dimension; i++) {
      acc = acc.add(this.amplitudes[i].conj().mul(other.amplitudes[i]));
    }
    return acc;
  }

  /** F = |⟨ψ|φ⟩|² — the standard state fidelity for pure states. */
  fidelity(other: StateVector): number {
    return Math.min(1, Math.max(0, this.innerProduct(other).absSq()));
  }

  /* ---- Measurement ---------------------------------------------------- */

  /**
   * Born-rule probabilities for a projective measurement in the given basis.
   * outcome0 is the +1 eigenstate (|0⟩, |+⟩, |i⟩), outcome1 the −1 one.
   */
  basisProbabilities(basis: BasisType): { zero: number; one: number } {
    this.requireQubit();
    const [alpha, beta] = this.amplitudes;

    if (basis === 'Z') {
      return { zero: alpha.absSq(), one: beta.absSq() };
    }
    if (basis === 'X') {
      return {
        zero: alpha.add(beta).mul(INV_SQRT2).absSq(),
        one: alpha.sub(beta).mul(INV_SQRT2).absSq(),
      };
    }
    // Y: |±i⟩ = (|0⟩ ± i|1⟩)/√2
    const iBeta = beta.mul(Complex.I);
    return {
      zero: alpha.sub(iBeta).mul(INV_SQRT2).absSq(),
      one: alpha.add(iBeta).mul(INV_SQRT2).absSq(),
    };
  }

  /**
   * Samples `shots` projective measurements.
   *
   * The shot counts are drawn from the Born-rule distribution by the caller's
   * seeded stream, so the same seed and shot count always yield the same
   * histogram. `deviation` reports the sampling error against theory rather
   * than hiding it.
   */
  measure(basis: BasisType, shots: number, rng: Rng): MeasurementResult {
    const theory = this.basisProbabilities(basis);
    const labels = BASIS_LABELS[basis];

    let zeroCount = 0;
    for (let i = 0; i < shots; i++) {
      if (sampleIndex(rng, [theory.zero, theory.one]) === 0) zeroCount++;
    }

    const oneCount = shots - zeroCount;
    const probZero = shots > 0 ? zeroCount / shots : 0;
    const probOne = shots > 0 ? oneCount / shots : 0;

    return {
      basis,
      shots,
      counts: { [labels.zero]: zeroCount, [labels.one]: oneCount },
      probabilities: { [labels.zero]: probZero, [labels.one]: probOne },
      theoretical: { [labels.zero]: theory.zero, [labels.one]: theory.one },
      deviation:
        ((Math.abs(probZero - theory.zero) + Math.abs(probOne - theory.one)) / 2) * 100,
    };
  }

  /** Exact measurement outcome, drawn from the Born rule. */
  sampleOutcome(basis: BasisType, rng: Rng): 0 | 1 {
    const p = this.basisProbabilities(basis);
    return (sampleIndex(rng, [p.zero, p.one]) === 0 ? 0 : 1);
  }

  /** Collapses to the eigenstate of the measured outcome in the given basis. */
  collapseTo(basis: BasisType, outcome: 0 | 1): StateVector {
    if (basis === 'Z') return outcome === 0 ? StateVector.zero() : StateVector.one();
    if (basis === 'X') {
      if (outcome === 0) return StateVector.plus();
      return StateVector.minus();
    }
    if (outcome === 0) return StateVector.plusI();
    return StateVector.minusI();
  }

  /* ---- Bloch sphere --------------------------------------------------- */

  /**
   * The Bloch vector, at full double precision.
   *
   * Nothing here is rounded. An earlier version rounded to six decimals on
   * the way out, which quietly made the library's own numbers disagree with
   * exact values — enough to fail a check on x = sin θ by 4e-7. Formatting is
   * the interface's job; the physics returns what it computed.
   */
  getBloch(): BlochCoordinates {
    this.requireQubit();
    const [alpha, beta] = this.amplitudes;
    const p0 = alpha.absSq();
    const p1 = beta.absSq();

    // ⟨σx⟩ = 2Re(α*β), ⟨σy⟩ = 2Im(α*β), ⟨σz⟩ = |α|² − |β|².
    const product = alpha.conj().mul(beta);
    const x = 2 * product.re;
    const y = 2 * product.im;
    const z = p0 - p1;

    const theta = Math.acos(Math.min(1, Math.max(-1, z)));
    const phi = (Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI);

    return { theta, phi, x, y, z, p0, p1 };
  }

  /* ---- Two-qubit analysis --------------------------------------------- */

  private requireTwoQubits(): void {
    if (this.numQubits !== 2) {
      throw new Error(`Two-qubit analysis needs a 2-qubit state, got ${this.numQubits}.`);
    }
  }

  /**
   * C = 2|ad − bc| for |ψ⟩ = a|00⟩ + b|01⟩ + c|10⟩ + d|11⟩.
   * Zero for a product state, one for a maximally entangled pair.
   */
  concurrence(): number {
    this.requireTwoQubits();
    const [a, b, c, d] = this.amplitudes;
    const determinant = a.mul(d).sub(b.mul(c));
    return Math.min(1, 2 * determinant.abs());
  }

  /**
   * Von Neumann entropy of the reduced state, in bits. Computed from the
   * concurrence rather than by tracing out a qubit, which for a pure
   * two-qubit state is exact and far cheaper.
   */
  entanglementEntropy(): number {
    const c = this.concurrence();
    const root = Math.sqrt(Math.max(0, 1 - c * c));
    const eigenvalues = [(1 + root) / 2, (1 - root) / 2];
    return eigenvalues.reduce((entropy, lambda) => {
      if (lambda < NEGLIGIBLE) return entropy;
      return entropy - lambda * Math.log2(lambda);
    }, 0);
  }

  /**
   * Correlation matrix Tᵢⱼ = ⟨ψ|σᵢ ⊗ σⱼ|ψ⟩, rows and columns ordered x, y, z.
   *
   * Evaluated by contracting the 4×4 matrix σᵢ ⊗ σⱼ against the amplitudes.
   * Hand-simplified closed forms are tempting here and were how this was
   * first written, but they are only correct for real amplitudes — the
   * off-diagonal terms pick up conjugates that a real-amplitude derivation
   * silently drops. This path costs a few hundred operations on a four-
   * dimensional state and is called rarely, so correctness wins.
   */
  correlationMatrix(): number[][] {
    this.requireTwoQubits();

    // Index into the 4×4 operator is (output pair)(input pair).
    const pauli: Record<'x' | 'y' | 'z', Complex[][]> = {
      x: [
        [Complex.ZERO, Complex.ONE],
        [Complex.ONE, Complex.ZERO],
      ],
      y: [
        [Complex.ZERO, new Complex(0, -1)],
        [new Complex(0, 1), Complex.ZERO],
      ],
      z: [
        [Complex.ONE, Complex.ZERO],
        [Complex.ZERO, new Complex(-1, 0)],
      ],
    };

    const axes = ['x', 'y', 'z'] as const;
    const rows: number[][] = [];

    for (const left of axes) {
      const row: number[] = [];
      for (const right of axes) {
        let acc = Complex.ZERO;
        for (let outA = 0; outA < 2; outA++) {
          for (let outB = 0; outB < 2; outB++) {
            const outIndex = outA * 2 + outB;
            const bra = this.amplitudes[outIndex].conj();
            for (let inA = 0; inA < 2; inA++) {
              for (let inB = 0; inB < 2; inB++) {
                const operatorEntry = pauli[left][outA][inA].mul(pauli[right][outB][inB]);
                if (operatorEntry.isZero()) continue;
                const inIndex = inA * 2 + inB;
                acc = acc.add(bra.mul(operatorEntry).mul(this.amplitudes[inIndex]));
              }
            }
          }
        }
        // ⟨ψ|σᵢ⊗σⱼ|ψ⟩ is real for Hermitian operators; the imaginary part is
        // floating-point residue.
        row.push(acc.re);
      }
      rows.push(row);
    }

    return rows;
  }

  /**
   * The CHSH parameter S = 2√(u₁² + u₂²), where u₁ and u₂ are the two
   * largest singular values of the correlation matrix (Horodecki criterion).
   *
   * Classical theories obey S ≤ 2; quantum mechanics permits up to
   * Tsirelson's bound 2√2 ≈ 2.828427.
   */
  chsh(): { s: number; violatesBell: boolean } {
    const t = this.correlationMatrix();

    // Singular values of a 3×3 matrix via the eigenvalues of TᵀT.
    let m00 = 0, m01 = 0, m02 = 0, m11 = 0, m12 = 0, m22 = 0;
    for (let i = 0; i < 3; i++) {
      const r0 = t[i][0];
      const r1 = t[i][1];
      const r2 = t[i][2];
      m00 += r0 * r0;
      m01 += r0 * r1;
      m02 += r0 * r2;
      m11 += r1 * r1;
      m12 += r1 * r2;
      m22 += r2 * r2;
    }

    const eigenvalues = symmetricEigenvalues3x3(m00, m01, m02, m11, m12, m22);
    const singular = eigenvalues
      .map((e) => Math.sqrt(Math.max(0, e)))
      .sort((a, b) => b - a);

    const s = 2 * Math.sqrt(singular[0] ** 2 + singular[1] ** 2);
    return {
      s,
      violatesBell: s > 2 + 1e-9,
    };
  }

  /* ---- Presentation --------------------------------------------------- */

  /** Formats as a ket, dropping negligible amplitudes. */
  toKet(precision = 3): string {
    const parts: string[] = [];
    this.amplitudes.forEach((amp, index) => {
      if (amp.abs() < 1e-6) return;
      const bits = index.toString(2).padStart(this.numQubits, '0');
      parts.push(`${amp.toCoefficient(precision)}|${bits}⟩`);
    });
    return parts.length === 0 ? '0' : parts.join(' + ').replace(/\+ −/g, '− ');
  }

  /** Formats a single-qubit state against the |0⟩/|1⟩ labels. */
  toQubitState(id: string, name: string): QubitState {
    this.requireQubit();
    return {
      id,
      name,
      alpha: this.amplitudes[0].toObject(),
      beta: this.amplitudes[1].toObject(),
      bloch: this.getBloch(),
      ket: this.toKet(),
    };
  }
}

/**
 * Eigenvalues of a real symmetric 3×3 matrix, via the trigonometric solution
 * of the characteristic cubic. Closed form rather than iterative: the input
 * is always a 3×3 Gram matrix, so there is no need for a general solver.
 */
function symmetricEigenvalues3x3(
  m00: number, m01: number, m02: number,
  m11: number, m12: number, m22: number,
): [number, number, number] {
  const p1 = m01 * m01 + m02 * m02 + m12 * m12;
  if (p1 < 1e-18) {
    // Already diagonal.
    return [m00, m11, m22];
  }

  const q = (m00 + m11 + m22) / 3;
  const p2 = (m00 - q) ** 2 + (m11 - q) ** 2 + (m22 - q) ** 2 + 2 * p1;
  const p = Math.sqrt(p2 / 6);

  // B = (A − qI)/p, then det(B)/2 = cos(3φ).
  const b00 = (m00 - q) / p;
  const b01 = m01 / p;
  const b02 = m02 / p;
  const b11 = (m11 - q) / p;
  const b12 = m12 / p;
  const b22 = (m22 - q) / p;

  const detB =
    b00 * (b11 * b22 - b12 * b12) -
    b01 * (b01 * b22 - b12 * b02) +
    b02 * (b01 * b12 - b11 * b02);

  let phi = Math.acos(Math.min(1, Math.max(-1, detB / 2))) / 3;
  const eig1 = q + 2 * p * Math.cos(phi);
  const eig3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3);
  phi += (2 * Math.PI) / 3;
  const eig2 = q + 2 * p * Math.cos(phi);

  // e1 ≥ e2 ≥ e3 for a symmetric matrix.
  const sorted = [eig1, eig2, eig3].sort((a, b) => b - a);
  return [sorted[0], sorted[1], sorted[2]];
}
