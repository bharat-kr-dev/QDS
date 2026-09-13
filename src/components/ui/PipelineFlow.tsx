'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { ArrowRight, Sparkles, Activity, ShieldAlert, Cpu } from 'lucide-react';

export interface PipelineStage {
  id: string;
  name: string;
  subtitle: string;
  category: 'quantum' | 'classical' | 'security';
  icon: string;
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
    teleportResult,
    attackConfig,
    verificationResult,
    manualCorrection,
    autoCorrectionMode,
  } = useQuantum();

  const [activeStageId, setActiveStageId] = useState<string>('teleportation');

  const appliedCorrection = autoCorrectionMode
    ? teleportResult.pauliCorrectionRequired
    : manualCorrection;

  const stages: PipelineStage[] = [
    {
      id: 'sender',
      name: '1. Alice (Sender)',
      subtitle: 'Signature State Source',
      category: 'quantum',
      icon: '🔐',
      routeHref: '/lab',
      details: {
        purpose: 'Generates non-cloneable quantum digital signature state payload.',
        mathForm: '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle',
        inputs: 'Secret key parameters, Random basis seed',
        outputs: 'Single-qubit quantum signature state',
        currentState: inputState.getKetString(),
      },
    },
    {
      id: 'bell_pair',
      name: '2. Bell Pair Entanglement',
      subtitle: 'Shared EPR Channel',
      category: 'quantum',
      icon: '⚡',
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
      icon: '🌌',
      routeHref: '/teleportation',
      details: {
        purpose: 'Transfers quantum state non-locally without transmitting physical qubit matter.',
        mathForm: '\\text{BSM} = (H \\otimes I)\\text{CNOT}',
        inputs: 'Alice Q0 (|ψ⟩) & Alice Q1 (Bell half)',
        outputs: '2 Classical bits + Bob collapsed Q2',
        currentState: `Outcome Bits: [${teleportResult.classicalBits[0]}, ${teleportResult.classicalBits[1]}]`,
      },
    },
    {
      id: 'classical_bits',
      name: '4. Classical Syndrome',
      subtitle: 'Speed of Light Channel',
      category: 'classical',
      icon: '📡',
      routeHref: '/teleportation',
      details: {
        purpose: 'Transmits Bell measurement outcome to determine Bob’s required unitary transformation.',
        mathForm: 'b_1 b_2 \\in \\{00, 01, 10, 11\\}',
        inputs: 'Photodetector projective measurement',
        outputs: '2 classical bits transmitted at speed c',
        currentState: `Transmitted: ${teleportResult.classicalBits[0]}${teleportResult.classicalBits[1]}`,
      },
    },
    {
      id: 'pauli_correction',
      name: '5. Pauli Correction',
      subtitle: 'Wavefunction Restoration',
      category: 'quantum',
      icon: '🔄',
      routeHref: '/verification',
      details: {
        purpose: 'Applies conditional Pauli gate (I, X, Z, or XZ) to restore original |ψ⟩ state.',
        mathForm: 'U = Z^{b_1} X^{b_2}',
        inputs: 'Classical bits [b1, b2] + Bob’s raw qubit',
        outputs: 'Restored quantum signature state |ψ⟩',
        currentState: `Applied: ${appliedCorrection} (Correct: ${teleportResult.pauliCorrectionRequired})`,
      },
    },
    {
      id: 'receiver',
      name: '6. Bob (Receiver)',
      subtitle: 'Signature Holder',
      category: 'quantum',
      icon: '📥',
      routeHref: '/verification',
      details: {
        purpose: 'Receives and holds reconstructed quantum signature for cryptographic verification.',
        mathForm: '|\\psi_{\\text{Bob}}\\rangle \\approx |\\psi\\rangle',
        inputs: 'Corrected qubit state',
        outputs: 'Quantum token ready for verification',
        currentState: `Fidelity F = ${(verificationResult.fidelity * 100).toFixed(1)}%`,
      },
    },
    {
      id: 'verification',
      name: '7. Multi-Basis Check',
      subtitle: 'State Tomography',
      category: 'security',
      icon: '🔍',
      routeHref: '/verification',
      details: {
        purpose: 'Performs projective measurements across Z, X, Y bases to verify state validity.',
        mathForm: 'F = |\\langle\\psi_{\\text{exp}}|\\psi_{\\text{rec}}\\rangle|^2 \\ge 1-\\delta',
        inputs: 'Alice expected state vector + Bob received state',
        outputs: 'State fidelity, basis probability scores',
        currentState: `Verdict: ${verificationResult.verdict} (F = ${verificationResult.fidelity})`,
      },
    },
    {
      id: 'threat_detection',
      name: '8. Threat / QBER',
      subtitle: 'MUB Anomaly Monitor',
      category: 'security',
      icon: '🛡️',
      routeHref: '/threats',
      details: {
        purpose: 'Calculates QBER and tests Mutually Unbiased Bases (MUB) to detect eavesdropping/noise.',
        mathForm: '\\text{QBER} = \\frac{\\text{errors}}{\\text{total bits}} \\le \\text{Threshold}',
        inputs: 'Observed bit errors, Decoy pulse yields',
        outputs: 'Security status, disturbance level',
        currentState: `QBER: ${verificationResult.qber}% (Threshold: ${verificationResult.threshold}%)`,
      },
    },
    {
      id: 'security_result',
      name: '9. Security Result',
      subtitle: 'Non-Repudiation',
      category: 'security',
      icon: '⚖️',
      routeHref: '/attacks',
      details: {
        purpose: 'Issues final cryptographic decision on whether the digital signature is authentic.',
        mathForm: '\\text{Decision} \\in \\{\\text{VALID}, \\text{SUSPICIOUS}, \\text{INVALID}, \\text{TAMPERED}\\}',
        inputs: 'Combined Fidelity, QBER, MUB, Nonce status',
        outputs: 'Cryptographic acceptance/rejection',
        currentState: `${verificationResult.verdict}: ${verificationResult.scientificDiagnosis.summary}`,
      },
    },
  ];

  const selectedStage = stages.find((s) => s.id === activeStageId) || stages[0];

  return (
    <div className="space-y-6">
      {/* Interactive Pipeline Track */}
      <div className="bg-[#080d1a] border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-base font-bold text-white tracking-tight">
                END-TO-END QUANTUM DIGITAL SIGNATURE PIPELINE
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any node in the flow to inspect live wavefunctions, mathematical operators, and channel diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Quantum Link
            </span>
            <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Classical Bit Channel
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Security Verifier
            </span>
          </div>
        </div>

        {/* Pipeline Nodes Scroll Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {stages.map((stage, idx) => {
            const isSelected = stage.id === activeStageId;
            const categoryGlow =
              stage.category === 'quantum'
                ? isSelected
                  ? 'bg-gradient-to-b from-cyan-950/90 to-[#0c192e] border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-900/30'
                  : 'bg-[#0b1222]/80 border-cyan-500/20 hover:border-cyan-400/50 hover:bg-[#0e182e]'
                : stage.category === 'classical'
                ? isSelected
                  ? 'bg-gradient-to-b from-amber-950/90 to-[#1f1608] border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-900/30'
                  : 'bg-[#0b1222]/80 border-amber-500/20 hover:border-amber-400/50 hover:bg-[#1a1409]'
                : isSelected
                ? 'bg-gradient-to-b from-emerald-950/90 to-[#071f16] border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-900/30'
                : 'bg-[#0b1222]/80 border-emerald-500/20 hover:border-emerald-400/50 hover:bg-[#091b15]';

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${categoryGlow}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stage.icon}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                </div>
                <div className="text-xs font-bold text-slate-100 truncate">{stage.name.split('. ')[1]}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-tight">
                  {stage.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="bg-gradient-to-b from-[#0b1222] to-[#070b16] border border-white/[0.08] rounded-2xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-3 bg-[#080d1a] rounded-2xl border border-white/[0.08] shadow-md">
              {selectedStage.icon}
            </span>
            <div>
              <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Stage {stages.findIndex((s) => s.id === selectedStage.id) + 1} Inspector
              </div>
              <h3 className="text-base font-bold text-white">{selectedStage.name}</h3>
              <p className="text-xs text-slate-400">{selectedStage.subtitle}</p>
            </div>
          </div>

          <div className="bg-[#080d1a] border border-white/[0.06] rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="text-slate-400 font-semibold font-mono">Stage Purpose:</div>
            <p className="text-slate-200 leading-relaxed">{selectedStage.details.purpose}</p>
          </div>

          <a
            href={selectedStage.routeHref}
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline pt-1"
          >
            <span>Open {selectedStage.name.split('. ')[1]} Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Formal Mathematics */}
          <div className="bg-[#080d1a] border border-white/[0.07] rounded-xl p-4 shadow-inner space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Mathematical Formalism
            </div>
            <div className="font-mono text-sm text-cyan-300 bg-[#0c1427] border border-cyan-900/40 rounded-lg px-3 py-2.5 overflow-x-auto shadow-inner">
              {selectedStage.details.mathForm}
            </div>
          </div>

          {/* Current Live State */}
          <div className="bg-[#080d1a] border border-white/[0.07] rounded-xl p-4 shadow-inner space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Live Quantum State / Telemetry
            </div>
            <div className="font-mono text-sm text-emerald-300 bg-[#0c1427] border border-emerald-900/40 rounded-lg px-3 py-2.5 overflow-x-auto truncate shadow-inner">
              {selectedStage.details.currentState}
            </div>
          </div>

          {/* Inputs */}
          <div className="bg-[#080d1a] border border-white/[0.07] rounded-xl p-4 shadow-inner space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Inputs / Channel Prerequisites
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedStage.details.inputs}</p>
          </div>

          {/* Outputs */}
          <div className="bg-[#080d1a] border border-white/[0.07] rounded-xl p-4 shadow-inner space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Outputs / Next Protocol Transition
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedStage.details.outputs}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
