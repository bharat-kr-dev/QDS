'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconOverview,
  IconBloch,
  IconEntangle,
  IconTeleport,
  IconVerify,
  IconThreat,
  IconIntrusion,
  IconExperiments,
  IconLearn,
  IconSettings,
  IconChevronRight,
} from '../icons/Icons';
import { useQuantum } from '../../lib/experiments/experiment-store';

interface NavItem {
  href: string;
  label: string;
  subtitle: string;
  icon: React.FC<{ size?: number; className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { step, attack, verification } = useQuantum();

  const isAttacked = attack.type !== 'none' && attack.type !== 'noise';

  const sections: NavSection[] = [
    {
      title: 'Core Platform',
      items: [
        {
          href: '/',
          label: 'Overview',
          subtitle: 'End-to-End Pipeline',
          icon: IconOverview,
        },
        {
          href: '/lab',
          label: 'Quantum Lab',
          subtitle: '3D Bloch & State Maker',
          icon: IconBloch,
        },
        {
          href: '/bell',
          label: 'Bell Generator',
          subtitle: 'EPR Pair Resource',
          icon: IconEntangle,
        },
      ],
    },
    {
      title: 'Protocol Rail',
      items: [
        {
          href: '/teleportation',
          label: 'Teleportation',
          subtitle: '9-Step Quantum Engine',
          icon: IconTeleport,
          badge: `Step ${step}/9`,
          badgeColor: 'bg-quantum-tint text-quantum border-quantum',
        },
        {
          href: '/verification',
          label: 'Verification',
          subtitle: 'Pauli & Tomography',
          icon: IconVerify,
          badge: verification.verdict,
          badgeColor:
            verification.verdict === 'VALID'
              ? 'bg-pass-tint text-pass border-pass'
              : verification.verdict === 'SUSPICIOUS'
              ? 'bg-warn-tint text-warn border-warn'
              : 'bg-adversary-tint text-adversary border-adversary',
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          href: '/threats',
          label: 'Threat Detection',
          subtitle: 'QBER Analyzer',
          icon: IconThreat,
          badge: `${verification.qber.toFixed(1)}%`,
          badgeColor:
            verification.qber > 5
              ? 'bg-adversary-tint text-adversary border-adversary'
              : 'bg-well text-ink-muted border-rule',
        },
        {
          href: '/attacks',
          label: 'Attack Simulator',
          subtitle: 'Red Team Lab',
          icon: IconIntrusion,
          badge: isAttacked ? 'ACTIVE' : undefined,
          badgeColor: 'bg-adversary text-white border-adversary',
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          href: '/experiments',
          label: 'Experiments',
          subtitle: 'Benchmark & Export',
          icon: IconExperiments,
        },
        {
          href: '/learn',
          label: 'Theory',
          subtitle: '15 Curated Modules',
          icon: IconLearn,
        },
        {
          href: '/settings',
          label: 'Settings',
          subtitle: 'Precision & Presets',
          icon: IconSettings,
        },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-68 shrink-0 bg-face border-r border-rule flex flex-col justify-between select-none p-3 relative z-10">
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="label px-3 uppercase tracking-wider mb-2">
              {sec.title}
            </div>

            <div className="space-y-px">
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      isActive
                        ? 'bg-quantum-tint text-quantum font-medium'
                        : 'text-ink-muted hover:bg-well hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon size={16} className="shrink-0" />
                      <div className="truncate text-left">
                        <div className="truncate text-[13px]">{item.label}</div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-quantum opacity-80' : 'text-ink-faint'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {item.badge ? (
                      <span
                        className={`text-[9px] font-mono font-medium px-1.5 py-0.5 border shrink-0 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <IconChevronRight
                        size={14}
                        className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
      <div className="mt-6 panel p-3 text-[11px] font-mono space-y-2">
        <div className="flex items-center justify-between text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="text-ink-faint">Fidelity:</span>
          </span>
          <strong className="text-quantum">{(verification.fidelity * 100).toFixed(1)}%</strong>
        </div>

        <div className="w-full bg-well h-1.5 border border-rule overflow-hidden">
          <div
            className="h-full bg-quantum transition-all duration-300"
            style={{ width: `${Math.min(100, verification.fidelity * 100)}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
