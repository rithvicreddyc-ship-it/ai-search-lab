import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Link2,
  Trash2,
  Flag,
  Target,
  RotateCcw,
  Sparkles,
  MapPin,
  Move,
  Info
} from 'lucide-react';
import { GraphEdge, GraphNode, GraphState } from '../../types';

interface GraphEditorProps {
  graph: GraphState;
  onGraphChange: (newGraph: GraphState) => void;
  activeNode: string | null;
  frontierSet: Set<string>;
  exploredSet: Set<string>;
  pathSet: Set<string>;
  onInspectNode: (nodeId: string | null) => void;
  isSearching: boolean;
}

export const GraphEditor: React.FC<GraphEditorProps> = ({
  graph,
  onGraphChange,
  activeNode,
  frontierSet,
  exploredSet,
  pathSet,
  onInspectNode,
  isSearching,
}) => {
  const [mode, setMode] = useState<'move' | 'add_node' | 'add_edge' | 'delete'>('move');
  const [edgeSource, setEdgeSource] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Quick hotkeys for graph editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toLowerCase();
      if (key === 'v') {
        setMode('move');
        setEdgeSource(null);
      } else if (key === 'n') {
        setMode('add_node');
        setEdgeSource(null);
      } else if (key === 'c') {
        setMode('add_edge');
        setEdgeSource(null);
      } else if (key === 'd') {
        setMode('delete');
        setEdgeSource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'add_node' || isSearching || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const newId = `N${graph.nodes.length + 1}`;
    const newNode: GraphNode = {
      id: newId,
      label: newId,
      x,
      y,
    };
    onGraphChange({
      ...graph,
      nodes: [...graph.nodes, newNode],
    });
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onInspectNode(nodeId);

    if (isSearching) return;

    if (mode === 'delete') {
      if (nodeId === graph.start || nodeId === graph.goal) {
        alert('Cannot delete the start or goal node. Reassign them first.');
        return;
      }
      const nextNodes = graph.nodes.filter((n) => n.id !== nodeId);
      const nextEdges = graph.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
      onGraphChange({ ...graph, nodes: nextNodes, edges: nextEdges });
    } else if (mode === 'add_edge') {
      if (!edgeSource) {
        setEdgeSource(nodeId);
      } else if (edgeSource === nodeId) {
        setEdgeSource(null);
      } else {
        const weightInput = prompt('Enter edge cost/weight (non-negative number):', '1.0');
        const weight = weightInput ? parseFloat(weightInput) : 1.0;
        if (!isNaN(weight) && weight >= 0) {
          const newEdge: GraphEdge = {
            source: edgeSource,
            target: nodeId,
            weight,
            directed: false,
          };
          onGraphChange({
            ...graph,
            edges: [...graph.edges, newEdge],
          });
        }
        setEdgeSource(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNode || isSearching || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(30, Math.min(rect.width - 30, Math.round(e.clientX - rect.left)));
    const y = Math.max(30, Math.min(rect.height - 30, Math.round(e.clientY - rect.top)));

    const nextNodes = graph.nodes.map((n) => (n.id === draggingNode ? { ...n, x, y } : n));
    onGraphChange({ ...graph, nodes: nextNodes });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Graph Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#0b101e]/90 border border-lab-border/80 shadow-glass-card backdrop-blur-xl">
        <div className="flex items-center gap-1 bg-[#060914] p-1 rounded-xl border border-lab-border/60">
          <button
            onClick={() => {
              setMode('move');
              setEdgeSource(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'move'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Move & Inspect Nodes [Hotkey: V]"
          >
            <Move className="w-3.5 h-3.5" />
            <span>Move</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">V</span>
          </button>

          <button
            onClick={() => {
              setMode('add_node');
              setEdgeSource(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'add_node'
                ? 'bg-emerald-950/80 text-emerald-300 shadow-sm ring-1 ring-emerald-500/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Click canvas to spawn a new node [Hotkey: N]"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Node</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">N</span>
          </button>

          <button
            onClick={() => {
              setMode('add_edge');
              setEdgeSource(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'add_edge'
                ? 'bg-amber-950/80 text-amber-300 shadow-sm ring-1 ring-amber-500/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Click source node then target node [Hotkey: C]"
          >
            <Link2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{edgeSource ? `Target for ${edgeSource}` : 'Connect'}</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">C</span>
          </button>

          <button
            onClick={() => {
              setMode('delete');
              setEdgeSource(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'delete'
                ? 'bg-rose-950/80 text-rose-300 shadow-sm ring-1 ring-rose-500/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Delete node or edge [Hotkey: D]"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete</span>
            <span className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">D</span>
          </button>
        </div>

        {/* Start / Goal Dropdowns */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-[#060914] px-2.5 py-1 rounded-xl border border-lab-border/60">
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Start:</span>
            <select
              value={graph.start}
              onChange={(e) => onGraphChange({ ...graph, start: e.target.value })}
              disabled={isSearching}
              className="bg-transparent border-none text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                  {n.label || n.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#060914] px-2.5 py-1 rounded-xl border border-lab-border/60">
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Goal:</span>
            <select
              value={graph.goal}
              onChange={(e) => onGraphChange({ ...graph, goal: e.target.value })}
              disabled={isSearching}
              className="bg-transparent border-none text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                  {n.label || n.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="flex-1 rounded-3xl bg-gradient-to-b from-[#080d19] to-[#040710] border border-lab-border relative overflow-hidden min-h-[410px] shadow-2xl">
        {/* Subtle Ambient Cosmic Glow Behind Graph */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Mode helper pill in top left */}
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#070b16]/80 border border-slate-800/80 backdrop-blur-md text-[11px] font-mono text-slate-300 pointer-events-none">
          <Info className="w-3 h-3 text-indigo-400" />
          <span>
            {mode === 'move'
              ? 'Click & drag nodes • Click to inspect'
              : mode === 'add_node'
              ? 'Click anywhere to place new node'
              : mode === 'add_edge'
              ? edgeSource ? `Select target node for ${edgeSource}` : 'Click source node to start edge'
              : 'Click any node or edge to remove'}
          </span>
        </div>

        <svg
          ref={svgRef}
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDraggingNode(null)}
          className="w-full h-full min-h-[430px] select-none cursor-crosshair relative z-10"
          viewBox="0 0 720 480"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle Grid background dots */}
          <defs>
            <pattern id="graph-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1b253b" />
            </pattern>
            {/* Glow filters for edges and nodes */}
            <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-dot-grid)" />

          {/* Render Edges */}
          {graph.edges.map((edge, idx) => {
            const u = graph.nodes.find((n) => n.id === edge.source);
            const v = graph.nodes.find((n) => n.id === edge.target);
            if (!u || !v) return null;

            const isEdgeInPath = pathSet.has(edge.source) && pathSet.has(edge.target);
            const strokeColor = isEdgeInPath ? '#34d399' : '#27354f';
            const strokeWidth = isEdgeInPath ? 3.5 : 1.8;

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            return (
              <g
                key={`edge-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (mode === 'delete') {
                    const nextEdges = graph.edges.filter((_, i) => i !== idx);
                    onGraphChange({ ...graph, edges: nextEdges });
                  }
                }}
                className="cursor-pointer group"
              >
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  filter={isEdgeInPath ? 'url(#emerald-glow)' : undefined}
                  className={isEdgeInPath ? 'animate-path-draw' : 'group-hover:stroke-indigo-400 transition-colors'}
                />
                {/* Weight badge */}
                <rect
                  x={midX - 16}
                  y={midY - 10}
                  width="32"
                  height="20"
                  rx="6"
                  fill="#0a0f1d"
                  stroke={isEdgeInPath ? '#059669' : '#27354f'}
                  strokeWidth="1.2"
                />
                <text
                  x={midX}
                  y={midY + 3.5}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold fill-slate-300 select-none"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {graph.nodes.map((node) => {
            const isStart = node.id === graph.start;
            const isGoal = node.id === graph.goal;
            const isActive = activeNode === node.id;
            const isFrontier = frontierSet.has(node.id);
            const isExplored = exploredSet.has(node.id);
            const isPath = pathSet.has(node.id);
            const isSourceSelected = edgeSource === node.id;

            let nodeFill = '#0f172a';
            let strokeColor = '#334155';
            let textColor = '#e2e8f0';

            if (isStart) {
              nodeFill = '#10b981';
              strokeColor = '#6ee7b7';
              textColor = '#022c22';
            } else if (isGoal) {
              nodeFill = '#f43f5e';
              strokeColor = '#fda4af';
              textColor = '#ffffff';
            } else if (isPath) {
              nodeFill = '#34d399';
              strokeColor = '#a7f3d0';
              textColor = '#064e3b';
            } else if (isActive) {
              nodeFill = '#f59e0b';
              strokeColor = '#fde68a';
              textColor = '#451a03';
            } else if (isFrontier) {
              nodeFill = '#06b6d4';
              strokeColor = '#67e8f9';
              textColor = '#083344';
            } else if (isExplored) {
              nodeFill = '#4f46e5';
              strokeColor = '#818cf8';
              textColor = '#e0e7ff';
            }

            return (
              <g
                key={node.id}
                onMouseDown={() => {
                  if (mode === 'move') setDraggingNode(node.id);
                }}
                onClick={(e) => handleNodeClick(node.id, e)}
                className="cursor-pointer transition-transform"
              >
                {/* Glow ring for active, path, or selected source */}
                {(isActive || isPath || isSourceSelected) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={26}
                    fill="none"
                    stroke={isActive ? '#f59e0b' : isSourceSelected ? '#06b6d4' : '#10b981'}
                    strokeWidth="1.5"
                    strokeDasharray={isSourceSelected ? '4 2' : 'none'}
                    className={isActive ? 'animate-ping' : ''}
                    opacity="0.6"
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isStart || isGoal ? 20 : 18}
                  fill={nodeFill}
                  stroke={strokeColor}
                  strokeWidth={isActive || isPath || isStart || isGoal ? 2.5 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="text-[11px] font-bold font-mono pointer-events-none select-none"
                  fill={textColor}
                >
                  {node.label || node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

