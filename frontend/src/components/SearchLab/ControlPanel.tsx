import React from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Compass,
  Cpu,
  Layers,
  Settings2,
  Sliders,
  Dices,
  Grid as GridIcon,
  Network,
  Compass as CompassIcon,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  AlgorithmType,
  HeuristicType,
  ProblemType,
  DifficultyType,
  MazePatternType
} from '../../types';

interface ControlPanelProps {
  problemType: ProblemType;
  onProblemTypeChange: (type: ProblemType) => void;
  algorithm: AlgorithmType;
  onAlgorithmChange: (alg: AlgorithmType) => void;
  heuristic: HeuristicType;
  onHeuristicChange: (h: HeuristicType) => void;
  diagonalMovement: boolean;
  onDiagonalMovementChange: (diag: boolean) => void;
  maxSideways: number;
  onMaxSidewaysChange: (v: number) => void;
  allowRestarts: boolean;
  onAllowRestartsChange: (v: boolean) => void;
  onSelectPreset: (presetId: string) => void;
  onGenerateMaze: (difficulty: DifficultyType, pattern: MazePatternType, withTerrain: boolean) => void;
  onExecuteSearch: () => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  problemType,
  onProblemTypeChange,
  algorithm,
  onAlgorithmChange,
  heuristic,
  onHeuristicChange,
  diagonalMovement,
  onDiagonalMovementChange,
  maxSideways,
  onMaxSidewaysChange,
  allowRestarts,
  onAllowRestartsChange,
  onSelectPreset,
  onGenerateMaze,
  onExecuteSearch,
  isLoading,
}) => {
  const isHeuristicRequired = ['greedy', 'astar', 'idastar', 'hill_climbing'].includes(algorithm);
  const isHillClimbing = algorithm === 'hill_climbing';

  // Algorithm metadata lookup for instantaneous high-tech context
  const algorithmMeta: Record<AlgorithmType, { name: string; tag: string; time: string; space: string; optimal: string }> = {
    bfs: { name: 'Breadth-First Search', tag: 'Uninformed', time: 'O(b^d)', space: 'O(b^d)', optimal: 'Yes (Uniform Cost)' },
    dfs: { name: 'Depth-First Search', tag: 'Uninformed', time: 'O(b^m)', space: 'O(b·m)', optimal: 'No' },
    ucs: { name: 'Uniform Cost Search', tag: 'Uninformed', time: 'O(b^(1+C*/ε))', space: 'O(b^(1+C*/ε))', optimal: 'Yes (Weighted Graphs)' },
    greedy: { name: 'Greedy Best-First', tag: 'Informed', time: 'O(b^m)', space: 'O(b^m)', optimal: 'No (Heuristic Only)' },
    astar: { name: 'A* Search', tag: 'Informed', time: 'O(b^d)', space: 'O(b^d)', optimal: 'Yes (Admissible h)' },
    idastar: { name: 'Iterative Deepening A*', tag: 'Informed', time: 'O(b^d)', space: 'O(d) Linear', optimal: 'Yes (Admissible h)' },
    hill_climbing: { name: 'Hill Climbing', tag: 'Local Search', time: 'Variable', space: 'O(1) Constant', optimal: 'No (Local Optima)' },
  };

  const meta = algorithmMeta[algorithm] || algorithmMeta.astar;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-5">
      {/* Problem Mode Segmented Switch */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Workspace Topology
          </label>
          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            {problemType === 'grid' ? 'Orthogonal / 8-Way' : 'State Graph'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => onProblemTypeChange('grid')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              problemType === 'grid'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GridIcon className="w-3.5 h-3.5" />
            <span>Grid Matrix</span>
          </button>

          <button
            onClick={() => onProblemTypeChange('graph')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              problemType === 'graph'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Graph Editor</span>
          </button>
        </div>
      </div>

      {/* Algorithm Selection with Live Spec Pill */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Search Engine Core</span>
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
        </label>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
        >
          <optgroup label="Uninformed Search (Blind)">
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
            <option value="ucs">Uniform Cost Search (UCS / Dijkstra)</option>
          </optgroup>
          <optgroup label="Informed Search (Heuristic)">
            <option value="greedy">Greedy Best-First Search</option>
            <option value="astar">A* Search</option>
            <option value="idastar">Iterative Deepening A* (IDA*)</option>
          </optgroup>
          <optgroup label="Local Optimization">
            <option value="hill_climbing">Hill Climbing (Steepest Descent)</option>
          </optgroup>
        </select>

        {/* Algorithm Live Spec Card */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">{meta.name}</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              {meta.tag}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 font-mono text-[10px] pt-0.5">
            <span>Time: {meta.time}</span>
            <span>Space: {meta.space}</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-sans flex items-center gap-1 pt-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Optimal: {meta.optimal}</span>
          </div>
        </div>
      </div>

      {/* Heuristic Function Selection */}
      <div className={`space-y-2 transition-opacity ${isHeuristicRequired ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <label className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Heuristic Estimator h(n)</span>
          <Compass className="w-3.5 h-3.5 text-violet-600" />
        </label>
        <select
          value={heuristic}
          disabled={!isHeuristicRequired}
          onChange={(e) => onHeuristicChange(e.target.value as HeuristicType)}
          className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {problemType === 'grid' ? (
            <>
              <option value="manhattan">Manhattan Distance (Orthogonal |Δx| + |Δy|)</option>
              <option value="euclidean">Euclidean Distance (Straight Line √(Δx² + Δy²))</option>
              <option value="octile">Octile Distance (8-Directional Diagonal)</option>
              <option value="chebyshev">Chebyshev Distance (King's Movement)</option>
              <option value="zero">Zero Heuristic h(n) = 0 (Equivalent to UCS)</option>
            </>
          ) : (
            <>
              <option value="graph_euclidean">Graph Euclidean (Canvas Coordinate Distance)</option>
              <option value="zero">Zero Heuristic (Uniform Cost / Dijkstra)</option>
            </>
          )}
        </select>
      </div>

      {/* Diagonal 8-Way Movement Toggle */}
      {problemType === 'grid' && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs shadow-sm">
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CompassIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>8-Way Diagonal Steps</span>
            </div>
            <div className="text-[10px] text-slate-500">Step cost: √2 ≈ 1.414</div>
          </div>
          <button
            onClick={() => onDiagonalMovementChange(!diagonalMovement)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              diagonalMovement ? 'bg-indigo-600 shadow-sm' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                diagonalMovement ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Hill Climbing Controls */}
      {isHillClimbing && (
        <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900">Max Sideways Moves: {maxSideways}</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={maxSideways}
            onChange={(e) => onMaxSidewaysChange(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-700">Random Restarts (max 3)</span>
            <input
              type="checkbox"
              checked={allowRestarts}
              onChange={(e) => onAllowRestartsChange(e.target.checked)}
              className="accent-amber-600 w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Preset Environments & Maze Generator */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Curated Benchmark Presets
        </label>
        <select
          onChange={(e) => {
            if (e.target.value) onSelectPreset(e.target.value);
          }}
          className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>Load benchmark preset...</option>
          {problemType === 'grid' ? (
            <>
              <option value="classic_labyrinth">Classic Labyrinth Maze</option>
              <option value="weighted_swamp">Weighted Mud Swamp (UCS vs BFS)</option>
              <option value="local_optimum_trap">U-Shaped Obstacle Trap (Hill Climbing)</option>
              <option value="unreachable_fortress">Unreachable Fortress (Completeness)</option>
            </>
          ) : (
            <>
              <option value="romania">Romania Road Map (AIMA Classic)</option>
            </>
          )}
        </select>
      </div>

      {/* Random Maze Generator Quick Action */}
      {problemType === 'grid' && (
        <div>
          <button
            onClick={() => onGenerateMaze('medium', 'recursive_division', false)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-all active:scale-95 shadow-sm"
          >
            <Dices className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate Labyrinth Maze</span>
          </button>
        </div>
      )}

      {/* Primary Execute Button */}
      <div className="pt-2">
        <button
          onClick={onExecuteSearch}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>COMPUTING STATE SPACE...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>EXECUTE SEARCH ALGORITHM</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

