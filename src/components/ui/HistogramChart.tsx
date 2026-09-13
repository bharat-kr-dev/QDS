'use client';

import React from 'react';
import { MeasurementResult } from '../../lib/quantum/types';

interface HistogramChartProps {
  result: MeasurementResult;
  title?: string;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  result,
  title = 'Projective Measurement Distribution',
}) => {
  const outcomes = Object.keys(result.counts);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            {title} ({result.basis}-Basis)
          </h4>
          <p className="text-xs text-slate-400">
            Total sampled shots: <span className="font-mono text-slate-200">{result.shots.toLocaleString()}</span>
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
          Empirical Error: <span className="text-emerald-400 font-semibold">{result.errorPercentage}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {outcomes.map((outcome) => {
          const count = result.counts[outcome] || 0;
          const observedProb = result.probabilities[outcome] || 0;
          const theoreticalProb = result.theoreticalProbabilities[outcome] || 0;

          return (
            <div key={outcome} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-sky-300 text-sm">{outcome}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    Observed: <strong className="text-white">{(observedProb * 100).toFixed(1)}%</strong> ({count.toLocaleString()} shots)
                  </span>
                  <span className="text-slate-500">
                    Expected: <strong className="text-slate-400">{(theoreticalProb * 100).toFixed(1)}%</strong>
                  </span>
                </div>
              </div>

              {/* Stacked comparison bar */}
              <div className="relative h-6 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center">
                {/* Theoretical marker tick */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{ left: `${theoreticalProb * 100}%` }}
                  title={`Theoretical Target: ${(theoreticalProb * 100).toFixed(1)}%`}
                />

                {/* Observed fill bar */}
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-cyan-500 transition-all duration-300 rounded-lg"
                  style={{ width: `${Math.max(1, observedProb * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded bg-cyan-500" /> Observed Frequency
          <span className="h-2 w-2 rounded bg-amber-400 ml-2" /> Theoretical Value (Born Rule)
        </div>
        <span className="font-mono text-slate-400">P = |⟨eigenstate|ψ⟩|²</span>
      </div>
    </div>
  );
};
