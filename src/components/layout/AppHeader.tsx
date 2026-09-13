'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { Play, Pause, RotateCcw, Save, Activity, ShieldCheck, Cpu, Sparkles, Terminal, Radio } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AppHeader: React.FC = () => {
  const {
    teleportResult,
    teleportStep,
    isPlaying,
    playTeleportation,
    pauseTeleportation,
    resetTeleportation,
    saveCurrentExperiment,
    verificationResult,
    attackConfig,
    bellKey,
  } = useQuantum();

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    saveCurrentExperiment();
    setSaveSuccess(true);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.1, x: 0.85 } });
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const isAttacked = attackConfig.enabled && attackConfig.type !== 'none';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080d1a]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-6 py-2.5 select-none shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-[1600px] mx-auto">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
            <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-[#0b1120] text-cyan-400 font-mono font-black text-lg border border-cyan-500/40 shadow-inner">
              Ψ
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                QUANTUM DIGITAL SIGNATURE WORKSTATION
              </h1>
              <span className="text-[9px] font-mono font-bold bg-gradient-to-r from-cyan-950 to-sky-900 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded shadow-sm">
                EPR TELEPORT v2.4
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-400">Resource:</span>
                <strong className="text-cyan-300">{bellKey}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Activity className="w-3 h-3 text-sky-400" />
                <span className="text-slate-400">Step:</span>
                <strong className="text-sky-300">{teleportStep}/9</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="hidden sm:flex items-center gap-1 text-slate-400">
                <Terminal className="w-3 h-3 text-indigo-400" />
                <span>Sim Latency: 0.2ms</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Channel Health Badge */}
        <div className="hidden xl:flex items-center gap-3 bg-[#0c1427]/80 border border-white/[0.08] px-3.5 py-1.5 rounded-xl text-xs font-mono shadow-inner">
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${isAttacked ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="text-slate-400">Channel Security:</span>
            <span className={`font-bold ${isAttacked ? 'text-rose-300' : 'text-emerald-300'}`}>
              {isAttacked ? `Adversary Intercept (${attackConfig.type})` : 'EPR Secure (Clean)'}
            </span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">QBER:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${verificationResult.qber > 5 ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'}`}>
              {verificationResult.qber}%
            </span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Fidelity:</span>
            <span className="font-bold text-cyan-300">
              {(verificationResult.fidelity * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right: Simulation Controls */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={pauseTeleportation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-amber-900/30 border border-amber-500/40 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={playTeleportation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-cyan-900/30 border border-cyan-400/40 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{teleportStep >= 9 ? 'Replay Run' : 'Auto Play'}</span>
            </button>
          )}

          <button
            onClick={resetTeleportation}
            title="Reset simulation to step 1"
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0e1629] hover:bg-[#131d36] text-slate-300 border border-white/[0.08] rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-md ${
              saveSuccess
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-[#0e1629] hover:bg-[#131d36] border-white/[0.08] hover:border-cyan-500/30 text-slate-200'
            }`}
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span>{saveSuccess ? 'Saved Run!' : 'Save Exp'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
