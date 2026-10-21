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
      <div className="p-4 rounded-3xl bg-[#0b101e]/90 border border-lab-border/80 shadow-glass-card backdrop-blur-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-lab-border/70 pb-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>State Inspector</span>
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-[#050813] px-2.5 py-0.5 rounded-full border border-cyan-500/30">
            {formatCoord(inspectedNode)}
          </span>
        </div>

        {inspectedNode ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-[#050813] border border-cyan-500/20 shadow-inner">
                <div className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider">g(n) Cost</div>
                <div className="text-base font-mono font-bold text-cyan-200 mt-0.5">
                  {nodeData?.g !== undefined ? nodeData.g : '—'}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#050813] border border-violet-500/20 shadow-inner">
                <div className="text-[9px] text-violet-400 uppercase font-bold tracking-wider">h(n) Est.</div>
                <div className="text-base font-mono font-bold text-violet-200 mt-0.5">
                  {nodeData?.h !== undefined ? nodeData.h : '—'}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#050813] border border-amber-500/20 shadow-inner">
                <div className="text-[9px] text-amber-400 uppercase font-bold tracking-wider">f(n) Total</div>
                <div className="text-base font-mono font-bold text-amber-200 mt-0.5">
                  {nodeData?.f !== undefined ? nodeData.f : '—'}
                </div>
              </div>
            </div>

            {nodeData?.parent && (
              <div className="text-[11px] font-mono text-slate-400 bg-[#050813] px-3 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>Parent Node:</span>
                <span className="text-slate-200 font-bold">{nodeData.parent}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3 text-center leading-relaxed font-sans">
            Hover over any cell or graph node to inspect coordinates, evaluations, and parent relations.
          </p>
        )}
      </div>

      {/* Real-time Search Metrics Card */}
      <div className="p-4 rounded-3xl bg-[#0b101e]/90 border border-lab-border/80 shadow-glass-card backdrop-blur-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-lab-border/70 pb-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Search Telemetry</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-[#050813] border border-lab-border/70 shadow-inner space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Nodes Expanded</span>
            <div className="text-lg font-bold font-mono text-white">
              {searchResult ? searchResult.nodes_expanded : currentStepData ? currentStepData.exploredCount : 0}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#050813] border border-lab-border/70 shadow-inner space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Frontier Peak</span>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {searchResult ? searchResult.max_frontier_size : currentStepData ? currentStepData.frontierCount : 0}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#050813] border border-lab-border/70 shadow-inner space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Path Cost</span>
            <div className="text-lg font-bold font-mono text-emerald-300">
              {searchResult && searchResult.solution_found ? searchResult.path_cost : '—'}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#050813] border border-lab-border/70 shadow-inner space-y-0.5">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Path Length</span>
            <div className="text-lg font-bold font-mono text-amber-300">
              {searchResult && searchResult.solution_found ? searchResult.path_length : '—'}
            </div>
          </div>
        </div>

        {searchResult && (
          <div className="pt-2 border-t border-lab-border/60 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span className="flex items-center gap-1 font-sans">
                <Clock className="w-3 h-3 text-slate-400" />
                Compute Latency:
              </span>
              <span className="text-slate-200 font-bold">{searchResult.execution_time_ms} ms</span>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 space-y-1">
              <div className="flex items-center gap-1 text-indigo-300 font-semibold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Optimality Guarantee:</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                {searchResult.optimality_guarantee}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

