import {
  AlgorithmMetadata,
  CompareResponse,
  ExperimentReport,
  GridState,
  GraphState,
  MazeGenerateResponse,
  SearchResult,
  ValidationResponse,
} from '../types';
import { generateMaze as engineGenerateMaze } from '../engine/maze';
import {
  ALGORITHM_METADATA,
  PRESET_CLASSIC_LABYRINTH,
  PRESET_LOCAL_OPTIMUM_TRAP,
  PRESET_ROMANIA,
  PRESET_UNREACHABLE_FORTRESS,
  PRESET_WEIGHTED_SWAMP,
} from '../engine/presets';
import { executeCompare, executeExperiment, executeSearch } from '../engine/runner';

const RAW_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';
const API_BASE = RAW_BASE ? `${RAW_BASE.replace(/\/$/, '')}/api` : '/api';

export async function fetchHealth(): Promise<{ status: string; version: string; available_algorithms: string[] }> {
  if (RAW_BASE) {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (err) {
      // Graceful fallback to pure Node/TypeScript engine
    }
  }
  return {
    status: 'healthy',
    version: '1.0.0 (High-Speed Client Engine)',
    available_algorithms: ['bfs', 'dfs', 'ucs', 'greedy', 'astar', 'idastar', 'hill_climbing'],
  };
}

export async function fetchAlgorithms(): Promise<AlgorithmMetadata[]> {
  if (RAW_BASE) {
    try {
      const res = await fetch(`${API_BASE}/algorithms`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }
  }
  return ALGORITHM_METADATA;
}

export async function fetchPresets(): Promise<{
  grids: Record<string, { id: string; name: string; description: string; state: GridState }>;
  graphs: Record<string, { id: string; name: string; description: string; state: GraphState }>;
  experiments: string[];
}> {
  if (RAW_BASE) {
    try {
      const res = await fetch(`${API_BASE}/presets`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }
  }
  return {
    grids: {
      classic_labyrinth: {
        id: 'classic_labyrinth',
        name: 'Classic Labyrinth',
        description: 'Challenging benchmark labyrinth with winding corridors and deceptive cul-de-sacs.',
        state: PRESET_CLASSIC_LABYRINTH,
      },
      weighted_swamp: {
        id: 'weighted_swamp',
        name: 'Weighted Mud Swamp (4.5x Cost)',
        description: 'Mud swamp with 4.5x cost multiplier; demonstrates UCS/A* optimality over BFS.',
        state: PRESET_WEIGHTED_SWAMP,
      },
      local_optimum_trap: {
        id: 'local_optimum_trap',
        name: 'U-Shaped Obstacle Trap (Hill Climbing)',
        description: 'Concave obstacle trap demonstrating hill climbing local optimum trapping and plateaus.',
        state: PRESET_LOCAL_OPTIMUM_TRAP,
      },
      unreachable_fortress: {
        id: 'unreachable_fortress',
        name: 'Unreachable Fortress',
        description: 'Completely walled-off goal state testing completeness and loop termination.',
        state: PRESET_UNREACHABLE_FORTRESS,
      },
    },
    graphs: {
      romania: {
        id: 'romania',
        name: 'Romania Road Map (AIMA Benchmark)',
        description: 'Classic 20-city Romania graph with textbook straight-line distance heuristics to Bucharest.',
        state: PRESET_ROMANIA,
      },
    },
    experiments: [
      'open_vs_obstacle',
      'weighted_terrain_tradeoff',
      'heuristic_comparison',
      'unreachable_completeness',
    ],
  };
}

export async function runSearch(payload: any): Promise<SearchResult> {
  if (RAW_BASE) {
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }
  }
  return executeSearch(payload);
}

export async function runCompare(payload: any): Promise<CompareResponse> {
  if (RAW_BASE) {
    try {
      const res = await fetch(`${API_BASE}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }
  }
  return executeCompare(payload);
}

export async function generateMazeAPI(payload: {
  rows?: number;
  cols?: number;
  difficulty?: string;
  pattern?: string;
  seed?: number;
  add_terrain?: boolean;
}): Promise<MazeGenerateResponse> {
  if (RAW_BASE) {
    try {
      const res = await fetch(`${API_BASE}/maze/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }
  }
  return engineGenerateMaze(payload);
}

export async function runExperimentAPI(payload: {
  preset_id: string;
  algorithms?: any[];
  seed?: number;
}): Promise<ExperimentReport> {
  if (RAW_BASE) {
    try {
      const res = await fetch(`${API_BASE}/experiments/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      // Fallback
    }
  }
  return executeExperiment(payload.preset_id, payload.algorithms, payload.seed);
}

export const generateMaze = generateMazeAPI;
export const runExperiment = runExperimentAPI;

export async function validateProblem(payload: any): Promise<ValidationResponse> {
  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}
