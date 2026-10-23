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
  FlaskConical,
  GitBranch,
  Layers,
  MapPin,
  Play,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
  Gift,
  Award,
  BookOpen,
  Users,
  HeartHandshake
} from 'lucide-react';
import { NavTab } from './Navbar';
import { AlgorithmType } from '../types';
import { runSearch } from '../api/client';
import { ArchitecturalStatusDashboard } from './ArchitecturalStatusDashboard';
import { HeroSearchGraphCanvas } from './HeroSearchGraphCanvas';

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

  // Auto-Cycle Demo State
  const [autoCycle, setAutoCycle] = useState<boolean>(true);
  const [nextCycleCountdown, setNextCycleCountdown] = useState<number | null>(null);
  const autoCycleRef = useRef<boolean>(true);
  const countdownTimerRef = useRef<number | null>(null);
  const cycleTimeoutRef = useRef<number | null>(null);

  // Algorithm category filter for clean, uncluttered browsing
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Uninformed' | 'Informed' | 'Local Search'>('all');

  const demoTimerRef = useRef<number | null>(null);
  const cycleAlgs: AlgorithmType[] = ['astar', 'bfs', 'greedy', 'dfs'];

  const demoMaze = {
    rows: 9,
    cols: 17,
    start: [1, 1],
    goal: [7, 15],
    walls: [
      // Outer borders
      ...Array.from({ length: 9 }).flatMap((_, r) => [[r, 0], [r, 16]]),
      ...Array.from({ length: 17 }).flatMap((_, c) => [[0, c], [8, c]]),
      // Labyrinth dividers with generous openings
      [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
      [2, 7], [3, 7], [5, 7], [6, 7], [7, 7],
      [1, 11], [2, 11], [3, 11], [4, 11], [6, 11], [7, 11]
    ]
  };

  const runHeroDemo = async (algToRun: AlgorithmType) => {
    setIsDemoRunning(true);
    setDemoStep(0);
    setDemoStats(null);
    setNextCycleCountdown(null);
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);

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

          // If autoCycle is enabled, schedule next algorithm after a brief inspection pause
          if (autoCycleRef.current) {
            setNextCycleCountdown(3);
            let rem = 3;
            countdownTimerRef.current = window.setInterval(() => {
              rem -= 1;
              if (rem <= 0) {
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                setNextCycleCountdown(null);
                setDemoAlg((prevAlg) => {
                  const nextIdx = (cycleAlgs.indexOf(prevAlg) + 1) % cycleAlgs.length;
                  const nextAlg = cycleAlgs[nextIdx];
                  runHeroDemo(nextAlg);
                  return nextAlg;
                });
              } else {
                setNextCycleCountdown(rem);
              }
            }, 750);
          }
        }
      }, 35);
    } catch (e) {
      setIsDemoRunning(false);
    }
  };

  useEffect(() => {
    autoCycleRef.current = autoCycle;
    if (!autoCycle) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setNextCycleCountdown(null);
    }
  }, [autoCycle]);

  useEffect(() => {
    // Auto-run A* on mount after 400ms
    const t = setTimeout(() => {
      runHeroDemo('astar');
    }, 400);
    return () => {
      clearTimeout(t);
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
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
      category: 'Uninformed' as const,
      complexity: 'Time: O(b^d) • Space: O(b^d)',
      highlight: 'Level-by-level FIFO queue traversal. Proven optimal for uniform unit-cost movement.',
      badgeColor: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
    },
    {
      id: 'dfs' as AlgorithmType,
      name: 'Depth-First Search (DFS)',
      category: 'Uninformed' as const,
      complexity: 'Time: O(b^m) • Space: O(b·m)',
      highlight: 'LIFO stack deep branch exploration. Linear spatial consumption, non-optimal paths.',
      badgeColor: 'bg-[#FAF5FF] text-[#6D28D9] border-[#DDD6FE]'
    },
    {
      id: 'ucs' as AlgorithmType,
      name: 'Uniform Cost Search (UCS / Dijkstra)',
      category: 'Uninformed' as const,
      complexity: 'Time: O(b^(1+C*/ε)) • Space: O(b^(1+C*/ε))',
      highlight: 'Min-priority queue ordered by g(n). Guaranteed optimal on arbitrary weighted graphs and swamps.',
      badgeColor: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
    },
    {
      id: 'greedy' as AlgorithmType,
      name: 'Greedy Best-First Search',
      category: 'Informed' as const,
      complexity: 'Time: O(b^m) worst • Space: O(b^m)',
      highlight: 'Guided purely by heuristic distance h(n) towards the goal. Highly accelerated, non-optimal.',
      badgeColor: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
    },
    {
      id: 'astar' as AlgorithmType,
      name: 'A* Search',
      category: 'Informed' as const,
      complexity: 'Time: O(b^d) worst • Space: O(b^d)',
      highlight: 'Evaluates f(n) = g(n) + h(n). Mathematically optimal and complete with admissible heuristics.',
      badgeColor: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]'
    },
    {
      id: 'idastar' as AlgorithmType,
      name: 'Iterative Deepening A* (IDA*)',
      category: 'Informed' as const,
      complexity: 'Time: O(b^d) • Space: O(d) Linear',
      highlight: 'Memory-bounded iterative f-cost cutoffs. Retains A* optimality within linear memory space.',
      badgeColor: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]'
    },
    {
      id: 'hill_climbing' as AlgorithmType,
      name: 'Hill Climbing',
      category: 'Local Search' as const,
      complexity: 'Time: O(∞) loops • Space: O(1) Constant',
      highlight: 'Steepest-descent local optimization. Evaluates sideways moves, plateau detection, and local minima.',
      badgeColor: 'bg-[#ECFEFF] text-[#0E7490] border-[#A5F3FC]'
    }
  ];

  const filteredAlgorithms = selectedCategory === 'all'
    ? algorithms
    : algorithms.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-24 pb-16">
      
      {/* Hero Section with Generous Whitespace, Graph Canvas & Airy Rhythm */}
      <section className="relative pt-10 pb-6 overflow-hidden">
        {/* Interactive AI Search Graph Mesh Canvas Background */}
        <HeroSearchGraphCanvas />

        {/* Soft Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-indigo-200/30 via-sky-200/25 to-amber-100/25 blur-[140px] pointer-events-none" />

        {/* Floating Academic Theoretical Badges in Hero Margins */}
        <div className="hidden lg:block pointer-events-none select-none">
          {/* Top-Left: A* Optimality */}
          <div className="absolute top-10 left-6 xl:left-14 animate-float-badge-1 z-20">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 border border-indigo-200 shadow-md shadow-indigo-500/10 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-indigo-950">
                f(n) = g(n) + h(n) • A* Search
              </span>
            </div>
          </div>

          {/* Top-Right: Consistency Proof */}
          <div className="absolute top-12 right-6 xl:right-14 animate-float-badge-2 z-20">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 border border-emerald-200 shadow-md shadow-emerald-500/10 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-mono font-bold text-emerald-950">
                h(n) ≤ c(n,a,n') + h(n') • Consistency
              </span>
            </div>
          </div>

          {/* Mid-Left: Linear Memory IDA* */}
          <div className="absolute top-64 left-4 xl:left-12 animate-float-badge-3 z-20">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 border border-purple-200 shadow-md shadow-purple-500/10 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-[11px] font-mono font-bold text-purple-950">
                O(b·d) Linear Memory • IDA* Engine
              </span>
            </div>
          </div>

          {/* Mid-Right: Pure Client-Side TS */}
          <div className="absolute top-68 right-4 xl:right-12 animate-float-badge-4 z-20">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 border border-amber-200 shadow-md shadow-amber-500/10 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-amber-950">
                Zero API Latency • 100% Free Engine
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-8 animate-fade-in-up">
          
          {/* Top Pill Badges with Pastel Aesthetic & Free-To-Use Banner */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF8F5]/90 border border-[#E8E2D5] text-slate-700 text-xs font-semibold shadow-2xs backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Artificial Intelligence Foundations</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-indigo-700">Search Algorithm Visualiser</span>
            </div>

            {/* 100% Free Web Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF8F2]/90 border border-[#DCF1E2] text-emerald-800 text-xs font-bold shadow-2xs backdrop-blur-sm">
              <Gift className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Free to Use Web Platform</span>
            </div>
          </div>

          {/* Main Headline with Relaxed Leading & Shimmering Gradient */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI Search Lab
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 mt-2 animate-gradient-flow">
                Interactive Search Algorithm Visualiser
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Explore classical state-space search algorithms with high-frequency step-by-step playback, real-time node inspections, empirical benchmarks, and viva defense guidance — completely free and open.
            </p>
          </div>

          {/* Spacious Action Buttons with Room to Breathe */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('lab')}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all hover-lift active:scale-98"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Full Search Lab</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => onNavigate('tutorial')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 font-semibold text-sm border border-indigo-200/90 shadow-2xs transition-all hover-lift ring-1 ring-indigo-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>16-Lesson Guided Tutorial</span>
            </button>

            <button
              onClick={() => onNavigate('experiments')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-emerald-700 font-semibold text-sm border border-emerald-200/90 shadow-2xs transition-all hover-lift ring-1 ring-emerald-50"
            >
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>8 Empirical Experiments</span>
            </button>

            <button
              onClick={() => onNavigate('compare')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 shadow-2xs transition-all hover-lift"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Compare Algorithms</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Hero Maze Preview - High-Radius Card */}
        <div className="max-w-4xl mx-auto px-4 mt-14 relative z-10">
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white/95 border border-slate-200/90 shadow-sm space-y-6 backdrop-blur-xl">
            
            {/* Header of Mini Preview */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Interactive Engine Demo
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-[#EFF8F2] px-2.5 py-0.5 rounded-full border border-[#DCF1E2]">
                  Free Client Engine
                </span>
                {nextCycleCountdown !== null && (
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 animate-pulse">
                    Next cycle in {nextCycleCountdown}s
                  </span>
                )}
              </div>

              {/* Demo Controls: Auto-Cycle Toggle + Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoCycle(!autoCycle)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    autoCycle
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                      : 'bg-[#FAF8F5] text-slate-500 border-[#EDE7DC]'
                  }`}
                  title="Toggle continuous auto-cycle playback across all 4 search algorithms"
                >
                  <span className={`w-2 h-2 rounded-full ${autoCycle ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                  <span>Auto-Cycle: {autoCycle ? 'ON' : 'OFF'}</span>
                </button>

                <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#EDE7DC]">
                  {(['astar', 'bfs', 'greedy', 'dfs'] as AlgorithmType[]).map((alg) => (
                    <button
                      key={alg}
                      onClick={() => {
                        setDemoAlg(alg);
                        runHeroDemo(alg);
                      }}
                      disabled={isDemoRunning}
                      className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                        demoAlg === alg
                          ? 'bg-white text-indigo-600 shadow-xs border border-slate-200 scale-105'
                          : 'text-slate-600 hover:text-slate-900'
                      } disabled:opacity-40`}
                    >
                      {alg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mini Grid Canvas with Generous Margin */}
            <div className="flex items-center justify-center p-6 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DC] overflow-x-auto shadow-inner">
              <div
                className="grid gap-[2.5px] p-3 bg-white rounded-2xl border border-slate-200 shadow-xs"
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

                    let cellClass = 'bg-slate-50 border border-slate-200/60 rounded-[4px]';
                    let innerContent: React.ReactNode = null;

                    if (isWall) {
                      cellClass = 'bg-slate-800 border border-slate-700 rounded-[4px]';
                    } else if (isStart) {
                      cellClass = 'relative bg-emerald-500 text-white font-bold glow-emerald rounded-[4px] shadow-sm';
                      innerContent = (
                        <>
                          <span className="absolute -inset-1 rounded-[6px] bg-emerald-400/40 animate-radar-wave pointer-events-none" />
                          <span className="relative z-10">S</span>
                        </>
                      );
                    } else if (isGoal) {
                      cellClass = 'relative bg-rose-500 text-white font-bold glow-rose rounded-[4px] shadow-sm';
                      innerContent = (
                        <>
                          <span className="absolute -inset-1 rounded-[6px] bg-rose-400/40 animate-radar-wave pointer-events-none" />
                          <span className="relative z-10">G</span>
                        </>
                      );
                    } else if (isPath) {
                      cellClass = 'bg-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400 rounded-[4px] animate-path-pulse shadow-xs';
                    } else if (isActive) {
                      cellClass = 'bg-amber-400 font-bold ring-2 ring-amber-300 animate-pulse rounded-[4px] shadow-xs';
                    } else if (isFrontier) {
                      cellClass = 'bg-amber-100 border border-amber-300 text-amber-900 animate-frontier-pulse rounded-[4px]';
                    } else if (isExplored) {
                      cellClass = 'bg-sky-100 border border-sky-200 text-sky-800 rounded-[4px]';
                    }

                    return (
                      <div
                        key={coordStr}
                        className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] ${cellClass}`}
                      >
                        {innerContent || (isStart ? 'S' : isGoal ? 'G' : null)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Demo Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600 px-2 pt-1">
              <div className="flex items-center gap-3">
                <span>
                  Step: <strong className="text-slate-900">{demoStep}</strong> / {demoEvents.length}
                </span>
                {demoStats && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>
                      Expanded: <strong className="text-indigo-600">{demoStats.expanded}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>
                      Path Cost: <strong className="text-emerald-600">{demoStats.cost}</strong>
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={() => runHeroDemo(demoAlg)}
                disabled={isDemoRunning}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Run {demoAlg.toUpperCase()}</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Architectural Status Dashboard from the Screenshot (Attendance & Activity) */}
      <section className="relative z-10">
        <ArchitecturalStatusDashboard />
      </section>

      {/* Feature Highlights Grid - De-clumped with Generous Padding */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FAF8F5] text-slate-600 border border-[#EDE7DC]">
            Architectural Highlights
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Academic Rigor & Zero Latency
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Cleanly designed educational architecture with ample whitespace, modular components, and no paywalls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#EBE4D5] hover:border-indigo-400 transition-all hover-lift shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E0D7C5] flex items-center justify-center text-indigo-600 shadow-2xs">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">7 Classical AI Algorithms</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Implements BFS, DFS, Uniform Cost Search, Greedy Best-First, A*, IDA*, and Hill Climbing with genuine state-space exploration and non-negative cost guarantees.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#EBE4D5] hover:border-violet-400 transition-all hover-lift shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E0D7C5] flex items-center justify-center text-violet-600 shadow-2xs">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Step-by-Step Replay Engine</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Complete playback controls: step forward, backward, pause, scrub timeline, and inspect frontier, explored set, and real-time g(n), h(n), and f(n) values.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#EBE4D5] hover:border-emerald-400 transition-all hover-lift shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E0D7C5] flex items-center justify-center text-emerald-600 shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Grid & Graph Dual Editors</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Draw obstacles, paint mud terrain costs, toggle 4-dir and 8-dir diagonal moves, or switch to an interactive graph editor featuring the classic Romania road map.
            </p>
          </div>

        </div>
      </section>

      {/* Supported Algorithms Showcase - Uncluttered with Category Filter & Free Space */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FAF8F5] text-slate-600 border border-[#EDE7DC]">
              Core Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Supported AI Search Algorithms
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Filter and explore the theoretical and empirical characteristics of each classical search strategy.
            </p>
          </div>

          {/* Clean Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#EDE7DC]">
            {(['all', 'Uninformed', 'Informed', 'Local Search'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All (7)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Spacious Algorithm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlgorithms.map((alg) => (
            <div
              key={alg.id}
              className="p-7 rounded-3xl border border-slate-200/90 bg-white/95 hover:border-indigo-400 space-y-4 transition-all hover-lift shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${alg.badgeColor}`}>
                    {alg.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{alg.complexity.split('•')[0]}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{alg.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{alg.highlight}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">100% Free Access</span>
                <button
                  onClick={() => onNavigate('lab')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <span>Launch in Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free-To-Use Web Architecture Guarantee Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 sm:p-10 rounded-[2.25rem] bg-[#FAF8F5] border border-[#EBE4D5] shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF8F2] border border-[#DCF1E2] text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Cost • Free Open-Access Web Tool</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Created for Students, Researchers, & Educators Everywhere
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                AI Search Lab will always be completely free to use. There are no logins, no API quotas, no watermarks locking exports, and no premium gates. Every maze generator, graph editor, benchmark runner, and LaTeX exporter is immediately available right in your browser.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('tutorial')}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-xs shadow-2xs transition-all hover-lift"
              >
                Start Free Tutorial
              </button>
              <button
                onClick={() => onNavigate('lab')}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all hover-lift"
              >
                Open Free Lab
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Objectives & Viva Readiness - De-clumped with Generous Padding */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 sm:p-10 rounded-[2.25rem] bg-white/95 border border-slate-200/90 shadow-sm space-y-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Built for Artificial Intelligence Foundations</h3>
              <p className="text-xs sm:text-sm text-slate-500">Designed to exceed university curriculum criteria and empower students during viva discussions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-700">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Separation of Concerns</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-performance TypeScript & Node search engine drives algorithms; React delivers deterministic step telemetry.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>No Fabricated Order</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Playback faithfully follows true priority queue / stack pops from the real search engine.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Admissibility & Consistency</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear mathematical explanations for Manhattan vs Euclidean under diagonal movement constraints.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Cost-Aware Terrain</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Weighted mud swamps ($4.5\times$ cost multiplier) prove when BFS fails to find optimal costs compared to UCS and A*.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Reproducible Benchmarks</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seeded automated experiments exportable to JSON, CSV, and LaTeX for formal lab reports.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D5] space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Interactive Viva Prep</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Curated oral examination questions on completeness, time/space Big-O, and heuristic pruning.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
