'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { calculateDecoyStateMetrics } from '../../lib/quantum/attacks';
import { performMUBAnalysis } from '../../lib/security/threat-detection';
import { QberGauge } from '../../components/ui/QberGauge';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  ShieldAlert,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Radio,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

export default function ThreatDetectionPage() {
  const {
    inputState,
    receivedState,
    verificationResult,
    qberThreshold,
    setQberThreshold,
    attackConfig,
  } = useQuantum();

  const [decoyEnabled, setDecoyEnabled] = useState<boolean>(true);
  const [signalMu, setSignalMu] = useState<number>(0.5);
  const [decoyNu, setDecoyNu] = useState<number>(0.1);

  // MUB basis calculations
  const mubResults = performMUBAnalysis(inputState, receivedState, 1000);

  // Decoy State calculations
  const isEavesdropperActive = attackConfig.enabled && attackConfig.type !== 'none';
  const decoyData = calculateDecoyStateMetrics(signalMu, decoyNu, 0.15, isEavesdropperActive);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-[11px] font-mono text-rose-400 mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Security Analysis & Anomaly Detection
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Threat Detection & Statistical MUB Analyzer
          </h1>
          <p className="text-xs text-slate-400">
            Monitor Quantum Bit Error Rates, inspect Mutually Unbiased Bases deviations, and evaluate Decoy-State pulse statistics.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              verificationResult.qber > qberThreshold ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-300 font-semibold">
            {verificationResult.qber > qberThreshold
              ? 'ANOMALOUS ERROR DETECTED'
              : 'CHANNEL SECURITY NOMINAL'}
          </span>
        </div>
      </div>

      {/* Top Grid: QBER Gauge & Threshold Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <QberGauge
            qber={verificationResult.qber}
            threshold={qberThreshold}
            label="Quantum Bit Error Rate (QBER)"
          />
        </div>

        {/* Configurable Threshold Card */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Statistical Security Threshold Tuning</span>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">
              Threshold = {qberThreshold.toFixed(1)}%
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Adjust the permissible QBER threshold. In standard BB84 / QDS teleportation protocols, error rates above 5.0% - 11.0% indicate substantial channel disturbance or non-orthogonal basis eavesdropping.
          </p>

          <input
            type="range"
            min="1.0"
            max="20.0"
            step="0.5"
            value={qberThreshold}
            onChange={(e) => setQberThreshold(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="grid grid-cols-3 gap-2 pt-2">
            {[3.0, 5.0, 11.0].map((preset) => (
              <button
                key={preset}
                onClick={() => setQberThreshold(preset)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                  qberThreshold === preset
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset === 3 ? 'Ultra-Strict (3%)' : preset === 5 ? 'Standard QDS (5%)' : 'Shor-Preskill Bound (11%)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mutually Unbiased Bases (MUB) Analysis Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Mechanism A: Mutually Unbiased Bases (MUB) Eigenstate Analyzer
            </h3>
            <p className="text-xs text-slate-400">
              Comparing expected theoretical distributions vs observed measurement probabilities across non-commuting Z, X, and Y bases.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Z', 'X', 'Y'] as const).map((basis) => {
            const check = mubResults[basis];
            const isDisturbed = check.isDisturbed;

            return (
              <div
                key={basis}
                className={`bg-slate-900/90 border rounded-xl p-4 space-y-3 ${
                  isDisturbed ? 'border-rose-700/80' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-white">
                    {basis}-Basis Projection
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isDisturbed
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {isDisturbed ? 'Disturbance Detected' : 'Consistent'}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Expected P(0):</span>
                    <span className="text-slate-200 font-bold">
                      {(check.expectedDistribution.outcome0 * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Observed P(0):</span>
                    <span className="text-sky-400 font-bold">
                      {(check.observedDistribution.outcome0 * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
                    <span>Statistical Deviation:</span>
                    <span
                      className={`font-bold ${
                        isDisturbed ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {(check.deviationScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decoy State Security Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Mechanism B: Decoy-State Multi-Photon Splitting (PNS) Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Security technique using varying optical pulse intensities to estimate single-photon transmission yields and defeat Photon Number Splitting attacks.
            </p>
          </div>

          <button
            onClick={() => setDecoyEnabled(!decoyEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
              decoyEnabled
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {decoyEnabled ? 'Decoy Analyzer Enabled' : 'Decoy Analyzer Disabled'}
          </button>
        </div>

        {decoyEnabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-400">Signal Pulse Intensity (μ):</span>
                <div className="text-lg font-bold text-sky-400 mt-1">{decoyData.signalIntensity}</div>
                <div className="text-[10px] text-slate-400">Gain Q_μ = {decoyData.signalGain}</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-400">Decoy Pulse Intensity (ν):</span>
                <div className="text-lg font-bold text-amber-400 mt-1">{decoyData.decoyIntensity}</div>
                <div className="text-[10px] text-slate-400">Gain Q_ν = {decoyData.decoyGain}</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-400">Estimated Single-Photon Yield (Y₁):</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {decoyData.estimatedSinglePhotonYield}
                </div>
                <div className="text-[10px] text-slate-400">Normalized Photon Yield</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-400">PNS Attack Verdict:</span>
                <div
                  className={`text-sm font-bold mt-1.5 ${
                    decoyData.pnsAttackDetected ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {decoyData.pnsAttackDetected ? 'PNS Anomalous Disparity' : 'Safe / Within Poisson Limit'}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
              <strong className="text-slate-200">Decoy Explanation:</strong> {decoyData.explanation}
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
