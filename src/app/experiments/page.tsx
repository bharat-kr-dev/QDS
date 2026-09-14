'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  IconSave,
  IconTrash,
  IconExport,
} from '../../components/icons/Icons';

export default function ExperimentsPage() {
  const {
    experiments,
    saveExperiment,
    deleteExperiment,
    clearExperiments,
    exportJson,
    exportCsv,
    verification,
    attack,
  } = useQuantum();

  const [compareIdA, setCompareIdA] = useState<string>('');
  const [compareIdB, setCompareIdB] = useState<string>('');

  const expA = experiments.find((e) => e.id === compareIdA) || experiments[0];
  const expB = experiments.find((e) => e.id === compareIdB) || experiments[1];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-quantum bg-quantum-tint text-[10px] font-mono font-bold text-quantum uppercase tracking-wider mb-2">
            <IconExport size={12} />
            Research Analytics & Data Store
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            Experiment Comparison & Analytics Suite
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            Log simulation runs, benchmark side-by-side metric deltas (Normal vs Attack), and export telemetry for academic publication.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => saveExperiment()}
            className="flex items-center gap-2 px-3.5 py-2 bg-quantum hover:bg-quantum/90 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <IconSave size={14} />
            <span>Save Current Run</span>
          </button>

          <button
            onClick={exportCsv}
            disabled={experiments.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-face hover:bg-well disabled:opacity-40 border border-rule text-ink font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <IconSave size={14} className="text-pass" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJson}
            disabled={experiments.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-face hover:bg-well disabled:opacity-40 border border-rule text-ink font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <IconSave size={14} className="text-quantum" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Workbench */}
      {experiments.length >= 2 ? (
        <div className="panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase tracking-wider">
              <IconExport size={16} className="text-pass" />
              <span>Experiment Differential Benchmark (Exp A vs Exp B)</span>
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
              <select
                value={expA?.id || ''}
                onChange={(e) => setCompareIdA(e.target.value)}
                className="bg-face border border-rule text-ink px-2.5 py-1"
              >
                {experiments.map((e) => (
                  <option key={e.id} value={e.id}>
                    Exp A: {e.name}
                  </option>
                ))}
              </select>

              <span className="text-ink-muted">vs</span>

              <select
                value={expB?.id || ''}
                onChange={(e) => setCompareIdB(e.target.value)}
                className="bg-face border border-rule text-ink px-2.5 py-1"
              >
                {experiments.map((e) => (
                  <option key={e.id} value={e.id}>
                    Exp B: {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Differential Comparison Table */}
          {expA && expB && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b-2 border-rule text-ink-muted uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Metric Parameter</th>
                    <th className="py-2.5 px-3 text-quantum">Exp A ({expA.attack.type})</th>
                    <th className="py-2.5 px-3 text-pass">Exp B ({expB.attack.type})</th>
                    <th className="py-2.5 px-3 text-warn">Difference (Δ B - A)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule font-medium">
                  <tr>
                    <td className="py-2.5 px-3 text-ink font-bold">Quantum Bit Error Rate (QBER)</td>
                    <td className="py-2.5 px-3">{expA.qber.toFixed(2)}%</td>
                    <td className="py-2.5 px-3">{expB.qber.toFixed(2)}%</td>
                    <td className="py-2.5 px-3 font-bold">
                      {expB.qber - expA.qber > 0 ? `+${(expB.qber - expA.qber).toFixed(2)}%` : `${(expB.qber - expA.qber).toFixed(2)}%`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-ink font-bold">Quantum State Overlap Fidelity</td>
                    <td className="py-2.5 px-3">{(expA.fidelity * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3">{(expB.fidelity * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-bold">
                      {((expB.fidelity - expA.fidelity) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-ink font-bold">Verification Result</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 border border-rule bg-face font-bold">
                        {expA.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 border border-rule bg-face font-bold">
                        {expB.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-ink-faint">
                      {expA.verdict === expB.verdict ? 'Identical Verdict' : 'Shifted Status'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-ink font-bold">Classical Measurement Syndrome</td>
                    <td className="py-2.5 px-3">[{expA.classicalBits[0]}, {expA.classicalBits[1]}]</td>
                    <td className="py-2.5 px-3">[{expB.classicalBits[0]}, {expB.classicalBits[1]}]</td>
                    <td className="py-2.5 px-3 text-ink-faint">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-ink font-bold">Sampled Shots</td>
                    <td className="py-2.5 px-3">{expA.shots.toLocaleString()}</td>
                    <td className="py-2.5 px-3">{expB.shots.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-ink-faint">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="panel p-6 text-center space-y-3 bg-bench">
          <p className="text-xs text-ink-muted font-bold uppercase tracking-wider">
            Save at least 2 experiment runs to unlock side-by-side differential benchmarking.
          </p>
          <button
            onClick={() => saveExperiment()}
            className="px-4 py-2 bg-face hover:bg-well border border-rule text-quantum uppercase tracking-wider text-xs font-mono font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <IconSave size={14} /> Log First Experiment Now
          </button>
        </div>
      )}

      {/* Historical Experiments Log Table */}
      <div className="panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Historical Experiment Records ({experiments.length})</h3>
            <p className="text-xs text-ink-muted font-medium mt-1">Saved simulations stored in local session cache.</p>
          </div>

          {experiments.length > 0 && (
            <button
              onClick={clearExperiments}
              className="flex items-center gap-1.5 text-xs text-adversary hover:text-adversary/80 uppercase font-bold tracking-wider cursor-pointer transition-colors"
            >
              <IconTrash size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {experiments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-rule text-ink-muted uppercase tracking-wider font-bold">
                  <th className="py-2 px-3">Run Name</th>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Scenario</th>
                  <th className="py-2 px-3">QBER</th>
                  <th className="py-2 px-3">Fidelity</th>
                  <th className="py-2 px-3">Verdict</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule font-medium">
                {experiments.map((e) => (
                  <tr key={e.id} className="hover:bg-well transition-colors">
                    <td className="py-2.5 px-3 font-bold text-ink">{e.name}</td>
                    <td className="py-2.5 px-3 text-ink-muted">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 border border-rule bg-face text-ink">
                        {e.attack.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-ink">{e.qber}%</td>
                    <td className="py-2.5 px-3 font-bold text-ink">
                      {(e.fidelity * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 font-bold uppercase tracking-wider border ${
                          e.verdict === 'VALID'
                            ? 'bg-pass-tint text-pass border-pass'
                            : 'bg-adversary-tint text-adversary border-adversary'
                        }`}
                      >
                        {e.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => deleteExperiment(e.id)}
                        className="text-ink-faint hover:text-adversary transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <IconTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-ink-faint font-mono font-bold uppercase tracking-wider">
            No experiments logged yet. Click "Save Current Run" to persist benchmark telemetry.
          </div>
        )}
      </div>

      {/* FAQs */}
      <HumanContextHelper
        title="Research Analytics Guidelines"
        items={[
          {
            question: 'How do delta metrics help in security audits?',
            answer:
              'Differential benchmarks isolate the exact percentage increase in QBER and drop in fidelity caused by an attack scenario relative to a clean baseline run under identical optical parameters.',
            type: 'info',
          },
        ]}
      />
    </div>
  );
}
