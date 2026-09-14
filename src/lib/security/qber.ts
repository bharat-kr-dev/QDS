import { StateVector } from '../quantum/statevector';
import type { BasisType, MubCheck } from '../quantum/types';
import { BASIS_DEVIATION_LIMIT, NOISE_FLOOR, QBER_THRESHOLD, VERIFICATION_SHOTS } from '../config';

/*
  The quantum bit error rate, defined once for the whole simulator.

  In QKD the error rate is a fraction of *sifted* bits: Alice and Bob compare
  a sample of what they actually measured and count disagreements. Nothing
  here has a real detector, so the honest analogue is the statistical distance
  between the distribution Bob's measurements produce and the distribution he
  would see on an undisturbed channel.

  That quantity has a concrete operational meaning: for two distributions over
  the same two outcomes, the distance is the best probability of telling them
  apart by a single measurement. Zero means Bob cannot distinguish the
  received channel from the intended one at all. One means every measurement
  betrays it.

  The earlier implementation reported `(1 − fidelity) × 100`. That is a
  different quantity with a different scale, and it produced the wrong
  behaviour in both directions: a correctly teleported state could show a
  non-zero error rate, and an intercept-resend attack could show a number with
  no relation to the disturbance it caused.
*/

export const BASES: readonly BasisType[] = ['Z', 'X', 'Y'];

/** Distance between two two-outcome distributions: half the L1 distance. */
export function statisticalDistance(
  expected: { zero: number; one: number },
  observed: { zero: number; one: number },
): number {
  return (Math.abs(expected.zero - observed.zero) + Math.abs(expected.one - observed.one)) / 2;
}

/**
 * Mixture of qubit states, as `{ probability, state }` pairs.
 *
 * Needed because an intercept-resend adversary's resent state depends on an
 * outcome she draws at random, so what Bob receives is one branch of a
 * probabilistic mixture rather than a single pure state. Summing the branch
 * probabilities gives the distribution Bob would actually see.
 */
export interface StateMixture {
  readonly branches: readonly { probability: number; state: StateVector }[];
}

/** Born-rule distribution of a mixture — linear because probability is linear. */
export function mixtureDistribution(
  mixture: StateMixture,
  basis: BasisType,
): { zero: number; one: number } {
  let zero = 0;
  let one = 0;
  let total = 0;

  for (const { probability, state } of mixture.branches) {
    const p = state.basisProbabilities(basis);
    zero += probability * p.zero;
    one += probability * p.one;
    total += probability;
  }

  // A mixture whose weights were rounded can fall a hair short of unity.
  if (total > 0 && Math.abs(total - 1) > 1e-12) {
    return { zero: zero / total, one: one / total };
  }
  return { zero, one };
}

export interface QberReport {
  /**
   * Headline figure: the largest per-basis deviation.
   *
   * The maximum rather than the mean, because the bases are checked
   * independently and each is a chance to catch the attacker. A phase
   * rotation, for instance, leaves Z perfectly intact and shows up only in
   * the conjugate bases — averaging would let a 20% disturbance in one basis
   * hide behind two clean ones and slip under the bound.
   */
  qber: number;
  /** Mean of the three, for reference. */
  mean: number;
  threshold: number;
  perBasis: Record<BasisType, number>;
  exceedsThreshold: boolean;
  mub: Record<BasisType, MubCheck>;
}

/**
 * Error rate between what was intended and what arrived.
 *
 * Accepts a pure state or a mixture for the received side, so an attack that
 * only produces a branch and an attack that produces a definite state are
 * measured by exactly the same rule.
 */
export function computeQber(
  expected: StateVector,
  received: StateVector | StateMixture,
  threshold: number = QBER_THRESHOLD,
): QberReport {
  const mixture: StateMixture =
    received instanceof StateVector ? { branches: [{ probability: 1, state: received }] } : received;

  const perBasis = {} as Record<BasisType, number>;
  const mub = {} as Record<BasisType, MubCheck>;

  for (const basis of BASES) {
    const e = expected.basisProbabilities(basis);
    const r = mixtureDistribution(mixture, basis);
    const deviation = statisticalDistance(e, r);

    perBasis[basis] = deviation;
    mub[basis] = {
      basis,
      expected: { zero: e.zero, one: e.one },
      observed: { zero: r.zero, one: r.one },
      deviation,
      disturbed: deviation * 100 > BASIS_DEVIATION_LIMIT,
    };
  }

  const values = BASES.map((b) => perBasis[b]);
  const qber = Math.max(...values) * 100;
  const mean = (values.reduce((a, b) => a + b, 0) / values.length) * 100;

  return {
    qber,
    mean,
    threshold,
    perBasis,
    exceedsThreshold: qber > threshold,
    mub,
  };
}

/** Per-basis disagreements, in percentage points, for the readout strip. */
export function basisDisagreement(report: QberReport): Record<BasisType, number> {
  return {
    Z: report.perBasis.Z * 100,
    X: report.perBasis.X * 100,
    Y: report.perBasis.Y * 100,
  };
}

/**
 * A basis is "disturbed" only when it clears both the absolute deviation
 * limit and the configured noise floor, so a channel sitting exactly at the
 * floor is not reported as an anomaly.
 */
export function isDisturbed(report: QberReport, basis: BasisType): boolean {
  const pct = report.perBasis[basis] * 100;
  return pct > BASIS_DEVIATION_LIMIT && pct > NOISE_FLOOR;
}

/**
 * Half the states checked by verification. Kept as a function so the shot
 * count is stated where it is used rather than passed around as a literal.
 */
export function verificationShots(): number {
  return VERIFICATION_SHOTS;
}
