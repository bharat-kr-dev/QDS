'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { BlochSphere } from '../../components/ui/BlochSphere';
import { HistogramChart } from '../../components/ui/HistogramChart';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import { BasisType } from '../../lib/quantum/types';
import { Atom, Sliders, Play, RefreshCw, Info } from 'lucide-react';

export default function QuantumLabPage() {
  const {
    inputState,
    inputQubit,
    setInputFromAngles,
    setInputPreset,
    shotsCount,
    setShotsCount,
  } = useQuantum();

  const [selectedBasis, setSelectedBasis] = useState<BasisType>('Z');
  const bloch = inputState.getSingleQubitBloch();

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
  const measurementResult = inputState.measure(selectedBasis, shotsCount);

  // Human explanation of probabilities
  const p0Pct = (bloch.p0 * 100).toFixed(1);
  const p1Pct = (bloch.p1 * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-800 text-[11px] font-mono text-sky-400 mb-1.5">
            <Atom className="w-3.5 h-3.5" />
            Interactive Quantum State Workspace
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Quantum Lab: Qubit State Engineering
          </h1>
          <p className="text-xs text-slate-400">
            Construct arbitrary single-qubit superpositions, rotate on the 3D Bloch sphere, and sample multi-basis projective measurements.
          </p>
        </div>

        {/* Preset State Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setInputPreset('zero')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-200 transition-colors"
          >
            |0⟩
          </button>
          <button
            onClick={() => setInputPreset('one')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-200 transition-colors"
          >
            |1⟩
          </button>
          <button
            onClick={() => setInputPreset('plus')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-200 transition-colors"
          >
            |+⟩
          </button>
          <button
            onClick={() => setInputPreset('minus')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-200 transition-colors"
          >
            |-⟩
          </button>
          <button
            onClick={() => setInputPreset('plusI')}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-200 transition-colors"
          >
            |+i⟩
          </button>
          <button
            onClick={() => setInputPreset('custom70_30')}
            className="px-2.5 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 rounded-lg text-xs font-mono font-semibold text-sky-300 transition-colors"
          >
            70% |0⟩ : 30% |1⟩
          </button>
        </div>
      </div>

      {/* Main Grid: Bloch Sphere & State Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Bloch Sphere */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              3D Bloch Sphere Geometry
            </span>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
              Unit Radius |r|=1
            </span>
          </div>

          <BlochSphere bloch={bloch} size={290} label="|ψ⟩" />

          {/* Natural Language Interpretation */}
          <div className="mt-4 w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold font-mono">
              <Info className="w-3.5 h-3.5" />
              Human Explanation:
            </div>
            <p className="leading-relaxed">
              This qubit has a <strong className="text-emerald-400">{p0Pct}%</strong> probability of being measured as <span className="font-mono text-white">|0⟩</span> and a <strong className="text-sky-400">{p1Pct}%</strong> probability of being measured as <span className="font-mono text-white">|1⟩</span> in the computational Z-basis.
            </p>
          </div>
        </div>

        {/* Right: State Vector & Probability Sliders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dirac Ket State Representation */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Dirac Ket Notation</h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Normalized: |α|² + |β|² = 1.000
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-sm sm:text-base text-sky-300 overflow-x-auto">
              {inputQubit.ketString}
            </div>

            {/* Probability Bars */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Probability P(|0⟩) = |α|²</span>
                  <span className="text-white font-bold">{p0Pct}% ({bloch.p0})</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                    style={{ width: `${bloch.p0 * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Probability P(|1⟩) = |β|²</span>
                  <span className="text-white font-bold">{p1Pct}% ({bloch.p1})</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-200"
                    style={{ width: `${bloch.p1 * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Angle Sliders */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Spherical Polar Coordinates</span>
            </div>

            {/* Theta slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Polar Angle θ (0° = North pole |0⟩, 180° = South pole |1⟩):</span>
                <span className="text-sky-400 font-bold">{thetaDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="1"
                value={thetaDeg}
                onChange={(e) => handleThetaChange(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Phi slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Azimuthal Phase Angle φ (Equatorial Rotation 0° to 360°):</span>
                <span className="text-amber-400 font-bold">{phiDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={phiDeg}
                onChange={(e) => handlePhiChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projective Measurement Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Projective Basis Selector</h3>
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <p className="text-xs text-slate-400">
            Select a measurement basis to collapse the state vector according to Born’s Rule.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedBasis('Z')}
              className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                selectedBasis === 'Z'
                  ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Z-Basis (|0⟩, |1⟩)
            </button>
            <button
              onClick={() => setSelectedBasis('X')}
              className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                selectedBasis === 'X'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              X-Basis (|+⟩, |-⟩)
            </button>
            <button
              onClick={() => setSelectedBasis('Y')}
              className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-all ${
                selectedBasis === 'Y'
                  ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Y-Basis (|i⟩, |-i⟩)
            </button>
          </div>

          {/* Shot Count Preset */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-mono text-slate-400">Measurement Shots:</span>
            <div className="grid grid-cols-3 gap-2">
              {[100, 1000, 10000].map((shots) => (
                <button
                  key={shots}
                  onClick={() => setShotsCount(shots)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                    shotsCount === shots
                      ? 'bg-slate-800 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {shots.toLocaleString()}
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
