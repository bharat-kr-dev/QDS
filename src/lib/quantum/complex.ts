import { ComplexNumber } from './types';

export class Complex {
  readonly re: number;
  readonly im: number;

  constructor(re: number = 0, im: number = 0) {
    this.re = Number.isFinite(re) ? re : 0;
    this.im = Number.isFinite(im) ? im : 0;
  }

  static from(c: ComplexNumber | number): Complex {
    if (typeof c === 'number') {
      return new Complex(c, 0);
    }
    return new Complex(c.re, c.im);
  }

  static zero(): Complex {
    return new Complex(0, 0);
  }

  static one(): Complex {
    return new Complex(1, 0);
  }

  static i(): Complex {
    return new Complex(0, 1);
  }

  static polar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
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
      this.re * o.im + this.im * o.re
    );
  }

  div(other: Complex | ComplexNumber | number): Complex {
    if (typeof other === 'number') {
      if (other === 0) return Complex.zero();
      return new Complex(this.re / other, this.im / other);
    }
    const o = Complex.from(other);
    const denom = o.re * o.re + o.im * o.im;
    if (denom === 0) return Complex.zero();
    return new Complex(
      (this.re * o.re + this.im * o.im) / denom,
      (this.im * o.re - this.re * o.im) / denom
    );
  }

  conj(): Complex {
    return new Complex(this.re, -this.im);
  }

  magSq(): number {
    return this.re * this.re + this.im * this.im;
  }

  mag(): number {
    return Math.sqrt(this.magSq());
  }

  phase(): number {
    return Math.atan2(this.im, this.re);
  }

  equals(other: Complex | ComplexNumber, tolerance: number = 1e-6): boolean {
    const o = Complex.from(other);
    return (
      Math.abs(this.re - o.re) <= tolerance &&
      Math.abs(this.im - o.im) <= tolerance
    );
  }

  format(precision: number = 3): string {
    const r = Math.abs(this.re) < 1e-10 ? 0 : this.re;
    const i = Math.abs(this.im) < 1e-10 ? 0 : this.im;

    if (i === 0) return r.toFixed(precision);
    if (r === 0) {
      if (i === 1) return 'i';
      if (i === -1) return '-i';
      return `${i.toFixed(precision)}i`;
    }

    const sign = i > 0 ? '+' : '-';
    const absI = Math.abs(i);
    const iStr = absI === 1 ? 'i' : `${absI.toFixed(precision)}i`;
    return `${r.toFixed(precision)} ${sign} ${iStr}`;
  }

  toObject(): ComplexNumber {
    return { re: this.re, im: this.im };
  }
}
