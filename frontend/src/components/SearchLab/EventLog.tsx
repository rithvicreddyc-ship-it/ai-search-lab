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
    <div className="p-4 rounded-3xl bg-[#0b101e]/90 border border-lab-border/80 shadow-glass-card backdrop-blur-2xl space-y-3">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-lab-border/70 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Trace Log</span>
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-[#050813] px-2.5 py-0.5 rounded-full border border-slate-800">
          {activeEvents.length} / {events.length} evt
        </span>
      </div>

      {/* Terminal Content Stream */}
      <div
        ref={scrollRef}
        className="max-h-56 overflow-y-auto space-y-2 font-mono text-xs pr-1 select-text"
      >
        {activeEvents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-1">
            <Sparkles className="w-5 h-5 text-slate-600 mx-auto opacity-50" />
            <p className="text-xs italic">Awaiting algorithm execution...</p>
            <p className="text-[10px] text-slate-600">Every state pop, push, and evaluation will stream here in real-time.</p>
          </div>
        ) : (
          activeEvents.map((evt, idx) => {
            const isLatest = idx === activeEvents.length - 1;

            let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
            if (evt.type === 'visit') badgeColor = 'bg-amber-950/70 text-amber-300 border-amber-500/40';
            if (evt.type === 'frontier_add') badgeColor = 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40';
            if (evt.type === 'path_found') badgeColor = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
            if (evt.type === 'search_failed' || evt.type === 'local_optimum')
              badgeColor = 'bg-rose-950/70 text-rose-300 border-rose-500/40';

            return (
              <div
                key={`evt-${evt.step}-${idx}`}
                className={`p-2.5 rounded-2xl transition-all ${
                  isLatest
                    ? 'bg-indigo-950/50 border border-indigo-500/50 shadow-glow-indigo'
                    : 'bg-[#050813]/80 border border-lab-border/60 text-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[10px]">
                  <span className="font-bold text-slate-400">#{evt.step}</span>
                  <span className={`uppercase px-2 py-0.5 rounded-md font-bold text-[9px] border ${badgeColor}`}>
                    {evt.type.replace('_', ' ')}
                  </span>
                  {evt.g !== undefined && (
                    <span className="text-cyan-400 font-sans font-semibold">
                      g={evt.g}
                    </span>
                  )}
                  {evt.h !== undefined && (
                    <span className="text-violet-400 font-sans font-semibold">
                      h={evt.h}
                    </span>
                  )}
                  {evt.f !== undefined && (
                    <span className="text-amber-400 font-sans font-semibold">
                      f={evt.f}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
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

