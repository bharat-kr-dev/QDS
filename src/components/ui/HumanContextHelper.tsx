'use client';

import React, { useState } from 'react';
import {
  IconInfo,
  IconChevronDown,
  IconChevronRight,
  IconThreat,
  IconCheck,
} from '../icons/Icons';

interface QuestionAnswer {
  question: string;
  answer: string;
  type?: 'info' | 'caution' | 'tip';
}

interface HumanContextHelperProps {
  title?: string;
  items: QuestionAnswer[];
}

export const HumanContextHelper: React.FC<HumanContextHelperProps> = ({
  title = 'Context & Guidance',
  items,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="panel overflow-hidden">
      <div className="bg-well px-4 py-3 border-b border-rule flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconInfo size={14} className="text-quantum" />
          <h4 className="label tracking-wider uppercase font-mono text-ink">
            {title}
          </h4>
        </div>
        <span className="text-[10px] text-ink-muted font-mono">
          Reference
        </span>
      </div>

      <div className="divide-y divide-rule">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="transition-colors">
              <button
                onClick={() => toggle(idx)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-well transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-medium text-ink">
                  <IconInfo size={14} className="text-ink-muted shrink-0" />
                  <span>{item.question}</span>
                </div>
                {isOpen ? (
                  <IconChevronDown size={14} className="text-ink-muted shrink-0" />
                ) : (
                  <IconChevronRight size={14} className="text-ink-muted shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-3 pt-1 text-xs text-ink-muted leading-relaxed bg-face border-t border-rule">
                  <div className="flex gap-2.5 mt-2">
                    {item.type === 'caution' ? (
                      <IconThreat size={14} className="text-warn shrink-0 mt-0.5" />
                    ) : item.type === 'tip' ? (
                      <IconCheck size={14} className="text-pass shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-quantum shrink-0 mt-1.5" />
                    )}
                    <div>{item.answer}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
