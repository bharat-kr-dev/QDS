'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { QuantumCircuit } from '../../components/ui/QuantumCircuit';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  SendHorizontal,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Radio,
  Cpu,
  Zap,
} from 'lucide-react';

export default function TeleportationPage() {
  const {
    teleportStep,
    setTeleportStep,
    teleportResult,
    isPlaying,
    playTeleportation,
    pauseTeleportation,
    resetTeleportation,
    stepNext,
    stepPrev,
    manualCorrection,
    autoCorrectionMode,
  } = useQuantum();

  const currentStepInfo = teleportResult.steps[teleportStep];

  const appliedCorr = autoCorrectionMode
    ? teleportResult.pauliCorrectionRequired
    : manualCorrection;

  return (
    <div className="space-y-8">
      {/* Page Header with Playback Controls */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-800 text-[11px] font-mono text-sky-400 mb-1.5">
            <SendHorizontal className="w-3.5 h-3.5" />
            Quantum Teleportation Engine (9-Stage Stepper)
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Quantum Teleportation Protocol Simulator
          </h1>
          <p className="text-xs text-slate-400">
            Step through the 9 exact stages of quantum teleportation from initial signature preparation to Pauli recovery.
          </p>
        </div>

        {/* Playback Controls Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={stepPrev}
            disabled={teleportStep <= 1}
            className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none border border-slate-700 text-slate-200 rounded-xl transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {isPlaying ? (
            <button
              onClick={pauseTeleportation}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={playTeleportation}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{teleportStep >= 9 ? 'Restart & Play' : 'Play Simulation'}</span>
            </button>
          )}

          <button
            onClick={stepNext}
            disabled={teleportStep >= 9}
            className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none border border-slate-700 text-slate-200 rounded-xl transition-colors"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={resetTeleportation}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Tracker Pills */}
      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 bg-slate-950 border border-slate-800 p-2 rounded-xl">
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((stepNum) => {
          const isCurrent = teleportStep === stepNum;
          const isPassed = teleportStep > stepNum;

          return (
            <button
              key={stepNum}
              onClick={() => setTeleportStep(stepNum)}
              className={`py-2 px-1 rounded-lg text-xs font-mono font-medium transition-all text-center flex flex-col items-center gap-0.5 ${
                isCurrent
                  ? 'bg-sky-600 text-white shadow-md font-bold ring-2 ring-sky-400'
                  : isPassed
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                  : 'bg-slate-900/40 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] text-slate-400">STEP {stepNum}</span>
              <span className="text-[11px] truncate max-w-full">
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
        currentStep={teleportStep}
        classicalBits={teleportResult.classicalBits}
        pauliCorrection={appliedCorr}
      />

      {/* Step Inspector & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Explanation Card */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-7 w-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-mono font-bold text-sm">
                {currentStepInfo.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">{currentStepInfo.title}</h3>
                <p className="text-xs text-slate-400">{currentStepInfo.shortDesc}</p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-sky-400 bg-sky-950 px-2.5 py-1 rounded-full border border-sky-800">
              Active Stage
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            {currentStepInfo.detailedExplanation}
          </div>

          {/* Mathematical Transformation */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono text-slate-400 uppercase">
              Mathematical State Operator
            </span>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-sm text-sky-300 overflow-x-auto">
              {currentStepInfo.mathState}
            </div>
          </div>
        </div>

        {/* Spatial State Snapshot */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Station State Telemetry
          </span>

          {/* Alice's Domain */}
          <div className="bg-slate-900/80 border border-sky-900/60 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Alice Domain (Q0, Q1)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Sender</span>
            </div>
            <p className="text-xs font-mono text-slate-200">{currentStepInfo.senderState}</p>
          </div>

          {/* Quantum / Classical Channel */}
          <div className="bg-slate-900/80 border border-amber-900/60 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> Channel Status
              </span>
              <span className="text-[10px] font-mono text-slate-400">Transmission</span>
            </div>
            <p className="text-xs font-mono text-slate-200">{currentStepInfo.channelState}</p>
          </div>

          {/* Bob's Domain */}
          <div className="bg-slate-900/80 border border-emerald-900/60 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Bob Domain (Q2)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Receiver</span>
            </div>
            <p className="text-xs font-mono text-slate-200">{currentStepInfo.receiverState}</p>
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
