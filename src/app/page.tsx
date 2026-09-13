'use client';

import React from 'react';
import Link from 'next/link';
import { useQuantum } from '../lib/experiments/experiment-store';
import { PipelineFlow } from '../components/ui/PipelineFlow';
import { QberGauge } from '../components/ui/QberGauge';
import { HumanContextHelper } from '../components/ui/HumanContextHelper';
import {
  Shield,
  Activity,
  SendHorizontal,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Cpu,
  Lock,
  Radio,
  Zap,
} from 'lucide-react';

export default function OverviewPage() {
  const {
    inputState,
    bellKey,
    teleportStep,
    verificationResult,
    attackConfig,
    experiments,
  } = useQuantum();

  const isAttacked = attackConfig.enabled && attackConfig.type !== 'none';

  return (
    <div className="space-y-8">
      {/* Top Banner / System Status Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1328] via-[#091022] to-[#041a1c] border border-cyan-500/20 p-6 lg:p-8 shadow-2xl">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-300 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>QUANTUM CRYPTOGRAPHY RESEARCH STATION</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
              Teleportation-Based Quantum Digital Signature (QDS) Simulator
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore state teleportation, EPR non-local correlations, Pauli unitary restorations, and statistical threat detection with exact linear algebra precision.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
            <Link
              href="/teleportation"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Launch Teleportation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/attacks"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0e172a] hover:bg-[#13203b] text-slate-200 border border-white/[0.1] hover:border-rose-500/40 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Red Team Attack Lab</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Input Signature State */}
        <div className="bg-[#080d1a] border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-4 shadow-xl transition-all space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
            <span>Input Signature State</span>
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm lg:text-base font-bold text-cyan-300 font-mono truncate">
            {inputState.getKetString()}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span>Polar Angle (θ):</span>
            <span className="font-mono font-bold text-slate-200">
              {((inputState.getSingleQubitBloch().theta * 180) / Math.PI).toFixed(1)}°
            </span>
          </div>
        </div>

        {/* Card 2: Shared Bell Resource */}
        <div className="bg-[#080d1a] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-4 shadow-xl transition-all space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
            <span>Bell EPR Resource</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm lg:text-base font-bold text-emerald-400 font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>{bellKey}</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span>Concurrence (C):</span>
            <span className="font-mono text-emerald-300 font-bold">1.000 (Maximal)</span>
          </div>
        </div>

        {/* Card 3: Verification Verdict */}
        <div className="bg-[#080d1a] border border-white/[0.08] hover:border-amber-500/40 rounded-2xl p-4 shadow-xl transition-all space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
            <span>Verification Verdict</span>
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm lg:text-base font-bold font-mono ${
                verificationResult.verdict === 'VALID'
                  ? 'text-emerald-400'
                  : verificationResult.verdict === 'SUSPICIOUS'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {verificationResult.verdict}
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span>State Fidelity (F):</span>
            <span className="font-mono text-cyan-300 font-bold">
              {(verificationResult.fidelity * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 4: Channel Condition */}
        <div className="bg-[#080d1a] border border-white/[0.08] hover:border-rose-500/40 rounded-2xl p-4 shadow-xl transition-all space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
            <span>Channel Security</span>
            <Radio className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div
            className={`text-sm lg:text-base font-bold truncate ${
              isAttacked ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {isAttacked ? attackConfig.name : 'Ideal Channel (Clean)'}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span>Saved Runs:</span>
            <span className="font-mono text-slate-200 font-bold">{experiments.length} logged</span>
          </div>
        </div>
      </div>

      {/* Main End-to-End Pipeline Diagram */}
      <PipelineFlow />

      {/* Analytics & Context Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <QberGauge
            qber={verificationResult.qber}
            threshold={verificationResult.threshold}
            label="Real-Time Channel Error (QBER)"
          />
        </div>

        <div className="lg:col-span-7">
          <HumanContextHelper
            title="System Overview Context & FAQs"
            items={[
              {
                question: 'What is a Quantum Digital Signature (QDS)?',
                answer:
                  'A Quantum Digital Signature is a cryptographic protocol that provides non-repudiation and unforgeability guaranteed by the laws of quantum mechanics (No-Cloning Theorem and uncertainty relations), rather than computational hardness assumptions.',
                type: 'info',
              },
              {
                question: 'Does quantum teleportation transmit physical matter?',
                answer:
                  'No. Quantum teleportation transfers quantum state information (amplitudes α and β) using shared entanglement and 2 classical bits. The physical matter is not moved, and the sender qubit collapses during measurement.',
                type: 'tip',
              },
              {
                question: 'Why is classical communication required in teleportation?',
                answer:
                  'Alice’s Bell measurement collapses Bob’s qubit into one of four possible Pauli transforms. Without receiving Alice’s 2 classical bits (00, 01, 10, 11), Bob cannot know which Pauli correction operator (I, X, Z, XZ) to apply, preserving the No-Signaling Theorem and relativistic causality.',
                type: 'info',
              },
              {
                question: 'What does an elevated QBER indicate?',
                answer:
                  'High QBER indicates anomalous error or channel behavior. It can be caused by fiber noise, misaligned optical components, or an eavesdropper measuring states in incompatible bases. We never jump to claiming an attack without cross-referencing MUB and decoy statistics.',
                type: 'caution',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
