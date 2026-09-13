import { StateVector } from '../quantum/statevector';
import { BasisType } from '../quantum/types';

export interface MUBCheckResult {
  basis: BasisType;
  expectedDistribution: { outcome0: number; outcome1: number };
  observedDistribution: { outcome0: number; outcome1: number };
  deviationScore: number; // 0.0 (perfect) to 1.0 (maximal disturbance)
  isDisturbed: boolean;
}

export interface ThreatAnalysisReport {
  qber: number;
  threshold: number;
  isQberExceeded: boolean;
  status: 'NORMAL' | 'ELEVATED_NOISE' | 'ANOMALOUS_DISTURBANCE' | 'HIGH_ALERT';
  mubChecks: Record<BasisType, MUBCheckResult>;
  overallDisturbanceScore: number;
  scientificExplanation: string;
  recommendedAction: string;
}

export function calculateQBER(errors: number, totalBits: number): number {
  if (totalBits <= 0) return 0;
  return Number(((errors / totalBits) * 100).toFixed(2));
}

export function performMUBAnalysis(
  originalState: StateVector,
  receivedState: StateVector,
  shotsPerBasis: number = 500
): Record<BasisType, MUBCheckResult> {
  const bases: BasisType[] = ['Z', 'X', 'Y'];
  const results: Partial<Record<BasisType, MUBCheckResult>> = {};

  for (const basis of bases) {
    const expected = originalState.getBasisProbabilities(basis);
    const measured = receivedState.measure(basis, shotsPerBasis);

    const labels =
      basis === 'Z'
        ? { '0': '|0⟩', '1': '|1⟩' }
        : basis === 'X'
        ? { '0': '|+⟩', '1': '|-⟩' }
        : { '0': '|i⟩', '1': '|-i⟩' };

    const obs0 = measured.probabilities[labels['0']] ?? 0;
    const obs1 = measured.probabilities[labels['1']] ?? 0;

    const diff0 = Math.abs(obs0 - expected.outcome0);
    const diff1 = Math.abs(obs1 - expected.outcome1);
    const deviationScore = Number(((diff0 + diff1) / 2).toFixed(4));

    results[basis] = {
      basis,
      expectedDistribution: {
        outcome0: Number(expected.outcome0.toFixed(4)),
        outcome1: Number(expected.outcome1.toFixed(4)),
      },
      observedDistribution: {
        outcome0: Number(obs0.toFixed(4)),
        outcome1: Number(obs1.toFixed(4)),
      },
      deviationScore,
      isDisturbed: deviationScore > 0.08, // > 8% statistical deviation
    };
  }

  return results as Record<BasisType, MUBCheckResult>;
}

export function evaluateThreatReport(
  qber: number,
  threshold: number = 5.0,
  mubResults: Record<BasisType, MUBCheckResult>
): ThreatAnalysisReport {
  const isQberExceeded = qber > threshold;
  const avgMubDeviation =
    (mubResults.Z.deviationScore + mubResults.X.deviationScore + mubResults.Y.deviationScore) / 3;

  let status: 'NORMAL' | 'ELEVATED_NOISE' | 'ANOMALOUS_DISTURBANCE' | 'HIGH_ALERT';
  let scientificExplanation: string;
  let recommendedAction: string;

  if (qber <= threshold && avgMubDeviation < 0.06) {
    status = 'NORMAL';
    scientificExplanation = `The observed Quantum Bit Error Rate (QBER = ${qber.toFixed(2)}%) is within the safe operational threshold of ${threshold.toFixed(1)}%. MUB basis consistency checks confirm that quantum state superpositions remained intact during transmission.`;
    recommendedAction = 'Proceed with signature verification and acceptance.';
  } else if (qber <= threshold && avgMubDeviation >= 0.06) {
    status = 'ELEVATED_NOISE';
    scientificExplanation = `QBER (${qber.toFixed(2)}%) is technically below the threshold, but subtle basis distribution deviations were detected in conjugate bases (${(avgMubDeviation * 100).toFixed(1)}% MUB deviation). This indicates ambient optical drift, minor fiber birefringence, or low-intensity background noise.`;
    recommendedAction = 'Monitor channel stability; increase verification shot sample if critical.';
  } else if (qber > threshold && qber < 20.0) {
    status = 'ANOMALOUS_DISTURBANCE';
    scientificExplanation = `The observed error rate (QBER = ${qber.toFixed(2)}%) exceeds the configured threshold of ${threshold.toFixed(1)}%. Noticeable disturbance across Mutually Unbiased Bases was detected. This may indicate channel thermal noise, optical misalignment, or an uncalibrated receiver. Possible active adversary eavesdropping cannot be ruled out.`;
    recommendedAction = 'Abort signature acceptance; run channel recalibration or decoy pulse verification.';
  } else {
    status = 'HIGH_ALERT';
    scientificExplanation = `Severe channel disturbance detected (QBER = ${qber.toFixed(2)}%, threshold = ${threshold.toFixed(1)}%). State vector overlap collapsed substantially across non-commuting bases. In quantum mechanics, non-orthogonal states cannot be extracted without creating large detectable errors (Born Rule / No-Cloning Theorem).`;
    recommendedAction = 'Immediately reject signature. Reroute quantum key and signature distribution over redundant secure links.';
  }

  return {
    qber,
    threshold,
    isQberExceeded,
    status,
    mubChecks: mubResults,
    overallDisturbanceScore: Number(avgMubDeviation.toFixed(4)),
    scientificExplanation,
    recommendedAction,
  };
}
