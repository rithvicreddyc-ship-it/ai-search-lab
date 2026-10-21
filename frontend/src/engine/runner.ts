import {
  AlgorithmType,
  CompareResponse,
  CompareResultItem,
  ExperimentReport,
  GraphState,
  GridState,
  ProblemType,
  SearchResult,
} from '../types';
import { runAStar, runBFS, runDFS, runGreedy, runHillClimbing, runIDAStar, runUCS } from './algorithms';
import { GraphEnvironment, GridEnvironment, SearchEnvironment } from './environment';
import { generateMaze } from './maze';
import {
  ALGORITHM_METADATA,
  PRESET_ROMANIA,
  PRESET_UNREACHABLE_FORTRESS,
  PRESET_WEIGHTED_SWAMP,
} from './presets';

export function createEnvironment(
  problemType: ProblemType,
  grid?: GridState,
  graph?: GraphState,
  heuristic: string = 'manhattan'
): SearchEnvironment {
  if (problemType === 'graph' && graph) {
    return new GraphEnvironment(graph, heuristic);
  }
  const defaultGrid: GridState = grid || {
    rows: 15,
    cols: 25,
    start: [1, 1],
    goal: [13, 23],
    walls: [],
    terrain: {},
    diagonal_movement: false,
  };
  return new GridEnvironment(defaultGrid, heuristic);
}

export function executeAlgorithm(
  algorithm: AlgorithmType,
  env: SearchEnvironment,
  options: {
    maxEvents?: number;
    maxSideways?: number;
    allowRestarts?: boolean;
    maxRestarts?: number;
  } = {}
): SearchResult {
  switch (algorithm) {
    case 'bfs':
      return runBFS(env, options);
    case 'dfs':
      return runDFS(env, options);
    case 'ucs':
      return runUCS(env, options);
    case 'greedy':
      return runGreedy(env, options);
    case 'astar':
      return runAStar(env, options);
    case 'idastar':
      return runIDAStar(env, options);
    case 'hill_climbing':
      return runHillClimbing(env, options);
    default:
      return runAStar(env, options);
  }
}

export function executeSearch(payload: any): SearchResult {
  const env = createEnvironment(
    payload.problem_type,
    payload.grid,
    payload.graph,
    payload.heuristic
  );
  return executeAlgorithm(payload.algorithm, env, {
    maxSideways: payload.max_sideways,
    allowRestarts: payload.allow_restarts,
  });
}

export function executeCompare(payload: any): CompareResponse {
  const algorithms: AlgorithmType[] = payload.algorithms || ['bfs', 'dfs', 'ucs', 'greedy', 'astar'];
  const results: CompareResultItem[] = [];

  for (const alg of algorithms) {
    const env = createEnvironment(
      payload.problem_type,
      payload.grid,
      payload.graph,
      payload.heuristic
    );
    const meta = ALGORITHM_METADATA.find((m) => m.id === alg);
    const res = executeAlgorithm(alg, env);

    results.push({
      algorithm: alg,
      name: meta?.name || alg.toUpperCase(),
      solution_found: res.solution_found,
      path_cost: res.path_cost,
      path_length: res.path_length,
      nodes_expanded: res.nodes_expanded,
      nodes_generated: res.nodes_generated,
      max_frontier_size: res.max_frontier_size,
      execution_time_ms: res.execution_time_ms,
      optimality_guarantee: res.optimality_guarantee,
      completeness_guarantee: res.completeness_guarantee,
      notes: res.summary,
      path: res.path,
    });
  }

  // Narrative generation
  const successful = results.filter((r) => r.solution_found);
  let narrative = '';
  let fastestAlg = '';
  let lowestCostAlg = '';
  let leastExpandedAlg = '';

  if (successful.length > 0) {
    const fastest = [...successful].sort((a, b) => a.execution_time_ms - b.execution_time_ms)[0];
    const lowestCost = [...successful].sort((a, b) => a.path_cost - b.path_cost)[0];
    const leastExpanded = [...successful].sort((a, b) => a.nodes_expanded - b.nodes_expanded)[0];

    fastestAlg = fastest.name;
    lowestCostAlg = lowestCost.name;
    leastExpandedAlg = leastExpanded.name;

    narrative = `${lowestCost.name} achieved the optimal path cost (${lowestCost.path_cost}). ${leastExpanded.name} was most memory/search efficient with only ${leastExpanded.nodes_expanded} node expansions. ${fastest.name} executed fastest in ${fastest.execution_time_ms}ms.`;
  } else {
    narrative = 'None of the algorithms reached the goal. The goal state appears disconnected by impassable barriers.';
  }

  return {
    problem_type: payload.problem_type,
    results,
    analysis_narrative: narrative,
    fastest_algorithm: fastestAlg,
    lowest_cost_algorithm: lowestCostAlg,
    least_expanded_algorithm: leastExpandedAlg,
  };
}

export function executeExperiment(
  presetId: string,
  requestedAlgs?: AlgorithmType[],
  seed?: number
): ExperimentReport {
  if (presetId === 'weighted_terrain_tradeoff') {
    const grid = PRESET_WEIGHTED_SWAMP;
    const algs: AlgorithmType[] = requestedAlgs || ['bfs', 'ucs', 'greedy', 'astar'];
    const comp = executeCompare({
      problem_type: 'grid',
      grid,
      algorithms: algs,
      heuristic: 'manhattan',
    });

    return {
      title: 'Optimality on Non-Uniform Weighted Terrain',
      description: 'Evaluates paths through high-cost mud swamp terrain (4.5x) alongside clear detour paths (1.0x).',
      research_question: 'Can uninformed BFS find the optimal path when terrain costs vary, and how does UCS compare against A*?',
      configuration: { presetId, terrain: 'mud swamp 4.5x multiplier' },
      results: comp.results,
      narrative: 'BFS only minimizes step counts, so it plows straight through mud swamps resulting in a suboptimal path cost. UCS and A* find the optimal route through the clear detour. A* expands fewer nodes than UCS thanks to heuristic pruning.',
      viva_takeaways: [
        'BFS optimizes step count, not cumulative path cost.',
        'UCS and A* guarantee path cost optimality on arbitrary non-negative weights.',
        'A* expands fewer nodes than UCS because h(n) directs search toward the goal.',
      ],
    };
  } else if (presetId === 'unreachable_completeness') {
    const grid = PRESET_UNREACHABLE_FORTRESS;
    const algs: AlgorithmType[] = requestedAlgs || ['bfs', 'dfs', 'ucs', 'astar', 'idastar', 'hill_climbing'];
    const comp = executeCompare({
      problem_type: 'grid',
      grid,
      algorithms: algs,
      heuristic: 'manhattan',
    });

    return {
      title: 'Termination and Completeness under Disconnected Goals',
      description: 'Tests an enclosed fortress where walls seal off the goal entirely.',
      research_question: 'Do classical search algorithms correctly determine when a goal is completely unreachable without crashing or looping infinitely?',
      configuration: { presetId, obstacle: 'enclosed fortress' },
      results: comp.results,
      narrative: 'Complete algorithms (BFS, DFS with cycle checking, UCS, A*, IDA*) exhaustively explore all reachable states before cleanly declaring failure.',
      viva_takeaways: [
        'A search algorithm is complete if it is guaranteed to either find a solution or correctly report failure when no solution exists.',
        'Closed list / reached set prevents infinite loops on cyclic state spaces.',
      ],
    };
  } else {
    // Default open vs obstacle
    const actualSeed = seed || 101;
    const maze = generateMaze(15, 25, 'medium', 'recursive_division', actualSeed, false);
    const grid: GridState = {
      rows: maze.rows,
      cols: maze.cols,
      start: maze.start,
      goal: maze.goal,
      walls: maze.walls,
      terrain: maze.terrain,
      diagonal_movement: false,
    };
    const algs: AlgorithmType[] = requestedAlgs || ['bfs', 'dfs', 'greedy', 'astar'];
    const comp = executeCompare({
      problem_type: 'grid',
      grid,
      algorithms: algs,
      heuristic: 'manhattan',
    });

    return {
      title: 'Impact of Obstacle Density on Search Complexity',
      description: 'Compares algorithms on a labyrinth with tight corridors versus open corridors.',
      research_question: 'How does increasing obstacle density affect search efficiency (nodes expanded and frontier size) of uninformed (BFS) vs heuristic (A*) search?',
      configuration: { presetId: 'open_vs_obstacle', seed: actualSeed },
      results: comp.results,
      narrative: 'In open spaces, BFS expands circularly in all directions O(b^d), while A* guided by Manhattan distance focuses sharply toward the goal.',
      viva_takeaways: [
        'Heuristic guidance focuses the search beam, drastically reducing explored state space.',
        'Greedy Best-First can be tricked into dead ends, whereas A* balances distance and accumulated path cost.',
      ],
    };
  }
}
