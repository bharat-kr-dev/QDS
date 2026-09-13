'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BlochCoordinates } from '../../lib/quantum/types';
import { RotateCw, Compass, Eye, Sparkles } from 'lucide-react';

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

    // 1. Sphere background & deep radial volumetric glow
    const grad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.3, 5, cx, cy, radius * 1.1);
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.16)');
    grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.85)');
    grad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();

    // 2. Sphere Outer Ring Neon
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // 3. Latitude Rings (z = 0.5, z = -0.5)
    [-0.5, 0.5].forEach((latZ) => {
      const latR = Math.sqrt(1 - latZ * latZ);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
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
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
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
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.setLineDash([2, 3]);
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
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(pNeg.screenX, pNeg.screenY);
      ctx.lineTo(pPos.screenX, pPos.screenY);
      ctx.stroke();

      // Axis Labels
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillStyle = axisColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelPos, pPos.screenX, pPos.screenY);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.fillText(labelNeg, pNeg.screenX, pNeg.screenY);
    };

    // Z-axis (Vertical: |0> at +Z, |1> at -Z)
    drawAxis(0, 0, 1, '#38bdf8', '|0⟩ (+Z)', '|1⟩ (-Z)');

    // X-axis (|+> at +X, |-> at -X)
    drawAxis(1, 0, 0, '#34d399', '|+⟩ (+X)', '|-⟩ (-X)');

    // Y-axis (|+i> at +Y, |-i> at -Y)
    drawAxis(0, 1, 0, '#f472b6', '|+i⟩ (+Y)', '|-i⟩ (-Y)');

    // 7. Draw State Vector Arrow |ψ⟩
    const sx = Math.sin(bloch.theta) * Math.cos(bloch.phi);
    const sy = Math.sin(bloch.theta) * Math.sin(bloch.phi);
    const sz = Math.cos(bloch.theta);

    const centerP = project3D(0, 0, 0, radius, cx, cy);
    const tipP = project3D(sx, sy, sz, radius, cx, cy);

    // Vector projection down to XY plane (for depth perspective)
    const shadowP = project3D(sx, sy, 0, radius, cx, cy);
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(tipP.screenX, tipP.screenY);
    ctx.lineTo(shadowP.screenX, shadowP.screenY);
    ctx.lineTo(centerP.screenX, centerP.screenY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vector glowing line
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(centerP.screenX, centerP.screenY);
    ctx.lineTo(tipP.screenX, tipP.screenY);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Arrowhead tip glowing dot
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(tipP.screenX, tipP.screenY, 5.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label tag with backdrop
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
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
          className="relative cursor-grab active:cursor-grabbing rounded-2xl bg-gradient-to-b from-[#0b1222] to-[#060a14] border border-white/[0.08] p-3 shadow-2xl shadow-cyan-950/30 overflow-hidden"
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
              className={`p-1.5 rounded-lg border text-[10px] font-mono flex items-center gap-1 transition-all ${
                autoRotate
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                  : 'bg-slate-900/90 border-white/[0.08] text-slate-300 hover:bg-slate-800'
              }`}
            >
              <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
              <span>{autoRotate ? 'Rotating' : 'Orbit'}</span>
            </button>

            <button
              onClick={() => {
                setRotX(0.35);
                setRotY(-0.45);
              }}
              title="Reset View Orientation"
              className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/[0.08] text-slate-300 text-[10px] font-mono transition-all"
            >
              Reset Cam
            </button>
          </div>

          <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 font-mono bg-slate-950/90 px-2 py-0.5 rounded-md border border-white/[0.06] pointer-events-none">
            🖱️ Drag to orbit 3D sphere
          </div>
        </div>
      </div>

      {/* Coordinate & Angle Telemetry HUD */}
      <div className="mt-3 grid grid-cols-2 gap-2 w-full text-xs font-mono">
        <div className="bg-[#0b1222]/90 border border-white/[0.07] rounded-xl px-3 py-2 shadow-inner">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>Polar (θ):</span>
            <span className="text-slate-400">{bloch.theta.toFixed(3)} rad</span>
          </div>
          <div className="text-base font-bold text-sky-400 mt-0.5">
            {((bloch.theta * 180) / Math.PI).toFixed(1)}°
          </div>
        </div>

        <div className="bg-[#0b1222]/90 border border-white/[0.07] rounded-xl px-3 py-2 shadow-inner">
          <div className="flex justify-between text-slate-400 text-[10px]">
            <span>Azimuth (φ):</span>
            <span className="text-slate-400">{bloch.phi.toFixed(3)} rad</span>
          </div>
          <div className="text-base font-bold text-amber-400 mt-0.5">
            {((bloch.phi * 180) / Math.PI).toFixed(1)}°
          </div>
        </div>

        <div className="col-span-2 bg-[#0b1222]/90 border border-white/[0.07] rounded-xl px-3 py-2 flex justify-between items-center text-[11px] shadow-inner">
          <span className="text-slate-400">Cartesian Vector (x,y,z):</span>
          <span className="text-cyan-300 font-bold">
            [{bloch.x}, {bloch.y}, {bloch.z}]
          </span>
        </div>
      </div>
    </div>
  );
};
