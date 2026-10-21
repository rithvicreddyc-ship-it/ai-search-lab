import React, { useState, useRef, useCallback } from 'react';
import {
  PenTool,
  Eraser,
  Droplets,
  Flag,
  Target,
  Sparkles,
  Trash2,
  Maximize2,
  Compass
} from 'lucide-react';
import { GridCoordinate, GridState } from '../../types';

export type ToolMode = 'wall' | 'eraser' | 'mud' | 'start' | 'goal';

interface GridEditorProps {
  grid: GridState;
  onGridChange: (newGrid: GridState) => void;
  activeNode: GridCoordinate | null;
  frontierSet: Set<string>;
  exploredSet: Set<string>;
  pathSet: Set<string>;
  onInspectNode: (coord: GridCoordinate | null) => void;
  isSearching: boolean;
}

export const GridEditor: React.FC<GridEditorProps> = ({
  grid,
  onGridChange,
  activeNode,
  frontierSet,
  exploredSet,
  pathSet,
  onInspectNode,
  isSearching,
}) => {
  const [toolMode, setToolMode] = useState<ToolMode>('wall');
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const wallLookup = useRef<Set<string>>(new Set());

  // Update wall lookup for O(1) membership checks
  wallLookup.current = new Set(grid.walls.map((w) => `${w[0]},${w[1]}`));

  const handleCellInteraction = (r: number, c: number) => {
    if (isSearching) return;
    const coordStr = `${r},${c}`;
    const isStart = grid.start[0] === r && grid.start[1] === c;
    const isGoal = grid.goal[0] === r && grid.goal[1] === c;

    if (toolMode === 'start') {
      if (wallLookup.current.has(coordStr) || isGoal) return;
      onGridChange({ ...grid, start: [r, c] });
    } else if (toolMode === 'goal') {
      if (wallLookup.current.has(coordStr) || isStart) return;
      onGridChange({ ...grid, goal: [r, c] });
    } else if (toolMode === 'wall') {
      if (isStart || isGoal) return;
      if (!wallLookup.current.has(coordStr)) {
        const nextWalls = [...grid.walls, [r, c] as GridCoordinate];
        // Also remove terrain if placing wall
        const nextTerrain = { ...grid.terrain };
        delete nextTerrain[coordStr];
        onGridChange({ ...grid, walls: nextWalls, terrain: nextTerrain });
      }
    } else if (toolMode === 'eraser') {
      if (isStart || isGoal) return;
      let changed = false;
      let nextWalls = grid.walls;
      let nextTerrain = { ...grid.terrain };

      if (wallLookup.current.has(coordStr)) {
        nextWalls = grid.walls.filter((w) => !(w[0] === r && w[1] === c));
        changed = true;
      }
      if (nextTerrain[coordStr] !== undefined) {
        delete nextTerrain[coordStr];
        changed = true;
      }
      if (changed) {
        onGridChange({ ...grid, walls: nextWalls, terrain: nextTerrain });
      }
    } else if (toolMode === 'mud') {
      if (isStart || isGoal) return;
      const nextWalls = grid.walls.filter((w) => !(w[0] === r && w[1] === c));
      const nextTerrain = { ...grid.terrain, [coordStr]: 4.5 };
      onGridChange({ ...grid, walls: nextWalls, terrain: nextTerrain });
    }
  };

  const clearWalls = () => {
    onGridChange({ ...grid, walls: [] });
  };

  const clearTerrain = () => {
    onGridChange({ ...grid, terrain: {} });
  };

  const resetAll = () => {
    onGridChange({
      ...grid,
      walls: [],
      terrain: {},
      start: [1, 1],
      goal: [grid.rows - 2, grid.cols - 2],
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-lab-panel/90 border border-lab-border/80">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setToolMode('wall')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'wall'
                ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Draw obstacle walls (Click & Drag)"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Wall</span>
          </button>

          <button
            onClick={() => setToolMode('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'eraser'
                ? 'bg-rose-600/80 text-white shadow-sm ring-1 ring-rose-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Erase walls and mud terrain"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          <button
            onClick={() => setToolMode('mud')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'mud'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Paint Mud Swamp (Cost 4.5x multiplier)"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Mud (4.5x)</span>
          </button>

          <span className="w-px h-5 bg-lab-border mx-1" />

          <button
            onClick={() => setToolMode('start')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'start'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Place Start node"
          >
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Set Start</span>
          </button>

          <button
            onClick={() => setToolMode('goal')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'goal'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Place Goal node"
          >
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Set Goal</span>
          </button>
        </div>

        {/* Clear & Grid Sizing Quick Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={clearWalls}
            disabled={grid.walls.length === 0}
            className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 transition-colors"
          >
            Clear Walls
          </button>
          <button
            onClick={clearTerrain}
            disabled={Object.keys(grid.terrain).length === 0}
            className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 transition-colors"
          >
            Clear Mud
          </button>
          <button
            onClick={resetAll}
            className="px-2.5 py-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear all walls, mud, and reset nodes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Canvas Container */}
      <div
        className="flex-1 flex items-center justify-center p-3 rounded-2xl bg-[#0b0e17] border border-lab-border overflow-auto select-none min-h-[380px]"
        onMouseLeave={() => {
          setIsMouseDown(false);
          onInspectNode(null);
        }}
        onMouseUp={() => setIsMouseDown(false)}
      >
        <div
          className="grid gap-[2px] p-2 bg-[#080b12] rounded-xl border border-slate-800/80 shadow-2xl"
          style={{
            gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: grid.rows }).map((_, r) =>
            Array.from({ length: grid.cols }).map((_, c) => {
              const coordStr = `${r},${c}`;
              const isStart = grid.start[0] === r && grid.start[1] === c;
              const isGoal = grid.goal[0] === r && grid.goal[1] === c;
              const isWall = wallLookup.current.has(coordStr);
              const isMud = grid.terrain[coordStr] !== undefined;

              const isPath = pathSet.has(coordStr);
              const isActive = activeNode && activeNode[0] === r && activeNode[1] === c;
              const isFrontier = frontierSet.has(coordStr);
              const isExplored = exploredSet.has(coordStr);

              // Determine styling
              let cellClass = 'bg-[#0f1422] hover:bg-slate-700/50 text-slate-500 border border-slate-800/80 rounded-[3px]';

              if (isWall) {
                cellClass = 'bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600/80 shadow-inner rounded-[3px]';
              } else if (isStart) {
                cellClass = 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold glow-emerald ring-2 ring-emerald-300 rounded-[4px] z-10';
              } else if (isGoal) {
                cellClass = 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-bold glow-rose ring-2 ring-rose-300 rounded-[4px] z-10';
              } else if (isPath) {
                cellClass = 'bg-emerald-400 text-slate-950 font-bold glow-emerald ring-1 ring-emerald-300 rounded-[3px] z-10 animate-node-pulse';
              } else if (isActive) {
                cellClass = 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300 glow-amber rounded-[3px] z-10 animate-pulse';
              } else if (isFrontier) {
                cellClass = 'bg-cyan-500/35 border border-cyan-400/80 text-cyan-200 glow-cyan rounded-[3px] animate-node-pulse';
              } else if (isExplored) {
                cellClass = 'bg-indigo-600/35 border border-indigo-500/60 text-indigo-200 rounded-[3px]';
              } else if (isMud) {
                cellClass = 'bg-gradient-to-b from-amber-800/70 to-amber-900/80 border border-amber-600/70 text-amber-200 rounded-[3px]';
              }

              return (
                <div
                  key={coordStr}
                  onMouseDown={() => {
                    setIsMouseDown(true);
                    handleCellInteraction(r, c);
                  }}
                  onMouseEnter={() => {
                    onInspectNode([r, c]);
                    if (isMouseDown) {
                      handleCellInteraction(r, c);
                    }
                  }}
                  className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-[10px] cursor-pointer transition-all duration-100 ${cellClass}`}
                >
                  {isStart ? (
                    <Flag className="w-3.5 h-3.5 text-slate-950 fill-current" />
                  ) : isGoal ? (
                    <Target className="w-3.5 h-3.5 text-white" />
                  ) : isMud && !isWall && !isPath && !isActive ? (
                    <span className="text-[10px] font-mono font-bold text-amber-300">~</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
