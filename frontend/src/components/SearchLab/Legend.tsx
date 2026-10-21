import React from 'react';
import { Flag, Target, Mountain, Compass, CheckCircle2, Navigation, Layers, ShieldCheck } from 'lucide-react';

export const Legend: React.FC = () => {
  const items = [
    { label: 'Start State', color: 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold', icon: Flag },
    { label: 'Goal State', color: 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold', icon: Target },
    { label: 'Obstacle Wall', color: 'bg-slate-700 border border-slate-600 text-slate-300' },
    { label: 'Mud Swamp (4.5x)', color: 'bg-amber-950/80 border border-amber-500/60 text-amber-300 font-mono font-bold' },
    { label: 'Scanning Head', color: 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300 shadow-glow-amber' },
    { label: 'Frontier Queue', color: 'bg-cyan-500/30 border border-cyan-400/80 text-cyan-300' },
    { label: 'Explored (Closed)', color: 'bg-indigo-600/30 border border-indigo-500/60 text-indigo-300' },
    { label: 'Optimal Path', color: 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold shadow-glow-emerald' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5 px-4 rounded-2xl bg-[#0b101e]/80 border border-lab-border/70 backdrop-blur-xl text-xs shadow-sm">
      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
        <span>Legend:</span>
      </span>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-[4px] flex items-center justify-center text-[10px] ${item.color}`}>
              {item.icon ? <item.icon className="w-2.5 h-2.5 fill-current" /> : item.label.includes('Mud') ? '~' : null}
            </span>
            <span className="text-slate-300 text-[11px] font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

