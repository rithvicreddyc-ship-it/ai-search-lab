import React, { useEffect, useRef } from 'react';
import { Terminal, ArrowRight, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
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
    <div className="p-3.5 rounded-2xl bg-lab-panel/90 border border-lab-border space-y-2">
      <div className="flex items-center justify-between border-b border-lab-border/70 pb-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Execution Step Log & Explainability</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {activeEvents.length} / {events.length} events
        </span>
      </div>

      <div
        ref={scrollRef}
        className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs pr-1"
      >
        {activeEvents.length === 0 ? (
          <p className="text-slate-500 italic py-4 text-center">
            Click "Execute Search Algorithm" to observe step-by-step state exploration.
          </p>
        ) : (
          activeEvents.map((evt, idx) => {
            const isLatest = idx === activeEvents.length - 1;

            let badgeColor = 'bg-slate-800 text-slate-300';
            if (evt.type === 'visit') badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
            if (evt.type === 'frontier_add') badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
            if (evt.type === 'path_found') badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
            if (evt.type === 'search_failed' || evt.type === 'local_optimum')
              badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';

            return (
              <div
                key={`evt-${evt.step}-${idx}`}
                className={`p-2 rounded-lg transition-all ${
                  isLatest
                    ? 'bg-indigo-950/40 border border-indigo-500/40 shadow-sm'
                    : 'bg-[#0b0e17]/60 border border-lab-border/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-slate-500 font-semibold">#{evt.step}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${badgeColor}`}>
                    {evt.type.replace('_', ' ')}
                  </span>
                  {evt.g !== undefined && (
                    <span className="text-[10px] text-cyan-400 font-sans font-medium">
                      g={evt.g}
                    </span>
                  )}
                  {evt.h !== undefined && (
                    <span className="text-[10px] text-violet-400 font-sans font-medium">
                      h={evt.h}
                    </span>
                  )}
                  {evt.f !== undefined && (
                    <span className="text-[10px] text-amber-400 font-sans font-medium">
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
