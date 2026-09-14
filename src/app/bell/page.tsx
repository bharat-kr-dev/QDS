'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { BELL_STATES } from '../../lib/quantum/bell';
import { BellStateKey } from '../../lib/quantum/types';
import { BELL_STATE_NOTES } from '../../content/protocol';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import { IconEntangle, IconClassical, IconInfo, IconCheck } from '../../components/icons/Icons';

export default function BellStatePage() {
  const { bellKey, setBellKey } = useQuantum();
  const currentBell = BELL_STATES[bellKey];
  const chshValue = currentBell.chsh;

  const bellKeys: BellStateKey[] = ['PHI_PLUS', 'PHI_MINUS', 'PSI_PLUS', 'PSI_MINUS'];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-pass bg-pass-tint text-[10px] font-mono font-bold text-pass uppercase tracking-wider mb-2">
            <IconEntangle size={12} />
            Maximally Entangled EPR Resource
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            Bell State Generator & Entanglement Engine
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">
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
                className={`px-3 py-2 text-xs font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                  isSelected
                    ? 'bg-pass border-pass text-white'
                    : 'bg-face border-rule text-ink hover:bg-well'
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
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <span className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">
                State Vector & Circuit
              </span>
              <span className="text-[11px] font-mono font-bold text-pass bg-pass-tint px-2 py-0.5 border border-pass uppercase tracking-wider">
                {bellKey.replace('_', ' ')}
              </span>
            </div>

            {/* Formula Block */}
            <div className="bg-well border border-rule p-4 font-mono text-lg font-bold text-quantum overflow-x-auto text-center">
              {currentBell.formula}
            </div>

            {/* Circuit Description */}
            <div className="bg-face border border-rule p-3.5 space-y-1 text-xs">
              <span className="text-ink-muted font-mono font-bold uppercase tracking-wider text-[10px]">Generation Circuit:</span>
              <p className="text-ink font-mono font-bold">{currentBell.preparation}</p>
            </div>

            {/* 4-Component Statevector table */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">Computational Basis Amplitudes:</span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono font-bold">
                {['|00⟩', '|01⟩', '|10⟩', '|11⟩'].map((basisLabel, i) => {
                  const amp = currentBell.amplitudes[i];
                  const hasProb = amp.re !== 0 || amp.im !== 0;
                  return (
                    <div
                      key={basisLabel}
                      className={`p-2.5 border transition-colors ${
                        hasProb
                          ? 'bg-pass-tint border-pass text-pass'
                          : 'bg-face border-rule text-ink-faint'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider">{basisLabel}</div>
                      <div className="my-1 text-sm">{amp.re !== 0 ? (amp.re > 0 ? '+1/√2' : '-1/√2') : '0'}</div>
                      <div className="text-[10px]">
                        {hasProb ? '50% prob' : '0%'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Entanglement Correlation Matrix */}
          <div className="panel p-6 space-y-4">
            <span className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider border-b border-rule pb-3 block">
              Pauli Spin Joint Correlation Coefficients ⟨σ_A ⊗ σ_B⟩
            </span>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-well border border-rule p-3">
                <div className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">⟨Z_A ⊗ Z_B⟩</div>
                <div className="text-lg font-mono font-bold text-quantum my-1">
                  {currentBell.correlations.zz > 0 ? '+1.0' : '-1.0'}
                </div>
                <div className="text-[10px] font-medium text-ink-muted">
                  {currentBell.correlations.zz > 0 ? 'Correlated' : 'Anti-Correlated'}
                </div>
              </div>

              <div className="bg-well border border-rule p-3">
                <div className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">⟨X_A ⊗ X_B⟩</div>
                <div className="text-lg font-mono font-bold text-pass my-1">
                  {currentBell.correlations.xx > 0 ? '+1.0' : '-1.0'}
                </div>
                <div className="text-[10px] font-medium text-ink-muted">
                  {currentBell.correlations.xx > 0 ? 'Correlated' : 'Anti-Correlated'}
                </div>
              </div>

              <div className="bg-well border border-rule p-3">
                <div className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">⟨Y_A ⊗ Y_B⟩</div>
                <div className="text-lg font-mono font-bold text-adversary my-1">
                  {currentBell.correlations.yy > 0 ? '+1.0' : '-1.0'}
                </div>
                <div className="text-[10px] font-medium text-ink-muted">
                  {currentBell.correlations.yy > 0 ? 'Correlated' : 'Anti-Correlated'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Entanglement Diagram & Bell Inequality */}
        <div className="lg:col-span-6 space-y-6">
          {/* Spatial Entanglement Visualizer */}
          <div className="panel p-6 space-y-4 flex flex-col items-center">
            <span className="w-full text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider border-b border-rule pb-3">
              Spatial Entanglement Distribution
            </span>

            <div className="w-full py-8 px-4 bg-face border border-rule flex items-center justify-between relative overflow-hidden">
              {/* Alice Qubit Node */}
              <div className="flex flex-col items-center space-y-1.5 z-10">
                <div className="h-14 w-14 bg-well border-2 border-quantum flex items-center justify-center text-quantum font-mono font-bold text-lg">
                  q_A
                </div>
                <span className="text-xs font-bold text-ink uppercase tracking-wider">Alice (Sender)</span>
                <span className="text-[10px] font-mono font-bold text-quantum uppercase tracking-wider">Qubit 1</span>
              </div>

              {/* Animated Non-Local Entanglement Link */}
              <div className="flex-1 mx-4 flex flex-col items-center relative">
                <div className="w-full h-1 bg-quantum opacity-50 relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full w-1/3 bg-pass animate-ping"></div>
                </div>
                <div className="my-2 inline-flex items-center gap-1.5 px-3 py-1 bg-pass-tint border border-pass text-[10px] font-mono font-bold text-pass uppercase tracking-wider">
                  <IconEntangle size={12} className="animate-pulse" />
                  <span>Non-Local Entanglement</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">
                  Concurrence C = 1.000 (Maximal)
                </div>
              </div>

              {/* Bob Qubit Node */}
              <div className="flex flex-col items-center space-y-1.5 z-10">
                <div className="h-14 w-14 bg-well border-2 border-pass flex items-center justify-center text-pass font-mono font-bold text-lg">
                  q_B
                </div>
                <span className="text-xs font-bold text-ink uppercase tracking-wider">Bob (Receiver)</span>
                <span className="text-[10px] font-mono font-bold text-pass uppercase tracking-wider">Qubit 2</span>
              </div>
            </div>

            {/* Plain English Explanation */}
            <div className="w-full bg-well border border-rule p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-pass font-bold font-mono uppercase tracking-wider text-[10px]">
                <IconInfo size={14} />
                Why does this matter?
              </div>
              <p className="leading-relaxed text-ink font-medium">{BELL_STATE_NOTES[bellKey].usage}</p>
            </div>
          </div>

          {/* CHSH Bell Inequality Violation Gauge */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider">
                <IconCheck size={16} className="text-pass" />
                <span>CHSH Bell Inequality Test</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-pass bg-pass-tint border border-pass px-2 py-0.5 uppercase tracking-wider">
                Quantum Non-Locality Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-face border border-rule p-4 space-y-1">
                <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">Classical Local Bound:</div>
                <div className="text-base font-mono font-bold text-ink my-1">|S| ≤ 2.000</div>
                <div className="text-[10px] font-medium text-ink-muted">Local Hidden Variable limit</div>
              </div>
              <div className="bg-well border border-pass p-4 space-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-pass"></div>
                <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">Observed Quantum S-Value:</div>
                <div className="text-base font-mono font-bold text-pass my-1">
                  S = 2√2 ≈ {chshValue.toFixed(3)}
                </div>
                <div className="text-[10px] font-medium text-pass">Reaches Tsirelson’s Bound</div>
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
