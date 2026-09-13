'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Atom,
  Layers,
  SendHorizontal,
  CheckCircle2,
  ShieldAlert,
  Skull,
  BarChart3,
  BookOpen,
  Settings,
  Flame,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { useQuantum } from '../../lib/experiments/experiment-store';

interface NavItem {
  href: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { teleportStep, attackConfig, verificationResult } = useQuantum();

  const isAttacked = attackConfig.enabled && attackConfig.type !== 'none';

  const sections: NavSection[] = [
    {
      title: 'CORE PLATFORM',
      items: [
        {
          href: '/',
          label: 'Overview',
          subtitle: 'End-to-End Pipeline',
          icon: LayoutDashboard,
        },
        {
          href: '/lab',
          label: 'Quantum Lab',
          subtitle: '3D Bloch & State Maker',
          icon: Atom,
        },
        {
          href: '/bell',
          label: 'Bell Generator',
          subtitle: 'EPR Pair Resource',
          icon: Layers,
        },
      ],
    },
    {
      title: 'TELEPORTATION & SIGNATURES',
      items: [
        {
          href: '/teleportation',
          label: 'Teleportation Station',
          subtitle: '9-Step Quantum Engine',
          icon: SendHorizontal,
          badge: `Step ${teleportStep}/9`,
          badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
        },
        {
          href: '/verification',
          label: 'Signature Verification',
          subtitle: 'Pauli & State Tomography',
          icon: CheckCircle2,
          badge: verificationResult.verdict,
          badgeColor:
            verificationResult.verdict === 'VALID'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
              : verificationResult.verdict === 'SUSPICIOUS'
              ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
              : 'bg-rose-950/80 text-rose-300 border-rose-700/60',
        },
      ],
    },
    {
      title: 'SECURITY & THREATS',
      items: [
        {
          href: '/threats',
          label: 'Threat Detection',
          subtitle: 'QBER & MUB Analyzer',
          icon: ShieldAlert,
          badge: `${verificationResult.qber}%`,
          badgeColor:
            verificationResult.qber > 5
              ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
              : 'bg-slate-900 text-slate-300 border-slate-700/60',
        },
        {
          href: '/attacks',
          label: 'Attack Simulator',
          subtitle: 'Red Team Adversary Lab',
          icon: isAttacked ? Flame : Skull,
          badge: isAttacked ? 'ACTIVE' : undefined,
          badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-600 animate-pulse',
        },
      ],
    },
    {
      title: 'ANALYTICS & EDUCATION',
      items: [
        {
          href: '/experiments',
          label: 'Experiments & Data',
          subtitle: 'Delta Benchmark & Export',
          icon: BarChart3,
        },
        {
          href: '/learn',
          label: 'Theory & Knowledge',
          subtitle: '15 Curated Modules',
          icon: BookOpen,
        },
        {
          href: '/settings',
          label: 'Settings',
          subtitle: 'Precision & Presets',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-68 shrink-0 bg-[#070b16]/90 border-r border-white/[0.06] flex flex-col justify-between select-none p-3 shadow-2xl">
      <div className="space-y-5">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-mono font-bold text-slate-400 tracking-wider">
              {sec.title}
            </div>

            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/40 text-cyan-300 border border-cyan-500/40 font-semibold shadow-lg shadow-cyan-950/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                            : 'bg-slate-900/60 text-slate-400 group-hover:text-slate-200 border border-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>

                      <div className="truncate text-left">
                        <div className="truncate font-semibold">{item.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {item.badge ? (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 shadow-sm ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                          isActive ? 'text-cyan-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Telemetry Card */}
      <div className="mt-4 p-3 rounded-xl bg-gradient-to-b from-[#0b1222] to-[#070c18] border border-white/[0.07] text-[11px] font-mono space-y-1.5 shadow-xl">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>State Fidelity:</span>
          </span>
          <strong className="text-cyan-300">{(verificationResult.fidelity * 100).toFixed(1)}%</strong>
        </div>

        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/[0.05]">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, verificationResult.fidelity * 100)}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
