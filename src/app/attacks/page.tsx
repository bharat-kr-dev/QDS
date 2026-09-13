'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { BlochSphere } from '../../components/ui/BlochSphere';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import { AttackType, BasisType } from '../../lib/quantum/types';
import {
  Skull,
  ShieldAlert,
  Flame,
  Radio,
  Sliders,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function AttackSimulatorPage() {
  const {
    inputState,
    receivedState,
    attackConfig,
    setAttackConfig,
    resetAttack,
    verificationResult,
  } = useQuantum();

  const originalBloch = inputState.getSingleQubitBloch();
  const disturbedBloch = receivedState.getSingleQubitBloch();

  const attackScenarios: { type: AttackType; label: string; desc: string; icon: string }[] = [
    {
      type: 'none',
      label: '1. Clean Channel (No Attack)',
      desc: 'Standard uncompromised quantum teleportation channel.',
      icon: '🛡️',
    },
    {
      type: 'intercept_resend',
      label: '2. Intercept-Resend',
      desc: 'Adversary intercepts, measures in basis, and re-prepares state.',
      icon: '👁️',
    },
    {
      type: 'forgery',
      label: '3. Quantum Forgery',
      desc: 'Counterfeit signature generated without authentic basis choices.',
      icon: '🎭',
    },
    {
      type: 'replay',
      label: '4. Replay Attack',
      desc: 'Adversary re-injects stale valid signature packets with expired nonce.',
      icon: '🔁',
    },
    {
      type: 'phase_shift',
      label: '5. Phase Drift / Rz(θ)',
      desc: 'Continuous channel optical phase rotation along Z-axis.',
      icon: '🌀',
    },
    {
      type: 'noise',
      label: '6. Thermal / Depolarizing Noise',
      desc: 'Ambient channel decoherence and stochastic thermal fluctuation.',
      icon: '📶',
    },
  ];

  const handleSelectAttack = (type: AttackType) => {
    if (type === 'none') {
      resetAttack();
    } else {
      setAttackConfig({
        type,
        enabled: true,
        name: attackScenarios.find((s) => s.type === type)?.label || type,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-[11px] font-mono text-rose-400 mb-1.5">
            <Flame className="w-3.5 h-3.5" />
            Adversary Threat & Attack Simulation Lab
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Red Team Quantum Attack Simulator
          </h1>
          <p className="text-xs text-slate-400">
            Inject real-time quantum attacks and observe state collapse, wavefunction disturbance, and QBER spikes.
          </p>
        </div>

        <button
          onClick={resetAttack}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Clean Channel</span>
        </button>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {attackScenarios.map((scen) => {
          const isSelected =
            (attackConfig.type === scen.type && attackConfig.enabled) ||
            (!attackConfig.enabled && scen.type === 'none');

          return (
            <button
              key={scen.type}
              onClick={() => handleSelectAttack(scen.type)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/40 shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{scen.icon}</span>
                {isSelected && (
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800 font-bold">
                    Active Scenario
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-white mb-1">{scen.label}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{scen.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Active Attack Parameters Configuration */}
      {attackConfig.enabled && attackConfig.type !== 'none' && (
        <div className="bg-slate-950 border border-rose-900/60 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
              <Sliders className="w-4 h-4" />
              <span>Configure Attack Parameters ({attackConfig.name})</span>
            </div>
          </div>

          {/* Intercept-Resend Basis Control */}
          {attackConfig.type === 'intercept_resend' && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-slate-300">
                Attacker (Eve) Measurement Basis:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(['RANDOM', 'Z', 'X', 'Y'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() =>
                      setAttackConfig({
                        interceptBasis: b as BasisType | 'RANDOM',
                      })
                    }
                    className={`py-2 px-3 rounded-lg text-xs font-mono border transition-all ${
                      attackConfig.interceptBasis === b
                        ? 'bg-rose-600 border-rose-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {b === 'RANDOM' ? '🎲 Random Basis' : `${b}-Basis`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Forgery Strategy Control */}
          {attackConfig.type === 'forgery' && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-slate-300">Forgery Strategy:</span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'random_state', label: 'Random Superposition' },
                    { id: 'orthogonal_guess', label: 'Orthogonal Flip (X|ψ⟩)' },
                    { id: 'partial_basis_knowledge', label: 'Hadamard Guess (H|ψ⟩)' },
                  ] as const
                ).map((strat) => (
                  <button
                    key={strat.id}
                    onClick={() => setAttackConfig({ forgeryStrategy: strat.id })}
                    className={`py-2 px-3 rounded-lg text-xs font-mono border transition-all ${
                      attackConfig.forgeryStrategy === strat.id
                        ? 'bg-rose-600 border-rose-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {strat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Replay Parameters */}
          {attackConfig.type === 'replay' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Replay Delay:</span>
                  <span className="text-rose-400 font-bold">{attackConfig.replayDelaySeconds} seconds</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={attackConfig.replayDelaySeconds || 45}
                  onChange={(e) =>
                    setAttackConfig({ replayDelaySeconds: Number(e.target.value) })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs font-mono text-slate-300">Simulate Stale Nonce Flag:</span>
                <button
                  onClick={() => setAttackConfig({ nonceValid: !attackConfig.nonceValid })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    !attackConfig.nonceValid
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {attackConfig.nonceValid ? 'Fresh Nonce' : 'Expired Nonce (Flagged)'}
                </button>
              </div>
            </div>
          )}

          {/* Phase Shift Slider */}
          {attackConfig.type === 'phase_shift' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Phase Shift Angle θ (Unitary Rz):</span>
                <span className="text-rose-400 font-bold">{attackConfig.phaseAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={attackConfig.phaseAngleDeg || 45}
                onChange={(e) =>
                  setAttackConfig({ phaseAngleDeg: Number(e.target.value) })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          )}

          {/* Generic Noise Slider */}
          {attackConfig.type === 'noise' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Channel Noise Level:</span>
                <span className="text-rose-400 font-bold">
                  {((attackConfig.noiseLevel || 0.15) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.02"
                value={attackConfig.noiseLevel || 0.15}
                onChange={(e) =>
                  setAttackConfig({ noiseLevel: Number(e.target.value) })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Before vs After Wavefunction Disturbance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Original State */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono text-sky-400 uppercase tracking-wider">
              Before Attack: |ψ_in⟩
            </span>
            <span className="text-[10px] font-mono text-slate-400">Authentic Qubit</span>
          </div>

          <BlochSphere bloch={originalBloch} size={250} label="|ψ_orig⟩" interactive={false} />

          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-sky-300 overflow-x-auto text-center">
            {inputState.getKetString()}
          </div>
        </div>

        {/* Perturbed State */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono text-rose-400 uppercase tracking-wider">
              After Attack: |ψ_disturbed⟩
            </span>
            <span className="text-[10px] font-mono text-rose-400 font-bold">
              {attackConfig.enabled ? 'Disturbed Wavefunction' : 'Undisturbed'}
            </span>
          </div>

          <BlochSphere bloch={disturbedBloch} size={250} label="|ψ_dist⟩" interactive={false} />

          <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-rose-300 overflow-x-auto text-center">
            {receivedState.getKetString()}
          </div>
        </div>
      </div>

      {/* Impact Telemetry Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Induced QBER</div>
          <div
            className={`text-2xl font-bold font-mono ${
              verificationResult.qber > 5.0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {verificationResult.qber}%
          </div>
          <div className="text-[10px] text-slate-400">Errors per 100 compared bits</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">State Overlap Fidelity</div>
          <div className="text-2xl font-bold font-mono text-slate-200">
            {(verificationResult.fidelity * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">Target: ≥ 95.0% for acceptance</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Tampering Status</div>
          <div
            className={`text-base font-bold font-mono ${
              verificationResult.verdict === 'VALID' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {verificationResult.verdict}
          </div>
          <div className="text-[10px] text-slate-400">Cryptographic non-repudiation</div>
        </div>
      </div>

      {/* Context Questions */}
      <HumanContextHelper
        title="Threat Simulation Deep Dive"
        items={[
          {
            question: 'Why does Intercept-Resend cause an inevitable ~25% error rate?',
            answer:
              'When Eve measures a qubit in an incompatible basis (e.g. measuring an X-basis state |+⟩ in the Z-basis), the state randomly collapses to |0⟩ or |1⟩ with 50% probability. When Bob measures in Alice’s original basis, he has a 50% chance of an error on those misaligned bits, giving an overall 25% QBER.',
            type: 'info',
          },
          {
            question: 'How is a Replay Attack detected in QDS?',
            answer:
              'Replay attacks are detected through protocol freshness tokens, high-precision timestamps, and unique session nonces. Even if Eve stores and replays identical quantum/classical payloads, the protocol rejects expired freshness identifiers.',
            type: 'tip',
          },
        ]}
      />
    </div>
  );
}
