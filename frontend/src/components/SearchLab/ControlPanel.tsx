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
  Network
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

  return (
    <div className="p-4 rounded-2xl bg-lab-panel/90 border border-lab-border space-y-5">
      {/* Problem Mode Tabs */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Problem Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0b0e17] rounded-xl border border-lab-border/70">
          <button
            onClick={() => onProblemTypeChange('grid')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
              problemType === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GridIcon className="w-3.5 h-3.5" />
            <span>Grid Maze</span>
          </button>

          <button
            onClick={() => onProblemTypeChange('graph')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
              problemType === 'graph'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Graph Editor</span>
          </button>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-1.5">
        <label className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Search Algorithm</span>
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        </label>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
          className="w-full bg-[#0b0e17] border border-lab-border rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <optgroup label="Uninformed Search">
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
            <option value="ucs">Uniform Cost Search (UCS / Dijkstra)</option>
          </optgroup>
          <optgroup label="Informed (Heuristic) Search">
            <option value="greedy">Greedy Best-First Search</option>
            <option value="astar">A* Search</option>
            <option value="idastar">Iterative Deepening A* (IDA*)</option>
          </optgroup>
          <optgroup label="Local Search">
            <option value="hill_climbing">Hill Climbing (Steepest Descent)</option>
          </optgroup>
        </select>
      </div>

      {/* Heuristic Selection (Active for informed algorithms) */}
      <div className={`space-y-1.5 transition-opacity ${isHeuristicRequired ? 'opacity-100' : 'opacity-40'}`}>
        <label className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Heuristic Function h(n)</span>
          <Compass className="w-3.5 h-3.5 text-violet-400" />
        </label>
        <select
          value={heuristic}
          disabled={!isHeuristicRequired}
          onChange={(e) => onHeuristicChange(e.target.value as HeuristicType)}
          className="w-full bg-[#0b0e17] border border-lab-border rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed"
        >
          {problemType === 'grid' ? (
            <>
              <option value="manhattan">Manhattan Distance (Orthogonal)</option>
              <option value="euclidean">Euclidean Distance (Straight Line)</option>
              <option value="octile">Octile Distance (Diagonal 8-Way)</option>
              <option value="chebyshev">Chebyshev Distance</option>
              <option value="zero">Zero Heuristic h(n) = 0 (Dijkstra)</option>
            </>
          ) : (
            <>
              <option value="graph_euclidean">Graph Euclidean (Canvas Coordinates)</option>
              <option value="zero">Zero Heuristic (Uniform Cost)</option>
            </>
          )}
        </select>
      </div>

      {/* Grid Settings: Diagonal movement */}
      {problemType === 'grid' && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0e17] border border-lab-border/70 text-xs">
          <div>
            <div className="font-medium text-slate-200">8-Directional Diagonal</div>
            <div className="text-[10px] text-slate-400">Step cost = √2 ≈ 1.414</div>
          </div>
          <button
            onClick={() => onDiagonalMovementChange(!diagonalMovement)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              diagonalMovement ? 'bg-indigo-600' : 'bg-slate-700'
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

      {/* Hill Climbing Settings */}
      {isHillClimbing && (
        <div className="space-y-3 p-3 rounded-xl bg-[#0b0e17] border border-amber-500/20 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-amber-300">Max Sideways Moves: {maxSideways}</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={maxSideways}
            onChange={(e) => onMaxSidewaysChange(Number(e.target.value))}
            className="w-full accent-amber-500"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300">Random Restarts (max 3)</span>
            <input
              type="checkbox"
              checked={allowRestarts}
              onChange={(e) => onAllowRestartsChange(e.target.checked)}
              className="accent-amber-500 w-4 h-4"
            />
          </div>
        </div>
      )}

      {/* Presets Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Preset Environments
        </label>
        <select
          onChange={(e) => {
            if (e.target.value) onSelectPreset(e.target.value);
          }}
          className="w-full bg-[#0b0e17] border border-lab-border rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          defaultValue=""
        >
          <option value="" disabled>Select a preset...</option>
          {problemType === 'grid' ? (
            <>
              <option value="classic_labyrinth">Classic Labyrinth Maze</option>
              <option value="weighted_swamp">Weighted Mud Swamp (UCS vs BFS)</option>
              <option value="local_optimum_trap">U-Shaped Obstacle Trap (Hill Climbing)</option>
              <option value="unreachable_fortress">Unreachable Fortress (Completeness)</option>
            </>
          ) : (
            <>
              <option value="romania">Romania Map (AIMA Classic)</option>
              <option value="diamond">Diamond Multi-Path Network</option>
            </>
          )}
        </select>
      </div>

      {/* Maze Generator Quick Actions (for Grid) */}
      {problemType === 'grid' && (
        <div className="pt-1">
          <button
            onClick={() => onGenerateMaze('medium', 'recursive_division', false)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700/70 transition-colors"
          >
            <Dices className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generate Random Maze</span>
          </button>
        </div>
      )}

      {/* Primary Execute Button */}
      <div className="pt-2">
        <button
          onClick={onExecuteSearch}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Computing Search Space...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Search Algorithm</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
