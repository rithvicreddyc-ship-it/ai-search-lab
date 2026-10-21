import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Eraser,
  Droplets,
  Flag,
  Target,
  Sparkles,
  Trash2,
  Maximize2,
  Compass,
  Crosshair,
  Sliders
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
  const [hoverCoord, setHoverCoord] = useState<GridCoordinate | null>(null);
  const wallLookup = useRef<Set<string>>(new Set());

  // Update wall lookup for O(1) membership checks
  wallLookup.current = new Set(grid.walls.map((w) => `${w[0]},${w[1]}`));

  // Keyboard shortcut for quick tool switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toLowerCase();
      if (key === 'w') setToolMode('wall');
      else if (key === 'e') setToolMode('eraser');
      else if (key === 'm') setToolMode('mud');
      else if (key === 's') setToolMode('start');
      else if (key === 'g') setToolMode('goal');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const clearWalls = () => onGridChange({ ...grid, walls: [] });
  const clearTerrain = () => onGridChange({ ...grid, terrain: {} });
  const resetAll = () => {
    onGridChange({
      ...grid,
      walls: [],
      terrain: {},
      start: [1, 1],
      goal: [grid.rows - 2, grid.cols - 2],
    });
  };

  // Compute live Manhattan distance for HUD
  const hoverH = hoverCoord
    ? Math.abs(hoverCoord[0] - grid.goal[0]) + Math.abs(hoverCoord[1] - grid.goal[1])
    : null;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Creative Command Dock */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#0b101e]/90 border border-lab-border/80 shadow-glass-card backdrop-blur-xl">
        {/* Drawing Tools Segmented Dock */}
        <div className="flex items-center gap-1 bg-[#060914] p-1 rounded-xl border border-lab-border/60">
          <button
            onClick={() => setToolMode('wall')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'wall'
                ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Obstacle Wall [Hotkey: W]"
          >
            <PenTool className="w-3.5 h-3.5 text-slate-300" />
            <span>Wall</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">W</span>
          </button>

          <button
            onClick={() => setToolMode('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'eraser'
                ? 'bg-rose-950/80 text-rose-300 shadow-sm ring-1 ring-rose-500/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Erase cell [Hotkey: E]"
          >
            <Eraser className="w-3.5 h-3.5 text-rose-400" />
            <span>Eraser</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">E</span>
          </button>

          <button
            onClick={() => setToolMode('mud')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'mud'
                ? 'bg-amber-950/80 text-amber-300 shadow-sm ring-1 ring-amber-500/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Mud Swamp (4.5x cost) [Hotkey: M]"
          >
            <Droplets className="w-3.5 h-3.5 text-amber-400" />
            <span>Mud 4.5x</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">M</span>
          </button>

          <span className="w-px h-5 bg-lab-border mx-1" />

          <button
            onClick={() => setToolMode('start')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'start'
                ? 'bg-emerald-950/80 text-emerald-300 shadow-sm ring-1 ring-emerald-500/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Set Start node [Hotkey: S]"
          >
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Start</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">S</span>
          </button>

          <button
            onClick={() => setToolMode('goal')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              toolMode === 'goal'
                ? 'bg-rose-950/80 text-rose-300 shadow-sm ring-1 ring-rose-500/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Set Goal node [Hotkey: G]"
          >
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Goal</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">G</span>
          </button>
        </div>

        {/* Clear Actions & Quick HUD */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={clearWalls}
            disabled={grid.walls.length === 0}
            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 transition-colors"
          >
            Clear Walls
          </button>
          <button
            onClick={clearTerrain}
            disabled={Object.keys(grid.terrain).length === 0}
            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 transition-colors"
          >
            Clear Mud
          </button>
          <button
            onClick={resetAll}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear all walls, mud, and reset nodes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Canvas Stage with Coordinate HUD */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-[#080d19] to-[#040710] border border-lab-border relative overflow-hidden select-none min-h-[390px] shadow-2xl"
        onMouseLeave={() => {
          setIsMouseDown(false);
          setHoverCoord(null);
          onInspectNode(null);
        }}
        onMouseUp={() => setIsMouseDown(false)}
      >
        {/* Subtle Ambient Cosmic Glow Behind Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Coordinate & Distance HUD Overlay */}
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#070b16]/80 border border-slate-800/80 backdrop-blur-md text-[11px] font-mono text-slate-300 shadow-sm pointer-events-none">
          <Crosshair className="w-3 h-3 text-cyan-400" />
          <span>
            {hoverCoord ? `[${hoverCoord[0]}, ${hoverCoord[1]}]` : `${grid.rows}×${grid.cols} Grid`}
          </span>
          {hoverH !== null && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-violet-300 font-sans">h={hoverH}</span>
            </>
          )}
          {hoverCoord && grid.terrain[`${hoverCoord[0]},${hoverCoord[1]}`] && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-sans">Cost: 4.5x</span>
            </>
          )}
        </div>

        {/* Dynamic Grid Matrix */}
        <div
          className="relative z-10 grid gap-[2px] p-2.5 bg-[#03060c] rounded-2xl border border-slate-800/90 shadow-2xl"
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

              // Classy styling mapping
              let cellClass =
                'bg-[#0a0f1d] hover:bg-slate-800/60 border border-slate-800/60 text-slate-500 rounded-[3.5px]';

              if (isWall) {
                cellClass =
                  'bg-gradient-to-b from-[#1e2538] to-[#121826] border border-slate-600/60 shadow-inner rounded-[3.5px]';
              } else if (isStart) {
                cellClass =
                  'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold glow-emerald ring-2 ring-emerald-300 rounded-[4px] z-10';
              } else if (isGoal) {
                cellClass =
                  'bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-bold glow-rose ring-2 ring-rose-300 rounded-[4px] z-10';
              } else if (isPath) {
                cellClass =
                  'bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 font-bold glow-emerald ring-1 ring-emerald-200 rounded-[3.5px] z-10 animate-path-pulse';
              } else if (isActive) {
                cellClass =
                  'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300 glow-amber rounded-[3.5px] z-10 animate-pulse';
              } else if (isFrontier) {
                cellClass =
                  'bg-cyan-500/30 border border-cyan-400/80 text-cyan-200 glow-cyan rounded-[3.5px] animate-frontier-pulse';
              } else if (isExplored) {
                cellClass =
                  'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 rounded-[3.5px]';
              } else if (isMud) {
                cellClass =
                  'bg-gradient-to-b from-amber-950/70 to-amber-900/60 border border-amber-600/60 text-amber-300 rounded-[3.5px]';
              }

              return (
                <div
                  key={coordStr}
                  onMouseDown={() => {
                    setIsMouseDown(true);
                    handleCellInteraction(r, c);
                  }}
                  onMouseEnter={() => {
                    setHoverCoord([r, c]);
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
                    <span className="text-[10px] font-mono font-bold text-amber-400/90 select-none">~</span>
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

