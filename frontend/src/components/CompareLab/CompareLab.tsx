import React, { useState } from 'react';
import {
  Layers,
  Play,
  Download,
  FileSpreadsheet,
  FileJson,
  Sparkles,
  BarChart2,
  TrendingDown,
  Clock,
  Database,
  Award,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { AlgorithmType, CompareResponse, GridState, GraphState, ProblemType } from '../../types';
import { runCompare } from '../../api/client';
import { exportComparisonToCsv, exportToJson } from '../../utils/export';

interface CompareLabProps {
  currentGrid: GridState;
  currentGraph: GraphState;
  problemType: ProblemType;
}

export const CompareLab: React.FC<CompareLabProps> = ({
  currentGrid,
  currentGraph,
  problemType,
}) => {
  const allAlgorithms: { id: AlgorithmType; label: string }[] = [
    { id: 'bfs', label: 'BFS' },
    { id: 'dfs', label: 'DFS' },
    { id: 'ucs', label: 'UCS (Dijkstra)' },
    { id: 'greedy', label: 'Greedy Best-First' },
    { id: 'astar', label: 'A* Search' },
    { id: 'idastar', label: 'IDA*' },
    { id: 'hill_climbing', label: 'Hill Climbing' },
  ];

  const [selectedAlgs, setSelectedAlgs] = useState<AlgorithmType[]>([
    'bfs',
    'ucs',
    'greedy',
    'astar',
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);

  const toggleAlgorithm = (id: AlgorithmType) => {
    if (selectedAlgs.includes(id)) {
      if (selectedAlgs.length <= 2) {
        alert('Please keep at least 2 algorithms selected for comparative analysis.');
        return;
      }
      setSelectedAlgs(selectedAlgs.filter((a) => a !== id));
    } else {
      setSelectedAlgs([...selectedAlgs, id]);
    }
  };

  const handleRunComparison = async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        algorithms: selectedAlgs,
        problem_type: problemType,
        heuristic: 'manhattan',
        diagonal_movement: currentGrid.diagonal_movement,
      };

      if (problemType === 'grid') {
        payload.grid = currentGrid;
      } else {
        payload.graph = currentGraph;
      }

      const res = await runCompare(payload);
      setCompareData(res);
    } catch (err: any) {
      alert(`Comparison failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Color palette for charts
  const chartColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Algorithm Comparison Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Execute multiple classical search algorithms side-by-side on the exact same problem to contrast pruning, memory, and path cost.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {compareData && (
            <>
              <button
                onClick={() => exportComparisonToCsv(compareData.results)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 shadow-xs transition-colors"
                title="Download CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => exportToJson(compareData, 'search_comparison_report.json')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 shadow-xs transition-colors"
                title="Download JSON report"
              >
                <FileJson className="w-3.5 h-3.5 text-sky-600" />
                <span>Export JSON</span>
              </button>
            </>
          )}

          <button
            onClick={handleRunComparison}
            disabled={isLoading || selectedAlgs.length < 2}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Benchmarking...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Comparison ({selectedAlgs.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Algorithm Checkboxes Selector */}
      <div className="p-5 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Select Algorithms to Benchmark on Current Problem ({problemType.toUpperCase()}):
        </span>
        <div className="flex flex-wrap gap-2.5">
          {allAlgorithms.map((alg) => {
            const isChecked = selectedAlgs.includes(alg.id);
            return (
              <button
                key={alg.id}
                onClick={() => toggleAlgorithm(alg.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isChecked
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  className="rounded accent-indigo-600 w-3.5 h-3.5 pointer-events-none"
                />
                <span>{alg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Results Section */}
      {compareData ? (
        <div className="space-y-6">
          {/* Analytical Narrative Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-indigo-50/80 border border-indigo-200 shadow-glass-card backdrop-blur-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Automated Analytical Interpretation
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {compareData.analysis_narrative}
            </p>
          </div>

          {/* Results Table */}
          <div className="rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Algorithm</th>
                    <th className="px-3 py-3">Found?</th>
                    <th className="px-3 py-3">Path Cost</th>
                    <th className="px-3 py-3">Path Length</th>
                    <th className="px-3 py-3">Nodes Expanded</th>
                    <th className="px-3 py-3">Max Frontier</th>
                    <th className="px-3 py-3">Time (ms)</th>
                    <th className="px-4 py-3">Optimality Property</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {compareData.results.map((res, idx) => (
                    <tr key={res.algorithm} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-sans font-bold text-slate-900 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                        />
                        {res.name}
                      </td>
                      <td className="px-3 py-3 font-sans">
                        {res.solution_found ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> No
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 font-bold text-emerald-700">
                        {res.solution_found ? res.path_cost : '—'}
                      </td>
                      <td className="px-3 py-3 text-amber-700">
                        {res.solution_found ? res.path_length : '—'}
                      </td>
                      <td className="px-3 py-3 font-bold text-sky-700">{res.nodes_expanded}</td>
                      <td className="px-3 py-3 text-purple-700">{res.max_frontier_size}</td>
                      <td className="px-3 py-3 text-slate-700">{res.execution_time_ms}</td>
                      <td className="px-4 py-3 font-sans text-[11px] text-slate-500">
                        {res.optimality_guarantee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Recharts Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Nodes Expanded (Pruning efficiency) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-600" />
                  <span>Nodes Expanded (Fewer is More Efficient)</span>
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData.results} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="nodes_expanded" name="Nodes Expanded" radius={[4, 4, 0, 0]}>
                      {compareData.results.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Path Cost (Optimality) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Path Cost (Lower is Optimal)</span>
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData.results} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="path_cost" name="Path Cost" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {compareData.results.map((_, i) => (
                        <Cell key={`cell-cost-${i}`} fill={chartColors[i % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Max Frontier Size (Memory Proxy) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-purple-600" />
                  <span>Max Frontier Size (Memory Footprint Proxy)</span>
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData.results} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="max_frontier_size" name="Frontier Size" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Execution Time */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Computation Execution Time (ms)</span>
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData.results} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="execution_time_ms" name="Time (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white/70 border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">No Comparison Results Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose at least 2 algorithms above and click "Run Comparison" to generate side-by-side performance metrics, bar charts, and trade-off narratives.
          </p>
        </div>
      )}
    </div>
  );
};
