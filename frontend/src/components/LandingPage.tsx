import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  GitBranch,
  Layers,
  MapPin,
  Play,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { NavTab } from './Navbar';
import { AlgorithmType } from '../types';
import { runSearch } from '../api/client';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Live Hero Mini Visualizer State
  const [demoAlg, setDemoAlg] = useState<AlgorithmType>('astar');
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demoEvents, setDemoEvents] = useState<any[]>([]);
  const [demoPath, setDemoPath] = useState<any[]>([]);
  const [demoStats, setDemoStats] = useState<{ cost: number; expanded: number } | null>(null);

  const demoTimerRef = useRef<number | null>(null);

  const demoMaze = {
    rows: 9,
    cols: 17,
    start: [1, 1],
    goal: [7, 15],
    walls: [
      // Outer borders
      ...Array.from({ length: 9 }).flatMap((_, r) => [[r, 0], [r, 16]]),
      ...Array.from({ length: 17 }).flatMap((_, c) => [[0, c], [8, c]]),
      // Labyrinth dividers with openings
      [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
      [2, 7], [3, 7], [5, 7], [6, 7], [7, 7],
      [1, 11], [2, 11], [3, 11], [4, 11], [6, 11], [7, 11]
    ]
  };

  const runHeroDemo = async (algToRun: AlgorithmType) => {
    setIsDemoRunning(true);
    setDemoStep(0);
    setDemoStats(null);
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);

    try {
      const res = await runSearch({
        algorithm: algToRun,
        problem_type: 'grid',
        heuristic: 'manhattan',
        playback_events: true,
        grid: {
          rows: demoMaze.rows,
          cols: demoMaze.cols,
          start: demoMaze.start,
          goal: demoMaze.goal,
          walls: demoMaze.walls,
          terrain: {},
          diagonal_movement: false
        }
      });

      setDemoEvents(res.events);
      setDemoPath(res.path);
      setDemoStats({ cost: res.path_cost, expanded: res.nodes_expanded });

      // Playback loop
      let step = 0;
      demoTimerRef.current = window.setInterval(() => {
        step += 1;
        setDemoStep(step);
        if (step >= res.events.length) {
          if (demoTimerRef.current) clearInterval(demoTimerRef.current);
          setIsDemoRunning(false);
        }
      }, 35);
    } catch (e) {
      setIsDemoRunning(false);
    }
  };

  useEffect(() => {
    // Auto-run A* on mount after 500ms
    const t = setTimeout(() => {
      runHeroDemo('astar');
    }, 400);
    return () => {
      clearTimeout(t);
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    };
  }, []);

  // Compute visual sets for mini demo
  const frontierSet = new Set<string>();
  const exploredSet = new Set<string>();
  const pathSet = new Set<string>();
  let activeNode: [number, number] | null = null;

  if (demoEvents.length > 0 && demoStep > 0) {
    const slice = demoEvents.slice(0, demoStep);
    for (const evt of slice) {
      const coordStr = `${evt.node[0]},${evt.node[1]}`;
      if (evt.type === 'frontier_add' || evt.type === 'frontier_update') {
        frontierSet.add(coordStr);
      } else if (evt.type === 'visit' || evt.type === 'explored') {
        frontierSet.delete(coordStr);
        exploredSet.add(coordStr);
        activeNode = evt.node;
      } else if (evt.type === 'path_found') {
        for (const p of demoPath) {
          pathSet.add(`${p[0]},${p[1]}`);
        }
      }
    }
  }

  const wallSet = new Set(demoMaze.walls.map((w) => `${w[0]},${w[1]}`));

  const algorithms = [
    {
      id: 'bfs' as AlgorithmType,
      name: 'Breadth-First Search (BFS)',
      category: 'Uninformed',
      complexity: 'Time: O(b^d) • Space: O(b^d)',
      highlight: 'Level-by-level queue traversal. Optimal on uniform cost.',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
    },
    {
      id: 'dfs' as AlgorithmType,
      name: 'Depth-First Search (DFS)',
      category: 'Uninformed',
      complexity: 'Time: O(b^m) • Space: O(b·m)',
      highlight: 'LIFO stack exploration. Minimal memory, non-optimal.',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
    },
    {
      id: 'ucs' as AlgorithmType,
      name: 'Uniform Cost Search (UCS)',
      category: 'Uninformed',
      complexity: 'Time: O(b^(1+C*/ε)) • Space: O(b^(1+C*/ε))',
      highlight: 'Priority queue by g(n). Guaranteed optimal on weighted graphs.',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'greedy' as AlgorithmType,
      name: 'Greedy Best-First Search',
      category: 'Informed',
      complexity: 'Time: O(b^m) worst • Space: O(b^m)',
      highlight: 'Heuristic-guided by h(n). Extremely rapid, non-optimal.',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    {
      id: 'astar' as AlgorithmType,
      name: 'A* Search',
      category: 'Informed',
      complexity: 'Time: O(b^d) worst • Space: O(b^d)',
      highlight: 'Evaluation f(n) = g(n) + h(n). Optimal with admissible heuristics.',
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'idastar' as AlgorithmType,
      name: 'Iterative Deepening A* (IDA*)',
      category: 'Informed',
      complexity: 'Time: O(b^d) • Space: O(d) Linear',
      highlight: 'Iterative f-cost bounding. Eliminates exponential memory.',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    },
    {
      id: 'hill_climbing' as AlgorithmType,
      name: 'Hill Climbing',
      category: 'Local Search',
      complexity: 'Time: O(∞) loops • Space: O(1) Constant',
      highlight: 'Local steepest descent. Detects local optima & plateaus.',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-8 pb-4 overflow-hidden">
        {/* Ambient Cosmic Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-sm shadow-indigo-500/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="font-semibold">CSE276 • Artificial Intelligence Foundations</span>
            <span className="text-indigo-400/60">•</span>
            <span>University Project 21</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            AI Search Lab
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 mt-2">
              Interactive Search Algorithm Visualiser
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Construct custom mazes and weighted graphs, execute 7 classical AI search algorithms with genuine step-by-step state inspection, benchmark performance metrics, and prepare for viva examinations.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('lab')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Full Search Lab</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => onNavigate('compare')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium text-sm border border-slate-700/80 transition-colors"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Compare Algorithms</span>
            </button>

            <button
              onClick={() => onNavigate('explorer')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium text-sm border border-slate-700/80 transition-colors"
            >
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>Algorithm Explorer & Viva</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Hero Maze Preview */}
        <div className="max-w-4xl mx-auto px-4 mt-10">
          <div className="p-5 rounded-3xl bg-[#0b0f19]/90 border border-indigo-500/25 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Interactive Engine Demo
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  FastAPI Backend Active
                </span>
              </div>

              {/* Demo Algorithm Switcher */}
              <div className="flex items-center gap-1.5 bg-[#070a12] p-1 rounded-xl border border-slate-800">
                {(['astar', 'bfs', 'greedy', 'dfs'] as AlgorithmType[]).map((alg) => (
                  <button
                    key={alg}
                    onClick={() => {
                      setDemoAlg(alg);
                      runHeroDemo(alg);
                    }}
                    disabled={isDemoRunning}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                      demoAlg === alg
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    } disabled:opacity-40`}
                  >
                    {alg}
                  </button>
                ))}
              </div>
            </div>

            {/* Mini Grid Canvas */}
            <div className="flex items-center justify-center p-3 rounded-2xl bg-[#06080e] border border-slate-800/80 overflow-x-auto">
              <div
                className="grid gap-[2px] p-2 bg-[#04060a] rounded-xl border border-slate-800"
                style={{
                  gridTemplateRows: `repeat(${demoMaze.rows}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${demoMaze.cols}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: demoMaze.rows }).map((_, r) =>
                  Array.from({ length: demoMaze.cols }).map((_, c) => {
                    const coordStr = `${r},${c}`;
                    const isStart = demoMaze.start[0] === r && demoMaze.start[1] === c;
                    const isGoal = demoMaze.goal[0] === r && demoMaze.goal[1] === c;
                    const isWall = wallSet.has(coordStr);
                    const isPath = pathSet.has(coordStr);
                    const isActive = activeNode && activeNode[0] === r && activeNode[1] === c;
                    const isFrontier = frontierSet.has(coordStr);
                    const isExplored = exploredSet.has(coordStr);

                    let cellClass = 'bg-[#0f1422] border border-slate-900';
                    if (isWall) {
                      cellClass = 'bg-slate-700/80 border border-slate-600/60 rounded-sm';
                    } else if (isStart) {
                      cellClass = 'bg-emerald-500 text-slate-950 font-bold glow-emerald rounded-sm';
                    } else if (isGoal) {
                      cellClass = 'bg-rose-500 text-white font-bold glow-rose rounded-sm';
                    } else if (isPath) {
                      cellClass = 'bg-emerald-400 font-bold glow-emerald ring-1 ring-emerald-300 rounded-sm';
                    } else if (isActive) {
                      cellClass = 'bg-amber-400 font-bold ring-2 ring-amber-300 animate-pulse rounded-sm';
                    } else if (isFrontier) {
                      cellClass = 'bg-cyan-500/35 border border-cyan-400/60 animate-node-pulse rounded-sm';
                    } else if (isExplored) {
                      cellClass = 'bg-indigo-600/35 border border-indigo-500/40 rounded-sm';
                    }

                    return (
                      <div
                        key={coordStr}
                        className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] ${cellClass}`}
                      >
                        {isStart ? 'S' : isGoal ? 'G' : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Demo Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300 px-2">
              <div className="flex items-center gap-3">
                <span>
                  Step: <strong className="text-white">{demoStep}</strong> / {demoEvents.length}
                </span>
                {demoStats && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>
                      Expanded: <strong className="text-cyan-400">{demoStats.expanded}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>
                      Path Cost: <strong className="text-emerald-400">{demoStats.cost}</strong>
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => runHeroDemo(demoAlg)}
                disabled={isDemoRunning}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-sans font-medium transition-all disabled:opacity-40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-Run {demoAlg.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d121d]/90 border border-lab-border hover:border-indigo-500/40 transition-all shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-white">7 Classical AI Algorithms</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Implements BFS, DFS, Uniform Cost Search, Greedy Best-First, A*, IDA*, and Hill Climbing with genuine state-space exploration and non-negative cost guarantees.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d121d]/90 border border-lab-border hover:border-violet-500/40 transition-all shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-white">Step-by-Step Replay Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete playback controls: step forward, backward, pause, scrub timeline, and inspect frontier, explored set, and real-time g(n), h(n), and f(n) values.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d121d]/90 border border-lab-border hover:border-cyan-500/40 transition-all shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-white">Grid & Graph Dual Editors</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Draw obstacles, paint mud terrain costs, toggle 4-dir and 8-dir diagonal moves, or switch to an interactive graph editor featuring the classic Romania road map.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Algorithms Showcase */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Supported AI Search Algorithms</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Every algorithm shares a unified problem model while retaining its distinctive exploration mechanics.
            </p>
          </div>
          <button
            onClick={() => onNavigate('explorer')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View detailed pseudocode & viva prep</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {algorithms.map((alg) => (
            <div
              key={alg.id}
              className="p-5 rounded-2xl border border-lab-border/80 bg-[#0d121d]/80 hover:bg-[#111726] hover:border-indigo-500/40 space-y-3 transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${alg.badgeColor}`}>
                  {alg.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{alg.complexity.split('•')[0]}</span>
              </div>
              <h3 className="font-bold text-sm text-white">{alg.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{alg.highlight}</p>
              <button
                onClick={() => onNavigate('lab')}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 pt-1"
              >
                <span>Launch in workspace</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Objectives & Viva Readiness */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0d121d] via-[#111728] to-[#151c30] border border-lab-border shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Built for CSE276 Project 21 Evaluation</h3>
              <p className="text-xs text-slate-400">Designed to exceed academic criteria and empower students during viva discussions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Separation of Concerns:</strong> FastAPI backend drives algorithms; React delivers high-frequency rendering.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Fabricated Order:</strong> Playback faithfully follows true priority queue / stack pops from the backend.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Admissibility & Consistency:</strong> Clear mathematical explanations for Manhattan vs Euclidean on diagonal movement.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Cost-Aware Terrain:</strong> Weighted mud swamps prove when BFS fails to find optimal path costs compared to UCS and A*.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Reproducible Benchmarks:</strong> Seeded automated experiments exportable to JSON and CSV for formal lab reports.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Interactive Viva Prep:</strong> Curated oral examination questions on completeness, time/space Big-O, and heuristic pruning.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
