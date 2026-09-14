'use client';

import React from 'react';
import Link from 'next/link';
import { useQuantum } from '../lib/experiments/experiment-store';
import { PipelineFlow } from '../components/ui/PipelineFlow';
import { QberGauge } from '../components/ui/QberGauge';
import { HumanContextHelper } from '../components/ui/HumanContextHelper';
import {
  IconThreat,
  IconTeleport,
  IconEntangle,
  IconChevronRight,
  IconInfo,
  IconCheck,
  IconSignature,
  IconClassical,
  IconReceive,
} from '../components/icons/Icons';

export default function OverviewPage() {
  const {
    inputState,
    bellKey,
    step,
    verification,
    attack,
    experiments,
  } = useQuantum();

  const isAttacked = attack.type !== 'none' && attack.type !== 'noise';

  return (
    <div className="space-y-8">
      {/* Top Banner / System Status Hero */}
      <div className="panel p-6 lg:p-8 relative overflow-hidden bg-face">
        {/* Flat subtle decorations */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full border border-rule/50 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full border border-rule/50 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-well border border-rule text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              <IconInfo size={12} className="text-quantum" />
              <span>Quantum Cryptography Research Station</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-ink tracking-tight leading-tight uppercase font-sans">
              Teleportation-Based Quantum Digital Signature (QDS) Simulator
            </h1>

            <p className="text-sm text-ink-muted leading-relaxed max-w-xl font-medium">
              Explore state teleportation, EPR non-local correlations, Pauli unitary restorations, and statistical threat detection with exact linear algebra precision.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-3 shrink-0">
            <Link
              href="/teleportation"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-quantum hover:bg-quantum/90 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <IconTeleport size={16} />
              <span>Launch Teleportation</span>
              <IconChevronRight size={14} />
            </Link>

            <Link
              href="/attacks"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-face hover:bg-well border border-rule hover:border-adversary text-ink text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <IconThreat size={16} className="text-adversary" />
              <span>Red Team Attack Lab</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Input Signature State */}
        <div className="bg-face border border-rule hover:border-quantum/50 p-4 transition-colors space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted uppercase tracking-wider">
            <span>Input Signature State</span>
            <IconSignature size={14} className="text-quantum" />
          </div>
          <div className="text-sm lg:text-base font-bold text-quantum font-mono truncate">
            {inputState.toKet(3)}
          </div>
          <div className="text-xs text-ink-muted flex items-center justify-between pt-2 border-t border-rule/60">
            <span>Polar Angle (θ):</span>
            <span className="font-mono font-bold text-ink">
              {((inputState.getBloch().theta * 180) / Math.PI).toFixed(1)}°
            </span>
          </div>
        </div>

        {/* Card 2: Shared Bell Resource */}
        <div className="bg-face border border-rule hover:border-quantum/50 p-4 transition-colors space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted uppercase tracking-wider">
            <span>Bell EPR Resource</span>
            <IconEntangle size={14} className="text-pass" />
          </div>
          <div className="text-sm lg:text-base font-bold text-pass font-mono flex items-center gap-1.5">
            <IconEntangle size={16} />
            <span>{bellKey}</span>
          </div>
          <div className="text-xs text-ink-muted flex items-center justify-between pt-2 border-t border-rule/60">
            <span>Concurrence (C):</span>
            <span className="font-mono text-pass font-bold">1.000 (Maximal)</span>
          </div>
        </div>

        {/* Card 3: Verification Verdict */}
        <div className="bg-face border border-rule hover:border-quantum/50 p-4 transition-colors space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted uppercase tracking-wider">
            <span>Verification Verdict</span>
            <IconCheck size={14} className="text-quantum" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm lg:text-base font-bold font-mono ${
                verification.verdict === 'VALID'
                  ? 'text-pass'
                  : verification.verdict === 'SUSPICIOUS'
                  ? 'text-warn'
                  : 'text-adversary'
              }`}
            >
              {verification.verdict}
            </span>
          </div>
          <div className="text-xs text-ink-muted flex items-center justify-between pt-2 border-t border-rule/60">
            <span>State Fidelity (F):</span>
            <span className="font-mono text-quantum font-bold">
              {(verification.fidelity * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 4: Channel Condition */}
        <div className="bg-face border border-rule hover:border-quantum/50 p-4 transition-colors space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted uppercase tracking-wider">
            <span>Channel Security</span>
            <IconClassical size={14} className="text-adversary" />
          </div>
          <div
            className={`text-sm lg:text-base font-bold truncate ${
              isAttacked ? 'text-adversary' : 'text-pass'
            }`}
          >
            {isAttacked ? attack.type : 'Ideal Channel (Clean)'}
          </div>
          <div className="text-xs text-ink-muted flex items-center justify-between pt-2 border-t border-rule/60">
            <span>Saved Runs:</span>
            <span className="font-mono text-ink font-bold">{experiments.length} logged</span>
          </div>
        </div>
      </div>

      {/* Main End-to-End Pipeline Diagram */}
      <PipelineFlow />

      {/* Analytics & Context Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <QberGauge
            qber={verification.qber}
            threshold={verification.threshold}
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
