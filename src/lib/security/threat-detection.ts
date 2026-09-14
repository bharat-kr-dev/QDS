import { StateVector } from '../quantum/statevector';
import type { BasisType, MubCheck, VerificationResult } from '../quantum/types';
import { QBER_THRESHOLD, TAMPER_MULTIPLE } from '../config';
import { BASES, computeQber, isDisturbed, type QberReport, type StateMixture } from './qber';

export { computeQber, basisDisagreement, mixtureDistribution } from './qber';
export type { QberReport, StateMixture } from './qber';

/*
  Reading a disturbance.

  An error rate alone says a channel is noisy. It does not say *why*. The
  pattern across the three mutually unbiased bases does, because different
  faults break different symmetries:

    phase rotation   Z populations untouched, X and Y shifted. The state
                     vector moved but the measurement statistics along the
                     phase axis did not, so only the conjugate bases see it.

    intercept-resend every basis disturbed roughly equally. Measuring in a
    interceptions      basis the sender did not use randomises the outcome,
                     and the adversary cannot restore what she destroyed.

    replay           nothing disturbed at all. The state is genuine — it is
                     simply old. No quantum measurement can detect this,
                     which is why the protocol needs a nonce.

  Separating drift from attack is the difference between recalibrating and
  shutting the link down, so it is worth the extra basis.
*/

export type ThreatLevel = 'CLEAR' | 'DRIFTING' | 'SUSPECT' | 'COMPROMISED';
export interface ThreatReport {
  level: ThreatLevel;
  /** Headline error rate, in percent. */
  qber: number;
  threshold: number;
  exceedsThreshold: boolean;
  mub: Record<BasisType, MubCheck>;
  perBasis: Record<BasisType, number>;
  disturbedBases: BasisType[];
  /**
   * True when only the conjugate bases deviate while Z holds.
   * A phase rotation looks like this; an interception does not.
   */
  phaseLike: boolean;
  /** True when all three bases deviate substantially — the interception signature. */
  broadDisturbance: boolean;
  report: QberReport;
}

export function assessThreat(
  expected: StateVector,
  received: StateVector | StateMixture,
  threshold: number = QBER_THRESHOLD,
): ThreatReport {
  const report = computeQber(expected, received, threshold);

  const disturbedBases = BASES.filter((b) => isDisturbed(report, b));
  const zClean = !isDisturbed(report, 'Z');
  const conjugateDisturbed = isDisturbed(report, 'X') || isDisturbed(report, 'Y');

  const phaseLike = zClean && conjugateDisturbed;
  const broadDisturbance = disturbedBases.length === 3 && report.qber > threshold / 2;

  let level: ThreatLevel;
  if (report.qber <= 1e-9) {
    level = 'CLEAR';
  } else if (report.qber <= threshold && disturbedBases.length === 0) {
    level = 'CLEAR';
  } else if (report.qber <= threshold) {
    level = 'DRIFTING';
  } else if (report.qber < threshold * TAMPER_MULTIPLE) {
    level = 'SUSPECT';
  } else {
    level = 'COMPROMISED';
  }

  return {
    level,
    qber: report.qber,
    threshold,
    exceedsThreshold: report.exceedsThreshold,
    mub: report.mub,
    perBasis: {
      Z: report.perBasis.Z * 100,
      X: report.perBasis.X * 100,
      Y: report.perBasis.Y * 100,
    },
    disturbedBases,
    phaseLike,
    broadDisturbance,
    report,
  };
}

export function levelLabel(level: ThreatLevel): string {
  switch (level) {
    case 'CLEAR':
      return 'Clear';
    case 'DRIFTING':
      return 'Drifting';
    case 'SUSPECT':
      return 'Suspect';
    case 'COMPROMISED':
      return 'Compromised';
  }
}

/**
 * The sentence a verifier would write.
 *
 * Ordered by what the evidence can actually establish. A stale packet is
 * reported before anything quantum, because freshness is the one failure no
 * measurement of the state can reveal — the state is perfect in that case,
 * which is exactly the problem.
 */
export function diagnose(
  report: ThreatReport,
  fidelity: number,
  correctionCorrect: boolean,
  freshnessValid: boolean,
  appliedCorrection: string,
  requiredCorrection: string,
): Pick<VerificationResult, 'verdict' | 'cause' | 'action'> {
  const qber = report.qber.toFixed(2);
  const fidelityPct = (fidelity * 100).toFixed(1);

  if (!freshnessValid) {
    return {
      verdict: 'TAMPERED',
      cause:
        'The state is intact, but the packet is older than the replay window allows. Nothing in the quantum channel can reveal this — only the timestamp can.',
      action: 'Reject, and require a freshly issued token. Discard the recorded transcript.',
    };
  }

  if (!correctionCorrect) {
    return {
      verdict: 'INVALID',
      cause: `The correction applied was ${appliedCorrection}, where the transmitted bits call for ${requiredCorrection}. The receiver is misaligned with the sender rather than under attack.`,
      action: `Apply ${requiredCorrection} and re-verify. If the mismatch persists, inspect the classical channel rather than the quantum one.`,
    };
  }

  if (report.level === 'CLEAR') {
    const residual = report.qber < 0.01 ? 'No basis deviates measurably.' : `The largest basis deviation is ${qber}%.`;
    return {
      verdict: 'VALID',
      cause: `Fidelity is ${fidelityPct}%. ${residual} Nothing here is distinguishable from an undisturbed channel.`,
      action: 'Accept the signature.',
    };
  }

  if (report.level === 'DRIFTING') {
    const pattern = report.phaseLike
      ? 'Only X and Y deviate while Z is untouched. That is the signature of a phase-type fault — a rotation or a dephasing — rather than a bit flip, because neither can move the populations along the axis it acts on.'
      : 'Deviation is spread across the bases but stays small and even, which is what ordinary link drift looks like.';
    return {
      verdict: 'SUSPICIOUS',
      cause: `The error rate is ${qber}%, under the ${report.threshold}% bound but above the noise floor. ${pattern}`,
      action: 'Repeat the run with a larger sample, or recalibrate before trusting this link at length.',
    };
  }

  if (report.level === 'SUSPECT') {
    return {
      verdict: 'SUSPICIOUS',
      cause: `The error rate is ${qber}%, past the ${report.threshold}% bound. Disturbance of this size is larger than channel drift accounts for.`,
      action: 'Treat this signature as unproven. Re-run with decoy pulses to establish whether the loss is environmental.',
    };
  }

  const pattern = report.broadDisturbance
    ? `Every basis is disturbed, Z included (${report.perBasis.Z.toFixed(1)}% / ${report.perBasis.X.toFixed(1)}% / ${report.perBasis.Y.toFixed(1)}%). A phase rotation cannot do that — only a measurement can.`
    : 'Disturbance is far beyond anything the channel produces on its own.';

  return {
    verdict: 'TAMPERED',
    cause: `The error rate is ${qber}%, well past the ${report.threshold}% bound. ${pattern}`,
    action: 'Reject. Treat the channel as compromised and re-establish the key by other means.',
  };
}
