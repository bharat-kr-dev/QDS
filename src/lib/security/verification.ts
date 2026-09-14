import { StateVector } from '../quantum/statevector';
import type { PauliCorrection, VerificationResult } from '../quantum/types';
import { QBER_THRESHOLD } from '../config';
import { assessThreat, diagnose } from './threat-detection';
import type { StateMixture } from './qber';

/*
  The verifier.

  This module does not compute an error rate of its own. It asks the threat
  assessment for one — which in turn uses the metric shared with the attack
  simulations — and then turns that into a verdict. Keeping one definition of
  the error rate across all three modules is what stops the attack page and
  the verification page from disagreeing about the same run.
*/

export interface VerifyOptions {
  /** The state Alice meant to send. */
  expected: StateVector;
  /** What Bob holds after applying his correction, as a state or mixture. */
  received: StateVector | StateMixture;
  /** The two classical bits Alice sent. */
  classicalBits: [number, number];
  /** The correction Bob actually applied. */
  appliedCorrection: PauliCorrection;
  /**
   * Bit pattern → correction map for the Bell resource in use.
   * Supplied by the caller rather than derived here, so verification stays
   * testable without knowing which resource is loaded.
   */
  correctionSchedule: Record<string, PauliCorrection>;
  threshold?: number;
  /** False when the packet is stale. Defaults to true. */
  freshnessValid?: boolean;
}

export function verifySignature({
  expected,
  received,
  classicalBits,
  appliedCorrection,
  correctionSchedule,
  threshold = QBER_THRESHOLD,
  freshnessValid = true,
}: VerifyOptions): VerificationResult {
  const bitString = `${classicalBits[0]}${classicalBits[1]}`;
  const requiredCorrection: PauliCorrection = correctionSchedule[bitString] ?? 'I';
  const pauliCorrectionCorrect = appliedCorrection === requiredCorrection;

  const report = assessThreat(expected, received, threshold);

  // Fidelity is Σ pᵢ|⟨ψ|φᵢ⟩|² for a mixture, and the plain state fidelity for
  // a single vector. Stated here rather than imported so the fallback is
  // visible: a mixture with no branches would otherwise report 1.0.
  const fidelity =
    received instanceof StateVector
      ? expected.fidelity(received)
      : received.branches.length === 0
        ? 0
        : received.branches.reduce(
            (acc, b) => acc + b.probability * expected.fidelity(b.state),
            0,
          );

  const { verdict, cause, action } = diagnose(
    report,
    fidelity,
    pauliCorrectionCorrect,
    freshnessValid,
    appliedCorrection,
    requiredCorrection,
  );

  return {
    verdict,
    fidelity,
    qber: report.qber,
    threshold: report.threshold,
    mubDisturbanceDetected: report.disturbedBases.length > 0,
    mub: report.mub,
    pauliCorrectionApplied: appliedCorrection,
    pauliCorrectionCorrect,
    freshnessValid,
    cause,
    action,
  };
}
