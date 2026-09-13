'use client';

import React from 'react';

interface QberGaugeProps {
  qber: number; // 0 to 100%
  threshold: number; // default 5.0%
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const QberGauge: React.FC<QberGaugeProps> = ({
  qber,
  threshold = 5.0,
  label = 'Quantum Bit Error Rate (QBER)',
}) => {
  // Cap visual range between 0 and 30% for high dial resolution
  const maxDial = 25;
  const clampedQber = Math.min(maxDial, Math.max(0, qber));
  const percentageOfMax = (clampedQber / maxDial) * 100;

  // Arc calculation (semi-circle from 180 deg to 0 deg)
  const angleDeg = 180 - (percentageOfMax / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  const thresholdAngleDeg = 180 - (Math.min(maxDial, threshold) / maxDial) * 180;
  const thresholdAngleRad = (thresholdAngleDeg * Math.PI) / 180;

  const isExceeded = qber > threshold;
  const isSevere = qber > 15.0;

  const statusColor = isSevere
    ? 'text-rose-400'
    : isExceeded
    ? 'text-amber-400'
    : 'text-emerald-400';

  const statusBadge = isSevere
    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
    : isExceeded
    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800';

  // SVG dimensions
  const r = 85;
  const cx = 110;
  const cy = 100;

  const needleX = cx + (r - 12) * Math.cos(angleRad);
  const needleY = cy - (r - 12) * Math.sin(angleRad);

  const threshX = cx + (r + 4) * Math.cos(thresholdAngleRad);
  const threshY = cy - (r + 4) * Math.sin(thresholdAngleRad);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusBadge}`}>
          {isSevere ? 'CRITICAL DISTURBANCE' : isExceeded ? 'ELEVATED ERROR' : 'NOMINAL SECURE'}
        </span>
      </div>

      <div className="relative w-[220px] h-[120px] flex items-center justify-center">
        <svg viewBox="0 0 220 120" className="w-full h-full select-none">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="25%" stopColor="#34d399" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>

          {/* Background Arc Track */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Value Gradient Arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(percentageOfMax / 100) * (Math.PI * r)} ${Math.PI * r}`}
          />

          {/* Threshold Marker */}
          <line
            x1={cx + (r - 16) * Math.cos(thresholdAngleRad)}
            y1={cy - (r - 16) * Math.sin(thresholdAngleRad)}
            x2={threshX}
            y2={threshY}
            stroke="#f59e0b"
            strokeWidth="2.5"
          />

          {/* Gauge Center & Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#f8fafc"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="6" fill="#f8fafc" />
          <circle cx={cx} cy={cy} r="3" fill="#0f172a" />
        </svg>

        {/* Big Numeric Readout in center */}
        <div className="absolute bottom-1 text-center">
          <div className={`text-2xl font-mono font-bold ${statusColor}`}>
            {qber.toFixed(2)}%
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Threshold: {threshold.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Meaningful Context Explanation */}
      <div className="mt-3 w-full bg-slate-900/90 border border-slate-800/80 rounded p-2.5 text-xs text-slate-300 leading-tight">
        {isExceeded ? (
          <span className="text-amber-300">
            ⚠️ Channel error exceeds the {threshold}% threshold. Quantum state disturbance detected.
          </span>
        ) : (
          <span className="text-emerald-300">
            ✓ Error rate is within safe bounds. Quantum channel is reliable and intact.
          </span>
        )}
      </div>
    </div>
  );
};
