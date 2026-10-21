import { GraphState, GridCoordinate, GridState } from '../types';
import { buildGraphHeuristic, buildGridHeuristic, HeuristicFunc } from './heuristics';

export interface SearchEnvironment {
  startNode: GridCoordinate | string;
  goalNode: GridCoordinate | string;
  getNeighbors(node: GridCoordinate | string): Array<{ node: GridCoordinate | string; cost: number }>;
  heuristic(node: GridCoordinate | string): number;
  isGoal(node: GridCoordinate | string): boolean;
  formatNode(node: GridCoordinate | string): GridCoordinate | string;
  key(node: GridCoordinate | string): string;
}

export class GridEnvironment implements SearchEnvironment {
  public rows: number;
  public cols: number;
  public startNode: GridCoordinate;
  public goalNode: GridCoordinate;
  public walls: Set<string>;
  public diagonal: boolean;
  public terrain: Map<string, number>;
  private _heuristicFunc: HeuristicFunc;

  constructor(gridState: GridState, heuristicName: string = 'manhattan') {
    this.rows = gridState.rows;
    this.cols = gridState.cols;
    this.startNode = [gridState.start[0], gridState.start[1]];
    this.goalNode = [gridState.goal[0], gridState.goal[1]];
    this.walls = new Set((gridState.walls || []).map((w) => `${w[0]},${w[1]}`));
    this.diagonal = !!gridState.diagonal_movement;

    this.terrain = new Map();
    for (const [key, cost] of Object.entries(gridState.terrain || {})) {
      this.terrain.set(key, Number(cost));
    }

    this._heuristicFunc = buildGridHeuristic(heuristicName, this.goalNode, this.diagonal);
  }

  key(node: GridCoordinate | string): string {
    if (typeof node === 'string') return node;
    return `${node[0]},${node[1]}`;
  }

  isGoal(node: GridCoordinate | string): boolean {
    if (typeof node === 'string') return false;
    return node[0] === this.goalNode[0] && node[1] === this.goalNode[1];
  }

  heuristic(node: GridCoordinate | string): number {
    return this._heuristicFunc(node);
  }

  formatNode(node: GridCoordinate | string): GridCoordinate | string {
    return node;
  }

  getNeighbors(node: GridCoordinate | string): Array<{ node: GridCoordinate; cost: number }> {
    if (typeof node === 'string') return [];
    const [r, c] = node;
    const neighbors: Array<{ node: GridCoordinate; cost: number }> = [];

    // Orthogonal: N, E, S, W
    const ortho = [
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ];
    for (const [dr, dc] of ortho) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !this.walls.has(key)) {
        const costMult = this.terrain.get(key) ?? 1.0;
        neighbors.push({ node: [nr, nc], cost: 1.0 * costMult });
      }
    }

    // Diagonal: NE, SE, SW, NW
    if (this.diagonal) {
      const diag = [
        [-1, 1],
        [1, 1],
        [1, -1],
        [-1, -1],
      ];
      for (const [dr, dc] of diag) {
        const nr = r + dr;
        const nc = c + dc;
        const key = `${nr},${nc}`;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && !this.walls.has(key)) {
          // Corner cutting prevention
          const corner1 = `${r + dr},${c}`;
          const corner2 = `${r},${c + dc}`;
          if (this.walls.has(corner1) && this.walls.has(corner2)) {
            continue;
          }
          const costMult = this.terrain.get(key) ?? 1.0;
          neighbors.push({ node: [nr, nc], cost: Math.SQRT2 * costMult });
        }
      }
    }

    return neighbors;
  }
}

export class GraphEnvironment implements SearchEnvironment {
  public startNode: string;
  public goalNode: string;
  public adjacency: Map<string, Array<{ target: string; cost: number }>>;
  public nodeCoords: Record<string, [number, number]>;
  private _heuristicFunc: HeuristicFunc;

  constructor(graphState: GraphState, heuristicName: string = 'graph_euclidean') {
    this.startNode = graphState.start;
    this.goalNode = graphState.goal;
    this.adjacency = new Map();
    this.nodeCoords = {};

    for (const node of graphState.nodes || []) {
      this.adjacency.set(node.id, []);
      this.nodeCoords[node.id] = [node.x, node.y];
    }

    for (const edge of graphState.edges || []) {
      const w = Math.max(0.1, Number(edge.weight || 1.0));
      if (!this.adjacency.has(edge.source)) this.adjacency.set(edge.source, []);
      this.adjacency.get(edge.source)!.push({ target: edge.target, cost: w });

      if (!edge.directed) {
        if (!this.adjacency.has(edge.target)) this.adjacency.set(edge.target, []);
        this.adjacency.get(edge.target)!.push({ target: edge.source, cost: w });
      }
    }

    this._heuristicFunc = buildGraphHeuristic(this.goalNode, this.nodeCoords, heuristicName);
  }

  key(node: GridCoordinate | string): string {
    if (typeof node === 'string') return node;
    return `${node[0]},${node[1]}`;
  }

  isGoal(node: GridCoordinate | string): boolean {
    return String(node) === this.goalNode;
  }

  heuristic(node: GridCoordinate | string): number {
    return this._heuristicFunc(node);
  }

  formatNode(node: GridCoordinate | string): string {
    return String(node);
  }

  getNeighbors(node: GridCoordinate | string): Array<{ node: string; cost: number }> {
    const id = String(node);
    const edges = this.adjacency.get(id) || [];
    return edges.map((e) => ({ node: e.target, cost: e.cost }));
  }
}
