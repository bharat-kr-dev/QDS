'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { BlochSphere } from '../../components/ui/BlochSphere';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  RotateCw,
  Cpu,
  Key,
  Sliders,
} from 'lucide-react';

export default function VerificationPage() {
  const {
    inputState,
    receivedState,
    teleportResult,
    manualCorrection,
    setManualCorrection,
    autoCorrectionMode,
    setAutoCorrectionMode,
    verificationResult,
  } = useQuantum();

  const expectedBloch = inputState.getSingleQubitBloch();
  const receivedBloch = receivedState.getSingleQubitBloch();
  const classicalBits = teleportResult.classicalBits;
  const bitString = `${classicalBits[0]}${classicalBits[1]}`;

  const pauliOptions: ('I' | 'X' | 'Z' | 'XZ')[] = ['I', 'X', 'Z', 'XZ'];

  const verdictBadge =
    verificationResult.verdict === 'VALID'
      ? {
          bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
          icon: CheckCircle2,
          color: 'text-emerald-400',
        }
      : verificationResult.verdict === 'SUSPICIOUS'
      ? {
          bg: 'bg-amber-950/80 border-amber-800 text-amber-300',
          icon: AlertTriangle,
          color: 'text-amber-400',
        }
      : {
          bg: 'bg-rose-950/80 border-rose-800 text-rose-300',
          icon: XCircle,
          color: 'text-rose-400',
        };

  const VerdictIcon = verdictBadge.icon;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] font-mono text-emerald-400 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Signature Verification & Pauli Correction Engine
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Bob’s Quantum Signature Verification Station
          </h1>
          <p className="text-xs text-slate-400">
            Apply Pauli unitary corrections, compute quantum overlap fidelity, and test cryptographic authenticity.
          </p>
        </div>

        {/* Big Verdict Badge */}
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${verdictBadge.bg}`}>
          <VerdictIcon className={`w-5 h-5 ${verdictBadge.color}`} />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Cryptographic Verdict</div>
            <div className="text-base font-bold font-mono tracking-wider">
              {verificationResult.verdict}
            </div>
          </div>
        </div>
      </div>

      {/* Pauli Correction Workbench */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-sky-400" />
              Pauli Unitary Correction Workbench
            </h3>
            <p className="text-xs text-slate-400">
              Classical syndrome bits received: <strong className="font-mono text-amber-400">[{classicalBits[0]}, {classicalBits[1]}]</strong> → Required Unitary: <strong className="font-mono text-emerald-400">{teleportResult.pauliCorrectionRequired}</strong>
            </p>
          </div>

          {/* Mode Switch: Auto vs Manual */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setAutoCorrectionMode(true)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                autoCorrectionMode
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto Correction (Protocol)
            </button>
            <button
              onClick={() => setAutoCorrectionMode(false)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                !autoCorrectionMode
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Manual Operator Selection
            </button>
          </div>
        </div>

        {/* Pauli Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pauliOptions.map((op) => {
            const isApplied =
              (autoCorrectionMode ? teleportResult.pauliCorrectionRequired : manualCorrection) === op;
            const isTheoreticallyCorrect = teleportResult.pauliCorrectionRequired === op;

            return (
              <button
                key={op}
                disabled={autoCorrectionMode}
                onClick={() => setManualCorrection(op)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isApplied
                    ? isTheoreticallyCorrect
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40'
                      : 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 disabled:opacity-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-base font-mono font-bold">Pauli-{op}</span>
                  {isTheoreticallyCorrect && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      Required
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
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
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono text-sky-400 uppercase tracking-wider">
              Expected State |ψ_in⟩ (Alice)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Authentic Target</span>
          </div>

          <BlochSphere bloch={expectedBloch} size={250} label="|ψ_exp⟩" interactive={false} />

          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-sky-300 overflow-x-auto text-center">
            {inputState.getKetString()}
          </div>
        </div>

        {/* Right: Received Corrected State */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Received State |ψ_out⟩ (Bob)
            </span>
            <span className="text-[10px] font-mono text-slate-400">After Unitary Correction</span>
          </div>

          <BlochSphere bloch={receivedBloch} size={250} label="|ψ_rec⟩" interactive={false} />

          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 overflow-x-auto text-center">
            {receivedState.getKetString()}
          </div>
        </div>
      </div>

      {/* Metrics & Scientific Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {/* Fidelity */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase">State Fidelity F</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {(verificationResult.fidelity * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400">|⟨ψ_in|ψ_out⟩|² = {verificationResult.fidelity}</div>
          </div>

          {/* QBER */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
            <div className="text-[11px] font-mono text-slate-400 uppercase">QBER</div>
            <div
              className={`text-2xl font-bold font-mono ${
                verificationResult.qber > 5.0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {verificationResult.qber}%
            </div>
            <div className="text-[10px] text-slate-400">Threshold: {verificationResult.threshold}%</div>
          </div>

          {/* Basis Consistency */}
          <div className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase">MUB Eigenstate Deviations</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                <div className="text-slate-400 text-[10px]">Z-Basis</div>
                <div className="text-sky-300 font-bold">{verificationResult.mubScores.zBasisError}%</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                <div className="text-slate-400 text-[10px]">X-Basis</div>
                <div className="text-emerald-300 font-bold">{verificationResult.mubScores.xBasisError}%</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                <div className="text-slate-400 text-[10px]">Y-Basis</div>
                <div className="text-pink-300 font-bold">{verificationResult.mubScores.yBasisError}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Scientific Diagnostic Breakdown */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Scientific Diagnostic Report</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-200">
              {verificationResult.scientificDiagnosis.summary}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {verificationResult.scientificDiagnosis.details}
            </p>
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="text-slate-400">
                <strong className="text-slate-300">Root Mechanism:</strong>{' '}
                {verificationResult.scientificDiagnosis.cause}
              </div>
              <div className="text-slate-400">
                <strong className="text-emerald-400">Recommended Action:</strong>{' '}
                {verificationResult.scientificDiagnosis.recommendedAction}
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
