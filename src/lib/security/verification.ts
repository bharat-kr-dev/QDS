import { StateVector } from '../quantum/statevector';
import { VerificationResult, VerificationVerdict } from '../quantum/types';
import { evaluateThreatReport, performMUBAnalysis } from './threat-detection';

export function verifySignature(
  expectedState: StateVector,
  receivedState: StateVector,
  classicalBits: [number, number],
  appliedCorrection: 'I' | 'X' | 'Z' | 'XZ',
  threshold: number = 5.0,
  freshnessValid: boolean = true
): VerificationResult {
  // Determine theoretically required Pauli correction for the classical syndrome
  const bitString = `${classicalBits[0]}${classicalBits[1]}`;
  let expectedCorrection: 'I' | 'X' | 'Z' | 'XZ';
  switch (bitString) {
    case '00':
      expectedCorrection = 'I';
      break;
    case '01':
      expectedCorrection = 'X';
      break;
    case '10':
      expectedCorrection = 'Z';
      break;
    case '11':
      expectedCorrection = 'XZ';
      break;
    default:
      expectedCorrection = 'I';
  }

  const pauliCorrectionCorrect = appliedCorrection === expectedCorrection;

  // Calculate Fidelity F = |<psi_expected | psi_received>|^2
  const fidelity = expectedState.fidelity(receivedState);

  // Perform MUB analysis
  const mubResults = performMUBAnalysis(expectedState, receivedState, 600);

  // Approximate QBER from fidelity and basis disturbance
  const rawQber = Math.max(0, (1 - fidelity) * 100);
  const threatReport = evaluateThreatReport(rawQber, threshold, mubResults);

  // Determine classification verdict
  let verdict: VerificationVerdict;
  let summary: string;
  let details: string;
  let cause: string;
  let recommendedAction: string;

  if (!freshnessValid) {
    verdict = 'TAMPERED';
    summary = 'Signature Stale / Replay Flagged';
    details = 'The quantum state matches, but the protocol-layer freshness timestamp / cryptographic nonce is expired or replayed.';
    cause = 'Replay attack or network packet delay.';
    recommendedAction = 'Discard signature and require fresh signed session token.';
  } else if (!pauliCorrectionCorrect) {
    verdict = 'INVALID';
    summary = 'Incorrect Pauli Correction Applied';
    details = `Bob applied correction '${appliedCorrection}', but classical bits '${bitString}' require unitary '${expectedCorrection}'.`;
    cause = 'Classical channel transmission error, decoding malfunction, or manual override error.';
    recommendedAction = `Apply the correct Pauli operation (${expectedCorrection}) to restore state alignment.`;
  } else if (fidelity >= 0.95 && rawQber <= threshold) {
    verdict = 'VALID';
    summary = 'Quantum Signature Authenticated';
    details = `Fidelity is ${(fidelity * 100).toFixed(1)}% and QBER is ${rawQber.toFixed(2)}%, well within the ${threshold}% security threshold.`;
    cause = 'Unimpaired quantum teleportation and authentic Bell pair entanglement.';
    recommendedAction = 'Accept digital signature as cryptographically valid.';
  } else if (fidelity >= 0.80 && rawQber <= threshold * 2) {
    verdict = 'SUSPICIOUS';
    summary = 'Subtle Disturbance Detected';
    details = `Fidelity dropped to ${(fidelity * 100).toFixed(1)}% with an error rate of ${rawQber.toFixed(2)}%.`;
    cause = 'Moderate channel decoherence, optical loss, or low-probability eavesdropping probing.';
    recommendedAction = 'Conduct secondary basis tomography or increase decoy sample rate before final commitment.';
  } else {
    verdict = 'TAMPERED';
    summary = 'Significant State Collapse / Tampering';
    details = `Fidelity is low (${(fidelity * 100).toFixed(1)}%) with elevated QBER (${rawQber.toFixed(2)}%).`;
    cause = 'Active interception measurement (Intercept-Resend), unauthenticated forgery attempt, or severe channel fault.';
    recommendedAction = 'Reject signature immediately. Flag channel as compromised.';
  }

  return {
    verdict,
    fidelity: Number(fidelity.toFixed(4)),
    qber: Number(rawQber.toFixed(2)),
    threshold,
    mubDisturbanceDetected: mubResults.Z.isDisturbed || mubResults.X.isDisturbed || mubResults.Y.isDisturbed,
    mubScores: {
      zBasisError: Number((mubResults.Z.deviationScore * 100).toFixed(2)),
      xBasisError: Number((mubResults.X.deviationScore * 100).toFixed(2)),
      yBasisError: Number((mubResults.Y.deviationScore * 100).toFixed(2)),
    },
    pauliCorrectionApplied: appliedCorrection,
    pauliCorrectionCorrect,
    freshnessValid,
    scientificDiagnosis: {
      summary,
      details,
      cause,
      recommendedAction,
    },
  };
}
