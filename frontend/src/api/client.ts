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

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; version: string; available_algorithms: string[] }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('API server is unreachable');
  return res.json();
}

export async function fetchAlgorithms(): Promise<AlgorithmMetadata[]> {
  const res = await fetch(`${API_BASE}/algorithms`);
  if (!res.ok) throw new Error('Failed to fetch algorithm metadata');
  return res.json();
}

export async function fetchPresets(): Promise<{
  grids: Record<string, { id: string; name: string; description: string; state: GridState }>;
  graphs: Record<string, { id: string; name: string; description: string; state: GraphState }>;
  experiments: string[];
}> {
  const res = await fetch(`${API_BASE}/presets`);
  if (!res.ok) throw new Error('Failed to fetch presets');
  return res.json();
}

export async function runSearch(payload: any): Promise<SearchResult> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Search execution failed' }));
    throw new Error(err.detail || 'Search failed');
  }
  return res.json();
}

export async function runCompare(payload: any): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Comparison failed' }));
    throw new Error(err.detail || 'Comparison failed');
  }
  return res.json();
}

export async function generateMaze(payload: any): Promise<MazeGenerateResponse> {
  const res = await fetch(`${API_BASE}/maze/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Maze generation failed');
  return res.json();
}

export async function runExperiment(payload: any): Promise<ExperimentReport> {
  const res = await fetch(`${API_BASE}/experiments/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Experiment execution failed');
  return res.json();
}

export async function validateProblem(payload: any): Promise<ValidationResponse> {
  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Validation request failed');
  return res.json();
}
