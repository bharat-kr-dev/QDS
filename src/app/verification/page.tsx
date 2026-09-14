'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { BlochSphere } from '../../components/ui/BlochSphere';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  IconCheck,
  IconIntrusion,
  IconCross,
  IconVerify,
  IconRestart,
} from '../../components/icons/Icons';

export default function VerificationPage() {
  const {
    inputState,
    receivedState,
    teleportation,
    manualCorrection,
    setManualCorrection,
    autoCorrection,
    setAutoCorrection,
    verification,
  } = useQuantum();

  const expectedBloch = inputState.getBloch();
  const receivedBloch = receivedState.getBloch();
  const classicalBits = teleportation.classicalBits;
  const bitString = `${classicalBits[0]}${classicalBits[1]}`;

  const pauliOptions: ('I' | 'X' | 'Z' | 'XZ')[] = ['I', 'X', 'Z', 'XZ'];

  const verdictBadge =
    verification.verdict === 'VALID'
      ? {
          bg: 'bg-pass-tint border-pass text-pass',
          icon: IconCheck,
          color: 'text-pass',
        }
      : verification.verdict === 'SUSPICIOUS'
      ? {
          bg: 'bg-warn-tint border-warn text-warn',
          icon: IconIntrusion,
          color: 'text-warn',
        }
      : {
          bg: 'bg-adversary-tint border-adversary text-adversary',
          icon: IconCross,
          color: 'text-adversary',
        };

  const VerdictIcon = verdictBadge.icon;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-pass bg-pass-tint text-[10px] font-mono font-bold text-pass uppercase tracking-wider mb-2">
            <IconCheck size={12} />
            Signature Verification & Pauli Correction Engine
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            Bob’s Quantum Signature Verification Station
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            Apply Pauli unitary corrections, compute quantum overlap fidelity, and test cryptographic authenticity.
          </p>
        </div>

        {/* Big Verdict Badge */}
        <div className={`flex items-center gap-3 px-4 py-2.5 border ${verdictBadge.bg}`}>
          <VerdictIcon size={20} className={verdictBadge.color} />
          <div>
            <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${verdictBadge.color}`}>Cryptographic Verdict</div>
            <div className="text-base font-bold font-mono tracking-wider">
              {verification.verdict}
            </div>
          </div>
        </div>
      </div>

      {/* Pauli Correction Workbench */}
      <div className="panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <IconRestart size={16} className="text-quantum" />
              Pauli Unitary Correction Workbench
            </h3>
            <p className="text-xs text-ink-muted font-medium mt-1">
              Classical syndrome bits received: <strong className="font-mono text-warn">[{classicalBits[0]}, {classicalBits[1]}]</strong> → Required Unitary: <strong className="font-mono text-pass">{teleportation.pauliCorrectionRequired}</strong>
            </p>
          </div>

          {/* Mode Switch: Auto vs Manual */}
          <div className="flex items-center gap-2 bg-face border border-rule p-1 text-xs font-mono font-bold uppercase tracking-wider">
            <button
              onClick={() => setAutoCorrection(true)}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                autoCorrection
                  ? 'bg-quantum text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Auto Correction (Protocol)
            </button>
            <button
              onClick={() => setAutoCorrection(false)}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                !autoCorrection
                  ? 'bg-warn text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Manual Operator Selection
            </button>
          </div>
        </div>

        {/* Pauli Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {pauliOptions.map((op) => {
            const isApplied =
              (autoCorrection ? teleportation.correctionSchedule[bitString] : manualCorrection) === op;
            const isTheoreticallyCorrect = teleportation.correctionSchedule[bitString] === op;

            return (
              <button
                key={op}
                disabled={autoCorrection}
                onClick={() => setManualCorrection(op)}
                className={`p-3.5 border text-left flex flex-col justify-between transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  isApplied
                    ? isTheoreticallyCorrect
                      ? 'bg-pass-tint border-pass text-pass'
                      : 'bg-adversary-tint border-adversary text-adversary'
                    : 'bg-bench border-rule text-ink-muted hover:bg-face disabled:opacity-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-base font-mono font-bold ${isApplied ? '' : 'text-ink'}`}>Pauli-{op}</span>
                  {isTheoreticallyCorrect && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-pass bg-pass-tint px-1.5 py-0.5 border border-pass">
                      Required
                    </span>
                  )}
                </div>
                <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isApplied ? '' : 'text-ink-muted'}`}>
                  {op === 'I'
                    ? 'Identity (No-Op)'
                    : op === 'X'
                    ? 'Bit Flip (X|ψ⟩)'
                    : op === 'Z'
                    ? 'Phase Flip (Z|ψ⟩)'
                    : 'Bit+Phase (ZX|ψ⟩)'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side State Tomography Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Expected State */}
        <div className="lg:col-span-6 panel p-6 space-y-3 flex flex-col items-center bg-bench">
          <div className="w-full flex items-center justify-between border-b border-rule pb-2">
            <span className="text-[11px] font-mono font-bold text-quantum uppercase tracking-wider">
              Expected State |ψ_in⟩ (Alice)
            </span>
            <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-wider">Authentic Target</span>
          </div>

          <BlochSphere bloch={expectedBloch} size={250} label="|ψ_exp⟩" interactive={false} />

          <div className="w-full bg-face border border-rule p-3 font-mono text-xs font-bold text-quantum overflow-x-auto text-center mt-4">
            {inputState.toKet(3)}
          </div>
        </div>

        {/* Right: Received Corrected State */}
        <div className="lg:col-span-6 panel p-6 space-y-3 flex flex-col items-center bg-bench">
          <div className="w-full flex items-center justify-between border-b border-rule pb-2">
            <span className="text-[11px] font-mono font-bold text-pass uppercase tracking-wider">
              Received State |ψ_out⟩ (Bob)
            </span>
            <span className="text-[9px] font-mono font-bold text-ink-muted uppercase tracking-wider">After Unitary Correction</span>
          </div>

          <BlochSphere bloch={receivedBloch} size={250} label="|ψ_rec⟩" interactive={false} />

          <div className="w-full bg-face border border-rule p-3 font-mono text-xs font-bold text-pass overflow-x-auto text-center mt-4">
            {receivedState.toKet(3)}
          </div>
        </div>
      </div>

      {/* Metrics & Scientific Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {/* Fidelity */}
          <div className="panel p-4 space-y-1">
            <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">State Fidelity F</div>
            <div className="text-2xl font-bold font-mono text-pass">
              {(verification.fidelity * 100).toFixed(1)}%
            </div>
            <div className="text-[9px] font-mono font-bold text-ink-muted">|⟨ψ_in|ψ_out⟩|² = {verification.fidelity.toFixed(3)}</div>
          </div>

          {/* QBER */}
          <div className="panel p-4 space-y-1">
            <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">QBER</div>
            <div
              className={`text-2xl font-bold font-mono ${
                verification.qber > 5.0 ? 'text-adversary' : 'text-pass'
              }`}
            >
              {verification.qber.toFixed(2)}%
            </div>
            <div className="text-[9px] font-mono font-bold text-ink-muted">Threshold: {verification.threshold}%</div>
          </div>

          {/* Basis Consistency */}
          <div className="col-span-2 panel p-4 space-y-2">
            <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider border-b border-rule pb-2 mb-2">MUB Eigenstate Deviations</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold uppercase tracking-wider">
              <div className="bg-bench border border-rule p-2">
                <div className="text-ink-muted text-[9px] mb-1">Z-Basis</div>
                <div className="text-quantum">{(verification.mub['Z'].deviation * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-bench border border-rule p-2">
                <div className="text-ink-muted text-[9px] mb-1">X-Basis</div>
                <div className="text-pass">{(verification.mub['X'].deviation * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-bench border border-rule p-2">
                <div className="text-ink-muted text-[9px] mb-1">Y-Basis</div>
                <div className="text-warn">{(verification.mub['Y'].deviation * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Scientific Diagnostic Breakdown */}
        <div className="lg:col-span-7 panel p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider border-b border-rule pb-3">
            <IconVerify size={16} className="text-quantum" />
            <span>Scientific Diagnostic Report</span>
          </div>

          <div className="bg-well border border-rule p-4 space-y-2 text-xs font-medium">
            <div className="font-bold text-ink">
              {verification.verdict === 'VALID' ? 'Channel Verification Passed' : 'Anomaly Detected'}
            </div>
            <p className="text-ink-muted leading-relaxed">
              {verification.cause}
            </p>
            <div className="pt-3 mt-3 border-t border-rule space-y-1.5">
              <div className="text-ink-muted">
                <strong className="text-pass uppercase tracking-wider text-[10px] mr-2">Recommended Action:</strong>{' '}
                {verification.action}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Questions */}
      <HumanContextHelper
        title="Signature Verification Rules"
        items={[
          {
            question: 'What is State Fidelity in quantum cryptography?',
            answer:
              'Quantum fidelity F(ρ, σ) = |⟨ψ_in|ψ_out⟩|² measures the geometric overlap between the intended signature state and the received state. F = 1.0 indicates perfect identical quantum states, while F < 0.95 signals channel noise or tampering.',
            type: 'info',
          },
          {
            question: 'Why is scientific caution required when classifying tampering?',
            answer:
              'A high error rate alone does not mathematically distinguish between channel thermal noise, optical fiber loss, or an active eavesdropper. The system reports "Channel Disturbance Detected" rather than making unsubstantiated claims.',
            type: 'caution',
          },
        ]}
      />
    </div>
  );
}
