/*
  Deterministic pseudo-randomness.

  Every stochastic quantity in the simulator — measurement outcomes, Eve's
  basis choices, Monte Carlo sifting — is drawn from an explicitly seeded
  stream. Two consequences that matter for a research tool: a run with a
  given seed is exactly reproducible, and a component that re-renders does
  not silently produce different numbers than it did a moment ago.
*/

export type Rng = () => number;

/**
 * mulberry32 — a small, fast, well-distributed 32-bit generator. Chosen over
 * Math.random for reproducibility, not for cryptographic quality: nothing
 * here needs to resist an attacker, it needs to be repeatable.
 */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Derives a stable seed from any string, so runs can be named and replayed. */
export function seedFromString(text: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Draws an integer in [0, n). */
export function randInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n) % n;
}

/** Draws uniformly from a non-empty list. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[randInt(rng, items.length)];
}

/**
 * Samples an index from a discrete distribution. Used for projective
 * measurement, where the probabilities come from the Born rule.
 */
export function sampleIndex(rng: Rng, probabilities: readonly number[]): number {
  const r = rng();
  let acc = 0;
  for (let i = 0; i < probabilities.length; i++) {
    acc += probabilities[i];
    if (r < acc) return i;
  }
  return probabilities.length - 1;
}
