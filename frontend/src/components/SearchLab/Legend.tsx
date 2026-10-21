import React from 'react';
import { Flag, Target, Mountain, Compass, CheckCircle2, Navigation, Layers, ShieldCheck } from 'lucide-react';

export const Legend: React.FC = () => {
  const items = [
    { label: 'Start State', color: 'bg-emerald-500 text-white font-bold', icon: Flag },
    { label: 'Goal State', color: 'bg-rose-500 text-white font-bold', icon: Target },
    { label: 'Obstacle Wall', color: 'bg-slate-800 border border-slate-700 text-white' },
    { label: 'Mud Swamp (4.5x)', color: 'bg-amber-100 border border-amber-300 text-amber-800 font-mono font-bold' },
    { label: 'Scanning Head', color: 'bg-amber-400 text-slate-950 font-bold ring-1 ring-amber-300' },
    { label: 'Frontier Queue', color: 'bg-amber-100 border border-amber-300 text-amber-900' },
    { label: 'Explored (Closed)', color: 'bg-sky-100 border border-sky-200 text-sky-800' },
    { label: 'Optimal Path', color: 'bg-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5 px-4 rounded-2xl bg-white/95 border border-slate-200/90 backdrop-blur-xl text-xs shadow-sm">
      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
        <span>Legend:</span>
      </span>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-[4px] flex items-center justify-center text-[10px] ${item.color}`}>
              {item.icon ? <item.icon className="w-2.5 h-2.5 fill-current" /> : item.label.includes('Mud') ? '~' : null}
            </span>
            <span className="text-slate-700 text-[11px] font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

