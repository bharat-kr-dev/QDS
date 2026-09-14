'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { QuantumCircuit } from '../../components/ui/QuantumCircuit';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import { PROTOCOL_STAGES } from '../../content/protocol';
import {
  IconTeleport,
  IconPlay,
  IconPause,
  IconRestart,
  IconStepBack,
  IconStepForward,
  IconCheck,
  IconPulse,
  IconInfo,
} from '../../components/icons/Icons';

export default function TeleportationPage() {
  const {
    step,
    setStep,
    teleportation,
    isPlaying,
    play,
    pause,
    reset,
    next,
    previous,
    manualCorrection,
    autoCorrection,
  } = useQuantum();

  const currentStepInfo = teleportation.steps[step];

  const appliedCorr = autoCorrection
    ? teleportation.pauliCorrectionRequired
    : manualCorrection;

  return (
    <div className="space-y-8">
      {/* Page Header with Playback Controls */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-quantum bg-quantum-tint text-[10px] font-mono font-bold text-quantum uppercase tracking-wider mb-2">
            <IconTeleport size={12} />
            Quantum Teleportation Engine (9-Stage Stepper)
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            Quantum Teleportation Protocol Simulator
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            Step through the 9 exact stages of quantum teleportation from initial signature preparation to Pauli recovery.
          </p>
        </div>

        {/* Playback Controls Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={previous}
            disabled={step <= 1}
            className="p-2.5 bg-face hover:bg-well disabled:opacity-40 disabled:pointer-events-none border border-rule text-ink transition-colors cursor-pointer"
            title="Previous Step"
          >
            <IconStepBack size={14} />
          </button>

          {isPlaying ? (
            <button
              onClick={pause}
              className="flex items-center gap-2 px-4 py-2 bg-warn-tint hover:bg-warn hover:text-white border border-warn text-warn text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <IconPause size={14} />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={play}
              className="flex items-center gap-2 px-4 py-2 bg-quantum hover:bg-quantum/90 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <IconPlay size={14} />
              <span>{step >= 9 ? 'Restart & Play' : 'Play Simulation'}</span>
            </button>
          )}

          <button
            onClick={next}
            disabled={step >= 9}
            className="p-2.5 bg-face hover:bg-well disabled:opacity-40 disabled:pointer-events-none border border-rule text-ink transition-colors cursor-pointer"
            title="Next Step"
          >
            <IconStepForward size={14} />
          </button>

          <button
            onClick={reset}
            className="p-2.5 bg-face hover:bg-well border border-rule text-ink transition-colors cursor-pointer ml-2"
            title="Reset to Step 1"
          >
            <IconRestart size={14} />
          </button>
        </div>
      </div>

      {/* Step Tracker Pills */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 panel p-2">
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((stepNum) => {
          const isCurrent = step === stepNum;
          const isPassed = step > stepNum;

          return (
            <button
              key={stepNum}
              onClick={() => setStep(stepNum)}
              className={`py-2 px-1 text-xs font-mono font-bold uppercase tracking-wider transition-colors text-center flex flex-col items-center gap-0.5 cursor-pointer border ${
                isCurrent
                  ? 'bg-quantum border-quantum text-white shadow-md'
                  : isPassed
                  ? 'bg-pass-tint border-pass text-pass'
                  : 'bg-face border-rule text-ink hover:bg-well'
              }`}
            >
              <span className={`text-[9px] ${isCurrent ? 'text-quantum-tint' : isPassed ? 'text-pass' : 'text-ink-muted'}`}>STEP {stepNum}</span>
              <span className="text-[10px] truncate max-w-full">
                {stepNum === 1
                  ? 'Prepare'
                  : stepNum === 2
                  ? 'Bell Pair'
                  : stepNum === 3
                  ? 'Entangle'
                  : stepNum === 4
                  ? 'BSM'
                  : stepNum === 5
                  ? 'Measure'
                  : stepNum === 6
                  ? 'Transmit'
                  : stepNum === 7
                  ? 'Pauli'
                  : stepNum === 8
                  ? 'Recover'
                  : 'Verify'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Circuit Visualization */}
      <QuantumCircuit
        currentStep={step}
        classicalBits={teleportation.classicalBits}
        pauliCorrection={appliedCorr}
      />

      {/* Step Inspector & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Explanation Card */}
        <div className="lg:col-span-7 panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div className="flex items-center gap-2.5">
              <span className="h-7 w-7 bg-quantum text-white flex items-center justify-center font-mono font-bold text-sm">
                {currentStepInfo.step}
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">{currentStepInfo.title}</h3>
                <p className="text-xs text-ink-muted font-medium">{currentStepInfo.summary}</p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold text-quantum bg-quantum-tint px-2 py-0.5 border border-quantum uppercase tracking-wider">
              Active Stage
            </span>
          </div>

          <div className="bg-well border border-rule p-4 text-xs text-ink font-medium leading-relaxed">
            {PROTOCOL_STAGES[currentStepInfo.step].note}
          </div>

          {/* Mathematical Transformation */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              Mathematical State Operator
            </span>
            <div className="bg-face border border-rule p-3 font-mono text-sm font-bold text-quantum overflow-x-auto">
              {currentStepInfo.state}
            </div>
          </div>
        </div>

        {/* Spatial State Snapshot */}
        <div className="lg:col-span-5 panel p-6 space-y-3">
          <span className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider block mb-2 border-b border-rule pb-2">
            Station State Telemetry
          </span>

          {/* Alice's Domain */}
          <div className="bg-bench border border-rule p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <span className="text-quantum flex items-center gap-1.5">
                <IconInfo size={14} /> Alice Domain (Q0, Q1)
              </span>
              <span className="text-ink-muted">Sender</span>
            </div>
            <p className="text-xs font-mono font-bold text-ink">{currentStepInfo.sender}</p>
          </div>

          {/* Quantum / Classical Channel */}
          <div className="bg-bench border border-rule p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <span className="text-warn flex items-center gap-1.5">
                <IconPulse size={14} /> Channel Status
              </span>
              <span className="text-ink-muted">Transmission</span>
            </div>
            <p className="text-xs font-mono font-bold text-ink">{currentStepInfo.channel}</p>
          </div>

          {/* Bob's Domain */}
          <div className="bg-bench border border-rule p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <span className="text-pass flex items-center gap-1.5">
                <IconCheck size={14} /> Bob Domain (Q2)
              </span>
              <span className="text-ink-muted">Receiver</span>
            </div>
            <p className="text-xs font-mono font-bold text-ink">{currentStepInfo.receiver}</p>
          </div>
        </div>
      </div>

      {/* Context Questions */}
      <HumanContextHelper
        title="Teleportation Step Context"
        items={[
          {
            question: 'Why did Alice’s original qubit state collapse at Step 5?',
            answer:
              'Quantum measurement is projective and non-reversible. Measuring Q0 and Q1 collapses their state. According to the No-Cloning Theorem, the original quantum state cannot be duplicated — it is destroyed at Alice’s end and reconstructed at Bob’s.',
            type: 'info',
          },
          {
            question: 'What happens if Bob does not apply Pauli correction?',
            answer:
              'If Bob does not apply the Pauli operator corresponding to the classical syndrome bits (00→I, 01→X, 10→Z, 11→XZ), his qubit remains in a rotated/phase-flipped state, causing fidelity to drop and signature verification to fail.',
            type: 'caution',
          },
        ]}
      />
    </div>
  );
}
