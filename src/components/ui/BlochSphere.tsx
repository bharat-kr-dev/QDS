'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BlochCoordinates } from '../../lib/quantum/types';

interface BlochSphereProps {
  bloch: BlochCoordinates;
  size?: number;
  interactive?: boolean;
  onAngleChange?: (theta: number, phi: number) => void;
  label?: string;
}

export const BlochSphere: React.FC<BlochSphereProps> = ({
  bloch,
  size = 280,
  interactive = true,
  onAngleChange,
  label = '|ψ⟩',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState<number>(0.35); // view tilt
  const [rotY, setRotY] = useState<number>(-0.45); // view azimuth
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3D rotation projection helper
  const project3D = (
    x: number,
    y: number,
    z: number,
    radius: number,
    cx: number,
    cy: number
  ) => {
    // Rotate around Y axis
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    // Rotate around X axis
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // 2D screen projection
    const scale = radius * 0.86;
    return {
      screenX: cx + x1 * scale,
      screenY: cy - y2 * scale, // Canvas Y is inverted
      depth: z2,
    };
  };

  // Auto rotate loop
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotY((prev) => prev + 0.015);
    }, 30);
    return () => clearInterval(timer);
  }, [autoRotate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = size;
    const height = size;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const cx = width / 2;
    const cy = height / 2;
    const radius = width * 0.38;

    ctx.clearRect(0, 0, width, height);

    // 1. Sphere background (well)
    ctx.fillStyle = '#e4e6ea';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();

    // 2. Sphere Outer Ring (rule)
    ctx.strokeStyle = '#b4b9c1';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // 3. Latitude Rings (z = 0.5, z = -0.5)
    [-0.5, 0.5].forEach((latZ) => {
      const latR = Math.sqrt(1 - latZ * latZ);
      ctx.strokeStyle = '#d2d5da';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      for (let i = 0; i <= 36; i++) {
        const angle = (i / 36) * 2 * Math.PI;
        const p = project3D(latR * Math.cos(angle), latR * Math.sin(angle), latZ, radius, cx, cy);
        if (i === 0) ctx.moveTo(p.screenX, p.screenY);
        else ctx.lineTo(p.screenX, p.screenY);
      }
      ctx.stroke();
    });

    // 4. Equator (XY plane circle at z=0)
    ctx.strokeStyle = '#8a9099';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const p = project3D(Math.cos(angle), Math.sin(angle), 0, radius, cx, cy);
      if (i === 0) ctx.moveTo(p.screenX, p.screenY);
      else ctx.lineTo(p.screenX, p.screenY);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Prime Meridian (XZ plane at y=0)
    ctx.strokeStyle = '#d2d5da';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const p = project3D(Math.cos(angle), 0, Math.sin(angle), radius, cx, cy);
      if (i === 0) ctx.moveTo(p.screenX, p.screenY);
      else ctx.lineTo(p.screenX, p.screenY);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Draw Coordinate Axes (X, Y, Z)
    const drawAxis = (
      dx: number,
      dy: number,
      dz: number,
      axisColor: string,
      labelPos: string,
      labelNeg: string
    ) => {
      const pPos = project3D(dx * 1.22, dy * 1.22, dz * 1.22, radius, cx, cy);
      const pNeg = project3D(-dx * 1.22, -dy * 1.22, -dz * 1.22, radius, cx, cy);

      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.0;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pNeg.screenX, pNeg.screenY);
      ctx.lineTo(pPos.screenX, pPos.screenY);
      ctx.stroke();

      // Axis Labels
      ctx.font = '500 10px monospace';
      ctx.fillStyle = axisColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelPos, pPos.screenX, pPos.screenY);
      ctx.fillStyle = '#8a9099';
      ctx.fillText(labelNeg, pNeg.screenX, pNeg.screenY);
    };

    // Z-axis (Vertical: |0> at +Z, |1> at -Z)
    drawAxis(0, 0, 1, '#14161a', '|0⟩ (+Z)', '|1⟩ (-Z)');

    // X-axis (|+> at +X, |-> at -X)
    drawAxis(1, 0, 0, '#5c626b', '|+⟩ (+X)', '|-⟩ (-X)');

    // Y-axis (|+i> at +Y, |-i> at -Y)
    drawAxis(0, 1, 0, '#5c626b', '|+i⟩ (+Y)', '|-i⟩ (-Y)');

    // 7. Draw State Vector Arrow |ψ⟩
    const sx = Math.sin(bloch.theta) * Math.cos(bloch.phi);
    const sy = Math.sin(bloch.theta) * Math.sin(bloch.phi);
    const sz = Math.cos(bloch.theta);

    const centerP = project3D(0, 0, 0, radius, cx, cy);
    const tipP = project3D(sx, sy, sz, radius, cx, cy);

    // Vector projection down to XY plane (for depth perspective)
    const shadowP = project3D(sx, sy, 0, radius, cx, cy);
    ctx.strokeStyle = '#b4b9c1';
    ctx.lineWidth = 1.0;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(tipP.screenX, tipP.screenY);
    ctx.lineTo(shadowP.screenX, shadowP.screenY);
    ctx.lineTo(centerP.screenX, centerP.screenY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector line
    ctx.strokeStyle = '#1a3fbf'; // quantum
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(centerP.screenX, centerP.screenY);
    ctx.lineTo(tipP.screenX, tipP.screenY);
    ctx.stroke();

    // Arrowhead tip dot
    ctx.fillStyle = '#1a3fbf';
    ctx.beginPath();
    ctx.arc(tipP.screenX, tipP.screenY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Label tag
    ctx.font = '600 12px monospace';
    ctx.fillStyle = '#1a3fbf';
    ctx.textAlign = 'left';
    ctx.fillText(` ${label}`, tipP.screenX + 6, tipP.screenY - 6);
  }, [bloch, rotX, rotY, size, label]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + dx * 0.012);
    setRotX((prev) => Math.max(-1.4, Math.min(1.4, prev - dy * 0.012)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex flex-col items-center select-none w-full">
      <div className="relative w-full flex justify-center">
        <div
          className="relative cursor-grab active:cursor-grabbing panel p-3 overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            style={{ width: size, height: size }}
            className="block"
          />

          {/* Quick HUD Toolbar */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title="Toggle Auto Rotation"
              className={`px-2 py-1 border text-[10px] font-mono transition-colors ${
                autoRotate
                  ? 'bg-quantum text-white border-quantum'
                  : 'bg-face border-rule text-ink hover:bg-well'
              }`}
            >
              {autoRotate ? 'Rotating' : 'Orbit'}
            </button>

            <button
              onClick={() => {
                setRotX(0.35);
                setRotY(-0.45);
              }}
              title="Reset View Orientation"
              className="px-2 py-1 bg-face hover:bg-well border border-rule text-ink text-[10px] font-mono transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Coordinate & Angle Telemetry HUD */}
      <div className="mt-3 grid grid-cols-2 gap-2 w-full text-xs font-mono">
        <div className="well border border-rule px-3 py-2">
          <div className="flex justify-between text-ink-muted text-[10px]">
            <span>Polar (θ):</span>
            <span className="text-ink-faint tnum">{bloch.theta.toFixed(3)} rad</span>
          </div>
          <div className="text-base font-bold text-ink mt-0.5 tnum">
            {((bloch.theta * 180) / Math.PI).toFixed(1)}°
          </div>
        </div>

        <div className="well border border-rule px-3 py-2">
          <div className="flex justify-between text-ink-muted text-[10px]">
            <span>Azimuth (φ):</span>
            <span className="text-ink-faint tnum">{bloch.phi.toFixed(3)} rad</span>
          </div>
          <div className="text-base font-bold text-ink mt-0.5 tnum">
            {((bloch.phi * 180) / Math.PI).toFixed(1)}°
          </div>
        </div>

        <div className="col-span-2 well border border-rule px-3 py-2 flex justify-between items-center text-[11px]">
          <span className="text-ink-muted">Vector (x,y,z):</span>
          <span className="text-quantum font-bold tnum">
            [{bloch.x.toFixed(3)}, {bloch.y.toFixed(3)}, {bloch.z.toFixed(3)}]
          </span>
        </div>
      </div>
    </div>
  );
};
