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
  Zap,
  ShieldCheck,
  CheckCircle2,
  Crosshair
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
    if (!node) return 'Hovering canvas';
    if (Array.isArray(node)) return `Cell (${node[0]}, ${node[1]})`;
    return `Node ${node}`;
  };

  return (
    <div className="space-y-4">
      {/* State Inspector Card */}
      <div className="p-4 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
            <span>State Inspector</span>
          </span>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            {formatCoord(inspectedNode)}
          </span>
        </div>

        {inspectedNode ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 shadow-xs">
                <div className="text-[9px] text-sky-700 uppercase font-bold tracking-wider">g(n) Cost</div>
                <div className="text-base font-mono font-bold text-sky-900 mt-0.5">
                  {nodeData?.g !== undefined ? nodeData.g : '—'}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 shadow-xs">
                <div className="text-[9px] text-purple-700 uppercase font-bold tracking-wider">h(n) Est.</div>
                <div className="text-base font-mono font-bold text-purple-900 mt-0.5">
                  {nodeData?.h !== undefined ? nodeData.h : '—'}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs">
                <div className="text-[9px] text-amber-700 uppercase font-bold tracking-wider">f(n) Total</div>
                <div className="text-base font-mono font-bold text-amber-900 mt-0.5">
                  {nodeData?.f !== undefined ? nodeData.f : '—'}
                </div>
              </div>
            </div>

            {nodeData?.parent && (
              <div className="text-[11px] font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>Parent Node:</span>
                <span className="text-slate-900 font-bold">{nodeData.parent}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center leading-relaxed font-sans">
            Hover over any cell or graph node to inspect coordinates, evaluations, and parent relations.
          </p>
        )}
      </div>

      {/* Real-time Search Metrics Card */}
      <div className="p-4 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Search Telemetry</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Nodes Expanded</span>
            <div className="text-lg font-bold font-mono text-slate-900">
              {searchResult ? searchResult.nodes_expanded : currentStepData ? currentStepData.exploredCount : 0}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-0.5">
            <span className="text-[10px] text-sky-700 uppercase font-semibold">Frontier Peak</span>
            <div className="text-lg font-bold font-mono text-sky-800">
              {searchResult ? searchResult.max_frontier_size : currentStepData ? currentStepData.frontierCount : 0}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-0.5">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold">Path Cost</span>
            <div className="text-lg font-bold font-mono text-emerald-800">
              {searchResult && searchResult.solution_found ? searchResult.path_cost : '—'}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-0.5">
            <span className="text-[10px] text-amber-700 uppercase font-semibold">Path Length</span>
            <div className="text-lg font-bold font-mono text-amber-800">
              {searchResult && searchResult.solution_found ? searchResult.path_length : '—'}
            </div>
          </div>
        </div>

        {searchResult && (
          <div className="pt-2 border-t border-slate-200/70 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-600 font-mono">
              <span className="flex items-center gap-1 font-sans">
                <Clock className="w-3 h-3 text-slate-400" />
                Compute Latency:
              </span>
              <span className="text-slate-900 font-bold">{searchResult.execution_time_ms} ms</span>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 space-y-1">
              <div className="flex items-center gap-1 text-indigo-700 font-semibold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Optimality Guarantee:</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                {searchResult.optimality_guarantee}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

