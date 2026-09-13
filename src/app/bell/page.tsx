'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { BELL_STATES, calculateCHSH } from '../../lib/quantum/bell';
import { BellStateKey } from '../../lib/quantum/types';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import { Layers, Zap, CheckCircle2, ShieldCheck, Sparkles, Activity } from 'lucide-react';

export default function BellStatePage() {
  const { bellKey, setBellKey } = useQuantum();
  const currentBell = BELL_STATES[bellKey];
  const chsh = calculateCHSH(bellKey);

  const bellKeys: BellStateKey[] = ['PHI_PLUS', 'PHI_MINUS', 'PSI_PLUS', 'PSI_MINUS'];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] font-mono text-emerald-400 mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            Maximally Entangled EPR Resource
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Bell State Generator & Entanglement Engine
          </h1>
          <p className="text-xs text-slate-400">
            Generate and analyze the 4 canonical Bell states that power the quantum teleportation channel.
          </p>
        </div>

        {/* Bell State Tab Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {bellKeys.map((key) => {
            const isSelected = bellKey === key;
            return (
              <button
                key={key}
                onClick={() => setBellKey(key)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {BELL_STATES[key].symbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main State Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mathematical Formulation & Circuit */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                State Vector & Circuit
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {currentBell.name}
              </span>
            </div>

            {/* Formula Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-lg text-emerald-300">
              {currentBell.formula}
            </div>

            {/* Circuit Description */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1 text-xs">
              <span className="text-slate-400 font-mono">Generation Circuit:</span>
              <p className="text-slate-200 font-mono">{currentBell.circuitDescription}</p>
            </div>

            {/* 4-Component Statevector table */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-mono text-slate-400">Computational Basis Amplitudes:</span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {['|00⟩', '|01⟩', '|10⟩', '|11⟩'].map((basisLabel, i) => {
                  const amp = currentBell.stateVector[i];
                  const hasProb = amp.re !== 0 || amp.im !== 0;
                  return (
                    <div
                      key={basisLabel}
                      className={`p-2.5 rounded-lg border ${
                        hasProb
                          ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200 font-bold'
                          : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                      }`}
                    >
                      <div className="text-slate-400 text-[10px]">{basisLabel}</div>
                      <div>{amp.re !== 0 ? (amp.re > 0 ? '+1/√2' : '-1/√2') : '0'}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {hasProb ? '50% prob' : '0%'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Entanglement Correlation Matrix */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Pauli Spin Joint Correlation Coefficients ⟨σ_A ⊗ σ_B⟩
            </span>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] font-mono text-slate-400">⟨Z_A ⊗ Z_B⟩</div>
                <div className="text-lg font-mono font-bold text-sky-400">
                  {currentBell.correlations.zz > 0 ? '+1.0' : '-1.0'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {currentBell.correlations.zz > 0 ? 'Correlated' : 'Anti-Correlated'}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] font-mono text-slate-400">⟨X_A ⊗ X_B⟩</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {currentBell.correlations.xx > 0 ? '+1.0' : '-1.0'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {currentBell.correlations.xx > 0 ? 'Correlated' : 'Anti-Correlated'}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] font-mono text-slate-400">⟨Y_A ⊗ Y_B⟩</div>
                <div className="text-lg font-mono font-bold text-pink-400">
                  {currentBell.correlations.yy > 0 ? '+1.0' : '-1.0'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {currentBell.correlations.yy > 0 ? 'Correlated' : 'Anti-Correlated'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Entanglement Diagram & Bell Inequality */}
        <div className="lg:col-span-6 space-y-6">
          {/* Spatial Entanglement Visualizer */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col items-center">
            <span className="w-full text-xs font-mono text-slate-400 uppercase tracking-wider">
              Spatial Entanglement Distribution
            </span>

            <div className="w-full py-8 px-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between relative overflow-hidden">
              {/* Alice Qubit Node */}
              <div className="flex flex-col items-center space-y-1.5 z-10">
                <div className="h-14 w-14 rounded-2xl bg-sky-950 border-2 border-sky-400 flex items-center justify-center text-sky-300 font-mono font-bold text-lg shadow-lg shadow-sky-500/20">
                  q_A
                </div>
                <span className="text-xs font-semibold text-white">Alice (Sender)</span>
                <span className="text-[10px] font-mono text-sky-400">Qubit 1</span>
              </div>

              {/* Animated Non-Local Entanglement Link */}
              <div className="flex-1 mx-4 flex flex-col items-center relative">
                <div className="w-full h-1 bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-500 rounded-full animate-pulse" />
                <div className="my-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-emerald-700/80 rounded-full text-[11px] font-mono text-emerald-300 shadow-md">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
                  <span>Non-Local Entanglement</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Concurrence C = 1.000 (Maximal)
                </div>
              </div>

              {/* Bob Qubit Node */}
              <div className="flex flex-col items-center space-y-1.5 z-10">
                <div className="h-14 w-14 rounded-2xl bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-mono font-bold text-lg shadow-lg shadow-emerald-500/20">
                  q_B
                </div>
                <span className="text-xs font-semibold text-white">Bob (Receiver)</span>
                <span className="text-[10px] font-mono text-emerald-400">Qubit 2</span>
              </div>
            </div>

            {/* Plain English Explanation */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                Why does this matter?
              </div>
              <p className="leading-relaxed">{currentBell.explanation}</p>
              <p className="text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
                {currentBell.whyItMatters}
              </p>
            </div>
          </div>

          {/* CHSH Bell Inequality Violation Gauge */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>CHSH Bell Inequality Test</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                Quantum Non-Locality Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="text-[11px] font-mono text-slate-400">Classical Local Bound:</div>
                <div className="text-base font-mono font-bold text-slate-300">|S| ≤ 2.000</div>
                <div className="text-[10px] text-slate-400">Local Hidden Variable limit</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="text-[11px] font-mono text-slate-400">Observed Quantum S-Value:</div>
                <div className="text-base font-mono font-bold text-emerald-400">
                  S = 2√2 ≈ {chsh.sValue}
                </div>
                <div className="text-[10px] text-emerald-400">Reaches Tsirelson’s Bound</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <HumanContextHelper
        title="Entanglement Deep Dive"
        items={[
          {
            question: 'Can entanglement be used for faster-than-light communication?',
            answer:
              'No. Although entanglement collapses correlated qubits instantaneously at any distance, individual measurement outcomes appear completely random to either observer. Meaningful information transfer requires transmitting 2 classical bits at the speed of light.',
            type: 'info',
          },
          {
            question: 'What is Concurrence?',
            answer:
              'Concurrence is an entanglement monotone ranging from 0 (completely unentangled/separable product state) to 1 (maximally entangled state like Bell pairs).',
            type: 'tip',
          },
        ]}
      />
    </div>
  );
}
