import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Download,
  FileSpreadsheet,
  FileJson,
  Printer,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Award,
  Database,
  Clock,
  Layers
} from 'lucide-react';
import { ExperimentReport } from '../../types';
import { runExperiment } from '../../api/client';
import { exportComparisonToCsv, exportToJson } from '../../utils/export';

export const ExperimentsLab: React.FC = () => {
  const experimentPresets = [
    {
      id: 'open_vs_obstacle',
      title: 'Experiment 1: Obstacle Density vs Search Complexity',
      subtitle: 'Compares uninformed BFS vs informed A* in an obstacle-dense labyrinth.',
    },
    {
      id: 'weighted_terrain_tradeoff',
      title: 'Experiment 2: Optimality on Weighted Terrain',
      subtitle: 'Demonstrates why BFS fails to find optimal path costs through mud swamp terrain.',
    },
    {
      id: 'heuristic_comparison',
      title: 'Experiment 3: Heuristic Pruning Power',
      subtitle: 'Contrasts Manhattan, Euclidean, and Zero heuristics on the same maze.',
    },
    {
      id: 'unreachable_completeness',
      title: 'Experiment 4: Disconnected Goals & Completeness',
      subtitle: 'Verifies safe exhaustion and termination when the goal is sealed in a fortress.',
    },
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>('weighted_terrain_tradeoff');
  const [seed, setSeed] = useState<number>(42);
  const [report, setReport] = useState<ExperimentReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRunExperiment = async (presetIdToRun?: string) => {
    const pId = presetIdToRun || selectedPresetId;
    setIsLoading(true);
    try {
      const data = await runExperiment({
        preset_id: pId,
        seed: seed,
      });
      setReport(data);
    } catch (err: any) {
      alert(`Experiment failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRunExperiment('weighted_terrain_tradeoff');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-lab-border/70 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-emerald-400" />
            <span>CSE276 Educational Experiments & Research Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reproducible benchmark experiments designed to generate empirical evidence for academic submission.
          </p>
        </div>

        {report && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportComparisonToCsv(report.results, `${report.title.replace(/\s+/g, '_')}.csv`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => exportToJson(report, `${report.title.replace(/\s+/g, '_')}.json`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              <FileJson className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-md shadow-indigo-600/30 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        {experimentPresets.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPresetId(preset.id);
                handleRunExperiment(preset.id);
              }}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md'
                  : 'bg-lab-panel/80 hover:bg-slate-800 border-lab-border text-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                Benchmark Suite
              </span>
              <h3 className="text-xs font-bold text-white mb-1">{preset.title.split(':')[1] || preset.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{preset.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Report Container */}
      {report && (
        <div className="p-8 rounded-3xl bg-lab-panel/95 border border-lab-border shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Title & Metadata */}
          <div className="border-b border-lab-border/70 pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider print:text-black">
                CSE276 Project 21 Experimental Report
              </span>
              <span className="text-xs font-mono text-slate-400 print:text-gray-600">
                Seed: {report.configuration.seed || 42}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight print:text-black">{report.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 print:text-gray-700">{report.description}</p>
          </div>

          {/* Research Question */}
          <div className="p-4 rounded-xl bg-[#0b0e17] border border-lab-border/70 space-y-1 print:bg-gray-100 print:border-gray-300">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block print:text-indigo-800">
              Research Question:
            </span>
            <p className="text-xs font-medium text-slate-200 leading-relaxed print:text-black">
              {report.research_question}
            </p>
          </div>

          {/* Experimental Results Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block print:text-black">
              Measured Performance Table:
            </span>
            <div className="rounded-xl border border-lab-border overflow-hidden print:border-gray-300">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0b0e17] text-slate-400 font-sans print:bg-gray-200 print:text-black">
                  <tr>
                    <th className="px-4 py-2.5">Algorithm</th>
                    <th className="px-3 py-2.5">Solved</th>
                    <th className="px-3 py-2.5">Path Cost</th>
                    <th className="px-3 py-2.5">Path Length</th>
                    <th className="px-3 py-2.5">Nodes Expanded</th>
                    <th className="px-3 py-2.5">Max Frontier</th>
                    <th className="px-3 py-2.5">Time (ms)</th>
                    <th className="px-4 py-2.5 font-sans">Optimality Property</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-border/50 text-slate-200 print:text-black print:divide-gray-300">
                  {report.results.map((res) => (
                    <tr key={res.algorithm} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 font-sans font-bold text-white print:text-black">{res.name}</td>
                      <td className="px-3 py-2.5 font-sans">
                        {res.solution_found ? 'YES' : 'NO'}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-emerald-400 print:text-green-800">
                        {res.solution_found ? res.path_cost : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-amber-300 print:text-black">
                        {res.solution_found ? res.path_length : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-cyan-300 print:text-black">{res.nodes_expanded}</td>
                      <td className="px-3 py-2.5 text-violet-300 print:text-black">{res.max_frontier_size}</td>
                      <td className="px-3 py-2.5 text-slate-300 print:text-black">{res.execution_time_ms}</td>
                      <td className="px-4 py-2.5 font-sans text-[11px] text-slate-400 print:text-gray-700">
                        {res.optimality_guarantee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analysis Narrative */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2 print:bg-gray-100 print:border-gray-300">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block print:text-indigo-800">
              Empirical Discussion & Findings:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed print:text-black font-normal">
              {report.narrative}
            </p>
          </div>

          {/* Viva Takeaways */}
          <div className="space-y-2 pt-2 border-t border-lab-border/70 print:border-gray-300">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 print:text-amber-800">
              <HelpCircle className="w-4 h-4" />
              <span>University Viva Defense Points:</span>
            </span>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 print:text-black">
              {report.viva_takeaways.map((takeaway, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-[#0b0e17] border border-lab-border/60 flex items-start gap-2.5 print:bg-gray-50 print:border-gray-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 print:text-green-700" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
