import { Complex } from './complex';
import { StateVector } from './statevector';
import { AttackConfig, BasisType, DecoyStateData } from './types';

export interface AttackSimulationResult {
  config: AttackConfig;
  originalState: StateVector;
  disturbedState: StateVector;
  eveBasisUsed?: BasisType;
  eveMeasurementOutcome?: string;
  inducedQBER: number;
  fidelity: number;
  disturbanceDetected: boolean;
  explanation: string;
  attackMechanism: string;
}

export function simulateAttack(
  originalState: StateVector,
  config: AttackConfig
): AttackSimulationResult {
  if (!config.enabled || config.type === 'none') {
    // Normal clean or slight ambient thermal noise
    const noise = config.noiseLevel || 0;
    let disturbedState = originalState;
    let qber = 0;

    if (noise > 0) {
      // Depolarizing / phase noise
      const phaseRad = (noise * Math.PI) / 4;
      disturbedState = originalState.applyPhaseShift(phaseRad);
      qber = Number((noise * 0.15 * 100).toFixed(2));
    }

    const fidelity = originalState.fidelity(disturbedState);

    return {
      config,
      originalState,
      disturbedState,
      inducedQBER: qber,
      fidelity: Number(fidelity.toFixed(4)),
      disturbanceDetected: qber > 5.0,
      explanation:
        noise > 0
          ? `Standard transmission with minor ambient background noise (${(noise * 100).toFixed(1)}%). QBER is within normal operational tolerances.`
          : 'Ideal transmission across a secure quantum channel with zero eavesdropping. Fidelity is 1.000.',
      attackMechanism: 'Standard quantum channel without active adversary interference.',
    };
  }

  if (config.type === 'intercept_resend') {
    // Eve intercepts the qubit and measures in a basis
    let eveBasis: BasisType;
    if (config.interceptBasis === 'RANDOM' || !config.interceptBasis) {
      const bases: BasisType[] = ['Z', 'X', 'Y'];
      eveBasis = bases[Math.floor(Math.random() * bases.length)];
    } else {
      eveBasis = config.interceptBasis;
    }

    // Eve performs projective measurement in eveBasis
    const measurement = originalState.measure(eveBasis, 1);
    const outcomeLabel = Object.keys(measurement.counts).find(
      (k) => measurement.counts[k] > 0
    ) || '|0⟩';

    // Eve re-prepares a fresh qubit in that eigenstate and sends it forward
    let rePreparedState: StateVector;
    if (eveBasis === 'Z') {
      rePreparedState = outcomeLabel.includes('0') ? StateVector.zero() : StateVector.one();
    } else if (eveBasis === 'X') {
      rePreparedState = outcomeLabel.includes('+') ? StateVector.plus() : StateVector.minus();
    } else {
      rePreparedState = outcomeLabel.includes('i') && !outcomeLabel.includes('-')
        ? StateVector.plusI()
        : StateVector.minusI();
    }

    // In BB84 / QDS teleportation schemes, measuring in an incompatible basis causes ~25% QBER
    // across random basis selections, or up to 50% in conjugate bases
    const fidelity = originalState.fidelity(rePreparedState);
    const inducedQBER = Number(((1 - fidelity) * 50 + (Math.random() * 4 - 2)).toFixed(2));
    const finalQBER = Math.max(0, Math.min(50, inducedQBER));

    return {
      config,
      originalState,
      disturbedState: rePreparedState,
      eveBasisUsed: eveBasis,
      eveMeasurementOutcome: outcomeLabel,
      inducedQBER: finalQBER,
      fidelity: Number(fidelity.toFixed(4)),
      disturbanceDetected: finalQBER > 5.0,
      explanation: `The adversary intercepted the quantum state and performed a projective measurement in the ${eveBasis}-basis, obtaining ${outcomeLabel}. Because quantum states cannot be measured non-destructively without collapsing superpositions (Heisenberg Uncertainty / Born Rule), the re-sent state suffered observable disturbance.`,
      attackMechanism: `Intercept-Resend Attack: Adversary measured in ${eveBasis} basis and retransmitted ${outcomeLabel}, collapsing non-orthogonal quantum superposition.`,
    };
  }

  if (config.type === 'forgery') {
    // Attacker tries to generate a counterfeit quantum signature state without the sender's private basis choices
    const strategy = config.forgeryStrategy || 'random_state';
    let forgedState: StateVector;

    if (strategy === 'random_state') {
      // Random state on Bloch sphere
      const randomTheta = Math.PI * Math.random();
      const randomPhi = 2 * Math.PI * Math.random();
      forgedState = StateVector.fromAngles(randomTheta, randomPhi);
    } else if (strategy === 'orthogonal_guess') {
      // Orthogonal state
      forgedState = originalState.applyPauliX();
    } else {
      // 45-degree misaligned state
      forgedState = originalState.applyHadamard();
    }

    const fidelity = originalState.fidelity(forgedState);
    const inducedQBER = Number(((1 - fidelity) * 60).toFixed(2));

    return {
      config,
      originalState,
      disturbedState: forgedState,
      inducedQBER: Math.max(0, Math.min(60, inducedQBER)),
      fidelity: Number(fidelity.toFixed(4)),
      disturbanceDetected: fidelity < 0.9,
      explanation: `The adversary generated a forged signature state without knowing the authentic basis selections. Verification projection against the expected receiver state failed with a low fidelity of ${(fidelity * 100).toFixed(1)}%.`,
      attackMechanism: `Quantum Forgery Attempt: Unauthenticated party constructed an estimated state via ${strategy.replace('_', ' ')}.`,
    };
  }

  if (config.type === 'replay') {
    // Replay attack: Eve captures a valid state/classical packet and re-injects it later
    const nonceValid = config.nonceValid ?? false;
    const delay = config.replayDelaySeconds || 45;

    // The quantum state might look valid in isolation, but the protocol layer flags invalid nonce/timestamp
    return {
      config,
      originalState,
      disturbedState: originalState,
      inducedQBER: 0.0,
      fidelity: 1.0,
      disturbanceDetected: !nonceValid,
      explanation: nonceValid
        ? 'Replay test with fresh cryptographic nonce passed verification.'
        : `Replay attack detected at the protocol layer! Although the quantum state matched (Fidelity = 1.000), the packet timestamp/nonce expired (${delay}s old). Replay protection rejected the stale signature.`,
      attackMechanism: `Replay Attack: Re-injection of previously captured classical syndrome bits and state vector with expired nonce (T = ${delay}s).`,
    };
  }

  if (config.type === 'phase_shift') {
    const angleDeg = config.phaseAngleDeg ?? 45;
    const angleRad = (angleDeg * Math.PI) / 180;
    const disturbedState = originalState.applyPhaseShift(angleRad);
    const fidelity = originalState.fidelity(disturbedState);
    const inducedQBER = Number(((1 - fidelity) * 40).toFixed(2));

    return {
      config,
      originalState,
      disturbedState,
      inducedQBER,
      fidelity: Number(fidelity.toFixed(4)),
      disturbanceDetected: inducedQBER > 5.0,
      explanation: `A continuous phase rotation of θ = ${angleDeg}° was applied along the Z-axis (Rz operator). This alters the relative phase of the superposition, causing detectable error in the X and Y bases while leaving Z-basis populations invariant.`,
      attackMechanism: `Phase Noise / Channel Dephasing: Unitary transformation R_z(${angleDeg}°) rotated relative quantum phase.`,
    };
  }

  // Custom noise
  const noise = config.noiseLevel || 0.15;
  const phaseShift = (noise * Math.PI);
  const disturbedState = originalState.applyPhaseShift(phaseShift);
  const fidelity = originalState.fidelity(disturbedState);
  const qber = Number((noise * 35).toFixed(2));

  return {
    config,
    originalState,
    disturbedState,
    inducedQBER: qber,
    fidelity: Number(fidelity.toFixed(4)),
    disturbanceDetected: qber > 5.0,
    explanation: `Generalized channel noise (${(noise * 100).toFixed(1)}%) introduced stochastic phase drift and state degradation across the transmission medium.`,
    attackMechanism: `Channel Disturbance / Thermal Depolarization at ${(noise * 100).toFixed(1)}% intensity.`,
  };
}

// Decoy State Analysis Simulator
export function calculateDecoyStateMetrics(
  signalIntensity: number = 0.5,
  decoyIntensity: number = 0.1,
  channelLoss: number = 0.2, // 20% loss
  eavesdropperPresent: boolean = false
): DecoyStateData {
  // In decoy-state QKD/QDS, signal pulses (mu ~ 0.5) and decoy pulses (nu ~ 0.1)
  // have predictable Poisson photon number statistics: P(n|mu) = e^(-mu) mu^n / n!
  // An eavesdropper performing Photon Number Splitting (PNS) selectively taps multi-photon pulses
  // which causes an anomalous disparity between the gain of signal vs decoy states:
  // Q_mu / mu != Q_nu / nu

  const baseTransmission = 1 - channelLoss;
  let signalGain = baseTransmission * (1 - Math.exp(-signalIntensity));
  let decoyGain = baseTransmission * (1 - Math.exp(-decoyIntensity));
  let signalQBER = 1.2;
  let decoyQBER = 1.5;

  if (eavesdropperPresent) {
    // PNS attack attenuates single photons more than multi-photons, distorting yield estimates
    decoyGain *= 0.45; // Decoy (mostly single-photon) suffers heavy loss
    signalGain *= 0.85; // Signal (more multi-photon) passes more
    signalQBER += 8.5;
    decoyQBER += 14.2;
  }

  const normalizedSignalYield = signalGain / signalIntensity;
  const normalizedDecoyYield = decoyGain / decoyIntensity;
  const yieldDisparity = Math.abs(normalizedSignalYield - normalizedDecoyYield) / normalizedSignalYield;

  const pnsAttackDetected = eavesdropperPresent || yieldDisparity > 0.25;

  return {
    signalIntensity,
    decoyIntensity,
    signalGain: Number(signalGain.toFixed(4)),
    decoyGain: Number(decoyGain.toFixed(4)),
    signalQBER: Number(signalQBER.toFixed(2)),
    decoyQBER: Number(decoyQBER.toFixed(2)),
    estimatedSinglePhotonYield: Number((decoyGain / (decoyIntensity * Math.exp(-decoyIntensity))).toFixed(4)),
    pnsAttackDetected,
    explanation: pnsAttackDetected
      ? 'Anomalous decoy yield disparity detected! The transmission yield of weak decoy pulses differs substantially from signal pulses, indicating a possible Photon Number Splitting (PNS) attack or selective channel attenuation.'
      : 'Decoy state verification passed. The observed yield ratio Q_μ/μ ≈ Q_ν/ν matches theoretical single-photon Poisson statistics within bounds, proving multi-photon beam splitting attacks are absent.',
  };
}
