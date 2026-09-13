'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb, Compass, AlertCircle } from 'lucide-react';

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
  title = 'Human-Centered Context & Guidance',
  items,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            {title}
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Interactive Explanations
        </span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="transition-colors">
              <button
                onClick={() => toggle(idx)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{item.question}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-3 pt-1 text-xs text-slate-300 leading-relaxed bg-slate-950/40 border-t border-slate-800/40">
                  <div className="flex gap-2">
                    {item.type === 'caution' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    ) : item.type === 'tip' ? (
                      <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
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
