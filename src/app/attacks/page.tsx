'use client';

import React from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { BlochSphere } from '../../components/ui/BlochSphere';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import { AttackType, BasisType } from '../../lib/quantum/types';
import {
  IconThreat,
  IconReset,
  IconSettings,
  IconVerify,
  IconInfo,
} from '../../components/icons/Icons';

export default function AttackSimulatorPage() {
  const {
    inputState,
    receivedState,
    attack,
    setAttack,
    resetAttack,
    verification,
  } = useQuantum();

  const originalBloch = inputState.getBloch();
  const disturbedBloch = receivedState.getBloch();

  const attackScenarios: { type: AttackType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: 'none',
      label: '1. Clean Channel (No Attack)',
      desc: 'Standard uncompromised quantum teleportation channel.',
      icon: <IconVerify size={24} className="text-pass" />,
    },
    {
      type: 'intercept_resend',
      label: '2. Intercept-Resend',
      desc: 'Adversary intercepts, measures in basis, and re-prepares state.',
      icon: <IconThreat size={24} className="text-adversary" />,
    },
    {
      type: 'forgery',
      label: '3. Quantum Forgery',
      desc: 'Counterfeit signature generated without authentic basis choices.',
      icon: <IconThreat size={24} className="text-adversary" />,
    },
    {
      type: 'replay',
      label: '4. Replay Attack',
      desc: 'Adversary re-injects stale valid signature packets with expired nonce.',
      icon: <IconThreat size={24} className="text-adversary" />,
    },
    {
      type: 'phase_shift',
      label: '5. Phase Drift / Rz(θ)',
      desc: 'Continuous channel optical phase rotation along Z-axis.',
      icon: <IconThreat size={24} className="text-warn" />,
    },
    {
      type: 'noise',
      label: '6. Thermal / Depolarizing Noise',
      desc: 'Ambient channel decoherence and stochastic thermal fluctuation.',
      icon: <IconThreat size={24} className="text-warn" />,
    },
  ];

  const handleSelectAttack = (type: AttackType) => {
    if (type === 'none') {
      resetAttack();
    } else {
      setAttack({
        type,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-adversary bg-adversary-tint text-[10px] font-mono font-bold text-adversary uppercase tracking-wider mb-2">
            <IconThreat size={12} />
            Adversary Threat & Attack Simulation Lab
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            Red Team Quantum Attack Simulator
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Inject real-time quantum attacks and observe state collapse, wavefunction disturbance, and QBER spikes.
          </p>
        </div>

        <button
          onClick={resetAttack}
          className="flex items-center gap-2 px-3.5 py-2 bg-face hover:bg-well border border-rule text-ink uppercase tracking-wider font-bold text-xs cursor-pointer transition-colors"
        >
          <IconReset size={14} />
          <span>Reset to Clean Channel</span>
        </button>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {attackScenarios.map((scen) => {
          const isSelected = attack.type === scen.type;

          return (
            <button
              key={scen.type}
              onClick={() => handleSelectAttack(scen.type)}
              className={`p-4 border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-adversary-tint border-adversary ring-1 ring-adversary/50'
                  : 'bg-face border-rule hover:bg-well hover:border-ink-faint'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center justify-center">{scen.icon}</span>
                {isSelected && (
                  <span className="text-[10px] font-mono text-adversary bg-adversary-tint px-2 py-0.5 border border-adversary font-bold uppercase tracking-wider">
                    Active Scenario
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-ink mb-1">{scen.label}</div>
              <div className="text-xs text-ink-muted leading-relaxed font-medium">{scen.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Active Attack Parameters Configuration */}
      {attack.type !== 'none' && (
        <div className="panel p-6 space-y-4 bg-bench border-t-4 border-t-adversary">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-adversary uppercase tracking-wider">
              <IconSettings size={16} />
              <span>Configure Attack Parameters ({attack.type})</span>
            </div>
          </div>

          {/* Intercept-Resend Basis Control */}
          {attack.type === 'intercept_resend' && (
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider">
                Attacker (Eve) Measurement Basis:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(['RANDOM', 'Z', 'X', 'Y'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() =>
                      setAttack({
                        interceptBasis: b as BasisType | 'RANDOM',
                      })
                    }
                    className={`py-2 px-3 text-xs font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                      attack.interceptBasis === b
                        ? 'bg-adversary border-adversary text-white'
                        : 'bg-face border-rule text-ink hover:bg-well'
                    }`}
                  >
                    {b === 'RANDOM' ? '? Random' : `${b}-Basis`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Forgery Strategy Control */}
          {attack.type === 'forgery' && (
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider">Forgery Strategy:</span>
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
                    onClick={() => setAttack({ forgeryStrategy: strat.id as any })}
                    className={`py-2 px-3 text-xs font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                      attack.forgeryStrategy === strat.id
                        ? 'bg-adversary border-adversary text-white'
                        : 'bg-face border-rule text-ink hover:bg-well'
                    }`}
                  >
                    {strat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Replay Parameters */}
          {attack.type === 'replay' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3 bg-face border border-rule">
                <div className="flex justify-between text-xs font-mono font-bold text-ink-muted uppercase tracking-wider">
                  <span>Replay Delay:</span>
                  <span className="text-adversary font-bold">{attack.replayDelaySeconds} seconds</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={attack.replayDelaySeconds || 45}
                  onChange={(e) =>
                    setAttack({ replayDelaySeconds: Number(e.target.value) })
                  }
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-face border border-rule p-3">
                <span className="text-xs font-mono font-bold text-ink-muted uppercase tracking-wider">Simulate Stale Nonce Flag:</span>
                <button
                  onClick={() => setAttack({ nonceValid: !attack.nonceValid })}
                  className={`px-3 py-1.5 text-xs font-mono font-bold border transition-colors uppercase tracking-wider cursor-pointer ${
                    !attack.nonceValid
                      ? 'bg-adversary-tint text-adversary border-adversary'
                      : 'bg-pass-tint text-pass border-pass'
                  }`}
                >
                  {attack.nonceValid ? 'Fresh Nonce' : 'Expired Nonce (Flagged)'}
                </button>
              </div>
            </div>
          )}

          {/* Phase Shift Slider */}
          {attack.type === 'phase_shift' && (
            <div className="space-y-1.5 p-3 bg-face border border-rule">
              <div className="flex justify-between text-xs font-mono font-bold text-ink-muted uppercase tracking-wider">
                <span>Phase Shift Angle θ (Unitary Rz):</span>
                <span className="text-warn font-bold">{attack.phaseAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={attack.phaseAngleDeg || 45}
                onChange={(e) =>
                  setAttack({ phaseAngleDeg: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>
          )}

          {/* Generic Noise Slider */}
          {attack.type === 'noise' && (
            <div className="space-y-1.5 p-3 bg-face border border-rule">
              <div className="flex justify-between text-xs font-mono font-bold text-ink-muted uppercase tracking-wider">
                <span>Channel Noise Level:</span>
                <span className="text-warn font-bold">
                  {((attack.noiseLevel || 0.15) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.02"
                value={attack.noiseLevel || 0.15}
                onChange={(e) =>
                  setAttack({ noiseLevel: Number(e.target.value) })
                }
                className="w-full cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Before vs After Wavefunction Disturbance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Original State */}
        <div className="lg:col-span-6 panel p-6 space-y-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-quantum uppercase tracking-wider">
              Before Attack: |ψ_in⟩
            </span>
            <span className="text-[10px] font-mono text-ink-faint">Authentic Qubit</span>
          </div>

          <BlochSphere bloch={originalBloch} size={250} label="|ψ_orig⟩" interactive={false} />

          <div className="w-full bg-well border border-rule p-3 font-mono text-xs font-bold text-quantum overflow-x-auto text-center">
            {inputState.toKet(3)}
          </div>
        </div>

        {/* Perturbed State */}
        <div className="lg:col-span-6 panel p-6 space-y-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-adversary uppercase tracking-wider">
              After Attack: |ψ_disturbed⟩
            </span>
            <span className="text-[10px] font-mono font-bold text-adversary">
              {attack.type !== 'none' ? 'Disturbed Wavefunction' : 'Undisturbed'}
            </span>
          </div>

          <BlochSphere bloch={disturbedBloch} size={250} label="|ψ_dist⟩" interactive={false} />

          <div className="w-full bg-well border border-rule p-3 font-mono text-xs font-bold text-adversary overflow-x-auto text-center">
            {receivedState.toKet(3)}
          </div>
        </div>
      </div>

      {/* Impact Telemetry Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="panel p-4 space-y-1">
          <div className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">Induced QBER</div>
          <div
            className={`text-2xl font-bold font-mono tnum ${
              verification.qber > 5.0 ? 'text-adversary' : 'text-pass'
            }`}
          >
            {verification.qber}%
          </div>
          <div className="text-[10px] font-medium text-ink-faint">Errors per 100 compared bits</div>
        </div>

        <div className="panel p-4 space-y-1">
          <div className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">State Overlap Fidelity</div>
          <div className="text-2xl font-bold font-mono tnum text-ink">
            {(verification.fidelity * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] font-medium text-ink-faint">Target: ≥ 95.0% for acceptance</div>
        </div>

        <div className="panel p-4 space-y-1">
          <div className="text-[11px] font-mono font-bold text-ink-muted uppercase tracking-wider">Tampering Status</div>
          <div
            className={`text-base font-bold font-mono uppercase ${
              verification.verdict === 'VALID' ? 'text-pass' : 'text-adversary'
            }`}
          >
            {verification.verdict}
          </div>
          <div className="text-[10px] font-medium text-ink-faint">Cryptographic non-repudiation</div>
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
