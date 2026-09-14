'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import {
  IconPlay,
  IconPause,
  IconReset,
  IconSave,
  IconThreat,
  IconQber,
  IconSignature,
} from '../icons/Icons';
import confetti from 'canvas-confetti';

export const AppHeader: React.FC = () => {
  const {
    step,
    isPlaying,
    play,
    pause,
    reset,
    saveExperiment,
    verification,
    attack,
    bellKey,
  } = useQuantum();

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    saveExperiment();
    setSaveSuccess(true);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.1, x: 0.85 }, colors: ['#1a3fbf', '#0e7c86', '#0f7a4e'] });
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const isAttacked = attack.type !== 'none' && attack.type !== 'noise';

  return (
    <header className="sticky top-0 z-40 w-full bg-face border-b border-rule px-4 lg:px-6 py-2.5 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-[1600px] mx-auto">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-8 w-8 well border-rule text-quantum font-mono font-bold text-lg">
            Ψ
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-ink tracking-tight uppercase">
                Quantum Digital Signature Workstation
              </h1>
              <span className="text-[10px] font-mono font-medium text-ink-muted bg-well px-1.5 py-0.5 border border-rule">
                EPR TELEPORT v2.4
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-ink-muted font-mono mt-1">
              <span className="flex items-center gap-1.5">
                <span className="text-ink-faint">Resource:</span>
                <strong className="text-quantum">{bellKey}</strong>
              </span>
              <span className="text-rule-strong">|</span>
              <span className="flex items-center gap-1">
                <IconSignature size={12} className="text-classical" />
                <span className="text-ink-faint">Step:</span>
                <strong className="text-ink tnum">{step}/9</strong>
              </span>
              <span className="text-rule-strong">|</span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="text-ink-faint">Latency:</span>
                <span className="tnum">0.2ms</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Channel Health Badge */}
        <div className="hidden xl:flex items-center gap-3 panel px-3 py-1.5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <IconThreat size={14} className={isAttacked ? 'text-adversary' : 'text-pass'} />
            <span className="text-ink-muted">Channel:</span>
            <span className={`font-bold ${isAttacked ? 'text-adversary' : 'text-pass'}`}>
              {isAttacked ? `Intercept (${attack.type})` : 'Clean'}
            </span>
          </div>

          <span className="text-rule">|</span>

          <div className="flex items-center gap-1.5">
            <IconQber size={14} className="text-ink-muted" />
            <span className="text-ink-muted">QBER:</span>
            <span className={`font-bold px-1.5 py-0.5 ${verification.qber > 5 ? 'bg-adversary-tint text-adversary border border-adversary' : 'bg-pass-tint text-pass border border-pass'}`}>
              {verification.qber.toFixed(2)}%
            </span>
          </div>

          <span className="text-rule">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-ink-muted">Fidelity:</span>
            <span className="font-bold text-quantum tnum">
              {(verification.fidelity * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right: Simulation Controls */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={pause}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-warn-tint text-warn border border-warn hover:bg-warn hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <IconPause size={14} />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={play}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-quantum text-white border border-quantum hover:bg-quantum-tint hover:text-quantum text-xs font-medium transition-colors cursor-pointer"
            >
              <IconPlay size={14} />
              <span>{step >= 9 ? 'Replay' : 'Auto'}</span>
            </button>
          )}

          <button
            onClick={reset}
            title="Reset simulation to step 1"
            className="flex items-center gap-1.5 px-3 py-1.5 panel hover:bg-well text-ink-muted hover:text-ink text-xs font-medium transition-colors cursor-pointer"
          >
            <IconReset size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
              saveSuccess
                ? 'bg-pass text-white border-pass'
                : 'panel hover:bg-well text-ink-muted hover:text-ink'
            }`}
          >
            <IconSave size={14} />
            <span>{saveSuccess ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
