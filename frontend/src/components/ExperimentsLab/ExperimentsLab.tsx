import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Download,
  FileSpreadsheet,
  FileJson,
  Printer,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Award,
  Database,
  Clock,
  Layers,
  BarChart2,
  TrendingDown,
  Copy,
  Check,
  Zap,
  Sliders,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import {
  AlgorithmType,
  ExperimentReport,
  GridState,
  GraphState,
  HeuristicType,
  LabLaunchConfig,
  ProblemType,
} from '../../types';
import { runExperiment } from '../../api/client';
import { exportComparisonToCsv, exportToJson } from '../../utils/export';
import {
  PRESET_CLASSIC_LABYRINTH,
  PRESET_LOCAL_OPTIMUM_TRAP,
  PRESET_ROMANIA,
  PRESET_UNREACHABLE_FORTRESS,
  PRESET_WEIGHTED_SWAMP,
} from '../../engine/presets';

interface ExperimentsLabProps {
  onLoadExperimentInLab?: (config: LabLaunchConfig) => void;
}

export const ExperimentsLab: React.FC<ExperimentsLabProps> = ({ onLoadExperimentInLab }) => {
  const experimentPresets = [
    {
      id: 'open_vs_obstacle',
      title: 'Experiment 1: Obstacle Density & Maze Topology vs Search Complexity',
      subtitle: 'Contrasts blind BFS vs informed A* in an obstacle-dense labyrinth.',
      category: 'Search Complexity',
      presetId: 'classic_labyrinth',
      problemType: 'grid' as ProblemType,
    },
    {
      id: 'weighted_terrain_tradeoff',
      title: 'Experiment 2: Optimality on Non-Uniform Weighted Terrain',
      subtitle: 'Demonstrates why BFS fails on mud swamps (4.5x) while UCS and A* find optimal detours.',
      category: 'Cost Optimality',
      presetId: 'weighted_swamp',
      problemType: 'grid' as ProblemType,
    },
    {
      id: 'heuristic_comparison',
      title: 'Experiment 3: Heuristic Pruning Power & Metric Dominance Benchmark',
      subtitle: 'Benchmarks Zero Heuristic vs Euclidean (L2) vs Manhattan (L1) on the exact same maze.',
      category: 'Heuristic Dominance',
      presetId: 'classic_labyrinth',
      problemType: 'grid' as ProblemType,
    },
    {
      id: 'memory_bounded_scaling',
      title: 'Experiment 4: Spatial Memory Footprint: A* vs IDA*',
      subtitle: 'Contrasts the exponential open-set memory of standard A* with IDA* linear memory O(d).',
      category: 'Memory Scaling',
      presetId: 'classic_labyrinth',
      problemType: 'grid' as ProblemType,
    },
    {
      id: 'local_optimum_trap',
      title: 'Experiment 5: Local Search Fragility: Hill Climbing Trapping',
      subtitle: 'Tests steepest descent getting stuck in concave U-traps and evaluates sideways moves.',
      category: 'Local Search',
      presetId: 'local_optimum_trap',
      problemType: 'grid' as ProblemType,
    },
    {
      id: 'romania_graph_benchmark',
      title: 'Experiment 6: Graph Topology Benchmark: Romania Road Network',
      subtitle: 'The canonical 20-city AIMA benchmark routing Arad to Bucharest with straight-line distance.',
      category: 'Graph Networks',
      presetId: 'romania',
      problemType: 'graph' as ProblemType,
    },
    {
      id: 'unreachable_completeness',
      title: 'Experiment 7: Completeness Verification & Unreachable Goal Proof',
      subtitle: 'Verifies safe frontier exhaustion when the goal is sealed inside a fortress.',
      category: 'Completeness',
      presetId: 'unreachable_fortress',
      problemType: 'grid' as ProblemType,
    },
    {
      id: 'diagonal_connectivity',
      title: 'Experiment 8: Grid Connectivity: 4-Way vs 8-Way Diagonal Movement',
      subtitle: 'Analyzes Euclidean shortcut cost savings (sqrt(2) vs 2) and Octile heuristic dominance.',
      category: 'Topology & Angles',
      presetId: 'classic_labyrinth',
      problemType: 'grid' as ProblemType,
    },
  ];

  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('weighted_terrain_tradeoff');
  const [seed, setSeed] = useState<number>(42);
  const [report, setReport] = useState<ExperimentReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeChartMetric, setActiveChartMetric] = useState<'nodes_expanded' | 'max_frontier_size' | 'path_cost' | 'execution_time_ms'>('nodes_expanded');
  const [copiedLatex, setCopiedLatex] = useState<boolean>(false);

  // Custom Experiment Designer State
  const [customProblemType, setCustomProblemType] = useState<ProblemType>('grid');
  const [customTopology, setCustomTopology] = useState<string>('classic_labyrinth');
  const [customAlgorithms, setCustomAlgorithms] = useState<AlgorithmType[]>([
    'bfs',
    'ucs',
    'greedy',
    'astar',
  ]);
  const [customHeuristic, setCustomHeuristic] = useState<HeuristicType>('manhattan');
  const [customDiagonal, setCustomDiagonal] = useState<boolean>(false);
  const [customMaxSideways, setCustomMaxSideways] = useState<number>(25);
  const [customAllowRestarts, setCustomAllowRestarts] = useState<boolean>(false);

  const allAvailableAlgorithms: { id: AlgorithmType; label: string }[] = [
    { id: 'bfs', label: 'BFS' },
    { id: 'dfs', label: 'DFS' },
    { id: 'ucs', label: 'UCS (Dijkstra)' },
    { id: 'greedy', label: 'Greedy Best-First' },
    { id: 'astar', label: 'A* Search' },
    { id: 'idastar', label: 'IDA*' },
    { id: 'hill_climbing', label: 'Hill Climbing' },
  ];

  const toggleCustomAlgorithm = (id: AlgorithmType) => {
    if (customAlgorithms.includes(id)) {
      if (customAlgorithms.length <= 1) {
        alert('Please keep at least 1 algorithm selected.');
        return;
      }
      setCustomAlgorithms(customAlgorithms.filter((a) => a !== id));
    } else {
      setCustomAlgorithms([...customAlgorithms, id]);
    }
  };

  const handleRunPresetExperiment = async (presetIdToRun?: string) => {
    const pId = presetIdToRun || selectedPresetId;
    setIsLoading(true);
    try {
      const data = await runExperiment({
        preset_id: pId,
        seed: seed,
      });
      setReport(data);
    } catch (err: any) {
      alert(`Experiment failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCustomExperiment = async () => {
    setIsLoading(true);
    try {
      let gridToUse: GridState = PRESET_CLASSIC_LABYRINTH;
      if (customTopology === 'weighted_swamp') gridToUse = PRESET_WEIGHTED_SWAMP;
      else if (customTopology === 'local_optimum_trap') gridToUse = PRESET_LOCAL_OPTIMUM_TRAP;
      else if (customTopology === 'unreachable_fortress') gridToUse = PRESET_UNREACHABLE_FORTRESS;

      gridToUse = { ...gridToUse, diagonal_movement: customDiagonal };

      const data = await runExperiment({
        preset_id: 'custom',
        algorithms: customAlgorithms,
        seed: seed,
        options: {
          problemType: customProblemType,
          customGrid: gridToUse,
          customGraph: PRESET_ROMANIA,
          heuristic: customHeuristic,
          diagonal: customDiagonal,
          maxSideways: customMaxSideways,
          allowRestarts: customAllowRestarts,
        },
      });
      setReport(data);
    } catch (err: any) {
      alert(`Custom Benchmark failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRunPresetExperiment('weighted_terrain_tradeoff');
  }, []);

  const handleCopyLatex = () => {
    if (report?.latex_table) {
      navigator.clipboard.writeText(report.latex_table);
      setCopiedLatex(true);
      setTimeout(() => setCopiedLatex(false), 2500);
    }
  };

  const chartColors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  const chartData = (report?.results || []).map((r, i) => ({
    name: r.name,
    nodes_expanded: r.nodes_expanded,
    max_frontier_size: r.max_frontier_size,
    path_cost: r.solution_found ? r.path_cost : 0,
    execution_time_ms: r.execution_time_ms,
    solved: r.solution_found,
  }));

  // Identify optimal and best performers
  const successfulResults = (report?.results || []).filter((r) => r.solution_found);
  const minCost = successfulResults.length > 0 ? Math.min(...successfulResults.map((r) => r.path_cost)) : null;
  const minExpanded = successfulResults.length > 0 ? Math.min(...successfulResults.map((r) => r.nodes_expanded)) : null;
  const minFrontier = (report?.results || []).length > 0 ? Math.min(...(report?.results || []).map((r) => r.max_frontier_size)) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 py-2 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/80 pb-6 print:hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFF8F2] text-emerald-800 border border-[#DCF1E2]">
              100% Free Open Academic Web
            </span>
            <span className="text-xs text-slate-500 font-mono">Academic Benchmark Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <FlaskConical className="w-6 h-6 shrink-0" />
            </div>
            <span>AI Search Experimental Research & Benchmarking Suite</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Reproducible empirical benchmarks measuring computational complexity, memory scaling, heuristic dominance, and formal completeness proofs for university research submission.
          </p>
        </div>

        {report && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => exportComparisonToCsv(report.results, `${report.title.replace(/\s+/g, '_')}.csv`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => exportToJson(report, `${report.title.replace(/\s+/g, '_')}.json`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs transition-colors"
            >
              <FileJson className="w-3.5 h-3.5 text-sky-600" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleCopyLatex}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs transition-colors"
            >
              {copiedLatex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">LaTeX Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-600" />
                  <span>Copy LaTeX Table</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-md shadow-indigo-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Mode Toggle: Standard Benchmarks vs Custom Workbench */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'presets'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Standard Academic Benchmarks (8 Suites)</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'custom'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Custom Empirical Benchmark Designer</span>
        </button>
      </div>

      {/* Preset Benchmarks Grid */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
          {experimentPresets.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  handleRunPresetExperiment(preset.id);
                }}
                className={`p-4 rounded-3xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-2 border-indigo-600 text-slate-900 shadow-md ring-2 ring-indigo-100'
                    : 'bg-white/90 hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                    {preset.category}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                    {preset.title.split(':')[1]?.trim() || preset.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {preset.subtitle}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Preset: {preset.presetId}</span>
                  <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                    Run <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Experiment Designer Workbench */}
      {activeTab === 'custom' && (
        <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card space-y-5 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Custom Empirical Benchmark Configuration Workbench</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Design custom state-space topologies, configure parameter bounds, and execute multi-algorithm benchmarks.
              </p>
            </div>
            <button
              onClick={handleRunCustomExperiment}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Executing Benchmark...' : 'Run Custom Benchmark'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Problem Type & Topology */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Environment Topology
              </label>
              <select
                value={customProblemType === 'graph' ? 'romania' : customTopology}
                onChange={(e) => {
                  if (e.target.value === 'romania') {
                    setCustomProblemType('graph');
                    setCustomTopology('romania');
                  } else {
                    setCustomProblemType('grid');
                    setCustomTopology(e.target.value);
                  }
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
              >
                <option value="classic_labyrinth">Grid: Classic Labyrinth (15x25)</option>
                <option value="weighted_swamp">Grid: Weighted Mud Swamp (4.5x)</option>
                <option value="local_optimum_trap">Grid: Concave U-Trap</option>
                <option value="unreachable_fortress">Grid: Unreachable Fortress</option>
                <option value="romania">Graph: Romania Road Map (20 Cities)</option>
              </select>
            </div>

            {/* Heuristic Metric */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Heuristic Metric
              </label>
              <select
                value={customHeuristic}
                onChange={(e) => setCustomHeuristic(e.target.value as HeuristicType)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
              >
                <option value="manhattan">Manhattan Distance (L1 Norm)</option>
                <option value="euclidean">Euclidean Distance (L2 Norm)</option>
                <option value="octile">Octile Distance (Diagonal Metric)</option>
                <option value="chebyshev">Chebyshev Distance (L-infinity)</option>
                <option value="zero">Zero Heuristic (Collapses to UCS)</option>
              </select>
            </div>

            {/* Diagonal Movement Toggle */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Grid Connectivity
              </label>
              <button
                type="button"
                onClick={() => setCustomDiagonal(!customDiagonal)}
                className={`w-full p-2.5 rounded-xl font-medium border text-left transition-colors flex items-center justify-between ${
                  customDiagonal
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>{customDiagonal ? '8-Way (Diagonal Allowed)' : '4-Way (Cardinal Only)'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-slate-200">
                  {customDiagonal ? 'sqrt(2) cost' : 'unit cost'}
                </span>
              </button>
            </div>

            {/* Random Seed */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Reproducibility Seed
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Algorithm Multi-selection Pills */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Algorithms to Benchmark Simultaneously:
            </label>
            <div className="flex flex-wrap gap-2">
              {allAvailableAlgorithms.map((alg) => {
                const isSelected = customAlgorithms.includes(alg.id);
                return (
                  <button
                    key={alg.id}
                    onClick={() => toggleCustomAlgorithm(alg.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{alg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
            Executing Benchmark Matrix & Generating Empirical Proofs...
          </p>
        </div>
      )}

      {/* Comprehensive Academic Report View with Classy Fade In */}
      {!isLoading && report && (
        <div key={report.title} className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-7 animate-fade-in print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Paper Header & Metadata */}
          <div className="border-b border-slate-200/80 pb-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider print:text-black">
                Peer-Grade Empirical Research Report
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 print:text-gray-600">
                  Seed: {report.configuration.seed || seed}
                </span>
                <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 print:text-gray-600">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight print:text-black">
              {report.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 print:text-gray-700 leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* Research Question Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5 shadow-xs print:bg-gray-100 print:border-gray-300">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block print:text-indigo-800">
              Primary Research Question:
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed print:text-black">
              {report.research_question}
            </p>
          </div>

          {/* Hypothesis & Theoretical Framework */}
          {(report.hypothesis || report.theoretical_expectation) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.hypothesis && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Formal Hypothesis
                  </span>
                  <p className="text-slate-700 leading-relaxed">{report.hypothesis}</p>
                </div>
              )}
              {report.theoretical_expectation && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Asymptotic Theoretical Expectation
                  </span>
                  <p className="text-slate-700 leading-relaxed">{report.theoretical_expectation}</p>
                </div>
              )}
            </div>
          )}

          {/* Visual Analytical Charts Section */}
          <div className="space-y-3 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Comparative Empirical Performance Visualizer:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveChartMetric('nodes_expanded')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeChartMetric === 'nodes_expanded' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Search Work (Expansions)
                </button>
                <button
                  onClick={() => setActiveChartMetric('max_frontier_size')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeChartMetric === 'max_frontier_size' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  RAM Peak (Frontier)
                </button>
                <button
                  onClick={() => setActiveChartMetric('path_cost')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeChartMetric === 'path_cost' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Solution Quality (Cost)
                </button>
                <button
                  onClick={() => setActiveChartMetric('execution_time_ms')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeChartMetric === 'execution_time_ms' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Latency (ms)
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey={activeChartMetric} radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          activeChartMetric === 'path_cost' && entry.path_cost === minCost
                            ? '#10b981'
                            : chartColors[index % chartColors.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Measured Performance Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block print:text-black">
                Primary Measured Metrics Table:
              </span>
              <span className="text-[11px] text-slate-500 font-mono print:hidden">
                Green = Optimal Cost • Sky = Minimal Expansion
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 overflow-x-auto shadow-xs print:border-gray-300">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 font-sans border-b border-slate-200 print:bg-gray-200 print:text-black font-semibold">
                  <tr>
                    <th className="px-4 py-3">Algorithm</th>
                    <th className="px-3 py-3">Solved</th>
                    <th className="px-3 py-3">Path Cost</th>
                    <th className="px-3 py-3">Length</th>
                    <th className="px-3 py-3">Expanded</th>
                    <th className="px-3 py-3">Max Frontier</th>
                    <th className="px-3 py-3">Time (ms)</th>
                    <th className="px-4 py-3 font-sans">Optimality Property</th>
                    <th className="px-3 py-3 font-sans print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 print:text-black print:divide-gray-300">
                  {report.results.map((res) => {
                    const isOptimal = res.solution_found && minCost !== null && res.path_cost === minCost;
                    const isLeastExp = res.solution_found && minExpanded !== null && res.nodes_expanded === minExpanded;

                    return (
                      <tr key={res.algorithm} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-sans font-bold text-slate-900 print:text-black">
                          {res.name}
                        </td>
                        <td className="px-3 py-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              res.solution_found
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {res.solution_found ? 'Solved' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-bold text-slate-900">
                          {res.solution_found ? (
                            <span className={isOptimal ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md' : 'text-slate-800'}>
                              {res.path_cost.toFixed(1)} {isOptimal && '★'}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-3 py-3 text-amber-700 print:text-black">
                          {res.solution_found ? res.path_length : '—'}
                        </td>
                        <td className="px-3 py-3 text-sky-700 print:text-black">
                          <span className={isLeastExp ? 'font-bold bg-sky-50 px-1.5 py-0.5 rounded-md' : ''}>
                            {res.nodes_expanded}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-purple-700 print:text-black">{res.max_frontier_size}</td>
                        <td className="px-3 py-3 text-slate-700 print:text-black">{res.execution_time_ms.toFixed(1)}</td>
                        <td className="px-4 py-3 font-sans text-[11px] text-slate-500 print:text-gray-700">
                          {res.optimality_guarantee}
                        </td>
                        <td className="px-3 py-3 print:hidden">
                          {onLoadExperimentInLab && (
                            <button
                              onClick={() => {
                                const matchedAlg = res.algorithm.startsWith('astar')
                                  ? 'astar'
                                  : (res.algorithm as AlgorithmType);
                                onLoadExperimentInLab({
                                  presetId: report.configuration.presetId || 'classic_labyrinth',
                                  algorithm: matchedAlg,
                                  problemType: report.configuration.problemType || 'grid',
                                });
                              }}
                              className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1 hover:underline"
                            >
                              <span>Inspect</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Derived Academic Research Metrics (EBF, Penetrance, Penalty) */}
          {report.derived_metrics && report.derived_metrics.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block print:text-black">
                Advanced Analytical Derived Ratios (Research Thesis Formulation):
              </span>
              <div className="rounded-2xl border border-slate-200 overflow-x-auto shadow-xs print:border-gray-300">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 font-sans border-b border-slate-200 print:bg-gray-200 print:text-black font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Algorithm</th>
                      <th className="px-3 py-2.5">Effective Branching (b*)</th>
                      <th className="px-3 py-2.5">Search Penetrance (d / N)</th>
                      <th className="px-3 py-2.5">Memory Ratio (Frontier / Gen)</th>
                      <th className="px-3 py-2.5">Suboptimality Delta (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 print:text-black">
                    {report.derived_metrics.map((dm) => (
                      <tr key={dm.algorithm} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-sans font-bold text-slate-900">{dm.name}</td>
                        <td className="px-3 py-2.5 text-indigo-700 font-bold">{dm.effective_branching_factor.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-emerald-700">{dm.search_penetrance.toFixed(3)}</td>
                        <td className="px-3 py-2.5 text-purple-700">{dm.memory_efficiency.toFixed(3)}</td>
                        <td className="px-3 py-2.5">
                          {dm.suboptimality_pct === 0 ? (
                            <span className="text-emerald-700 font-bold">0.0% (Optimal)</span>
                          ) : (
                            <span className="text-rose-600 font-bold">+{dm.suboptimality_pct.toFixed(1)}%</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Theoretical Proof Sketch */}
          {report.theoretical_proof && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Formal Mathematical Proof Sketch & Theorem Justification
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {report.theoretical_proof}
              </p>
            </div>
          )}

          {/* Empirical Findings & Discussion */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 print:bg-gray-100 print:border-gray-300">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block print:text-indigo-800">
              Empirical Discussion & Research Findings:
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed print:text-black font-normal">
              {report.narrative}
            </p>
          </div>

          {/* Deep In-Depth Experimental Dissection (Point-by-Point Academic Breakdown) */}
          <div className="space-y-3 pt-3 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Deep Empirical Dissection & Theoretical Points (Point-by-Point Analysis):</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Rigorous Academic Defense
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Point 1: Space-Time Asymmetry */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 hover:border-indigo-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Spatial RAM Footprint vs CPU Expansion Divergence (The Memory Wall)
                  </h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  In blind BFS and standard A*, the frontier surface area scales as <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">O(b^d)</code>. While computers execute billions of CPU clock cycles per second, frontier open-sets holding millions of nodes cause memory allocation crashes (OOM) in under 60 seconds on search horizons where <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">d &gt; 25</code>.
                </p>
                <div className="pt-1 text-[11px] font-mono text-indigo-700 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Defense Takeaway: Memory is always the primary bottleneck of state-space search, not CPU time.</span>
                </div>
              </div>

              {/* Point 2: Cost-Optimality Inversion */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Step-Cost Sensitivity & The Optimality Inversion Invariant
                  </h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  BFS guarantees hop optimality (minimum edge count). On weighted terrain (e.g. mud swamp with 4.5x multiplier), a 15-step path through mud costs 67.5, whereas a 22-step clean detour costs only 22.0. BFS naively picks the mud path, suffering severe suboptimality. UCS and A* track cumulative <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">g(n)</code> and guarantee true cost optimality.
                </p>
                <div className="pt-1 text-[11px] font-mono text-emerald-700 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Defense Takeaway: Goal tests in UCS/A* MUST occur upon popping from the queue, never on node generation.</span>
                </div>
              </div>

              {/* Point 3: Heuristic Pruning & Dominance */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 hover:border-sky-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Heuristic Metric Dominance Mechanics (Manhattan vs Euclidean)
                  </h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  If heuristic <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">h2(n) &gt;= h1(n)</code> for all states without exceeding true cost <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">h*(n)</code>, then <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">h2</code> dominates <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">h1</code>. On 4-way grids, Manhattan distance (L1 norm) strictly dominates Euclidean distance (L2 norm), expanding substantially fewer nodes because it prunes all candidates where <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">g(n) + h(n) &gt; C*</code>.
                </p>
                <div className="pt-1 text-[11px] font-mono text-sky-700 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Defense Takeaway: Expansions(h_dominant) &lt;= Expansions(h_weak) is mathematically guaranteed.</span>
                </div>
              </div>

              {/* Point 4: Local Landscape Pathology */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                    4
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Local Search Landscape Fragility & Basin Trapping
                  </h4>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Memory-less local algorithms (Hill Climbing) store only the current state in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">O(1)</code> space. Facing concave U-shaped obstacle traps or flat cost plateaus, greedy descent cannot backtrack because moving out requires an uphill transition (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">delta_h &gt; 0</code>). Without stochastic restarts or temperature annealing, Hill Climbing terminates in failure.
                </p>
                <div className="pt-1 text-[11px] font-mono text-amber-700 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Defense Takeaway: Local search trades guaranteed completeness for constant O(1) memory footprint.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Metric Glossary & Mathematical Formulation Cards */}
          <div className="space-y-3 pt-3 border-t border-slate-200/80">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              📚 Academic Benchmark Metrics Glossary & Mathematical Formulations:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700 font-mono text-[11px]">Effective Branching (b*)</span>
                  <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">b* ~ 1.0 = Ideal</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Uniform branching factor needed for a tree of depth <code className="font-mono">d</code> to generate <code className="font-mono">N</code> nodes. Lower <code className="font-mono">b*</code> indicates a laser-focused search beam.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-white p-1 rounded border border-slate-200">
                  N + 1 = sum_{"{i=0}"}^{"{d}"} (b*)^i
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 font-mono text-[11px]">Search Penetrance (P)</span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">P in [0, 1]</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Ratio of optimal solution depth <code className="font-mono">d</code> to total nodes generated <code className="font-mono">N</code>. Measures directness towards the goal without blind side-exploration.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-white p-1 rounded border border-slate-200">
                  P = d / N_generated
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-700 font-mono text-[11px]">Frontier Memory Ratio</span>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">RAM Stress</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Peak count of active nodes in the Open Set relative to total generated nodes. Dictates the RAM allocation footprint required by the min-heap.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-white p-1 rounded border border-slate-200">
                  Ratio = MaxFrontier / N_gen
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 font-mono text-[11px]">Suboptimality Delta (%)</span>
                  <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">Cost Penalty</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Percentage excess cost suffered by an algorithm relative to the true optimal shortest path cost <code className="font-mono">C*</code> found by UCS or A*.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-white p-1 rounded border border-slate-200">
                  Delta% = ((Cost - C*) / C*) * 100%
                </div>
              </div>
            </div>
          </div>

          {/* Viva Defense Takeaways */}
          <div className="space-y-3 pt-3 border-t border-slate-200/80 print:border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 print:text-amber-800">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>University Viva Voce Oral Defense Key Takeaways & Defense Strategy:</span>
              </span>
              <span className="text-[11px] text-amber-700 font-mono font-semibold">Examiner Q&A Alignment</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 print:text-black">
              {report.viva_takeaways.map((takeaway, idx) => (
                <li
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 flex items-start gap-2.5 print:bg-gray-50 print:border-gray-300 shadow-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider font-mono">
                      Viva Defense Point #{idx + 1}
                    </span>
                    <span className="leading-relaxed text-slate-800 font-medium">{takeaway}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
};
