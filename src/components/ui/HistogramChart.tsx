'use client';

import React from 'react';
import { MeasurementResult } from '../../lib/quantum/types';

interface HistogramChartProps {
  result: MeasurementResult;
  title?: string;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  result,
  title = 'Measurement Distribution',
}) => {
  const outcomes = Object.keys(result.counts);

  return (
    <div className="panel p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-quantum" />
            {title} ({result.basis}-Basis)
          </h4>
          <p className="text-xs text-ink-muted">
            Total sampled shots: <span className="tnum font-medium text-ink">{result.shots.toLocaleString()}</span>
          </p>
        </div>
        <div className="text-xs font-mono text-ink-muted bg-well border border-rule px-2.5 py-1">
          Empirical Error: <span className="text-warn font-semibold">{result.deviation}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {outcomes.map((outcome) => {
          const count = result.counts[outcome] || 0;
          const observedProb = result.probabilities[outcome] || 0;
          const theoreticalProb = result.theoretical[outcome] || 0;

          return (
            <div key={outcome} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-quantum text-sm">{outcome}</span>
                <div className="flex items-center gap-3">
                  <span className="text-ink-muted">
                    Observed: <strong className="text-ink">{(observedProb * 100).toFixed(1)}%</strong> ({count.toLocaleString()} shots)
                  </span>
                  <span className="text-ink-faint">
                    Expected: <strong className="text-ink-muted">{(theoreticalProb * 100).toFixed(1)}%</strong>
                  </span>
                </div>
              </div>

              {/* Stacked comparison bar */}
              <div className="relative h-5 bg-well overflow-hidden border border-rule flex items-center">
                {/* Theoretical marker tick */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-warn z-10"
                  style={{ left: `${theoreticalProb * 100}%` }}
                  title={`Theoretical Target: ${(theoreticalProb * 100).toFixed(1)}%`}
                />

                {/* Observed fill bar */}
                <div
                  className="h-full bg-quantum transition-all duration-300"
                  style={{ width: `${Math.max(1, observedProb * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-rule flex items-center justify-between text-[11px] text-ink-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-quantum" /> Observed</span>
          <span className="flex items-center gap-1.5"><span className="w-px h-2 bg-warn" /> Theoretical</span>
        </div>
        <span className="font-mono text-ink-faint">P = |⟨eigenstate|ψ⟩|²</span>
      </div>
    </div>
  );
};
