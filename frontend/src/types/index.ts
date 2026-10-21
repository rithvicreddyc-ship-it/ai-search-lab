export type AlgorithmType =
  | 'bfs'
  | 'dfs'
  | 'ucs'
  | 'greedy'
  | 'astar'
  | 'idastar'
  | 'hill_climbing';

export type ProblemType = 'grid' | 'graph';

export type HeuristicType =
  | 'manhattan'
  | 'euclidean'
  | 'octile'
  | 'chebyshev'
  | 'graph_euclidean'
  | 'zero';

export type DifficultyType = 'easy' | 'medium' | 'hard';
export type MazePatternType = 'recursive_division' | 'random' | 'prim' | 'rooms';

export type GridCoordinate = [number, number];

export interface GridState {
  rows: number;
  cols: number;
  start: GridCoordinate;
  goal: GridCoordinate;
  walls: GridCoordinate[];
  terrain: Record<string, number>;
  diagonal_movement: boolean;
}

export interface GraphNode {
  id: string;
  label?: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  directed: boolean;
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  start: string;
  goal: string;
}

export type EventType =
  | 'visit'
  | 'expand'
  | 'frontier_add'
  | 'frontier_update'
  | 'explored'
  | 'threshold_update'
  | 'restart'
  | 'local_optimum'
  | 'path_found'
  | 'search_failed';

export interface SearchEvent {
  step: number;
  type: EventType | string;
  node: GridCoordinate | string;
  parent?: GridCoordinate | string | null;
  g?: number;
  h?: number;
  f?: number;
  frontier_size: number;
  explored_size: number;
  explanation: string;
}

export interface SearchResult {
  algorithm: string;
  solution_found: boolean;
  path: Array<GridCoordinate | string>;
  path_cost: number;
  path_length: number;
  nodes_expanded: number;
  nodes_generated: number;
  max_frontier_size: number;
  execution_time_ms: number;
  total_events: number;
  events: SearchEvent[];
  warnings: string[];
  optimality_guarantee: string;
  completeness_guarantee: string;
  summary: string;
}

export interface VivaQuestion {
  question: string;
  answer: string;
}

export interface AlgorithmMetadata {
  id: AlgorithmType;
  name: string;
  category: string;
  time_complexity: string;
  space_complexity: string;
  completeness: string;
  optimality: string;
  requires_heuristic: boolean;
  supports_weights: boolean;
  pseudocode: string[];
  description: string;
  viva_questions: VivaQuestion[];
}

export interface CompareResultItem {
  algorithm: string;
  name: string;
  solution_found: boolean;
  path_cost: number;
  path_length: number;
  nodes_expanded: number;
  nodes_generated: number;
  max_frontier_size: number;
  execution_time_ms: number;
  optimality_guarantee: string;
  completeness_guarantee: string;
  notes: string;
  path: Array<GridCoordinate | string>;
}

export interface CompareResponse {
  problem_type: ProblemType;
  results: CompareResultItem[];
  analysis_narrative: string;
  fastest_algorithm?: string;
  lowest_cost_algorithm?: string;
  least_expanded_algorithm?: string;
}

export interface MazeGenerateResponse {
  rows: number;
  cols: number;
  start: GridCoordinate;
  goal: GridCoordinate;
  walls: GridCoordinate[];
  terrain: Record<string, number>;
  difficulty: string;
  seed: number;
}

export interface ValidationResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExperimentReport {
  title: string;
  description: string;
  research_question: string;
  configuration: Record<string, any>;
  results: CompareResultItem[];
  narrative: string;
  viva_takeaways: string[];
}
