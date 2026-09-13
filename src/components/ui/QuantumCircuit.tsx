'use client';

import React from 'react';
import { TeleportationStepIndex } from '../../lib/quantum/types';

interface QuantumCircuitProps {
  currentStep: TeleportationStepIndex;
  classicalBits?: [number, number];
  pauliCorrection?: 'I' | 'X' | 'Z' | 'XZ';
}

export const QuantumCircuit: React.FC<QuantumCircuitProps> = ({
  currentStep,
  classicalBits = [0, 0],
  pauliCorrection = 'I',
}) => {
  const isStepActive = (stepMin: number, stepMax: number = 9) =>
    currentStep >= stepMin && currentStep <= stepMax;

  return (
    <div className="w-full overflow-x-auto bg-[#080d1a] border border-white/[0.08] rounded-2xl p-5 shadow-2xl relative">
      <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-400/50" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Quantum Teleportation Circuit Schematics
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-700/60 shadow-inner">
            ACTIVE STAGE {currentStep} / 9
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 900 310"
        className="w-full h-auto min-w-[760px] max-h-[310px] select-none text-slate-200"
      >
        <defs>
          <linearGradient id="aliceBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="bobBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="gateCyan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="gateRose" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
          <linearGradient id="gateEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#065f46" />
          </linearGradient>
          <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Partition Backgrounds */}
        {/* Alice's Domain */}
        <rect
          x="20"
          y="20"
          width="480"
          height="165"
          rx="12"
          fill="url(#aliceBg)"
          stroke="#0284c7"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <text
          x="35"
          y="42"
          fill="#38bdf8"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
        >
          ALICE (Sender Domain - Q0 & Q1)
        </text>

        {/* Bob's Domain */}
        <rect
          x="540"
          y="180"
          width="340"
          height="110"
          rx="12"
          fill="url(#bobBg)"
          stroke="#10b981"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <text
          x="555"
          y="202"
          fill="#34d399"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
        >
          BOB (Receiver Domain - Q2)
        </text>

        {/* Qubit Wire 0: Alice's Signature State |psi> */}
        <text x="35" y="86" fill="#fb7185" fontSize="13" fontFamily="monospace" fontWeight="bold">
          q₀: |ψ⟩
        </text>
        <line
          x1="100"
          y1="82"
          x2="460"
          y2="82"
          stroke={isStepActive(1) ? '#f43f5e' : '#334155'}
          strokeWidth="2.5"
        />

        {/* Qubit Wire 1: Alice's half of Bell Pair */}
        <text x="35" y="146" fill="#38bdf8" fontSize="13" fontFamily="monospace" fontWeight="bold">
          q₁: |0⟩
        </text>
        <line
          x1="100"
          y1="142"
          x2="460"
          y2="142"
          stroke={isStepActive(2) ? '#38bdf8' : '#334155'}
          strokeWidth="2.5"
        />

        {/* Qubit Wire 2: Bob's half of Bell Pair */}
        <text x="35" y="248" fill="#34d399" fontSize="13" fontFamily="monospace" fontWeight="bold">
          q₂: |0⟩
        </text>
        <line
          x1="100"
          y1="244"
          x2="860"
          y2="244"
          stroke={isStepActive(2) ? '#34d399' : '#334155'}
          strokeWidth="2.5"
        />

        {/* Bell State Generation: Hadamard on Q1 */}
        <g opacity={isStepActive(2) ? 1 : 0.45} className="cursor-pointer transition-opacity">
          <rect
            x="130"
            y="124"
            width="38"
            height="36"
            rx="6"
            fill="url(#gateCyan)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            filter={isStepActive(2) ? 'url(#circuitGlow)' : undefined}
          />
          <text
            x="149"
            y="147"
            fill="#ffffff"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            H
          </text>
        </g>

        {/* Bell State Generation: CNOT between Q1 (ctrl) and Q2 (target) */}
        <g opacity={isStepActive(2) ? 1 : 0.45}>
          <circle cx="195" cy="142" r="5" fill="#38bdf8" />
          <line x1="195" y1="142" x2="195" y2="244" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="195" cy="244" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <line x1="187" y1="244" x2="203" y2="244" stroke="#38bdf8" strokeWidth="2" />
          <line x1="195" y1="236" x2="195" y2="252" stroke="#38bdf8" strokeWidth="2" />
        </g>

        {/* Entanglement Indicator Bubble */}
        {isStepActive(2) && (
          <g transform="translate(140, 180)">
            <rect x="0" y="0" width="110" height="22" rx="11" fill="#581c87" stroke="#c084fc" strokeWidth="1.2" />
            <text x="55" y="15" fill="#f3e8ff" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              ⚡ |Φ⁺⟩ EPR Resource
            </text>
          </g>
        )}

        {/* Alice's Bell Measurement: CNOT(Q0 ctrl, Q1 target) */}
        <g opacity={isStepActive(4) ? 1 : 0.35}>
          <circle cx="270" cy="82" r="5" fill="#f43f5e" />
          <line x1="270" y1="82" x2="270" y2="142" stroke="#f43f5e" strokeWidth="2.5" />
          <circle cx="270" cy="142" r="14" fill="#0f172a" stroke="#f43f5e" strokeWidth="2" />
          <line x1="262" y1="142" x2="278" y2="142" stroke="#f43f5e" strokeWidth="2" />
          <line x1="270" y1="134" x2="270" y2="150" stroke="#f43f5e" strokeWidth="2" />
        </g>

        {/* Alice's Bell Measurement: Hadamard on Q0 */}
        <g opacity={isStepActive(4) ? 1 : 0.35}>
          <rect
            x="320"
            y="64"
            width="38"
            height="36"
            rx="6"
            fill="url(#gateRose)"
            stroke="#f43f5e"
            strokeWidth="1.5"
            filter={isStepActive(4) ? 'url(#circuitGlow)' : undefined}
          />
          <text
            x="339"
            y="87"
            fill="#ffffff"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            H
          </text>
        </g>

        {/* Alice Measurement Meters (Q0 & Q1) */}
        <g opacity={isStepActive(5) ? 1 : 0.35}>
          {/* Meter Q0 */}
          <rect
            x="390"
            y="62"
            width="44"
            height="40"
            rx="6"
            fill="#090d16"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            filter={isStepActive(5) ? 'url(#circuitGlow)' : undefined}
          />
          <path
            d="M 398 92 A 15 15 0 0 1 426 92"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line x1="412" y1="92" x2="424" y2="74" stroke="#f59e0b" strokeWidth="2" />
          <text x="412" y="98" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            M₀={classicalBits[0]}
          </text>

          {/* Meter Q1 */}
          <rect
            x="390"
            y="122"
            width="44"
            height="40"
            rx="6"
            fill="#090d16"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            filter={isStepActive(5) ? 'url(#circuitGlow)' : undefined}
          />
          <path
            d="M 398 152 A 15 15 0 0 1 426 152"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line x1="412" y1="152" x2="424" y2="134" stroke="#f59e0b" strokeWidth="2" />
          <text x="412" y="158" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            M₁={classicalBits[1]}
          </text>
        </g>

        {/* Double Classical Line transmitting from Alice to Bob */}
        <g opacity={isStepActive(6) ? 1 : 0.3}>
          {/* Classical Double Wire from Meter 0 */}
          <line x1="434" y1="80" x2="630" y2="80" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="434" y1="84" x2="630" y2="84" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="630" y1="82" x2="630" y2="218" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Classical Double Wire from Meter 1 */}
          <line x1="434" y1="140" x2="690" y2="140" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="434" y1="144" x2="690" y2="144" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="690" y1="142" x2="690" y2="218" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Classical Packet Bubble */}
          {isStepActive(6, 7) && (
            <g transform="translate(535, 95)">
              <rect x="0" y="0" width="76" height="26" rx="13" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" filter="url(#circuitGlow)" />
              <text x="38" y="17" fill="#fef3c7" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                Bits: {classicalBits[0]}{classicalBits[1]}
              </text>
            </g>
          )}
        </g>

        {/* Bob's Pauli Correction Gates (X gate controlled by M1, Z gate controlled by M0) */}
        <g opacity={isStepActive(7) ? 1 : 0.35}>
          {/* Pauli X gate (controlled by bit 1) */}
          <rect
            x="615"
            y="226"
            width="36"
            height="36"
            rx="6"
            fill={pauliCorrection === 'X' || pauliCorrection === 'XZ' ? 'url(#gateEmerald)' : '#1e293b'}
            stroke="#10b981"
            strokeWidth="1.5"
            filter={pauliCorrection === 'X' || pauliCorrection === 'XZ' ? 'url(#circuitGlow)' : undefined}
          />
          <text
            x="633"
            y="249"
            fill="#ffffff"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            X
          </text>

          {/* Pauli Z gate (controlled by bit 0) */}
          <rect
            x="675"
            y="226"
            width="36"
            height="36"
            rx="6"
            fill={pauliCorrection === 'Z' || pauliCorrection === 'XZ' ? 'url(#gateEmerald)' : '#1e293b'}
            stroke="#10b981"
            strokeWidth="1.5"
            filter={pauliCorrection === 'Z' || pauliCorrection === 'XZ' ? 'url(#circuitGlow)' : undefined}
          />
          <text
            x="693"
            y="249"
            fill="#ffffff"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            Z
          </text>

          <text
            x="660"
            y="280"
            fill="#34d399"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            Applied: {pauliCorrection}
          </text>
        </g>

        {/* Output State on Bob's end */}
        {isStepActive(8) && (
          <g transform="translate(755, 224)">
            <rect x="0" y="0" width="95" height="40" rx="8" fill="#047857" stroke="#34d399" strokeWidth="1.5" filter="url(#circuitGlow)" />
            <text x="47" y="25" fill="#ffffff" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              |ψ_out⟩ = |ψ⟩
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
