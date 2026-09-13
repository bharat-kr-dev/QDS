import { Complex } from './complex';
import { StateVector } from './statevector';
import {
  BellStateKey,
  TeleportationStepIndex,
  TeleportationStepInfo,
} from './types';

export interface TeleportationRunResult {
  inputState: StateVector;
  bellKey: BellStateKey;
  classicalBits: [number, number]; // [b1, b2]
  aliceMeasurementOutcome: '00' | '01' | '10' | '11';
  bobIntermediateState: StateVector;
  pauliCorrectionRequired: 'I' | 'X' | 'Z' | 'XZ';
  bobCorrectedState: StateVector;
  fidelity: number;
  steps: Record<TeleportationStepIndex, TeleportationStepInfo>;
}

export function runTeleportation(
  inputState: StateVector,
  bellKey: BellStateKey = 'PHI_PLUS',
  forcedClassicalBits?: [number, number]
): TeleportationRunResult {
  const [alpha, beta] = inputState.amplitudes;

  // Alice measures her 2 qubits in Bell basis
  // In an ideal protocol, each outcome 00, 01, 10, 11 occurs with 25% probability
  const rand = Math.random();
  let bits: [number, number];
  if (forcedClassicalBits) {
    bits = forcedClassicalBits;
  } else {
    if (rand < 0.25) bits = [0, 0];
    else if (rand < 0.5) bits = [0, 1];
    else if (rand < 0.75) bits = [1, 0];
    else bits = [1, 1];
  }

  const outcomeStr = `${bits[0]}${bits[1]}` as '00' | '01' | '10' | '11';

  // Determine Bob's intermediate collapsed state before Pauli correction
  // Based on teleportation algebraic expansion:
  // |psi> (x) |Phi+> = 1/2 [ |00>(alpha|0> + beta|1>)
  //                         + |01>(alpha|1> + beta|0>)
  //                         + |10>(alpha|0> - beta|1>)
  //                         + |11>(alpha|1> - beta|0>) ]
  let intermediateState: StateVector;
  let requiredCorrection: 'I' | 'X' | 'Z' | 'XZ';

  switch (outcomeStr) {
    case '00':
      // Bob has alpha|0> + beta|1> -> Needs I
      intermediateState = new StateVector([alpha, beta]);
      requiredCorrection = 'I';
      break;
    case '01':
      // Bob has alpha|1> + beta|0> = beta|0> + alpha|1> -> Needs X
      intermediateState = new StateVector([beta, alpha]);
      requiredCorrection = 'X';
      break;
    case '10':
      // Bob has alpha|0> - beta|1> -> Needs Z
      intermediateState = new StateVector([alpha, beta.mul(-1)]);
      requiredCorrection = 'Z';
      break;
    case '11':
      // Bob has alpha|1> - beta|0> = -beta|0> + alpha|1> -> Needs X then Z (XZ)
      intermediateState = new StateVector([beta.mul(-1), alpha]);
      requiredCorrection = 'XZ';
      break;
  }

  // Bob applies the required correction
  const bobCorrectedState = intermediateState.applyPauliCorrection(requiredCorrection);
  const fidelity = inputState.fidelity(bobCorrectedState);

  const aStr = alpha.format(3);
  const bStr = beta.format(3);

  const steps: Record<TeleportationStepIndex, TeleportationStepInfo> = {
    1: {
      step: 1,
      title: 'Prepare Signature State',
      shortDesc: 'Alice creates arbitrary quantum signature state |ψ⟩',
      detailedExplanation:
        'Alice initializes the secret quantum state |ψ⟩ = α|0⟩ + β|1⟩ that represents the cryptographic digital signature payload. This state cannot be cloned due to the No-Cloning Theorem.',
      mathState: `|\\psi\\rangle = (${aStr})|0\\rangle + (${bStr})|1\\rangle`,
      circuitHighlight: 'Qubit 0 initialized with |ψ⟩',
      senderState: `|ψ⟩ = (${aStr})|0⟩ + (${bStr})|1⟩`,
      channelState: 'Idle / Quantum Channel Ready',
      receiverState: '|0⟩ (Initialized)',
    },
    2: {
      step: 2,
      title: 'Create Entangled Bell Pair',
      shortDesc: 'Quantum source generates Bell state resource |Φ⁺⟩',
      detailedExplanation:
        'An EPR pair generator creates a maximally entangled state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Qubit A is sent to Alice, and Qubit B is sent to Bob.',
      mathState: '|\\Phi^+\\rangle_{23} = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)',
      circuitHighlight: 'Hadamard on Q1 followed by CNOT(Q1 → Q2)',
      senderState: 'Holds Q0 (|ψ⟩) & Q1 (Bell Half)',
      channelState: 'Distributing Entangled Pair',
      receiverState: 'Holds Q2 (Bell Half)',
    },
    3: {
      step: 3,
      title: 'Entangle Sender & Receiver',
      shortDesc: 'Form joint 3-qubit tripartite state |Ψ₁₂₃⟩',
      detailedExplanation:
        'The composite system of Alice’s signature qubit and the shared Bell pair forms an overall 3-qubit state |Ψ₁₂₃⟩ = |ψ⟩₁ ⊗ |Φ⁺⟩₂₃ across the spatial link.',
      mathState: '|\\Psi_{123}\\rangle = |\\psi\\rangle_1 \\otimes |\\Phi^+\\rangle_{23}',
      circuitHighlight: '3-Qubit Composite System active',
      senderState: 'Qubits 0 & 1 coupled in joint Hilbert space',
      channelState: 'Spacelike quantum entanglement active',
      receiverState: 'Qubit 2 entangled with Alice’s Qubit 1',
    },
    4: {
      step: 4,
      title: 'Alice Bell-State Measurement',
      shortDesc: 'Alice applies CNOT and Hadamard to her qubits',
      detailedExplanation:
        'Alice performs a Bell State Measurement (BSM) by passing Qubit 0 and Qubit 1 through a CNOT gate (Q0 control, Q1 target) and then applying a Hadamard gate to Qubit 0.',
      mathState: '\\text{BSM}_{01} = (H \\otimes I) \\cdot \\text{CNOT}_{01}',
      circuitHighlight: 'CNOT(Q0 → Q1) then H(Q0)',
      senderState: 'Bell basis transformation applied',
      channelState: 'Wavefunction entangling Q0 & Q1',
      receiverState: 'Quantum correlations propagating non-locally',
    },
    5: {
      step: 5,
      title: 'Generate Classical Bits',
      shortDesc: `Alice measures Q0 & Q1, yielding outcome: ${outcomeStr}`,
      detailedExplanation:
        `Alice measures both of her qubits in the computational basis. This projects her qubits into |${bits[0]}⟩ and |${bits[1]}⟩, simultaneously collapsing Bob's qubit into a conditionally transformed version of |ψ⟩.`,
      mathState: `M_0 = ${bits[0]}, \\quad M_1 = ${bits[1]} \\quad \\implies \\text{Bits: } ${outcomeStr}`,
      circuitHighlight: 'Measurement meters on Q0 and Q1',
      senderState: `Measured: Bit 0 = ${bits[0]}, Bit 1 = ${bits[1]}`,
      channelState: `Classical packet [${outcomeStr}] prepared`,
      receiverState: `Collapsed to intermediate state |ψ'⟩`,
      classicalBits: bits,
    },
    6: {
      step: 6,
      title: 'Transmit Classical Bits',
      shortDesc: `Alice transmits [${outcomeStr}] via classical channel to Bob`,
      detailedExplanation:
        `Alice transmits the 2 classical measurement bits '${outcomeStr}' to Bob over a conventional classical channel (fiber/radio). Notice that no quantum state can be reconstructed until these classical bits arrive (preserving relativistic causality / No-Signaling Theorem).`,
      mathState: `\\text{Channel}(b_1, b_2) = \\{${bits[0]}, ${bits[1]}\\}`,
      circuitHighlight: 'Double classical wire from Alice to Bob',
      senderState: `Sent classical syndrome: ${outcomeStr}`,
      channelState: `Transmitting bits [${outcomeStr}] at speed of light`,
      receiverState: 'Awaiting classical bits to determine unitary',
      classicalBits: bits,
    },
    7: {
      step: 7,
      title: 'Apply Pauli Correction',
      shortDesc: `Bob selects and applies correction operator: ${requiredCorrection}`,
      detailedExplanation:
        `Bob receives classical bits '${outcomeStr}'. According to the quantum teleportation decoding rule (00→I, 01→X, 10→Z, 11→XZ), Bob applies the unitary operation ${requiredCorrection} to his qubit to undo the Pauli transformation.`,
      mathState: `U_{\\text{correct}} = \\sigma_${requiredCorrection} \\quad (${outcomeStr} \\to ${requiredCorrection})`,
      circuitHighlight: `Conditional gate ${requiredCorrection} triggered on Q2`,
      senderState: 'Measurement complete (state destroyed locally)',
      channelState: 'Transmission complete',
      receiverState: `Applying unitary ${requiredCorrection} on Qubit 2`,
      classicalBits: bits,
      pauliCorrection: requiredCorrection,
    },
    8: {
      step: 8,
      title: 'Recover Receiver State',
      shortDesc: 'Bob restores exact original signature state |ψ⟩',
      detailedExplanation:
        `Following the unitary Pauli correction, Bob's qubit is now identical in state to Alice's original input state. Quantum state information has been transferred with 100% theoretical fidelity!`,
      mathState: `|\\psi_{\\text{Bob}}\\rangle = (${bobCorrectedState.amplitudes[0].format(3)})|0\\rangle + (${bobCorrectedState.amplitudes[1].format(3)})|1\\rangle`,
      circuitHighlight: 'Q2 output identical to Q0 input',
      senderState: 'Original qubit collapsed (no cloning)',
      channelState: 'Quiescent',
      receiverState: `|ψ_Bob⟩ = (${bobCorrectedState.amplitudes[0].format(3)})|0⟩ + (${bobCorrectedState.amplitudes[1].format(3)})|1⟩`,
      classicalBits: bits,
      pauliCorrection: requiredCorrection,
    },
    9: {
      step: 9,
      title: 'Verify State Fidelity',
      shortDesc: `Fidelity F = ${(fidelity * 100).toFixed(1)}% (Verification Passed)`,
      detailedExplanation:
        'Bob performs projective verification and state tomography. The overlap fidelity F = |⟨ψ_in|ψ_out⟩|² is evaluated. In the absence of channel noise or eavesdropping, fidelity reaches 1.000.',
      mathState: `F = |\\langle \\psi_{\\text{in}} | \\psi_{\\text{out}} \\rangle|^2 = ${(fidelity).toFixed(4)} \\quad (100\\%)`,
      circuitHighlight: 'State Tomography / Projective Verification',
      senderState: 'Verified Alice identity',
      channelState: 'Clean / Uncompromised',
      receiverState: 'Signature state verified and stored',
      classicalBits: bits,
      pauliCorrection: requiredCorrection,
    },
  };

  return {
    inputState,
    bellKey,
    classicalBits: bits,
    aliceMeasurementOutcome: outcomeStr,
    bobIntermediateState: intermediateState,
    pauliCorrectionRequired: requiredCorrection,
    bobCorrectedState,
    fidelity,
    steps,
  };
}
