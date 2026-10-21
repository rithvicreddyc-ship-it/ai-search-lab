import React, { useEffect, useRef } from 'react';
import { Terminal, ArrowRight, Zap, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { SearchEvent } from '../../types';

interface EventLogProps {
  events: SearchEvent[];
  currentStep: number;
}

export const EventLog: React.FC<EventLogProps> = ({ events, currentStep }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active event
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep]);

  const activeEvents = events.slice(0, currentStep);

  return (
    <div className="p-4 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Trace Log</span>
          </span>
        </div>
        <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
          {activeEvents.length} / {events.length} evt
        </span>
      </div>

      {/* Terminal Content Stream */}
      <div
        ref={scrollRef}
        className="max-h-56 overflow-y-auto space-y-2 font-mono text-xs pr-1 select-text"
      >
        {activeEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-1">
            <Sparkles className="w-5 h-5 text-slate-300 mx-auto" />
            <p className="text-xs italic">Awaiting algorithm execution...</p>
            <p className="text-[10px] text-slate-400">Every state pop, push, and evaluation will stream here in real-time.</p>
          </div>
        ) : (
          activeEvents.map((evt, idx) => {
            const isLatest = idx === activeEvents.length - 1;

            let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (evt.type === 'visit') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
            if (evt.type === 'frontier_add') badgeColor = 'bg-sky-50 text-sky-800 border-sky-200';
            if (evt.type === 'path_found') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            if (evt.type === 'search_failed' || evt.type === 'local_optimum')
              badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';

            return (
              <div
                key={`evt-${evt.step}-${idx}`}
                className={`p-2.5 rounded-2xl transition-all ${
                  isLatest
                    ? 'bg-indigo-50/80 border border-indigo-200 shadow-sm'
                    : 'bg-slate-50/80 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[10px]">
                  <span className="font-bold text-slate-500">#{evt.step}</span>
                  <span className={`uppercase px-2 py-0.5 rounded-md font-bold text-[9px] border ${badgeColor}`}>
                    {evt.type.replace('_', ' ')}
                  </span>
                  {evt.g !== undefined && (
                    <span className="text-sky-700 font-sans font-semibold">
                      g={evt.g}
                    </span>
                  )}
                  {evt.h !== undefined && (
                    <span className="text-purple-700 font-sans font-semibold">
                      h={evt.h}
                    </span>
                  )}
                  {evt.f !== undefined && (
                    <span className="text-amber-700 font-sans font-semibold">
                      f={evt.f}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-sans text-slate-700 leading-relaxed">
                  {evt.explanation}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

