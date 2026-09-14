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
    <div className="w-full overflow-x-auto panel p-5">
      <div className="flex items-center justify-between mb-3 border-b border-rule pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-quantum animate-pulse" />
          <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
            Quantum Teleportation Circuit Schematics
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-quantum bg-quantum-tint px-2.5 py-1 border border-quantum/20">
            ACTIVE STAGE {currentStep} / 9
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 900 310"
        className="w-full h-auto min-w-[760px] max-h-[310px] select-none text-ink"
      >
        <defs>
          <linearGradient id="aliceBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a3fbf" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#1a3fbf" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="bobBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f7a4e" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0f7a4e" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="gateCyan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a3fbf" />
            <stop offset="100%" stopColor="#153399" />
          </linearGradient>
          <linearGradient id="gateRose" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c62d1f" />
            <stop offset="100%" stopColor="#9e2418" />
          </linearGradient>
          <linearGradient id="gateEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f7a4e" />
            <stop offset="100%" stopColor="#0c623e" />
          </linearGradient>
        </defs>

        {/* Partition Backgrounds */}
        {/* Alice's Domain */}
        <rect
          x="20"
          y="20"
          width="480"
          height="165"
          rx="4"
          fill="url(#aliceBg)"
          stroke="#1a3fbf"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <text
          x="35"
          y="42"
          fill="#1a3fbf"
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
          rx="4"
          fill="url(#bobBg)"
          stroke="#0f7a4e"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <text
          x="555"
          y="202"
          fill="#0f7a4e"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
        >
          BOB (Receiver Domain - Q2)
        </text>

        {/* Qubit Wire 0: Alice's Signature State |psi> */}
        <text x="35" y="86" fill="#c62d1f" fontSize="13" fontFamily="monospace" fontWeight="bold">
          q₀: |ψ⟩
        </text>
        <line
          x1="100"
          y1="82"
          x2="460"
          y2="82"
          stroke={isStepActive(1) ? '#c62d1f' : '#b4b9c1'}
          strokeWidth="2.5"
        />

        {/* Qubit Wire 1: Alice's half of Bell Pair */}
        <text x="35" y="146" fill="#1a3fbf" fontSize="13" fontFamily="monospace" fontWeight="bold">
          q₁: |0⟩
        </text>
        <line
          x1="100"
          y1="142"
          x2="460"
          y2="142"
          stroke={isStepActive(2) ? '#1a3fbf' : '#b4b9c1'}
          strokeWidth="2.5"
        />

        {/* Qubit Wire 2: Bob's half of Bell Pair */}
        <text x="35" y="248" fill="#0f7a4e" fontSize="13" fontFamily="monospace" fontWeight="bold">
          q₂: |0⟩
        </text>
        <line
          x1="100"
          y1="244"
          x2="860"
          y2="244"
          stroke={isStepActive(2) ? '#0f7a4e' : '#b4b9c1'}
          strokeWidth="2.5"
        />

        {/* Bell State Generation: Hadamard on Q1 */}
        <g opacity={isStepActive(2) ? 1 : 0.45} className="cursor-pointer transition-opacity">
          <rect
            x="130"
            y="124"
            width="38"
            height="36"
            rx="2"
            fill="url(#gateCyan)"
            stroke="#1a3fbf"
            strokeWidth="1.5"
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
          <circle cx="195" cy="142" r="5" fill="#1a3fbf" />
          <line x1="195" y1="142" x2="195" y2="244" stroke="#1a3fbf" strokeWidth="2.5" />
          <circle cx="195" cy="244" r="14" fill="#ffffff" stroke="#1a3fbf" strokeWidth="2" />
          <line x1="187" y1="244" x2="203" y2="244" stroke="#1a3fbf" strokeWidth="2" />
          <line x1="195" y1="236" x2="195" y2="252" stroke="#1a3fbf" strokeWidth="2" />
        </g>

        {/* Entanglement Indicator Bubble */}
        {isStepActive(2) && (
          <g transform="translate(140, 180)">
            <rect x="0" y="0" width="110" height="22" rx="2" fill="#e8dcf8" stroke="#7123c8" strokeWidth="1.2" />
            <text x="55" y="15" fill="#7123c8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              + |Φ⁺⟩ EPR Resource
            </text>
          </g>
        )}

        {/* Alice's Bell Measurement: CNOT(Q0 ctrl, Q1 target) */}
        <g opacity={isStepActive(4) ? 1 : 0.35}>
          <circle cx="270" cy="82" r="5" fill="#c62d1f" />
          <line x1="270" y1="82" x2="270" y2="142" stroke="#c62d1f" strokeWidth="2.5" />
          <circle cx="270" cy="142" r="14" fill="#ffffff" stroke="#c62d1f" strokeWidth="2" />
          <line x1="262" y1="142" x2="278" y2="142" stroke="#c62d1f" strokeWidth="2" />
          <line x1="270" y1="134" x2="270" y2="150" stroke="#c62d1f" strokeWidth="2" />
        </g>

        {/* Alice's Bell Measurement: Hadamard on Q0 */}
        <g opacity={isStepActive(4) ? 1 : 0.35}>
          <rect
            x="320"
            y="64"
            width="38"
            height="36"
            rx="2"
            fill="url(#gateRose)"
            stroke="#c62d1f"
            strokeWidth="1.5"
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
            rx="2"
            fill="#ffffff"
            stroke="#8a9099"
            strokeWidth="1.5"
          />
          <path
            d="M 398 92 A 15 15 0 0 1 426 92"
            fill="none"
            stroke="#b4b9c1"
            strokeWidth="1.2"
          />
          <line x1="412" y1="92" x2="424" y2="74" stroke="#8f5e0a" strokeWidth="2" />
          <text x="412" y="98" fill="#8f5e0a" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            M₀={classicalBits[0]}
          </text>

          {/* Meter Q1 */}
          <rect
            x="390"
            y="122"
            width="44"
            height="40"
            rx="2"
            fill="#ffffff"
            stroke="#8a9099"
            strokeWidth="1.5"
          />
          <path
            d="M 398 152 A 15 15 0 0 1 426 152"
            fill="none"
            stroke="#b4b9c1"
            strokeWidth="1.2"
          />
          <line x1="412" y1="152" x2="424" y2="134" stroke="#8f5e0a" strokeWidth="2" />
          <text x="412" y="158" fill="#8f5e0a" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            M₁={classicalBits[1]}
          </text>
        </g>

        {/* Double Classical Line transmitting from Alice to Bob */}
        <g opacity={isStepActive(6) ? 1 : 0.3}>
          {/* Classical Double Wire from Meter 0 */}
          <line x1="434" y1="80" x2="630" y2="80" stroke="#8f5e0a" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="434" y1="84" x2="630" y2="84" stroke="#8f5e0a" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="630" y1="82" x2="630" y2="218" stroke="#8f5e0a" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Classical Double Wire from Meter 1 */}
          <line x1="434" y1="140" x2="690" y2="140" stroke="#8f5e0a" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="434" y1="144" x2="690" y2="144" stroke="#8f5e0a" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="690" y1="142" x2="690" y2="218" stroke="#8f5e0a" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Classical Packet Bubble */}
          {isStepActive(6, 7) && (
            <g transform="translate(535, 95)">
              <rect x="0" y="0" width="76" height="26" rx="2" fill="#faeace" stroke="#8f5e0a" strokeWidth="1.5" />
              <text x="38" y="17" fill="#8f5e0a" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
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
            rx="2"
            fill={pauliCorrection === 'X' || pauliCorrection === 'XZ' ? 'url(#gateEmerald)' : '#e4e6ea'}
            stroke={pauliCorrection === 'X' || pauliCorrection === 'XZ' ? '#0f7a4e' : '#b4b9c1'}
            strokeWidth="1.5"
          />
          <text
            x="633"
            y="249"
            fill={pauliCorrection === 'X' || pauliCorrection === 'XZ' ? '#ffffff' : '#8a9099'}
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
            rx="2"
            fill={pauliCorrection === 'Z' || pauliCorrection === 'XZ' ? 'url(#gateEmerald)' : '#e4e6ea'}
            stroke={pauliCorrection === 'Z' || pauliCorrection === 'XZ' ? '#0f7a4e' : '#b4b9c1'}
            strokeWidth="1.5"
          />
          <text
            x="693"
            y="249"
            fill={pauliCorrection === 'Z' || pauliCorrection === 'XZ' ? '#ffffff' : '#8a9099'}
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
            fill="#0f7a4e"
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
            <rect x="0" y="0" width="95" height="40" rx="2" fill="#0f7a4e" stroke="#0f7a4e" strokeWidth="1.5" />
            <text x="47" y="25" fill="#ffffff" fontSize="13" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              |ψ_out⟩ = |ψ⟩
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
