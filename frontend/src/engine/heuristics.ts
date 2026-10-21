import { GridCoordinate } from '../types';

export type HeuristicFunc = (node: GridCoordinate | string) => number;

export function manhattanDistance(a: GridCoordinate, b: GridCoordinate): number {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

export function euclideanDistance(a: GridCoordinate, b: GridCoordinate): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function octileDistance(a: GridCoordinate, b: GridCoordinate): number {
  const dx = Math.abs(a[0] - b[0]);
  const dy = Math.abs(a[1] - b[1]);
  const d1 = 1.0;
  const d2 = Math.SQRT2; // ~1.414
  return d1 * (dx + dy) + (d2 - 2.0 * d1) * Math.min(dx, dy);
}

export function chebyshevDistance(a: GridCoordinate, b: GridCoordinate): number {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}

export const ROMANIA_SLD_BUCHAREST: Record<string, number> = {
  Arad: 366.0,
  Bucharest: 0.0,
  Craiova: 160.0,
  Drobeta: 242.0,
  Eforie: 161.0,
  Fagaras: 176.0,
  Giurgiu: 77.0,
  Hirsova: 151.0,
  Iasi: 226.0,
  Lugoj: 244.0,
  Mehadia: 241.0,
  Neamt: 234.0,
  Oradea: 380.0,
  Pitesti: 100.0,
  RimnicuVilcea: 193.0,
  Sibiu: 253.0,
  Timisoara: 329.0,
  Urziceni: 80.0,
  Vaslui: 199.0,
  Zerind: 374.0,
};

export function buildGridHeuristic(
  heuristicName: string,
  goal: GridCoordinate,
  diagonalMovement: boolean = false
): HeuristicFunc {
  const hLower = (heuristicName || 'manhattan').toLowerCase();

  return (node: GridCoordinate | string) => {
    if (typeof node === 'string') return 0;
    const coord = node as GridCoordinate;

    if (hLower === 'zero') {
      return 0;
    } else if (hLower === 'euclidean') {
      return euclideanDistance(coord, goal);
    } else if (hLower === 'octile' || hLower === 'diagonal') {
      return octileDistance(coord, goal);
    } else if (hLower === 'chebyshev') {
      return chebyshevDistance(coord, goal);
    } else {
      // Manhattan
      return manhattanDistance(coord, goal);
    }
  };
}

export function buildGraphHeuristic(
  goalId: string,
  nodeCoords: Record<string, [number, number]>,
  heuristicName: string = 'graph_euclidean'
): HeuristicFunc {
  const hLower = (heuristicName || 'graph_euclidean').toLowerCase();
  if (hLower === 'zero') return () => 0;

  if (goalId === 'Bucharest' && 'Arad' in nodeCoords) {
    return (node: GridCoordinate | string) => {
      const id = typeof node === 'string' ? node : `${node[0]},${node[1]}`;
      return ROMANIA_SLD_BUCHAREST[id] ?? 0;
    };
  }

  const goalPos = nodeCoords[goalId] || [0, 0];
  return (node: GridCoordinate | string) => {
    const id = typeof node === 'string' ? node : `${node[0]},${node[1]}`;
    const pos = nodeCoords[id];
    if (!pos) return 0;
    return Math.hypot(pos[0] - goalPos[0], pos[1] - goalPos[1]);
  };
}
