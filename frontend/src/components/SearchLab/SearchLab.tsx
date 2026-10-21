import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ControlPanel } from './ControlPanel';
import { GridEditor } from './GridEditor';
import { GraphEditor } from './GraphEditor';
import { PlaybackBar } from './PlaybackBar';
import { Legend } from './Legend';
import { NodeInspector } from './NodeInspector';
import { EventLog } from './EventLog';
import {
  AlgorithmType,
  DifficultyType,
  GraphState,
  GridCoordinate,
  GridState,
  HeuristicType,
  MazePatternType,
  ProblemType,
  SearchResult,
} from '../../types';
import { fetchPresets, generateMaze, runSearch } from '../../api/client';

export const SearchLab: React.FC = () => {
  // Problem State
  const [problemType, setProblemType] = useState<ProblemType>('grid');

  const [grid, setGrid] = useState<GridState>({
    rows: 15,
    cols: 25,
    start: [1, 1],
    goal: [13, 23],
    walls: [],
    terrain: {},
    diagonal_movement: false,
  });

  const [graph, setGraph] = useState<GraphState>({
    nodes: [],
    edges: [],
    start: '',
    goal: '',
  });

  // Algorithm Controls
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('astar');
  const [heuristic, setHeuristic] = useState<HeuristicType>('manhattan');
  const [diagonalMovement, setDiagonalMovement] = useState<boolean>(false);
  const [maxSideways, setMaxSideways] = useState<number>(10);
  const [allowRestarts, setAllowRestarts] = useState<boolean>(false);

  // Playback & Search Execution
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(60);
  const [inspectedNode, setInspectedNode] = useState<GridCoordinate | string | null>(null);

  const playbackTimerRef = useRef<number | null>(null);

  // Load presets on mount
  useEffect(() => {
    fetchPresets()
      .then((presets) => {
        if (presets.grids.classic_labyrinth) {
          setGrid(presets.grids.classic_labyrinth.state);
        }
        if (presets.graphs.romania) {
          setGraph(presets.graphs.romania.state);
        }
      })
      .catch((err) => console.error('Preset load warning:', err));
  }, []);

  // Sync diagonal movement setting with grid
  useEffect(() => {
    setGrid((prev) => ({ ...prev, diagonal_movement: diagonalMovement }));
  }, [diagonalMovement]);

  // Execute Search from Backend
  const handleExecuteSearch = async () => {
    setIsLoading(true);
    setIsPlaying(false);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    try {
      const payload: any = {
        algorithm,
        problem_type: problemType,
        heuristic,
        diagonal_movement: diagonalMovement,
        max_sideways: maxSideways,
        allow_random_restarts: allowRestarts,
        playback_events: true,
      };

      if (problemType === 'grid') {
        payload.grid = grid;
      } else {
        payload.graph = graph;
      }

      const res = await runSearch(payload);
      setSearchResult(res);
      setCurrentStep(0);
      setIsPlaying(true); // Auto-start replay
    } catch (err: any) {
      alert(`Search Execution Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Playback Animation Loop
  useEffect(() => {
    if (isPlaying && searchResult && searchResult.events.length > 0) {
      playbackTimerRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= searchResult.events.length) {
            setIsPlaying(false);
            if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, searchResult, speedMs]);

  // Keyboard Shortcuts (Space: play/pause, ArrowRight: next, ArrowLeft: prev, R: reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStep((prev) => (searchResult ? Math.min(searchResult.events.length, prev + 1) : prev));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStep((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentStep(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResult]);

  // Derive visual sets based on currentStep
  const frontierSet = new Set<string>();
  const exploredSet = new Set<string>();
  const pathSet = new Set<string>();
  let activeNode: GridCoordinate | string | null = null;

  if (searchResult && currentStep > 0) {
    const activeSlice = searchResult.events.slice(0, currentStep);

    for (const evt of activeSlice) {
      const nodeStr = Array.isArray(evt.node) ? `${evt.node[0]},${evt.node[1]}` : String(evt.node);

      if (evt.type === 'frontier_add' || evt.type === 'frontier_update') {
        frontierSet.add(nodeStr);
      } else if (evt.type === 'visit' || evt.type === 'explored') {
        frontierSet.delete(nodeStr);
        exploredSet.add(nodeStr);
        activeNode = evt.node as any;
      } else if (evt.type === 'path_found') {
        // Solution found! Highlight final path
        for (const p of searchResult.path) {
          const pStr = Array.isArray(p) ? `${p[0]},${p[1]}` : String(p);
          pathSet.add(pStr);
        }
      }
    }
  }

  // Handle Preset selection
  const handleSelectPreset = async (presetId: string) => {
    setIsPlaying(false);
    setSearchResult(null);
    setCurrentStep(0);

    try {
      const presets = await fetchPresets();
      if (presets.grids[presetId]) {
        setProblemType('grid');
        setGrid(presets.grids[presetId].state);
      } else if (presets.graphs[presetId]) {
        setProblemType('graph');
        setGraph(presets.graphs[presetId].state);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Maze Generation
  const handleGenerateMaze = async (
    difficulty: DifficultyType,
    pattern: MazePatternType,
    withTerrain: boolean
  ) => {
    setIsPlaying(false);
    setSearchResult(null);
    setCurrentStep(0);

    try {
      const res = await generateMaze({
        rows: grid.rows,
        cols: grid.cols,
        difficulty,
        pattern,
        add_terrain: withTerrain,
      });
      setGrid({
        rows: res.rows,
        cols: res.cols,
        start: res.start,
        goal: res.goal,
        walls: res.walls,
        terrain: res.terrain,
        diagonal_movement: diagonalMovement,
      });
    } catch (err: any) {
      alert(`Maze Generation failed: ${err.message}`);
    }
  };

  // Derive inspected node metrics dynamically from event history or heuristic
  let nodeData: { g?: number; h?: number; f?: number; status: string; parent?: string } | undefined = undefined;
  if (inspectedNode) {
    const inspectedStr = Array.isArray(inspectedNode)
      ? `${inspectedNode[0]},${inspectedNode[1]}`
      : String(inspectedNode);

    if (searchResult && searchResult.events.length > 0) {
      const activeSlice = searchResult.events.slice(0, currentStep > 0 ? currentStep : searchResult.events.length);
      for (let i = activeSlice.length - 1; i >= 0; i--) {
        const evt = activeSlice[i];
        const evtNodeStr = Array.isArray(evt.node) ? `${evt.node[0]},${evt.node[1]}` : String(evt.node);
        if (evtNodeStr === inspectedStr) {
          nodeData = {
            g: evt.g,
            h: evt.h,
            f: evt.f,
            status: evt.type,
            parent: evt.parent ? (Array.isArray(evt.parent) ? `(${evt.parent[0]}, ${evt.parent[1]})` : String(evt.parent)) : undefined,
          };
          break;
        }
      }
    }

    // If node wasn't in events yet, calculate raw heuristic to goal on grid
    if (!nodeData && Array.isArray(inspectedNode) && problemType === 'grid') {
      const [r, c] = inspectedNode;
      const hVal = Math.abs(r - grid.goal[0]) + Math.abs(c - grid.goal[1]);
      nodeData = {
        h: hVal,
        status: 'unvisited',
      };
    }
  }

  // Derive status
  let searchStatus: 'idle' | 'running' | 'paused' | 'success' | 'failed' = 'idle';
  if (searchResult) {
    if (isPlaying) searchStatus = 'running';
    else if (currentStep >= searchResult.events.length) {
      searchStatus = searchResult.solution_found ? 'success' : 'failed';
    } else if (currentStep > 0) {
      searchStatus = 'paused';
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Playback Toolbar */}
      <PlaybackBar
        currentStep={currentStep}
        totalSteps={searchResult ? searchResult.events.length : 0}
        isPlaying={isPlaying}
        onPlayToggle={() => {
          if (searchResult && currentStep >= searchResult.events.length) {
            setCurrentStep(0);
          }
          setIsPlaying((p) => !p);
        }}
        onStepForward={() => {
          setIsPlaying(false);
          setCurrentStep((prev) => (searchResult ? Math.min(searchResult.events.length, prev + 1) : prev));
        }}
        onStepBackward={() => {
          setIsPlaying(false);
          setCurrentStep((prev) => Math.max(0, prev - 1));
        }}
        onReset={() => {
          setIsPlaying(false);
          setCurrentStep(0);
        }}
        onScrub={(step) => {
          setIsPlaying(false);
          setCurrentStep(step);
        }}
        speedMs={speedMs}
        onSpeedChange={setSpeedMs}
        searchStatus={searchStatus}
      />

      {/* Main Workspace Layout: Controls Left | Canvas Center | Inspector Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Algorithm Controls & Presets */}
        <div className="lg:col-span-3">
          <ControlPanel
            problemType={problemType}
            onProblemTypeChange={(t) => {
              setProblemType(t);
              setIsPlaying(false);
              setSearchResult(null);
              setCurrentStep(0);
            }}
            algorithm={algorithm}
            onAlgorithmChange={setAlgorithm}
            heuristic={heuristic}
            onHeuristicChange={setHeuristic}
            diagonalMovement={diagonalMovement}
            onDiagonalMovementChange={setDiagonalMovement}
            maxSideways={maxSideways}
            onMaxSidewaysChange={setMaxSideways}
            allowRestarts={allowRestarts}
            onAllowRestartsChange={setAllowRestarts}
            onSelectPreset={handleSelectPreset}
            onGenerateMaze={handleGenerateMaze}
            onExecuteSearch={handleExecuteSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Center Column: Interactive Grid or Graph Canvas */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="flex-1">
            {problemType === 'grid' ? (
              <GridEditor
                grid={grid}
                onGridChange={(newGrid) => {
                  setGrid(newGrid);
                  setSearchResult(null);
                  setCurrentStep(0);
                }}
                activeNode={activeNode as any}
                frontierSet={frontierSet}
                exploredSet={exploredSet}
                pathSet={pathSet}
                onInspectNode={setInspectedNode}
                isSearching={isPlaying}
              />
            ) : (
              <GraphEditor
                graph={graph}
                onGraphChange={(newGraph) => {
                  setGraph(newGraph);
                  setSearchResult(null);
                  setCurrentStep(0);
                }}
                activeNode={activeNode as any}
                frontierSet={frontierSet}
                exploredSet={exploredSet}
                pathSet={pathSet}
                onInspectNode={setInspectedNode}
                isSearching={isPlaying}
              />
            )}
          </div>

          {/* Visual Legend */}
          <Legend />
        </div>

        {/* Right Column: Node Inspector, Metrics, and Event Log */}
        <div className="lg:col-span-3 space-y-4">
          <NodeInspector
            inspectedNode={inspectedNode}
            nodeData={nodeData}
            searchResult={searchResult}
            currentStepData={{
              frontierCount: frontierSet.size,
              exploredCount: exploredSet.size,
            }}
          />

          <EventLog
            events={searchResult ? searchResult.events : []}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
};
