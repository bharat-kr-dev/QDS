'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  Settings as SettingsIcon,
  Sliders,
  Cpu,
  Shield,
  RotateCcw,
  Sparkles,
  Database,
  CheckCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    shotsCount,
    setShotsCount,
    qberThreshold,
    setQberThreshold,
    autoCorrectionMode,
    setAutoCorrectionMode,
    clearExperiments,
    experiments,
    resetTeleportation,
    resetAttack,
  } = useQuantum();

  const handleFullReset = () => {
    resetTeleportation();
    resetAttack();
    setQberThreshold(5.0);
    setShotsCount(1000);
    setAutoCorrectionMode(true);
    alert('Simulator parameters restored to standard factory baseline.');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300 mb-1.5">
            <SettingsIcon className="w-3.5 h-3.5 text-sky-400" />
            Simulator Precision & Backend Configuration
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            System & Quantum Engine Settings
          </h1>
          <p className="text-xs text-slate-400">
            Configure numerical simulation precision, measurement shot sampling presets, and security thresholds.
          </p>
        </div>

        <button
          onClick={handleFullReset}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Defaults</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Measurement & Simulation Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Shots Presets */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Projective Measurement Shot Presets</span>
            </div>
            <p className="text-xs text-slate-400">
              Higher shot counts decrease statistical shot noise and improve confidence intervals according to 1/√N convergence.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[100, 1000, 10000, 50000].map((shots) => (
                <button
                  key={shots}
                  onClick={() => setShotsCount(shots)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                    shotsCount === shots
                      ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {shots.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Auto vs Manual Pauli Mode */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Default Pauli Unitary Mode</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {autoCorrectionMode ? 'Automatic' : 'Manual Override'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              When automatic mode is enabled, Bob instantly applies the correct Pauli operator (I, X, Z, XZ) decoded from Alice's classical measurement bits.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoCorrectionMode(true)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                  autoCorrectionMode
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Auto Protocol Correction
              </button>
              <button
                onClick={() => setAutoCorrectionMode(false)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                  !autoCorrectionMode
                    ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Manual User Control
              </button>
            </div>
          </div>
        </div>

        {/* Right: Security Bounds & Data Management */}
        <div className="lg:col-span-6 space-y-6">
          {/* QBER Security Threshold */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Security Threshold Configuration</span>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {qberThreshold.toFixed(1)}%
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Set the error margin above which channel disturbance or eavesdropping is flagged.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 3.0, label: '3.0% (Strict)' },
                { val: 5.0, label: '5.0% (Standard)' },
                { val: 11.0, label: '11.0% (Shor-Preskill)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setQberThreshold(opt.val)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono border transition-all ${
                    qberThreshold === opt.val
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session Data Store */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Database className="w-4 h-4 text-sky-400" />
              <span>Experiment Session Cache</span>
            </div>
            <p className="text-xs text-slate-400">
              Currently storing <strong className="text-slate-200">{experiments.length}</strong> logged experiment runs in browser memory.
            </p>

            <button
              onClick={clearExperiments}
              disabled={experiments.length === 0}
              className="py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-rose-400 rounded-xl text-xs font-mono font-semibold transition-colors"
            >
              Purge All Saved Experiment Runs
            </button>
          </div>
        </div>
      </div>

      {/* Backend Engine Specification */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-sky-400 font-bold">
          <Sparkles className="w-4 h-4" />
          Quantum Simulation Engine Specifications
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-slate-400">
          <div>
            <span className="text-slate-200">Linear Algebra Core:</span> Complex Statevector
          </div>
          <div>
            <span className="text-slate-200">Numerical Precision:</span> IEEE-754 Float64 (1e-12 tolerance)
          </div>
          <div>
            <span className="text-slate-200">Execution Backend:</span> Client-Side Deterministic & Stochastic Engine
          </div>
        </div>
      </div>
    </div>
  );
}
