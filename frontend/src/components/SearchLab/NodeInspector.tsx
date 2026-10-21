import React from 'react';
import {
  Activity,
  Award,
  Clock,
  Compass,
  Cpu,
  Database,
  Hash,
  Layers,
  MapPin,
  TrendingDown,
  Zap
} from 'lucide-react';
import { GridCoordinate, SearchResult } from '../../types';

interface NodeInspectorProps {
  inspectedNode: GridCoordinate | string | null;
  nodeData?: {
    g?: number;
    h?: number;
    f?: number;
    status: string;
    parent?: string;
  };
  searchResult: SearchResult | null;
  currentStepData?: {
    currentEvent?: any;
    frontierCount: number;
    exploredCount: number;
  };
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  inspectedNode,
  nodeData,
  searchResult,
  currentStepData,
}) => {
  const formatCoord = (node: GridCoordinate | string | null) => {
    if (!node) return 'None';
    if (Array.isArray(node)) return `(${node[0]}, ${node[1]})`;
    return String(node);
  };

  return (
    <div className="space-y-4">
      {/* Node Inspector Card */}
      <div className="p-3.5 rounded-2xl bg-lab-panel/90 border border-lab-border space-y-2.5">
        <div className="flex items-center justify-between border-b border-lab-border/70 pb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>State Inspector</span>
          </span>
          <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {formatCoord(inspectedNode)}
          </span>
        </div>

        {inspectedNode ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[#0b0e17] border border-lab-border/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">g(n) Cost</div>
              <div className="text-sm font-mono font-bold text-cyan-300">
                {nodeData?.g !== undefined ? nodeData.g : '—'}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#0b0e17] border border-lab-border/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">h(n) Est.</div>
              <div className="text-sm font-mono font-bold text-violet-300">
                {nodeData?.h !== undefined ? nodeData.h : '—'}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#0b0e17] border border-lab-border/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">f(n) Total</div>
              <div className="text-sm font-mono font-bold text-amber-300">
                {nodeData?.f !== undefined ? nodeData.f : '—'}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-2 text-center">
            Hover over any cell or node to inspect coordinates, evaluation scores, and parent relationship.
          </p>
        )}
      </div>

      {/* Real-time Search Metrics Card */}
      <div className="p-3.5 rounded-2xl bg-lab-panel/90 border border-lab-border space-y-3">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-lab-border/70 pb-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Search Space Statistics</span>
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-[#0b0e17] border border-lab-border/60 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Nodes Expanded</span>
            <div className="text-base font-bold font-mono text-white">
              {searchResult ? searchResult.nodes_expanded : currentStepData ? currentStepData.exploredCount : 0}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#0b0e17] border border-lab-border/60 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Max Frontier Size</span>
            <div className="text-base font-bold font-mono text-cyan-300">
              {searchResult ? searchResult.max_frontier_size : currentStepData ? currentStepData.frontierCount : 0}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#0b0e17] border border-lab-border/60 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Path Cost</span>
            <div className="text-base font-bold font-mono text-emerald-300">
              {searchResult && searchResult.solution_found ? searchResult.path_cost : '—'}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#0b0e17] border border-lab-border/60 space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Path Length</span>
            <div className="text-base font-bold font-mono text-amber-300">
              {searchResult && searchResult.solution_found ? searchResult.path_length : '—'}
            </div>
          </div>
        </div>

        {searchResult && (
          <div className="pt-2 border-t border-lab-border/60 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Compute Time:</span>
              <span className="font-mono text-slate-200">{searchResult.execution_time_ms} ms</span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <span className="font-semibold block">Optimality:</span>
              <span>{searchResult.optimality_guarantee}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
