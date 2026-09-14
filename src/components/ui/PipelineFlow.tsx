'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import {
  IconSignature,
  IconEntangle,
  IconTeleport,
  IconClassical,
  IconPauli,
  IconReceive,
  IconVerify,
  IconThreat,
  IconCheck,
  IconChevronRight,
} from '../icons/Icons';

export interface PipelineStage {
  id: string;
  name: string;
  subtitle: string;
  category: 'quantum' | 'classical' | 'security';
  icon: React.ReactNode;
  routeHref: string;
  details: {
    purpose: string;
    mathForm: string;
    inputs: string;
    outputs: string;
    currentState: string;
  };
}

export const PipelineFlow: React.FC = () => {
  const {
    inputState,
    bellKey,
    teleportation,
    attack,
    verification,
    manualCorrection,
    autoCorrection,
  } = useQuantum();

  const [activeStageId, setActiveStageId] = useState<string>('teleportation');

  const appliedCorrection = autoCorrection
    ? teleportation.pauliCorrectionRequired
    : manualCorrection;

  const stages: PipelineStage[] = [
    {
      id: 'sender',
      name: '1. Alice (Sender)',
      subtitle: 'Signature State Source',
      category: 'quantum',
      icon: <IconSignature size={24} className="text-quantum" />,
      routeHref: '/lab',
      details: {
        purpose: 'Generates non-cloneable quantum digital signature state payload.',
        mathForm: '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle',
        inputs: 'Secret key parameters, Random basis seed',
        outputs: 'Single-qubit quantum signature state',
        currentState: inputState.toKet(3),
      },
    },
    {
      id: 'bell_pair',
      name: '2. Bell Pair Entanglement',
      subtitle: 'Shared EPR Channel',
      category: 'quantum',
      icon: <IconEntangle size={24} className="text-quantum" />,
      routeHref: '/bell',
      details: {
        purpose: 'Provides maximally entangled EPR resource pair distributed between Alice and Bob.',
        mathForm: '|\\Phi^+\\rangle_{AB} = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)',
        inputs: 'Laser source, Non-linear crystal',
        outputs: '2 spatially separated entangled qubits',
        currentState: `Resource: ${bellKey} (Concurrence: 1.00)`,
      },
    },
    {
      id: 'teleportation',
      name: '3. Teleportation BSM',
      subtitle: 'Bell Measurement',
      category: 'quantum',
      icon: <IconTeleport size={24} className="text-quantum" />,
      routeHref: '/teleportation',
      details: {
        purpose: 'Transfers quantum state non-locally without transmitting physical qubit matter.',
        mathForm: '\\text{BSM} = (H \\otimes I)\\text{CNOT}',
        inputs: 'Alice Q0 (|ψ⟩) & Alice Q1 (Bell half)',
        outputs: '2 Classical bits + Bob collapsed Q2',
        currentState: `Outcome Bits: [${teleportation.classicalBits[0]}, ${teleportation.classicalBits[1]}]`,
      },
    },
    {
      id: 'classical_bits',
      name: '4. Classical Syndrome',
      subtitle: 'Speed of Light Channel',
      category: 'classical',
      icon: <IconClassical size={24} className="text-classical" />,
      routeHref: '/teleportation',
      details: {
        purpose: 'Transmits Bell measurement outcome to determine Bob’s required unitary transformation.',
        mathForm: 'b_1 b_2 \\in \\{00, 01, 10, 11\\}',
        inputs: 'Photodetector projective measurement',
        outputs: '2 classical bits transmitted at speed c',
        currentState: `Transmitted: ${teleportation.classicalBits[0]}${teleportation.classicalBits[1]}`,
      },
    },
    {
      id: 'pauli_correction',
      name: '5. Pauli Correction',
      subtitle: 'Wavefunction Restoration',
      category: 'quantum',
      icon: <IconPauli size={24} className="text-quantum" />,
      routeHref: '/verification',
      details: {
        purpose: 'Applies conditional Pauli gate (I, X, Z, or XZ) to restore original |ψ⟩ state.',
        mathForm: 'U = Z^{b_1} X^{b_2}',
        inputs: 'Classical bits [b1, b2] + Bob’s raw qubit',
        outputs: 'Restored quantum signature state |ψ⟩',
        currentState: `Applied: ${appliedCorrection} (Correct: ${teleportation.pauliCorrectionRequired})`,
      },
    },
    {
      id: 'receiver',
      name: '6. Bob (Receiver)',
      subtitle: 'Signature Holder',
      category: 'quantum',
      icon: <IconReceive size={24} className="text-quantum" />,
      routeHref: '/verification',
      details: {
        purpose: 'Receives and holds reconstructed quantum signature for cryptographic verification.',
        mathForm: '|\\psi_{\\text{Bob}}\\rangle \\approx |\\psi\\rangle',
        inputs: 'Corrected qubit state',
        outputs: 'Quantum token ready for verification',
        currentState: `Fidelity F = ${(verification.fidelity * 100).toFixed(1)}%`,
      },
    },
    {
      id: 'verification',
      name: '7. Multi-Basis Check',
      subtitle: 'State Tomography',
      category: 'security',
      icon: <IconVerify size={24} className="text-pass" />,
      routeHref: '/verification',
      details: {
        purpose: 'Performs projective measurements across Z, X, Y bases to verify state validity.',
        mathForm: 'F = |\\langle\\psi_{\\text{exp}}|\\psi_{\\text{rec}}\\rangle|^2 \\ge 1-\\delta',
        inputs: 'Alice expected state vector + Bob received state',
        outputs: 'State fidelity, basis probability scores',
        currentState: `Verdict: ${verification.verdict} (F = ${verification.fidelity})`,
      },
    },
    {
      id: 'threat_detection',
      name: '8. Threat / QBER',
      subtitle: 'MUB Anomaly Monitor',
      category: 'security',
      icon: <IconThreat size={24} className="text-warn" />,
      routeHref: '/threats',
      details: {
        purpose: 'Calculates QBER and tests Mutually Unbiased Bases (MUB) to detect eavesdropping/noise.',
        mathForm: '\\text{QBER} = \\frac{\\text{errors}}{\\text{total bits}} \\le \\text{Threshold}',
        inputs: 'Observed bit errors, Decoy pulse yields',
        outputs: 'Security status, disturbance level',
        currentState: `QBER: ${verification.qber}% (Threshold: ${verification.threshold}%)`,
      },
    },
    {
      id: 'security_result',
      name: '9. Security Result',
      subtitle: 'Non-Repudiation',
      category: 'security',
      icon: <IconCheck size={24} className="text-pass" />,
      routeHref: '/attacks',
      details: {
        purpose: 'Issues final cryptographic decision on whether the digital signature is authentic.',
        mathForm: '\\text{Decision} \\in \\{\\text{VALID}, \\text{SUSPICIOUS}, \\text{INVALID}, \\text{TAMPERED}\\}',
        inputs: 'Combined Fidelity, QBER, MUB, Nonce status',
        outputs: 'Cryptographic acceptance/rejection',
        currentState: `${verification.verdict}: ${verification.cause}`,
      },
    },
  ];

  const selectedStage = stages.find((s) => s.id === activeStageId) || stages[0];

  return (
    <div className="space-y-6">
      {/* Interactive Pipeline Track */}
      <div className="panel p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-quantum" />
              <h2 className="label text-ink tracking-widest uppercase">
                End-To-End Quantum Digital Signature Pipeline
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Select any node in the flow to inspect live wavefunctions, mathematical operators, and channel diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-quantum bg-quantum-tint px-2.5 py-1 border border-quantum/20">
              <span className="h-1.5 w-1.5 bg-quantum" /> Quantum Link
            </span>
            <span className="flex items-center gap-1.5 text-classical bg-classical-tint px-2.5 py-1 border border-classical/20">
              <span className="h-1.5 w-1.5 bg-classical" /> Classical Bit Channel
            </span>
            <span className="flex items-center gap-1.5 text-pass bg-pass-tint px-2.5 py-1 border border-pass/20">
              <span className="h-1.5 w-1.5 bg-pass" /> Security Verifier
            </span>
          </div>
        </div>

        {/* Pipeline Nodes Scroll Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {stages.map((stage, idx) => {
            const isSelected = stage.id === activeStageId;
            let activeColor = '';
            if (isSelected) {
               if (stage.category === 'quantum') activeColor = 'border-quantum bg-quantum-tint ring-1 ring-quantum';
               else if (stage.category === 'classical') activeColor = 'border-classical bg-classical-tint ring-1 ring-classical';
               else activeColor = 'border-pass bg-pass-tint ring-1 ring-pass';
            } else {
               activeColor = 'border-rule bg-face hover:bg-well hover:border-ink-faint';
            }

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`flex flex-col text-left p-3 border transition-colors cursor-pointer ${activeColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center justify-center">{stage.icon}</span>
                  <span className="text-[10px] font-mono font-bold text-ink-faint">#{idx + 1}</span>
                </div>
                <div className="text-xs font-bold text-ink truncate">{stage.name.split('. ')[1]}</div>
                <div className="text-[10px] text-ink-muted line-clamp-2 mt-1 leading-tight">
                  {stage.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="panel p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-bench">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-face border border-rule">
              {selectedStage.icon}
            </span>
            <div>
              <div className="text-[11px] font-mono font-bold text-quantum uppercase tracking-wider">
                Stage {stages.findIndex((s) => s.id === selectedStage.id) + 1} Inspector
              </div>
              <h3 className="text-base font-bold text-ink">{selectedStage.name}</h3>
              <p className="text-xs text-ink-muted">{selectedStage.subtitle}</p>
            </div>
          </div>

          <div className="bg-face border border-rule p-3.5 space-y-1.5 text-xs">
            <div className="text-ink-muted font-semibold font-mono uppercase tracking-wider text-[10px]">Stage Purpose:</div>
            <p className="text-ink leading-relaxed">{selectedStage.details.purpose}</p>
          </div>

          <a
            href={selectedStage.routeHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-quantum hover:text-quantum/80 pt-1 uppercase tracking-wider"
          >
            <span>Open {selectedStage.name.split('. ')[1]} Workspace</span>
            <IconChevronRight size={14} />
          </a>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Formal Mathematics */}
          <div className="bg-face border border-rule p-4 space-y-1.5">
            <div className="text-[11px] font-mono text-ink-muted uppercase font-semibold tracking-wider">
              Mathematical Formalism
            </div>
            <div className="font-mono text-sm text-quantum bg-well border border-rule px-3 py-2.5 overflow-x-auto">
              {selectedStage.details.mathForm}
            </div>
          </div>

          {/* Current Live State */}
          <div className="bg-face border border-rule p-4 space-y-1.5">
            <div className="text-[11px] font-mono text-ink-muted uppercase font-semibold tracking-wider">
              Live Quantum State / Telemetry
            </div>
            <div className="font-mono text-sm text-pass bg-well border border-rule px-3 py-2.5 overflow-x-auto truncate">
              {selectedStage.details.currentState}
            </div>
          </div>

          {/* Inputs */}
          <div className="bg-face border border-rule p-4 space-y-1">
            <div className="text-[11px] font-mono text-ink-muted uppercase font-semibold tracking-wider">
              Inputs / Channel Prerequisites
            </div>
            <p className="text-xs text-ink leading-relaxed">{selectedStage.details.inputs}</p>
          </div>

          {/* Outputs */}
          <div className="bg-face border border-rule p-4 space-y-1">
            <div className="text-[11px] font-mono text-ink-muted uppercase font-semibold tracking-wider">
              Outputs / Next Protocol Transition
            </div>
            <p className="text-xs text-ink leading-relaxed">{selectedStage.details.outputs}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
