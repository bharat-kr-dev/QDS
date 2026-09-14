'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { BlochSphere } from '../../components/ui/BlochSphere';
import { HistogramChart } from '../../components/ui/HistogramChart';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import { BasisType } from '../../lib/quantum/types';
import {
  IconQubit,
  IconSettings,
  IconReset,
  IconInfo,
} from '../../components/icons/Icons';

export default function QuantumLabPage() {
  const {
    inputState,
    inputQubit,
    setInputFromAngles,
    setInputPreset,
    shots,
    setShots,
  } = useQuantum();

  const [selectedBasis, setSelectedBasis] = useState<BasisType>('Z');
  const bloch = inputState.getBloch();

  // Slider angle state in degrees
  const thetaDeg = Math.round((bloch.theta * 180) / Math.PI);
  const phiDeg = Math.round((bloch.phi * 180) / Math.PI);

  const handleThetaChange = (valDeg: number) => {
    const tRad = (valDeg * Math.PI) / 180;
    setInputFromAngles(tRad, bloch.phi);
  };

  const handlePhiChange = (valDeg: number) => {
    const pRad = (valDeg * Math.PI) / 180;
    setInputFromAngles(bloch.theta, pRad);
  };

  // Run projective measurement simulation
  const measurementResult = inputState.measure(selectedBasis, shots, Math.random);

  // Human explanation of probabilities
  const p0Pct = (bloch.p0 * 100).toFixed(1);
  const p1Pct = (bloch.p1 * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-quantum bg-quantum-tint text-[10px] font-mono font-bold text-quantum uppercase tracking-wider mb-2">
            <IconQubit size={12} />
            Interactive Quantum State Workspace
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            Quantum Lab: Qubit State Engineering
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            Construct arbitrary single-qubit superpositions, rotate on the 3D Bloch sphere, and sample multi-basis projective measurements.
          </p>
        </div>

        {/* Preset State Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setInputPreset('zero')}
            className="px-2.5 py-1.5 bg-face hover:bg-well border border-rule text-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            |0⟩
          </button>
          <button
            onClick={() => setInputPreset('one')}
            className="px-2.5 py-1.5 bg-face hover:bg-well border border-rule text-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            |1⟩
          </button>
          <button
            onClick={() => setInputPreset('plus')}
            className="px-2.5 py-1.5 bg-face hover:bg-well border border-rule text-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            |+⟩
          </button>
          <button
            onClick={() => setInputPreset('minus')}
            className="px-2.5 py-1.5 bg-face hover:bg-well border border-rule text-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            |-⟩
          </button>
          <button
            onClick={() => setInputPreset('plusI')}
            className="px-2.5 py-1.5 bg-face hover:bg-well border border-rule text-ink text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            |+i⟩
          </button>
          <button
            onClick={() => setInputPreset('weighted')}
            className="px-2.5 py-1.5 bg-quantum-tint hover:bg-quantum text-quantum hover:text-white border border-quantum text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            70% |0⟩ : 30% |1⟩
          </button>
        </div>
      </div>

      {/* Main Grid: Bloch Sphere & State Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Bloch Sphere */}
        <div className="lg:col-span-5 panel p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 border-b border-rule pb-3">
            <span className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              3D Bloch Sphere Geometry
            </span>
            <span className="text-[10px] font-mono font-bold text-quantum bg-quantum-tint border border-quantum px-2 py-0.5 uppercase tracking-wider">
              Unit Radius |r|=1
            </span>
          </div>

          <BlochSphere bloch={bloch} size={290} label="|ψ⟩" />

          {/* Natural Language Interpretation */}
          <div className="mt-4 w-full bg-well border border-rule p-4 text-xs text-ink space-y-1.5">
            <div className="flex items-center gap-1.5 text-quantum font-bold font-mono uppercase tracking-wider text-[10px]">
              <IconInfo size={14} />
              Human Explanation:
            </div>
            <p className="leading-relaxed font-medium">
              This qubit has a <strong className="text-pass">{p0Pct}%</strong> probability of being measured as <span className="font-mono text-quantum font-bold">|0⟩</span> and a <strong className="text-quantum">{p1Pct}%</strong> probability of being measured as <span className="font-mono text-pass font-bold">|1⟩</span> in the computational Z-basis.
            </p>
          </div>
        </div>

        {/* Right: State Vector & Probability Sliders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dirac Ket State Representation */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Dirac Ket Notation</h3>
              <span className="text-[10px] font-mono font-bold text-pass bg-pass-tint border border-pass px-2 py-0.5 uppercase tracking-wider">
                Normalized: |α|² + |β|² = 1.000
              </span>
            </div>

            <div className="bg-well border border-rule p-4 font-mono text-sm sm:text-base font-bold text-quantum overflow-x-auto text-center">
              {inputQubit.ket}
            </div>

            {/* Probability Bars */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider mb-1">
                  <span>Probability P(|0⟩) = |α|²</span>
                  <span className="text-pass font-bold">{p0Pct}% ({bloch.p0})</span>
                </div>
                <div className="h-3 bg-well rounded-none border border-rule overflow-hidden">
                  <div
                    className="h-full bg-pass transition-all duration-200"
                    style={{ width: `${bloch.p0 * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider mb-1">
                  <span>Probability P(|1⟩) = |β|²</span>
                  <span className="text-quantum font-bold">{p1Pct}% ({bloch.p1})</span>
                </div>
                <div className="h-3 bg-well rounded-none border border-rule overflow-hidden">
                  <div
                    className="h-full bg-quantum transition-all duration-200"
                    style={{ width: `${bloch.p1 * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Angle Sliders */}
          <div className="panel p-6 space-y-4 bg-bench">
            <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider border-b border-rule pb-3">
              <IconSettings size={16} className="text-quantum" />
              <span>Spherical Polar Coordinates</span>
            </div>

            {/* Theta slider */}
            <div className="space-y-1.5 p-3 bg-face border border-rule">
              <div className="flex justify-between text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">
                <span>Polar Angle θ (0° = North pole |0⟩, 180° = South pole |1⟩):</span>
                <span className="text-quantum font-bold">{thetaDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="1"
                value={thetaDeg}
                onChange={(e) => handleThetaChange(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Phi slider */}
            <div className="space-y-1.5 p-3 bg-face border border-rule">
              <div className="flex justify-between text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">
                <span>Azimuthal Phase Angle φ (Equatorial Rotation 0° to 360°):</span>
                <span className="text-warn font-bold">{phiDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={phiDeg}
                onChange={(e) => handlePhiChange(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projective Measurement Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Projective Basis Selector</h3>
            <IconReset size={14} className="text-ink-muted" />
          </div>

          <p className="text-xs text-ink-muted font-medium">
            Select a measurement basis to collapse the state vector according to Born’s Rule.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => setSelectedBasis('Z')}
              className={`py-2 px-3 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                selectedBasis === 'Z'
                  ? 'bg-quantum border-quantum text-white'
                  : 'bg-face border-rule text-ink hover:bg-well'
              }`}
            >
              Z-Basis
            </button>
            <button
              onClick={() => setSelectedBasis('X')}
              className={`py-2 px-3 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                selectedBasis === 'X'
                  ? 'bg-pass border-pass text-white'
                  : 'bg-face border-rule text-ink hover:bg-well'
              }`}
            >
              X-Basis
            </button>
            <button
              onClick={() => setSelectedBasis('Y')}
              className={`py-2 px-3 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                selectedBasis === 'Y'
                  ? 'bg-adversary border-adversary text-white'
                  : 'bg-face border-rule text-ink hover:bg-well'
              }`}
            >
              Y-Basis
            </button>
          </div>

          {/* Shot Count Preset */}
          <div className="space-y-1.5 pt-4 border-t border-rule">
            <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">Measurement Shots:</span>
            <div className="grid grid-cols-3 gap-2">
              {[100, 1000, 10000].map((s) => (
                <button
                  key={s}
                  onClick={() => setShots(s)}
                  className={`py-1.5 px-2 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                    shots === s
                      ? 'bg-quantum-tint border-quantum text-quantum'
                      : 'bg-face border-rule text-ink-muted hover:text-ink hover:bg-well'
                  }`}
                >
                  {s.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <HistogramChart result={measurementResult} />
        </div>
      </div>

      {/* Context & Education Accordion */}
      <HumanContextHelper
        title="Quantum State Principles"
        items={[
          {
            question: 'What is a Qubit Superposition?',
            answer:
              'Unlike a classical bit which is strictly 0 or 1, a qubit exists in a linear superposition |ψ⟩ = α|0⟩ + β|1⟩. Before measurement, both outcomes exist simultaneously with complex probability amplitudes.',
            type: 'info',
          },
          {
            question: 'How does the Born Rule govern measurements?',
            answer:
              'When measured, the superposition collapses probabilistically into one of the basis eigenstates. The probability of measuring outcome |0⟩ is P(0) = |α|², and for |1⟩ is P(1) = |β|², where |α|² + |β|² = 1.',
            type: 'tip',
          },
          {
            question: 'Why do we need different measurement bases (X, Y, Z)?',
            answer:
              'Measuring across non-commuting Mutually Unbiased Bases (MUBs) is foundational to quantum security. An eavesdropper cannot measure a qubit in one basis without disturbing conjugate superpositions in the others.',
            type: 'caution',
          },
        ]}
      />
    </div>
  );
}
