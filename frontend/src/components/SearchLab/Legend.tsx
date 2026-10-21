import React from 'react';
import { Flag, Target, Mountain, Compass, CheckCircle2, Navigation } from 'lucide-react';

export const Legend: React.FC = () => {
  const items = [
    { label: 'Start State', color: 'bg-emerald-500 text-white', icon: Flag },
    { label: 'Goal State', color: 'bg-rose-500 text-white', icon: Target },
    { label: 'Wall Obstacle', color: 'bg-slate-700 text-slate-300', icon: Mountain },
    { label: 'Mud Swamp (Cost 4x)', color: 'bg-amber-600/70 border border-amber-500/80 text-amber-200' },
    { label: 'Current State', color: 'bg-amber-400 text-slate-900 ring-2 ring-amber-300 shadow-amber-400/50 shadow-md font-bold' },
    { label: 'Frontier (Queue/PQ)', color: 'bg-cyan-500/30 border border-cyan-400 text-cyan-300' },
    { label: 'Explored (Closed)', color: 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300' },
    { label: 'Solution Path', color: 'bg-emerald-400 text-slate-950 font-bold ring-1 ring-emerald-300' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 px-3 rounded-xl bg-lab-panel/60 border border-lab-border/60 text-xs">
      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Legend:</span>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${item.color}`}>
            {item.icon ? <item.icon className="w-2.5 h-2.5" /> : null}
          </span>
          <span className="text-slate-300 text-[11px]">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
