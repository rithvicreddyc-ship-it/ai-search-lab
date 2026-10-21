import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const HeuristicsLab: React.FC = () => {
  const [startPos, setStartPos] = useState<[number, number]>([2, 3]);
  const [goalPos, setGoalPos] = useState<[number, number]>([12, 18]);

  const dx = Math.abs(startPos[0] - goalPos[0]);
  const dy = Math.abs(startPos[1] - goalPos[1]);

  const manhattan = dx + dy;
  const euclidean = Math.hypot(dx, dy);
  const octile = Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  const chebyshev = Math.max(dx, dy);

  const heuristicsInfo = [
    {
      id: 'manhattan',
      name: 'Manhattan Distance (L1 Norm)',
      formula: 'h(n) = |r1 - r2| + |c1 - c2|',
      calculated: manhattan.toFixed(2),
      is4DirAdmissible: true,
      is8DirAdmissible: false,
      notes: 'Optimal & consistent for 4-directional unit grids. Violates admissibility if diagonal moves are permitted.'
    },
    {
      id: 'euclidean',
      name: 'Euclidean Distance (L2 Norm)',
      formula: 'h(n) = √((r1 - r2)² + (c1 - c2)²)',
      calculated: euclidean.toFixed(2),
      is4DirAdmissible: true,
      is8DirAdmissible: true,
      notes: 'Strictly admissible for both 4-way and 8-way movement, but weaker than Manhattan on 4-way unit grids (expands more nodes).'
    },
    {
      id: 'octile',
      name: 'Octile Distance (Diagonal Metric)',
      formula: 'h(n) = max(dx, dy) + (√2 - 1)·min(dx, dy)',
      calculated: octile.toFixed(2),
      is4DirAdmissible: false,
      is8DirAdmissible: true,
      notes: 'The exact admissible and consistent heuristic for 8-directional grids where diagonal step cost = √2 ≈ 1.414.'
    },
    {
      id: 'chebyshev',
      name: 'Chebyshev Distance (L∞ Norm)',
      formula: 'h(n) = max(|r1 - r2|, |c1 - c2|)',
      calculated: chebyshev.toFixed(2),
      is4DirAdmissible: false,
      is8DirAdmissible: true,
      notes: 'Admissible only if diagonal movement cost equals orthogonal cost (cost = 1.0, e.g. King moves in chess).'
    },
    {
      id: 'zero',
      name: 'Zero Heuristic h(n) = 0',
      formula: 'h(n) = 0.0',
      calculated: '0.00',
      is4DirAdmissible: true,
      is8DirAdmissible: true,
      notes: 'Trivially admissible. Converts A* directly into Dijkstra / Uniform Cost Search.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="border-b border-lab-border/70 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-violet-400" />
          <span>Heuristics Laboratory & Admissibility Sandbox</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore mathematical heuristic formulas, verify admissibility conditions, and observe how heuristic choice dictates A* pruning efficiency.
        </p>
      </div>

      {/* Interactive Coordinate Probe */}
      <div className="p-5 rounded-2xl bg-lab-panel/90 border border-lab-border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Interactive Node Distance Probe
          </span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">Start:</span>
              <span>({startPos[0]}, {startPos[1]})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-semibold">Goal:</span>
              <span>({goalPos[0]}, {goalPos[1]})</span>
            </div>
            <div className="text-slate-400">
              Δr = {dx}, Δc = {dy}
            </div>
          </div>
        </div>

        {/* Sliders to test coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Start Row: {startPos[0]}</span>
              <span>Start Col: {startPos[1]}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="25"
                value={startPos[0]}
                onChange={(e) => setStartPos([Number(e.target.value), startPos[1]])}
                className="w-full accent-emerald-500"
              />
              <input
                type="range"
                min="0"
                max="35"
                value={startPos[1]}
                onChange={(e) => setStartPos([startPos[0], Number(e.target.value)])}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Goal Row: {goalPos[0]}</span>
              <span>Goal Col: {goalPos[1]}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="25"
                value={goalPos[0]}
                onChange={(e) => setGoalPos([Number(e.target.value), goalPos[1]])}
                className="w-full accent-rose-500"
              />
              <input
                type="range"
                min="0"
                max="35"
                value={goalPos[1]}
                onChange={(e) => setGoalPos([goalPos[0], Number(e.target.value)])}
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Calculated Heuristic Values Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
          {heuristicsInfo.map((h) => (
            <div
              key={h.id}
              className="p-3.5 rounded-xl bg-[#0b0e17] border border-lab-border/70 space-y-1.5"
            >
              <div className="text-[11px] font-bold text-white truncate">{h.name.split('(')[0]}</div>
              <div className="text-xl font-bold font-mono text-cyan-300">{h.calculated}</div>
              <div className="text-[10px] font-mono text-slate-400">{h.formula}</div>
              <div className="pt-1.5 border-t border-slate-800 space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span>4-Way Admissible:</span>
                  <span className={h.is4DirAdmissible ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {h.is4DirAdmissible ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>8-Way Admissible:</span>
                  <span className={h.is8DirAdmissible ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {h.is8DirAdmissible ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Explanations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admissibility Explained */}
        <div className="p-6 rounded-2xl bg-lab-panel/90 border border-lab-border space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Admissibility: Never Overestimating Cost
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A heuristic <code className="text-indigo-300 font-mono">h(n)</code> is <strong>admissible</strong> if it never overestimates the true lowest cost <code className="text-indigo-300 font-mono">h*(n)</code> to reach the goal:
          </p>
          <div className="p-3 rounded-lg bg-[#0b0e17] border border-lab-border/70 text-center font-mono text-xs text-amber-300">
            0 ≤ h(n) ≤ h*(n)  for all nodes n
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Viva Key Point:</strong> In Tree Search, admissibility alone guarantees that A* discovers an optimal path. If a heuristic overestimates by even 0.01, A* can prune an optimal branch in favor of a seemingly shorter one.
          </p>
        </div>

        {/* Consistency / Monotonicity Explained */}
        <div className="p-6 rounded-2xl bg-lab-panel/90 border border-lab-border space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Consistency (Monotonicity): The Triangle Inequality
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A heuristic is <strong>consistent</strong> if for every node <code className="text-indigo-300 font-mono">n</code> and successor <code className="text-indigo-300 font-mono">n'</code> generated by action <code className="text-indigo-300 font-mono">a</code>:
          </p>
          <div className="p-3 rounded-lg bg-[#0b0e17] border border-lab-border/70 text-center font-mono text-xs text-cyan-300">
            h(n) ≤ c(n, a, n') + h(n')
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Viva Key Point:</strong> Consistency implies admissibility. In Graph Search, consistency guarantees that when any node is selected from the priority queue and expanded, its path cost is already strictly optimal, eliminating the need to reopen closed nodes.
          </p>
        </div>
      </div>
    </div>
  );
};
