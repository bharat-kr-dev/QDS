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
    ? 'text-adversary'
    : isExceeded
    ? 'text-warn'
    : 'text-pass';

  const statusBadge = isSevere
    ? 'bg-adversary-tint text-adversary border-adversary'
    : isExceeded
    ? 'bg-warn-tint text-warn border-warn'
    : 'bg-pass-tint text-pass border-pass';

  // SVG dimensions
  const r = 85;
  const cx = 110;
  const cy = 100;

  const needleX = cx + (r - 12) * Math.cos(angleRad);
  const needleY = cy - (r - 12) * Math.sin(angleRad);

  const threshX = cx + (r + 4) * Math.cos(thresholdAngleRad);
  const threshY = cy - (r + 4) * Math.sin(thresholdAngleRad);

  return (
    <div className="panel p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">
          {label}
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 border ${statusBadge}`}>
          {isSevere ? 'CRITICAL DISTURBANCE' : isExceeded ? 'ELEVATED ERROR' : 'NOMINAL SECURE'}
        </span>
      </div>

      <div className="relative w-[220px] h-[120px] flex items-center justify-center mt-2">
        <svg viewBox="0 0 220 120" className="w-full h-full select-none">
          {/* Background Arc Track */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#e4e6ea"
            strokeWidth="12"
            strokeLinecap="square"
          />

          {/* Value Arc (solid color based on status) */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={isSevere ? '#c62d1f' : isExceeded ? '#8f5e0a' : '#0f7a4e'}
            strokeWidth="12"
            strokeLinecap="square"
            strokeDasharray={`${(percentageOfMax / 100) * (Math.PI * r)} ${Math.PI * r}`}
          />

          {/* Threshold Marker */}
          <line
            x1={cx + (r - 16) * Math.cos(thresholdAngleRad)}
            y1={cy - (r - 16) * Math.sin(thresholdAngleRad)}
            x2={threshX}
            y2={threshY}
            stroke="#8f5e0a"
            strokeWidth="2.0"
          />

          {/* Gauge Center & Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#14161a"
            strokeWidth="2.5"
            strokeLinecap="square"
          />
          <circle cx={cx} cy={cy} r="6" fill="#14161a" />
          <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
        </svg>

        {/* Big Numeric Readout in center */}
        <div className="absolute bottom-1 text-center">
          <div className={`text-2xl font-mono font-bold tnum ${statusColor}`}>
            {qber.toFixed(2)}%
          </div>
          <div className="text-[10px] font-mono text-ink-muted">
            Threshold: {threshold.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Meaningful Context Explanation */}
      <div className="mt-4 w-full bg-well border border-rule p-2.5 text-xs text-ink leading-tight font-medium">
        {isExceeded ? (
          <span className="text-warn">
            ! Channel error exceeds the {threshold}% threshold. Quantum state disturbance detected.
          </span>
        ) : (
          <span className="text-pass">
            + Error rate is within safe bounds. Quantum channel is reliable and intact.
          </span>
        )}
      </div>
    </div>
  );
};
