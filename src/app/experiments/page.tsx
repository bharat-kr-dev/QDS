'use client';

import React, { useState } from 'react';
import { useQuantum } from '../../lib/experiments/experiment-store';
import { HumanContextHelper } from '../../components/ui/HumanContextHelper';
import {
  BarChart3,
  Download,
  Trash2,
  Save,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
} from 'lucide-react';

export default function ExperimentsPage() {
  const {
    experiments,
    saveCurrentExperiment,
    deleteExperiment,
    clearExperiments,
    exportExperimentsJson,
    exportExperimentsCsv,
    verificationResult,
    attackConfig,
  } = useQuantum();

  const [compareIdA, setCompareIdA] = useState<string>('');
  const [compareIdB, setCompareIdB] = useState<string>('');

  const expA = experiments.find((e) => e.id === compareIdA) || experiments[0];
  const expB = experiments.find((e) => e.id === compareIdB) || experiments[1];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-800 text-[11px] font-mono text-sky-400 mb-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Research Analytics & Data Store
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Experiment Comparison & Analytics Suite
          </h1>
          <p className="text-xs text-slate-400">
            Log simulation runs, benchmark side-by-side metric deltas (Normal vs Attack), and export telemetry for academic publication.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => saveCurrentExperiment()}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Current Run</span>
          </button>

          <button
            onClick={exportExperimentsCsv}
            disabled={experiments.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportExperimentsJson}
            disabled={experiments.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Workbench */}
      {experiments.length >= 2 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ArrowUpDown className="w-4 h-4 text-emerald-400" />
              <span>Experiment Differential Benchmark (Exp A vs Exp B)</span>
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <select
                value={expA?.id || ''}
                onChange={(e) => setCompareIdA(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg"
              >
                {experiments.map((e) => (
                  <option key={e.id} value={e.id}>
                    Exp A: {e.name}
                  </option>
                ))}
              </select>

              <span className="text-slate-500">vs</span>

              <select
                value={expB?.id || ''}
                onChange={(e) => setCompareIdB(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg"
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
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Metric Parameter</th>
                    <th className="py-2.5 px-3 text-sky-400">Exp A ({expA.attackConfig.type})</th>
                    <th className="py-2.5 px-3 text-emerald-400">Exp B ({expB.attackConfig.type})</th>
                    <th className="py-2.5 px-3 text-amber-400">Difference (Δ B - A)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">Quantum Bit Error Rate (QBER)</td>
                    <td className="py-2.5 px-3">{expA.qber.toFixed(2)}%</td>
                    <td className="py-2.5 px-3">{expB.qber.toFixed(2)}%</td>
                    <td className="py-2.5 px-3 font-bold">
                      {expB.qber - expA.qber > 0 ? `+${(expB.qber - expA.qber).toFixed(2)}%` : `${(expB.qber - expA.qber).toFixed(2)}%`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">Quantum State Overlap Fidelity</td>
                    <td className="py-2.5 px-3">{(expA.fidelity * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3">{(expB.fidelity * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-bold">
                      {((expB.fidelity - expA.fidelity) * 100).toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">Verification Result</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">
                        {expA.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">
                        {expB.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {expA.verdict === expB.verdict ? 'Identical Verdict' : 'Shifted Status'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">Classical Measurement Syndrome</td>
                    <td className="py-2.5 px-3">[{expA.classicalBits[0]}, {expA.classicalBits[1]}]</td>
                    <td className="py-2.5 px-3">[{expB.classicalBits[0]}, {expB.classicalBits[1]}]</td>
                    <td className="py-2.5 px-3 text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">Sampled Shots</td>
                    <td className="py-2.5 px-3">{expA.shots.toLocaleString()}</td>
                    <td className="py-2.5 px-3">{expB.shots.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Save at least 2 experiment runs to unlock side-by-side differential benchmarking.
          </p>
          <button
            onClick={() => saveCurrentExperiment()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 rounded-lg text-xs font-mono font-semibold"
          >
            Log First Experiment Now
          </button>
        </div>
      )}

      {/* Historical Experiments Log Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Historical Experiment Records ({experiments.length})</h3>
            <p className="text-xs text-slate-400">Saved simulations stored in local session cache.</p>
          </div>

          {experiments.length > 0 && (
            <button
              onClick={clearExperiments}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:underline font-mono"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {experiments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Run Name</th>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Scenario</th>
                  <th className="py-2 px-3">QBER</th>
                  <th className="py-2 px-3">Fidelity</th>
                  <th className="py-2 px-3">Verdict</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {experiments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{e.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {e.attackConfig.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-200">{e.qber}%</td>
                    <td className="py-2.5 px-3 font-bold text-slate-200">
                      {(e.fidelity * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          e.verdict === 'VALID'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {e.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => deleteExperiment(e.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
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
