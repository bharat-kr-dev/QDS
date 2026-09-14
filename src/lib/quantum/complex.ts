import type { ComplexNumber } from './types';

const TOLERANCE = 1e-10;

/**
 * A complex amplitude.
 *
 * Immutable, and deliberately small: the simulator performs millions of these
 * operations, so each method returns a new value rather than mutating.
 * Non-finite inputs collapse to zero instead of poisoning a whole state
 * vector with NaN, which is the failure mode that is hardest to trace back.
 */
export class Complex {
  readonly re: number;
  readonly im: number;

  constructor(re = 0, im = 0) {
    this.re = Number.isFinite(re) ? re : 0;
    this.im = Number.isFinite(im) ? im : 0;
  }

  static from(value: Complex | ComplexNumber | number): Complex {
    if (typeof value === 'number') return new Complex(value, 0);
    if (value instanceof Complex) return value;
    return new Complex(value.re, value.im);
  }

  static readonly ZERO = new Complex(0, 0);
  static readonly ONE = new Complex(1, 0);
  static readonly I = new Complex(0, 1);

  static polar(radius: number, theta: number): Complex {
    return new Complex(radius * Math.cos(theta), radius * Math.sin(theta));
  }

  add(other: Complex | ComplexNumber | number): Complex {
    const o = Complex.from(other);
    return new Complex(this.re + o.re, this.im + o.im);
  }

  sub(other: Complex | ComplexNumber | number): Complex {
    const o = Complex.from(other);
    return new Complex(this.re - o.re, this.im - o.im);
  }

  mul(other: Complex | ComplexNumber | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re * other, this.im * other);
    }
    const o = Complex.from(other);
    return new Complex(
      this.re * o.re - this.im * o.im,
      this.re * o.im + this.im * o.re,
    );
  }

  div(other: Complex | ComplexNumber | number): Complex {
    if (typeof other === 'number') {
      return other === 0 ? Complex.ZERO : new Complex(this.re / other, this.im / other);
    }
    const o = Complex.from(other);
    const denom = o.re * o.re + o.im * o.im;
    if (denom < TOLERANCE) return Complex.ZERO;
    return new Complex(
      (this.re * o.re + this.im * o.im) / denom,
      (this.im * o.re - this.re * o.im) / denom,
    );
  }

  neg(): Complex {
    return new Complex(-this.re, -this.im);
  }

  /** Complex conjugate, written with a bar over the symbol in texts. */
  conj(): Complex {
    return new Complex(this.re, -this.im);
  }

  /** |z|² — the Born-rule probability of this amplitude. */
  absSq(): number {
    return this.re * this.re + this.im * this.im;
  }

  /** |z| */
  abs(): number {
    return Math.sqrt(this.absSq());
  }

  /** arg(z), in radians on (-π, π]. */
  phase(): number {
    return Math.atan2(this.im, this.re);
  }

  equals(other: Complex | ComplexNumber, tolerance = 1e-9): boolean {
    const o = Complex.from(other);
    return Math.abs(this.re - o.re) <= tolerance && Math.abs(this.im - o.im) <= tolerance;
  }

  isZero(tolerance = TOLERANCE): boolean {
    return Math.abs(this.re) < tolerance && Math.abs(this.im) < tolerance;
  }

  toObject(): ComplexNumber {
    return { re: this.re, im: this.im };
  }

  /** Human-readable form, for prose and diagnostics rather than the UI. */
  toString(precision = 3): string {
    const r = Math.abs(this.re) < TOLERANCE ? 0 : this.re;
    const i = Math.abs(this.im) < TOLERANCE ? 0 : this.im;

    if (i === 0) return r.toFixed(precision);
    if (r === 0) {
      if (Math.abs(i - 1) < TOLERANCE) return 'i';
      if (Math.abs(i + 1) < TOLERANCE) return '-i';
      return `${i.toFixed(precision)}i`;
    }
    const sign = i > 0 ? '+' : '−';
    const magnitude = Math.abs(i);
    const imaginary = Math.abs(magnitude - 1) < TOLERANCE ? 'i' : `${magnitude.toFixed(precision)}i`;
    return `${r.toFixed(precision)} ${sign} ${imaginary}`;
  }

  /**
   * Arithmetic form for ket coefficients, where a bare 1 reads better than
   * "1.000" and the sign belongs to the coefficient itself.
   */
  toCoefficient(precision = 3): string {
    const r = Math.abs(this.re) < 1e-6 ? 0 : this.re;
    const i = Math.abs(this.im) < 1e-6 ? 0 : this.im;

    const round = (v: number) => {
      const rounded = Number(v.toFixed(precision));
      return Object.is(rounded, -0) ? 0 : rounded;
    };
    const r2 = round(r);
    const i2 = round(i);

    if (i2 === 0) return String(r2);
    const sign = i2 > 0 ? '+' : '−';
    const magnitude = Math.abs(i2);
    const imaginary = magnitude === 1 ? 'i' : `${magnitude}i`;
    if (r2 === 0) return i2 < 0 ? `−${imaginary}` : imaginary;
    return `${r2} ${sign} ${imaginary}`;
  }
}
