import { GridCoordinate, SearchEvent, SearchResult } from '../types';
import { SearchEnvironment } from './environment';

export interface RunSearchOptions {
  maxEvents?: number;
  maxSideways?: number;
  allowRestarts?: boolean;
  maxRestarts?: number;
}

function reconstructPath(
  parents: Map<string, GridCoordinate | string | null>,
  env: SearchEnvironment,
  goal: GridCoordinate | string
): Array<GridCoordinate | string> {
  const path: Array<GridCoordinate | string> = [];
  let curr: GridCoordinate | string | null | undefined = goal;

  while (curr !== null && curr !== undefined) {
    path.push(env.formatNode(curr));
    const k = env.key(curr);
    curr = parents.get(k);
  }

  path.reverse();
  return path;
}

// --------------------------------------------------------------------------
// 1. Breadth-First Search (BFS)
// --------------------------------------------------------------------------
export function runBFS(env: SearchEnvironment, options: RunSearchOptions = {}): SearchResult {
  const t0 = performance.now();
  const maxEvents = options.maxEvents || 8000;
  const start = env.startNode;

  if (env.isGoal(start)) {
    return {
      algorithm: 'bfs',
      solution_found: true,
      path: [env.formatNode(start)],
      path_cost: 0,
      path_length: 1,
      nodes_expanded: 0,
      nodes_generated: 1,
      max_frontier_size: 1,
      execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
      total_events: 1,
      events: [
        {
          step: 1,
          type: 'path_found',
          node: env.formatNode(start),
          g: 0,
          h: 0,
          f: 0,
          frontier_size: 0,
          explored_size: 1,
          explanation: 'Start node is already the goal state.',
        },
      ],
      warnings: [],
      optimality_guarantee: 'Optimal (unit costs)',
      completeness_guarantee: 'Complete',
      summary: 'Start node is the goal. Immediate solution found.',
    };
  }

  const queue: Array<GridCoordinate | string> = [start];
  const inQueue = new Set<string>([env.key(start)]);
  const explored = new Set<string>();
  const parents = new Map<string, GridCoordinate | string | null>([[env.key(start), null]]);
  const gCosts = new Map<string, number>([[env.key(start), 0]]);

  const events: SearchEvent[] = [];
  let step = 0;
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;
  let solutionFound = false;
  let goalNode: GridCoordinate | string | null = null;

  step++;
  events.push({
    step,
    type: 'frontier_add',
    node: env.formatNode(start),
    g: 0,
    h: Math.round(env.heuristic(start) * 100) / 100,
    f: Math.round(env.heuristic(start) * 100) / 100,
    frontier_size: 1,
    explored_size: 0,
    explanation: 'Initialised FIFO queue with start node.',
  });

  while (queue.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, queue.length);
    const current = queue.shift()!;
    const currKey = env.key(current);
    inQueue.delete(currKey);

    explored.add(currKey);
    nodesExpanded++;

    if (events.length < maxEvents) {
      step++;
      events.push({
        step,
        type: 'expand',
        node: env.formatNode(current),
        g: gCosts.get(currKey) ?? 0,
        h: Math.round(env.heuristic(current) * 100) / 100,
        f: gCosts.get(currKey) ?? 0,
        frontier_size: queue.length,
        explored_size: explored.size,
        explanation: `Popped node ${currKey} from front of queue; expanding unvisited successors.`,
      });
    }

    if (env.isGoal(current)) {
      solutionFound = true;
      goalNode = current;
      break;
    }

    for (const neighbor of env.getNeighbors(current)) {
      const nKey = env.key(neighbor.node);
      if (!explored.has(nKey) && !inQueue.has(nKey)) {
        nodesGenerated++;
        parents.set(nKey, current);
        gCosts.set(nKey, (gCosts.get(currKey) ?? 0) + neighbor.cost);
        queue.push(neighbor.node);
        inQueue.add(nKey);

        if (events.length < maxEvents) {
          step++;
          events.push({
            step,
            type: 'frontier_add',
            node: env.formatNode(neighbor.node),
            parent: env.formatNode(current),
            g: gCosts.get(nKey),
            h: Math.round(env.heuristic(neighbor.node) * 100) / 100,
            f: gCosts.get(nKey),
            frontier_size: queue.length,
            explored_size: explored.size,
            explanation: `Enqueued unvisited successor ${nKey} at rear of FIFO queue.`,
          });
        }

        if (env.isGoal(neighbor.node)) {
          // BFS can terminate on generation for unit costs
          solutionFound = true;
          goalNode = neighbor.node;
          break;
        }
      }
    }

    if (solutionFound) break;
  }

  const finalPath = solutionFound && goalNode ? reconstructPath(parents, env, goalNode) : [];
  const finalCost = goalNode ? (gCosts.get(env.key(goalNode)) ?? 0) : 0;

  if (solutionFound && goalNode) {
    step++;
    events.push({
      step,
      type: 'path_found',
      node: env.formatNode(goalNode),
      g: finalCost,
      frontier_size: queue.length,
      explored_size: explored.size,
      explanation: `Goal reached! Reconstructed optimal path with length ${finalPath.length}.`,
    });
  } else {
    step++;
    events.push({
      step,
      type: 'search_failed',
      node: env.formatNode(start),
      frontier_size: 0,
      explored_size: explored.size,
      explanation: 'Queue exhausted with no unblocked path to the goal state.',
    });
  }

  return {
    algorithm: 'bfs',
    solution_found: solutionFound,
    path: finalPath,
    path_cost: Math.round(finalCost * 100) / 100,
    path_length: finalPath.length,
    nodes_expanded: nodesExpanded,
    nodes_generated: nodesGenerated,
    max_frontier_size: maxFrontierSize,
    execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
    total_events: events.length,
    events,
    warnings: [],
    optimality_guarantee: 'Optimal for uniform step costs; suboptimal on weighted terrain.',
    completeness_guarantee: 'Complete on finite state spaces.',
    summary: solutionFound
      ? `BFS found path of ${finalPath.length} steps (cost: ${Math.round(finalCost * 10) / 10}) by expanding ${nodesExpanded} nodes.`
      : 'Goal unreachable.',
  };
}

// --------------------------------------------------------------------------
// 2. Depth-First Search (DFS)
// --------------------------------------------------------------------------
export function runDFS(env: SearchEnvironment, options: RunSearchOptions = {}): SearchResult {
  const t0 = performance.now();
  const maxEvents = options.maxEvents || 8000;
  const start = env.startNode;

  if (env.isGoal(start)) {
    return {
      algorithm: 'dfs',
      solution_found: true,
      path: [env.formatNode(start)],
      path_cost: 0,
      path_length: 1,
      nodes_expanded: 0,
      nodes_generated: 1,
      max_frontier_size: 1,
      execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
      total_events: 1,
      events: [
        {
          step: 1,
          type: 'path_found',
          node: env.formatNode(start),
          g: 0,
          h: 0,
          f: 0,
          frontier_size: 0,
          explored_size: 1,
          explanation: 'Start node is the goal state.',
        },
      ],
      warnings: [],
      optimality_guarantee: 'Non-optimal',
      completeness_guarantee: 'Complete (with cycle check)',
      summary: 'Start node is the goal.',
    };
  }

  const stack: Array<GridCoordinate | string> = [start];
  const inStack = new Set<string>([env.key(start)]);
  const explored = new Set<string>();
  const parents = new Map<string, GridCoordinate | string | null>([[env.key(start), null]]);
  const gCosts = new Map<string, number>([[env.key(start), 0]]);

  const events: SearchEvent[] = [];
  let step = 0;
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;
  let solutionFound = false;
  let goalNode: GridCoordinate | string | null = null;

  step++;
  events.push({
    step,
    type: 'frontier_add',
    node: env.formatNode(start),
    g: 0,
    frontier_size: 1,
    explored_size: 0,
    explanation: 'Initialised LIFO stack with start node.',
  });

  while (stack.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, stack.length);
    const current = stack.pop()!;
    const currKey = env.key(current);
    inStack.delete(currKey);

    if (explored.has(currKey)) continue;

    explored.add(currKey);
    nodesExpanded++;

    if (events.length < maxEvents) {
      step++;
      events.push({
        step,
        type: 'expand',
        node: env.formatNode(current),
        g: gCosts.get(currKey) ?? 0,
        frontier_size: stack.length,
        explored_size: explored.size,
        explanation: `Popped deepest node ${currKey} from top of LIFO stack.`,
      });
    }

    if (env.isGoal(current)) {
      solutionFound = true;
      goalNode = current;
      break;
    }

    const neighbors = env.getNeighbors(current);
    for (const neighbor of neighbors) {
      const nKey = env.key(neighbor.node);
      if (!explored.has(nKey) && !inStack.has(nKey)) {
        nodesGenerated++;
        parents.set(nKey, current);
        gCosts.set(nKey, (gCosts.get(currKey) ?? 0) + neighbor.cost);
        stack.push(neighbor.node);
        inStack.add(nKey);

        if (events.length < maxEvents) {
          step++;
          events.push({
            step,
            type: 'frontier_add',
            node: env.formatNode(neighbor.node),
            parent: env.formatNode(current),
            g: gCosts.get(nKey),
            frontier_size: stack.length,
            explored_size: explored.size,
            explanation: `Pushed unvisited successor ${nKey} onto top of LIFO stack.`,
          });
        }
      }
    }
  }

  const finalPath = solutionFound && goalNode ? reconstructPath(parents, env, goalNode) : [];
  const finalCost = goalNode ? (gCosts.get(env.key(goalNode)) ?? 0) : 0;

  if (solutionFound && goalNode) {
    step++;
    events.push({
      step,
      type: 'path_found',
      node: env.formatNode(goalNode),
      g: finalCost,
      frontier_size: stack.length,
      explored_size: explored.size,
      explanation: `DFS reached goal! Note: Path is typically non-optimal (${finalPath.length} steps).`,
    });
  }

  return {
    algorithm: 'dfs',
    solution_found: solutionFound,
    path: finalPath,
    path_cost: Math.round(finalCost * 100) / 100,
    path_length: finalPath.length,
    nodes_expanded: nodesExpanded,
    nodes_generated: nodesGenerated,
    max_frontier_size: maxFrontierSize,
    execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
    total_events: events.length,
    events,
    warnings: ['DFS does not guarantee finding the shortest or lowest-cost path.'],
    optimality_guarantee: 'Non-optimal',
    completeness_guarantee: 'Complete on finite graphs with cycle checking.',
    summary: solutionFound
      ? `DFS found a path with cost ${Math.round(finalCost * 10) / 10} (${finalPath.length} steps) after expanding ${nodesExpanded} nodes.`
      : 'Goal unreachable.',
  };
}

// --------------------------------------------------------------------------
// 3. Uniform Cost Search (UCS / Dijkstra)
// --------------------------------------------------------------------------
export function runUCS(env: SearchEnvironment, options: RunSearchOptions = {}): SearchResult {
  const t0 = performance.now();
  const maxEvents = options.maxEvents || 8000;
  const start = env.startNode;

  // Priority Queue entry: { cost: number, node: GridCoordinate | string }
  const pq: Array<{ cost: number; node: GridCoordinate | string }> = [{ cost: 0, node: start }];
  const gCosts = new Map<string, number>([[env.key(start), 0]]);
  const explored = new Set<string>();
  const parents = new Map<string, GridCoordinate | string | null>([[env.key(start), null]]);

  const events: SearchEvent[] = [];
  let step = 0;
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;
  let solutionFound = false;
  let goalNode: GridCoordinate | string | null = null;

  step++;
  events.push({
    step,
    type: 'frontier_add',
    node: env.formatNode(start),
    g: 0,
    f: 0,
    frontier_size: 1,
    explored_size: 0,
    explanation: 'Initialised priority queue with start node (g=0).',
  });

  while (pq.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, pq.length);
    // Sort by lowest g(n)
    pq.sort((a, b) => a.cost - b.cost);
    const { cost: currG, node: current } = pq.shift()!;
    const currKey = env.key(current);

    if (currG > (gCosts.get(currKey) ?? Infinity)) continue;
    if (explored.has(currKey)) continue;

    explored.add(currKey);
    nodesExpanded++;

    if (events.length < maxEvents) {
      step++;
      events.push({
        step,
        type: 'expand',
        node: env.formatNode(current),
        g: currG,
        f: currG,
        frontier_size: pq.length,
        explored_size: explored.size,
        explanation: `Popped node with lowest g(n)=${Math.round(currG * 10) / 10} from priority queue.`,
      });
    }

    if (env.isGoal(current)) {
      solutionFound = true;
      goalNode = current;
      break;
    }

    for (const neighbor of env.getNeighbors(current)) {
      const nKey = env.key(neighbor.node);
      const tentG = currG + neighbor.cost;
      const prevG = gCosts.get(nKey) ?? Infinity;

      if (tentG < prevG) {
        gCosts.set(nKey, tentG);
        parents.set(nKey, current);
        nodesGenerated++;
        pq.push({ cost: tentG, node: neighbor.node });

        if (events.length < maxEvents) {
          step++;
          events.push({
            step,
            type: prevG === Infinity ? 'frontier_add' : 'frontier_update',
            node: env.formatNode(neighbor.node),
            parent: env.formatNode(current),
            g: Math.round(tentG * 100) / 100,
            f: Math.round(tentG * 100) / 100,
            frontier_size: pq.length,
            explored_size: explored.size,
            explanation: `Updated cheapest path to ${nKey}: g=${Math.round(tentG * 10) / 10}.`,
          });
        }
      }
    }
  }

  const finalPath = solutionFound && goalNode ? reconstructPath(parents, env, goalNode) : [];
  const finalCost = goalNode ? (gCosts.get(env.key(goalNode)) ?? 0) : 0;

  return {
    algorithm: 'ucs',
    solution_found: solutionFound,
    path: finalPath,
    path_cost: Math.round(finalCost * 100) / 100,
    path_length: finalPath.length,
    nodes_expanded: nodesExpanded,
    nodes_generated: nodesGenerated,
    max_frontier_size: maxFrontierSize,
    execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
    total_events: events.length,
    events,
    warnings: [],
    optimality_guarantee: 'Strictly optimal for all non-negative step costs.',
    completeness_guarantee: 'Complete if all step costs >= eps > 0.',
    summary: solutionFound
      ? `UCS found strictly optimal path with cost ${Math.round(finalCost * 100) / 100} across ${finalPath.length} nodes.`
      : 'Goal unreachable.',
  };
}

// --------------------------------------------------------------------------
// 4. Greedy Best-First Search
// --------------------------------------------------------------------------
export function runGreedy(env: SearchEnvironment, options: RunSearchOptions = {}): SearchResult {
  const t0 = performance.now();
  const maxEvents = options.maxEvents || 8000;
  const start = env.startNode;
  const startH = env.heuristic(start);

  const pq: Array<{ h: number; node: GridCoordinate | string }> = [{ h: startH, node: start }];
  const explored = new Set<string>();
  const inPQ = new Set<string>([env.key(start)]);
  const parents = new Map<string, GridCoordinate | string | null>([[env.key(start), null]]);
  const gCosts = new Map<string, number>([[env.key(start), 0]]);

  const events: SearchEvent[] = [];
  let step = 0;
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;
  let solutionFound = false;
  let goalNode: GridCoordinate | string | null = null;

  step++;
  events.push({
    step,
    type: 'frontier_add',
    node: env.formatNode(start),
    h: Math.round(startH * 100) / 100,
    f: Math.round(startH * 100) / 100,
    frontier_size: 1,
    explored_size: 0,
    explanation: `Initialised greedy priority queue with start node: h=${Math.round(startH * 10) / 10}.`,
  });

  while (pq.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, pq.length);
    pq.sort((a, b) => a.h - b.h);
    const { h: currH, node: current } = pq.shift()!;
    const currKey = env.key(current);
    inPQ.delete(currKey);

    explored.add(currKey);
    nodesExpanded++;

    if (events.length < maxEvents) {
      step++;
      events.push({
        step,
        type: 'expand',
        node: env.formatNode(current),
        g: gCosts.get(currKey) ?? 0,
        h: Math.round(currH * 100) / 100,
        f: Math.round(currH * 100) / 100,
        frontier_size: pq.length,
        explored_size: explored.size,
        explanation: `Popped node with lowest heuristic h(n)=${Math.round(currH * 10) / 10}.`,
      });
    }

    if (env.isGoal(current)) {
      solutionFound = true;
      goalNode = current;
      break;
    }

    for (const neighbor of env.getNeighbors(current)) {
      const nKey = env.key(neighbor.node);
      if (!explored.has(nKey) && !inPQ.has(nKey)) {
        nodesGenerated++;
        parents.set(nKey, current);
        gCosts.set(nKey, (gCosts.get(currKey) ?? 0) + neighbor.cost);
        const nh = env.heuristic(neighbor.node);
        pq.push({ h: nh, node: neighbor.node });
        inPQ.add(nKey);

        if (events.length < maxEvents) {
          step++;
          events.push({
            step,
            type: 'frontier_add',
            node: env.formatNode(neighbor.node),
            parent: env.formatNode(current),
            g: gCosts.get(nKey),
            h: Math.round(nh * 100) / 100,
            f: Math.round(nh * 100) / 100,
            frontier_size: pq.length,
            explored_size: explored.size,
            explanation: `Added successor ${nKey} with h(n)=${Math.round(nh * 10) / 10}.`,
          });
        }
      }
    }
  }

  const finalPath = solutionFound && goalNode ? reconstructPath(parents, env, goalNode) : [];
  const finalCost = goalNode ? (gCosts.get(env.key(goalNode)) ?? 0) : 0;

  return {
    algorithm: 'greedy',
    solution_found: solutionFound,
    path: finalPath,
    path_cost: Math.round(finalCost * 100) / 100,
    path_length: finalPath.length,
    nodes_expanded: nodesExpanded,
    nodes_generated: nodesGenerated,
    max_frontier_size: maxFrontierSize,
    execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
    total_events: events.length,
    events,
    warnings: ['Greedy Best-First is not optimal; it can be tricked by local obstacles.'],
    optimality_guarantee: 'Not optimal (ignores past path cost g).',
    completeness_guarantee: 'Incomplete on infinite graphs; complete on finite spaces with closed set.',
    summary: solutionFound
      ? `Greedy found path of ${finalPath.length} steps (cost: ${Math.round(finalCost * 10) / 10}) very rapidly.`
      : 'Goal unreachable.',
  };
}

// --------------------------------------------------------------------------
// 5. A* Search
// --------------------------------------------------------------------------
export function runAStar(env: SearchEnvironment, options: RunSearchOptions = {}): SearchResult {
  const t0 = performance.now();
  const maxEvents = options.maxEvents || 8000;
  const start = env.startNode;
  const startH = env.heuristic(start);
  const startF = 0 + startH;

  const pq: Array<{ f: number; h: number; node: GridCoordinate | string }> = [
    { f: startF, h: startH, node: start },
  ];
  const gCosts = new Map<string, number>([[env.key(start), 0]]);
  const fCosts = new Map<string, number>([[env.key(start), startF]]);
  const explored = new Set<string>();
  const parents = new Map<string, GridCoordinate | string | null>([[env.key(start), null]]);

  const events: SearchEvent[] = [];
  let step = 0;
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;
  let solutionFound = false;
  let goalNode: GridCoordinate | string | null = null;

  step++;
  events.push({
    step,
    type: 'frontier_add',
    node: env.formatNode(start),
    g: 0,
    h: Math.round(startH * 100) / 100,
    f: Math.round(startF * 100) / 100,
    frontier_size: 1,
    explored_size: 0,
    explanation: `Initialised A* priority queue: g=0.0, h=${Math.round(startH * 10) / 10}, f=${Math.round(startF * 10) / 10}.`,
  });

  while (pq.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, pq.length);
    // Sort by f(n), tie-break by lower h(n)
    pq.sort((a, b) => a.f - b.f || a.h - b.h);
    const { f: currF, h: currH, node: current } = pq.shift()!;
    const currKey = env.key(current);

    if (currF > (fCosts.get(currKey) ?? Infinity)) continue;
    if (explored.has(currKey)) continue;

    explored.add(currKey);
    nodesExpanded++;

    const currG = gCosts.get(currKey) ?? 0;
    if (events.length < maxEvents) {
      step++;
      events.push({
        step,
        type: 'expand',
        node: env.formatNode(current),
        g: Math.round(currG * 100) / 100,
        h: Math.round(currH * 100) / 100,
        f: Math.round(currF * 100) / 100,
        frontier_size: pq.length,
        explored_size: explored.size,
        explanation: `Expanded node with lowest f(n)=g(${Math.round(currG * 10) / 10})+h(${Math.round(currH * 10) / 10})=${Math.round(currF * 10) / 10}.`,
      });
    }

    if (env.isGoal(current)) {
      solutionFound = true;
      goalNode = current;
      break;
    }

    for (const neighbor of env.getNeighbors(current)) {
      const nKey = env.key(neighbor.node);
      const tentG = currG + neighbor.cost;
      const prevG = gCosts.get(nKey) ?? Infinity;

      if (tentG < prevG) {
        gCosts.set(nKey, tentG);
        parents.set(nKey, current);
        const nh = env.heuristic(neighbor.node);
        const nf = tentG + nh;
        fCosts.set(nKey, nf);
        nodesGenerated++;
        pq.push({ f: nf, h: nh, node: neighbor.node });

        if (events.length < maxEvents) {
          step++;
          events.push({
            step,
            type: prevG === Infinity ? 'frontier_add' : 'frontier_update',
            node: env.formatNode(neighbor.node),
            parent: env.formatNode(current),
            g: Math.round(tentG * 100) / 100,
            h: Math.round(nh * 100) / 100,
            f: Math.round(nf * 100) / 100,
            frontier_size: pq.length,
            explored_size: explored.size,
            explanation: `Evaluated successor ${nKey}: g=${Math.round(tentG * 10) / 10}, h=${Math.round(nh * 10) / 10}, f=${Math.round(nf * 10) / 10}.`,
          });
        }
      }
    }
  }

  const finalPath = solutionFound && goalNode ? reconstructPath(parents, env, goalNode) : [];
  const finalCost = goalNode ? (gCosts.get(env.key(goalNode)) ?? 0) : 0;

  return {
    algorithm: 'astar',
    solution_found: solutionFound,
    path: finalPath,
    path_cost: Math.round(finalCost * 100) / 100,
    path_length: finalPath.length,
    nodes_expanded: nodesExpanded,
    nodes_generated: nodesGenerated,
    max_frontier_size: maxFrontierSize,
    execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
    total_events: events.length,
    events,
    warnings: [],
    optimality_guarantee: 'Optimal with admissible/consistent heuristic.',
    completeness_guarantee: 'Complete on finite branching spaces.',
    summary: solutionFound
      ? `A* found optimal path (cost: ${Math.round(finalCost * 100) / 100}, length: ${finalPath.length}) by expanding ${nodesExpanded} nodes.`
      : 'Goal unreachable.',
  };
}

// --------------------------------------------------------------------------
// 6. Iterative Deepening A* (IDA*)
// --------------------------------------------------------------------------
export function runIDAStar(env: SearchEnvironment, options: RunSearchOptions = {}): SearchResult {
  const t0 = performance.now();
  const maxEvents = options.maxEvents || 8000;
  const start = env.startNode;
  const startH = env.heuristic(start);

  let threshold = startH;
  const events: SearchEvent[] = [];
  let step = 0;
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;
  let solutionFound = false;
  let finalPath: Array<GridCoordinate | string> = [];
  let finalCost = 0;

  const path: Array<GridCoordinate | string> = [start];
  const inPath = new Set<string>([env.key(start)]);

  function search(g: number, bound: number): number | 'FOUND' {
    const current = path[path.length - 1];
    const h = env.heuristic(current);
    const f = g + h;

    if (f > bound) return f;
    if (env.isGoal(current)) {
      solutionFound = true;
      finalPath = path.map((n) => env.formatNode(n));
      finalCost = g;
      return 'FOUND';
    }

    nodesExpanded++;
    maxFrontierSize = Math.max(maxFrontierSize, path.length);

    if (events.length < maxEvents) {
      step++;
      events.push({
        step,
        type: 'expand',
        node: env.formatNode(current),
        g: Math.round(g * 100) / 100,
        h: Math.round(h * 100) / 100,
        f: Math.round(f * 100) / 100,
        frontier_size: path.length,
        explored_size: nodesExpanded,
        explanation: `IDA* expanding depth branch: g=${Math.round(g * 10) / 10}, h=${Math.round(h * 10) / 10}, f=${Math.round(f * 10) / 10} <= threshold (${Math.round(bound * 10) / 10}).`,
      });
    }

    let minThreshold = Infinity;
    const neighbors = env.getNeighbors(current);
    neighbors.sort((a, b) => a.cost + env.heuristic(a.node) - (b.cost + env.heuristic(b.node)));

    for (const neighbor of neighbors) {
      const nKey = env.key(neighbor.node);
      if (!inPath.has(nKey)) {
        nodesGenerated++;
        path.push(neighbor.node);
        inPath.add(nKey);

        const res = search(g + neighbor.cost, bound);
        if (res === 'FOUND') return 'FOUND';
        if (res < minThreshold) minThreshold = res;

        path.pop();
        inPath.delete(nKey);
      }
    }

    return minThreshold;
  }

  for (let iteration = 0; iteration < 50; iteration++) {
    if (events.length < maxEvents) {
      step++;
      events.push({
        step,
        type: 'threshold_update',
        node: env.formatNode(start),
        f: Math.round(threshold * 100) / 100,
        frontier_size: 1,
        explored_size: nodesExpanded,
        explanation: `Started IDA* iteration ${iteration + 1} with cutoff threshold f <= ${Math.round(threshold * 100) / 100}.`,
      });
    }

    const res = search(0, threshold);
    if (res === 'FOUND') break;
    if (res === Infinity || isNaN(res)) break;
    threshold = res;
  }

  return {
    algorithm: 'idastar',
    solution_found: solutionFound,
    path: finalPath,
    path_cost: Math.round(finalCost * 100) / 100,
    path_length: finalPath.length,
    nodes_expanded: nodesExpanded,
    nodes_generated: nodesGenerated,
    max_frontier_size: maxFrontierSize,
    execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
    total_events: events.length,
    events,
    warnings: [],
    optimality_guarantee: 'Optimal with admissible heuristic; uses O(d) memory.',
    completeness_guarantee: 'Complete on finite graphs.',
    summary: solutionFound
      ? `IDA* found optimal path with linear memory footprint O(d) in ${nodesExpanded} node evaluations.`
      : 'Goal unreachable within threshold limits.',
  };
}

// --------------------------------------------------------------------------
// 7. Hill Climbing
// --------------------------------------------------------------------------
export function runHillClimbing(env: SearchEnvironment, options: RunSearchOptions = {}): SearchResult {
  const t0 = performance.now();
  const maxEvents = options.maxEvents || 8000;
  const maxSideways = options.maxSideways ?? 10;
  const allowRestarts = options.allowRestarts ?? false;
  const maxRestarts = options.maxRestarts ?? 3;

  let current = env.startNode;
  let currH = env.heuristic(current);
  const visited = new Set<string>([env.key(current)]);
  const path: Array<GridCoordinate | string> = [current];
  let totalCost = 0;

  const events: SearchEvent[] = [];
  let step = 0;
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let solutionFound = false;
  let sidewaysCount = 0;
  let restartsUsed = 0;

  step++;
  events.push({
    step,
    type: 'frontier_add',
    node: env.formatNode(current),
    h: Math.round(currH * 100) / 100,
    frontier_size: 1,
    explored_size: 0,
    explanation: `Initialised Hill Climbing at start node: h=${Math.round(currH * 10) / 10}.`,
  });

  while (step < maxEvents) {
    if (env.isGoal(current)) {
      solutionFound = true;
      break;
    }

    nodesExpanded++;
    const neighbors = env.getNeighbors(current);
    if (neighbors.length === 0) break;

    // Steepest descent: find neighbor with strictly lowest h(n)
    let bestNeighbor = neighbors[0];
    let bestH = env.heuristic(bestNeighbor.node);

    for (let i = 1; i < neighbors.length; i++) {
      const nh = env.heuristic(neighbors[i].node);
      if (nh < bestH) {
        bestH = nh;
        bestNeighbor = neighbors[i];
      }
    }

    nodesGenerated += neighbors.length;

    if (bestH < currH) {
      // Direct improvement
      sidewaysCount = 0;
      currH = bestH;
      totalCost += bestNeighbor.cost;
      current = bestNeighbor.node;
      path.push(current);
      visited.add(env.key(current));

      step++;
      events.push({
        step,
        type: 'expand',
        node: env.formatNode(current),
        h: Math.round(currH * 100) / 100,
        frontier_size: 1,
        explored_size: nodesExpanded,
        explanation: `Moved downhill to neighbor with lower heuristic h=${Math.round(currH * 10) / 10}.`,
      });
    } else if (bestH === currH && sidewaysCount < maxSideways) {
      // Sideways plateau move
      sidewaysCount++;
      totalCost += bestNeighbor.cost;
      current = bestNeighbor.node;
      path.push(current);
      visited.add(env.key(current));

      step++;
      events.push({
        step,
        type: 'local_optimum',
        node: env.formatNode(current),
        h: Math.round(currH * 100) / 100,
        frontier_size: 1,
        explored_size: nodesExpanded,
        explanation: `Traversing plateau (sideways move ${sidewaysCount}/${maxSideways}) at h=${Math.round(currH * 10) / 10}.`,
      });
    } else {
      // Stuck in local optimum
      step++;
      events.push({
        step,
        type: 'local_optimum',
        node: env.formatNode(current),
        h: Math.round(currH * 100) / 100,
        frontier_size: 0,
        explored_size: nodesExpanded,
        explanation: `Stuck at local optimum: all neighbors have h >= ${Math.round(currH * 10) / 10}.`,
      });

      if (allowRestarts && restartsUsed < maxRestarts) {
        restartsUsed++;
        current = env.startNode;
        currH = env.heuristic(current);
        sidewaysCount = 0;
        step++;
        events.push({
          step,
          type: 'restart',
          node: env.formatNode(current),
          h: Math.round(currH * 100) / 100,
          frontier_size: 1,
          explored_size: nodesExpanded,
          explanation: `Triggered random restart (${restartsUsed}/${maxRestarts}).`,
        });
      } else {
        break;
      }
    }
  }

  const finalPath = solutionFound ? path.map((n) => env.formatNode(n)) : [];

  return {
    algorithm: 'hill_climbing',
    solution_found: solutionFound,
    path: finalPath,
    path_cost: Math.round(totalCost * 100) / 100,
    path_length: finalPath.length,
    nodes_expanded: nodesExpanded,
    nodes_generated: nodesGenerated,
    max_frontier_size: 1,
    execution_time_ms: Math.round((performance.now() - t0) * 100) / 100,
    total_events: events.length,
    events,
    warnings: solutionFound
      ? []
      : ['Hill Climbing terminated at local optimum before reaching goal.'],
    optimality_guarantee: 'Not optimal (greedy gradient descent).',
    completeness_guarantee: 'Incomplete: Can get stuck in local minima or plateaus.',
    summary: solutionFound
      ? `Hill Climbing reached goal in ${finalPath.length} steps.`
      : 'Hill climbing trapped in local minimum / plateau.',
  };
}
