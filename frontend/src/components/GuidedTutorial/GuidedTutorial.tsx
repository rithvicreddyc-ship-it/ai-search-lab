import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  PlayCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { AlgorithmType } from '../../types';
import { NavTab } from '../Navbar';

interface GuidedTutorialProps {
  onLoadTutorialSetup: (presetId: string, alg: AlgorithmType) => void;
  onNavigate: (tab: NavTab) => void;
}

export const GuidedTutorial: React.FC<GuidedTutorialProps> = ({
  onLoadTutorialSetup,
  onNavigate,
}) => {
  const [activeLesson, setActiveLesson] = useState<number>(0);

  const lessons = [
    {
      title: 'Lesson 1: Anatomy of Classical State-Space Search',
      badge: 'Foundations',
      concept:
        'In classical AI, problem-solving is formulated as searching through a state space. Every state has transitions (actions), a cost model, and a goal test.',
      details: [
        'State Space: All valid configurations of the agent (e.g. coordinates (row, col) or graph nodes).',
        'Frontier (Open Set): Data structure holding all candidate states discovered but not yet expanded.',
        'Explored Set (Closed Set): States that have already been expanded, preventing infinite cycles.',
        'Parent Pointers: Backwards references used to reconstruct the final solution trajectory once the goal is discovered.'
      ],
      presetId: 'classic_labyrinth',
      algId: 'bfs' as AlgorithmType,
      actionText: 'Load Simple Maze with BFS',
      vivaTip: 'Always be prepared to explain the cycle prevention mechanism: without an explored set, graph search will loop indefinitely on cyclical graphs.'
    },
    {
      title: 'Lesson 2: BFS (Queue) vs DFS (Stack)',
      badge: 'Uninformed Search',
      concept:
        'Breadth-First Search uses a FIFO queue to expand nodes level-by-level, guaranteeing the shortest path on unit costs at the price of exponential memory O(b^d). Depth-First Search uses a LIFO stack to dive deep, requiring only linear memory O(bm) but risking huge suboptimal detours.',
      details: [
        'BFS expands circularly like a ripple in water. It is optimal only if all step costs are equal.',
        'DFS pursues the first branch to its deepest leaf before backtracking. It is never guaranteed to be optimal.',
        'Run both on the Classic Labyrinth to observe how BFS finds the direct exit while DFS wanders through dead ends.'
      ],
      presetId: 'classic_labyrinth',
      algId: 'dfs' as AlgorithmType,
      actionText: 'Experience DFS Meandering Trajectory',
      vivaTip: 'Why does BFS fail on graphs with step costs of 1 vs 10? Because BFS only counts the number of hops (edges), completely blind to edge weights.'
    },
    {
      title: 'Lesson 3: Why UCS (Dijkstra) is Optimal on Weighted Terrain',
      badge: 'Cost-Aware Search',
      concept:
        'When moving through mud, mountains, or toll roads, edge costs vary. Uniform Cost Search sorts the frontier by cumulative path cost g(n) instead of depth, ensuring that nodes with lowest true cost are expanded first.',
      details: [
        'Priority queue ordered by g(n) = sum of all step costs from start to n.',
        'Goal test MUST occur when the goal is popped from the priority queue, not when generated.',
        'In the Weighted Mud Swamp preset, BFS plows through expensive mud (cost 4.5) while UCS discovers the cheap detour (cost 1.0).'
      ],
      presetId: 'weighted_swamp',
      algId: 'ucs' as AlgorithmType,
      actionText: 'Load Weighted Swamp with UCS',
      vivaTip: 'Remember: UCS is Dijkstra’s algorithm applied to goal-directed search. It requires non-negative edge costs.'
    },
    {
      title: 'Lesson 4: Heuristics & A* Optimality',
      badge: 'Informed Search',
      concept:
        'A* Search combines the cumulative path cost g(n) from UCS with an estimated future distance h(n) from Greedy Best-First Search: f(n) = g(n) + h(n). This achieves optimal efficiency without wasting expansions in directions away from the goal.',
      details: [
        'f(n) = g(n) + h(n): estimated total cost of path through node n to the goal.',
        'If h(n) is admissible (never overestimates) and consistent, A* is guaranteed to be optimal.',
        'A* prunes huge swaths of the search space compared to uninformed UCS.'
      ],
      presetId: 'classic_labyrinth',
      algId: 'astar' as AlgorithmType,
      actionText: 'Load A* with Manhattan Heuristic',
      vivaTip: 'Explain what happens if h(n) = 0: A* becomes identical to Uniform Cost Search. If g(n) = 0, A* becomes Greedy Best-First Search.'
    },
    {
      title: 'Lesson 5: Overcoming Exponential Memory with IDA*',
      badge: 'Advanced Heuristics',
      concept:
        'Standard A* stores all open and closed nodes in RAM, rapidly exhausting memory on large problems. Iterative Deepening A* (IDA*) solves this by doing depth-first search bounded by an f-cost threshold, using only linear space O(d).',
      details: [
        'Initial threshold is set to h(start).',
        'Branches exceeding the current f-bound are pruned, and the minimum exceeded f-cost becomes the next bound.',
        'Generates iteration threshold updates during playback!'
      ],
      presetId: 'classic_labyrinth',
      algId: 'idastar' as AlgorithmType,
      actionText: 'Observe IDA* Threshold Iterations',
      vivaTip: 'The fundamental trade-off: IDA* uses minimal linear memory, but repeats computation across shallow depths in each iteration.'
    },
    {
      title: 'Lesson 6: Local Search & Hill Climbing Traps',
      badge: 'Local Search',
      concept:
        'Unlike pathfinding algorithms that keep an exploration frontier, Hill Climbing only keeps the single current state and greedily moves to the best neighbor. It uses constant O(1) memory, but is vulnerable to local minima, plateaus, and ridges.',
      details: [
        'Steepest descent: evaluates all immediate neighbors and picks the one minimizing distance to goal.',
        'When facing a U-shaped wall, Hill Climbing terminates at the concave local minimum because stepping back increases heuristic distance.',
        'Random restarts can help escape local optima.'
      ],
      presetId: 'local_optimum_trap',
      algId: 'hill_climbing' as AlgorithmType,
      actionText: 'Load U-Trap to see Hill Climbing Fail',
      vivaTip: 'Why does Hill Climbing fail even when a path exists? Because it has no memory or backtracking capability: it refuses moves that temporarily increase h(n).'
    }
  ];

  const current = lessons[activeLesson];

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="border-b border-lab-border/70 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-indigo-400" />
          <span>Interactive Guided Tutorial</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Master classical search algorithms through progressive, hands-on pedagogical lessons designed for university examinations.
        </p>
      </div>

      {/* Lesson Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {lessons.map((lesson, idx) => {
          const isActive = idx === activeLesson;
          return (
            <button
              key={idx}
              onClick={() => setActiveLesson(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-lab-panel/80 hover:bg-slate-800 text-slate-300 border border-lab-border/60'
              }`}
            >
              Lesson {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Lesson Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0b101e]/90 border border-lab-border/80 shadow-glass-card backdrop-blur-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-lab-border/70 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {current.badge}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1.5">{current.title}</h2>
          </div>

          <button
            onClick={() => {
              onLoadTutorialSetup(current.presetId, current.algId);
              onNavigate('lab');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow-indigo transition-all self-start sm:self-auto active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{current.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Concept Description */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050813] border border-lab-border/70 space-y-2 shadow-inner">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Core Theoretical Principle
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{current.concept}</p>
        </div>

        {/* Bullet Points */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Key Conceptual Mechanics:
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            {current.details.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#050813] border border-lab-border/60 shadow-inner"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Viva Key Tip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-1.5 shadow-inner">
          <span className="font-bold flex items-center gap-1.5 text-amber-300">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            University Viva Takeaway
          </span>
          <p>{current.vivaTip}</p>
        </div>
      </div>
    </div>
  );
};
