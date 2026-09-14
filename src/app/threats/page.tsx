'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { analyseDecoyStates } from '../../lib/quantum/attacks';
import { QberGauge } from '../../components/ui/QberGauge';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  IconThreat,
  IconSettings,
  IconVerify,
  IconIntrusion,
  IconInfo,
} from '../../components/icons/Icons';

export default function ThreatDetectionPage() {
  const {
    inputState,
    receivedState,
    verification,
    threshold,
    setThreshold,
    attack,
  } = useQuantum();

  const [decoyEnabled, setDecoyEnabled] = useState<boolean>(true);
  const [signalMu, setSignalMu] = useState<number>(0.5);
  const [decoyNu, setDecoyNu] = useState<number>(0.1);

  // Decoy State calculations
  const isEavesdropperActive = attack.type !== 'none' && attack.type !== 'noise';
  const decoyData = analyseDecoyStates(signalMu, decoyNu, 0.15, isEavesdropperActive);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-adversary bg-adversary-tint text-[10px] font-mono font-bold text-adversary uppercase tracking-wider mb-2">
            <IconThreat size={12} />
            Security Analysis & Anomaly Detection
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            Threat Detection & Statistical MUB Analyzer
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            Monitor Quantum Bit Error Rates, inspect Mutually Unbiased Bases deviations, and evaluate Decoy-State pulse statistics.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-face border border-rule px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider">
          <span
            className={`h-2.5 w-2.5 ${
              verification.qber > threshold ? 'bg-adversary animate-ping' : 'bg-pass'
            }`}
          />
          <span className="text-ink">
            {verification.qber > threshold
              ? 'ANOMALOUS ERROR DETECTED'
              : 'CHANNEL SECURITY NOMINAL'}
          </span>
        </div>
      </div>

      {/* Top Grid: QBER Gauge & Threshold Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <QberGauge
            qber={verification.qber}
            threshold={threshold}
            label="Quantum Bit Error Rate (QBER)"
          />
        </div>

        {/* Configurable Threshold Card */}
        <div className="lg:col-span-7 panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider">
              <IconSettings size={16} className="text-warn" />
              <span>Statistical Security Threshold Tuning</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-warn bg-warn-tint border border-warn px-2 py-0.5 uppercase tracking-wider">
              Threshold = {threshold.toFixed(1)}%
            </span>
          </div>

          <p className="text-xs text-ink-muted font-medium leading-relaxed">
            Adjust the permissible QBER threshold. In standard BB84 / QDS teleportation protocols, error rates above 5.0% - 11.0% indicate substantial channel disturbance or non-orthogonal basis eavesdropping.
          </p>

          <input
            type="range"
            min="1.0"
            max="20.0"
            step="0.5"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full cursor-pointer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            {[3.0, 5.0, 11.0].map((preset) => (
              <button
                key={preset}
                onClick={() => setThreshold(preset)}
                className={`py-2 px-2 text-[10px] font-mono font-bold border transition-colors cursor-pointer uppercase tracking-wider ${
                  threshold === preset
                    ? 'bg-warn-tint border-warn text-warn'
                    : 'bg-face border-rule text-ink hover:bg-well'
                }`}
              >
                {preset === 3 ? 'Ultra-Strict (3%)' : preset === 5 ? 'Standard QDS (5%)' : 'Shor-Preskill Bound (11%)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mutually Unbiased Bases (MUB) Analysis Section */}
      <div className="panel p-6 space-y-4 bg-bench">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <IconInfo size={16} className="text-pass" />
              Mechanism A: Mutually Unbiased Bases (MUB) Eigenstate Analyzer
            </h3>
            <p className="text-xs text-ink-muted font-medium mt-1">
              Comparing expected theoretical distributions vs observed measurement probabilities across non-commuting Z, X, and Y bases.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {(['Z', 'X', 'Y'] as const).map((basis) => {
            const check = verification.mub[basis];
            const isDisturbed = check.disturbed;

            return (
              <div
                key={basis}
                className={`bg-face border p-4 space-y-3 ${
                  isDisturbed ? 'border-adversary' : 'border-rule'
                }`}
              >
                <div className="flex items-center justify-between border-b border-rule pb-2">
                  <span className="text-[11px] font-mono font-bold text-ink uppercase tracking-wider">
                    {basis}-Basis Projection
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
                      isDisturbed
                        ? 'bg-adversary-tint text-adversary border-adversary'
                        : 'bg-pass-tint text-pass border-pass'
                    }`}
                  >
                    {isDisturbed ? 'Disturbance Detected' : 'Consistent'}
                  </span>
                </div>

                <div className="space-y-2 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <div className="flex justify-between text-ink-muted">
                    <span>Expected P(0):</span>
                    <span className="text-ink">
                      {(check.expected.zero * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Observed P(0):</span>
                    <span className="text-quantum">
                      {(check.observed.zero * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-muted border-t border-rule pt-2 mt-1">
                    <span>Statistical Deviation:</span>
                    <span
                      className={`${
                        isDisturbed ? 'text-adversary' : 'text-pass'
                      }`}
                    >
                      {(check.deviation * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decoy State Security Section */}
      <div className="panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rule pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <IconInfo size={16} className="text-warn" />
              Mechanism B: Decoy-State Multi-Photon Splitting (PNS) Analysis
            </h3>
            <p className="text-xs text-ink-muted font-medium mt-1">
              Security technique using varying optical pulse intensities to estimate single-photon transmission yields and defeat Photon Number Splitting attacks.
            </p>
          </div>

          <button
            onClick={() => setDecoyEnabled(!decoyEnabled)}
            className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
              decoyEnabled
                ? 'bg-warn border-warn text-white'
                : 'bg-face text-ink border-rule hover:bg-well'
            }`}
          >
            {decoyEnabled ? 'Decoy Analyzer Enabled' : 'Decoy Analyzer Disabled'}
          </button>
        </div>

        {decoyEnabled && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[10px] font-mono font-bold uppercase tracking-wider">
              <div className="bg-bench border border-rule p-3">
                <span className="text-ink-muted">Signal Pulse Intensity (μ):</span>
                <div className="text-lg text-quantum mt-1">{decoyData.signalIntensity}</div>
                <div className="text-[9px] text-ink-faint mt-1">Gain Q_μ = {decoyData.signalGain}</div>
              </div>

              <div className="bg-bench border border-rule p-3">
                <span className="text-ink-muted">Decoy Pulse Intensity (ν):</span>
                <div className="text-lg text-warn mt-1">{decoyData.decoyIntensity}</div>
                <div className="text-[9px] text-ink-faint mt-1">Gain Q_ν = {decoyData.decoyGain}</div>
              </div>

              <div className="bg-bench border border-rule p-3">
                <span className="text-ink-muted">Estimated Single-Photon Yield (Y₁):</span>
                <div className="text-lg text-pass mt-1">
                  {decoyData.singlePhotonYield.toFixed(3)}
                </div>
                <div className="text-[9px] text-ink-faint mt-1">Normalized Photon Yield</div>
              </div>

              <div className="bg-bench border border-rule p-3">
                <span className="text-ink-muted">PNS Attack Verdict:</span>
                <div
                  className={`text-sm mt-1.5 ${
                    decoyData.pnsDetected ? 'text-adversary' : 'text-pass'
                  }`}
                >
                  {decoyData.pnsDetected ? 'PNS Anomalous Disparity' : 'Safe / Within Poisson Limit'}
                </div>
              </div>
            </div>

            <div className="bg-well border border-rule p-4 text-xs text-ink font-medium leading-relaxed">
              <strong className="text-ink font-bold font-sans uppercase tracking-wider text-[11px] mr-2">Decoy Insight:</strong> Photon-number splitting is {decoyData.pnsDetected ? 'detected due to a collapse in the single photon yield.' : 'not detected, indicating the multi-photon pulses are being naturally attenuated.'}
            </div>
          </div>
        )}
      </div>

      {/* Context Questions */}
      <HumanContextHelper
        title="Threat Detection Logic"
        items={[
          {
            question: 'Why do we check Mutually Unbiased Bases (MUB)?',
            answer:
              'In quantum mechanics, measuring a state in one basis (e.g. Z) completely randomizes the outcome when subsequently measured in a conjugate basis (e.g. X). Monitoring all three MUB bases exposes eavesdroppers who attempt to inspect transmitted qubits.',
            type: 'info',
          },
          {
            question: 'What is a Photon Number Splitting (PNS) Attack?',
            answer:
              'In practical optical implementations, weak coherent pulses occasionally contain 2 or more photons. An eavesdropper could split off one photon to measure while letting the other proceed undetected. Decoy states detect this by comparing attenuation ratios between different intensity pulses.',
            type: 'tip',
          },
        ]}
      />
    </div>
  );
}
