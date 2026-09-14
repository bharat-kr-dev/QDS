'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  IconSettings,
  IconReset,
  IconExperiments,
  IconVerify,
  IconInfo,
} from '../../components/icons/Icons';

export default function SettingsPage() {
  const {
    shots,
    setShots,
    threshold,
    setThreshold,
    autoCorrection,
    setAutoCorrection,
    clearExperiments,
    experiments,
    reset,
    resetAttack,
  } = useQuantum();

  const handleFullReset = () => {
    reset();
    resetAttack();
    setThreshold(5.0);
    setShots(1000);
    setAutoCorrection(true);
    alert('Simulator parameters restored to standard factory baseline.');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-quantum bg-quantum-tint text-[10px] font-mono font-bold text-quantum uppercase tracking-wider mb-2">
            <IconSettings size={12} />
            Simulator Precision & Backend Configuration
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            System & Quantum Engine Settings
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            Configure numerical simulation precision, measurement shot sampling presets, and security thresholds.
          </p>
        </div>

        <button
          onClick={handleFullReset}
          className="flex items-center gap-2 px-3.5 py-2 bg-face hover:bg-well border border-rule text-ink text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <IconReset size={14} />
          <span>Restore Defaults</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Measurement & Simulation Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Shots Presets */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider border-b border-rule pb-3">
              <IconSettings size={16} className="text-quantum" />
              <span>Projective Measurement Shot Presets</span>
            </div>
            <p className="text-xs text-ink-muted font-medium">
              Higher shot counts decrease statistical shot noise and improve confidence intervals according to 1/√N convergence.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[100, 1000, 10000, 50000].map((s) => (
                <button
                  key={s}
                  onClick={() => setShots(s)}
                  className={`py-2 px-3 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                    shots === s
                      ? 'bg-quantum border-quantum text-white'
                      : 'bg-face border-rule text-ink hover:bg-well'
                  }`}
                >
                  {s.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Auto vs Manual Pauli Mode */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider">
                <IconSettings size={16} className="text-pass" />
                <span>Default Pauli Unitary Mode</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pass">
                {autoCorrection ? 'Automatic' : 'Manual Override'}
              </span>
            </div>

            <p className="text-xs text-ink-muted font-medium">
              When automatic mode is enabled, Bob instantly applies the correct Pauli operator (I, X, Z, XZ) decoded from Alice's classical measurement bits.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => setAutoCorrection(true)}
                className={`flex-1 w-full py-2 px-3 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                  autoCorrection
                    ? 'bg-pass border-pass text-white'
                    : 'bg-face border-rule text-ink hover:bg-well'
                }`}
              >
                Auto Protocol Correction
              </button>
              <button
                onClick={() => setAutoCorrection(false)}
                className={`flex-1 w-full py-2 px-3 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                  !autoCorrection
                    ? 'bg-warn border-warn text-white'
                    : 'bg-face border-rule text-ink hover:bg-well'
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
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider">
                <IconVerify size={16} className="text-warn" />
                <span>Security Threshold Configuration</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-warn">
                {threshold.toFixed(1)}%
              </span>
            </div>

            <p className="text-xs text-ink-muted font-medium">
              Set the error margin above which channel disturbance or eavesdropping is flagged.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              {[
                { val: 3.0, label: '3.0% (Strict)' },
                { val: 5.0, label: '5.0% (Standard)' },
                { val: 11.0, label: '11.0% (Shor-Preskill)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setThreshold(opt.val)}
                  className={`py-2 px-2 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                    threshold === opt.val
                      ? 'bg-warn-tint border-warn text-warn'
                      : 'bg-face border-rule text-ink hover:bg-well'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session Data Store */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider border-b border-rule pb-3">
              <IconExperiments size={16} className="text-quantum" />
              <span>Experiment Session Cache</span>
            </div>
            <p className="text-xs text-ink-muted font-medium">
              Currently storing <strong className="text-ink">{experiments.length}</strong> logged experiment runs in browser memory.
            </p>

            <button
              onClick={clearExperiments}
              disabled={experiments.length === 0}
              className="w-full py-2 px-3 bg-face hover:bg-well disabled:opacity-40 border border-rule text-adversary text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer pt-2"
            >
              Purge All Saved Experiment Runs
            </button>
          </div>
        </div>
      </div>

      {/* Backend Engine Specification */}
      <div className="panel p-6 bg-bench border border-rule space-y-3">
        <div className="flex items-center gap-2 text-quantum font-bold uppercase tracking-wider text-[11px] border-b border-rule pb-3">
          <IconInfo size={14} />
          Quantum Simulation Engine Specifications
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs font-medium text-ink-muted">
          <div>
            <span className="text-ink font-bold block mb-1">Linear Algebra Core</span> Complex Statevector
          </div>
          <div>
            <span className="text-ink font-bold block mb-1">Numerical Precision</span> IEEE-754 Float64 (1e-12 tolerance)
          </div>
          <div>
            <span className="text-ink font-bold block mb-1">Execution Backend</span> Client-Side Deterministic & Stochastic Engine
          </div>
        </div>
      </div>
    </div>
  );
}
