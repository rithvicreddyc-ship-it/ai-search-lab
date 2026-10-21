import React, { useState, useRef } from 'react';
import {
  Plus,
  Link2,
  Trash2,
  Flag,
  Target,
  RotateCcw,
  Sparkles,
  MapPin
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
        // Create edge from edgeSource to nodeId
        const weightInput = prompt('Enter edge weight (non-negative number):', '1.0');
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
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-lab-panel/90 border border-lab-border/80">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setMode('move');
              setEdgeSource(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'move'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Move Nodes</span>
          </button>

          <button
            onClick={() => {
              setMode('add_node');
              setEdgeSource(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'add_node'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Click canvas to spawn a new node"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          <button
            onClick={() => {
              setMode('add_edge');
              setEdgeSource(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'add_edge'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Click source node then target node to connect"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{edgeSource ? `Select target for ${edgeSource}` : 'Add Edge'}</span>
          </button>

          <button
            onClick={() => {
              setMode('delete');
              setEdgeSource(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'delete'
                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title="Click a node or edge to delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Start / Goal Dropdowns */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Start:</span>
            <select
              value={graph.start}
              onChange={(e) => onGraphChange({ ...graph, start: e.target.value })}
              disabled={isSearching}
              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-0.5 text-xs text-white"
            >
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label || n.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Goal:</span>
            <select
              value={graph.goal}
              onChange={(e) => onGraphChange({ ...graph, goal: e.target.value })}
              disabled={isSearching}
              className="bg-slate-900 border border-slate-700 rounded-md px-2 py-0.5 text-xs text-white"
            >
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label || n.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 rounded-2xl bg-[#0b0e17] border border-lab-border relative overflow-hidden min-h-[400px]">
        <svg
          ref={svgRef}
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDraggingNode(null)}
          className="w-full h-full min-h-[420px] select-none cursor-crosshair"
          viewBox="0 0 720 480"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid background dots */}
          <defs>
            <pattern id="dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1e293b" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />

          {/* Render Edges */}
          {graph.edges.map((edge, idx) => {
            const u = graph.nodes.find((n) => n.id === edge.source);
            const v = graph.nodes.find((n) => n.id === edge.target);
            if (!u || !v) return null;

            const isEdgeInPath = pathSet.has(edge.source) && pathSet.has(edge.target);
            const strokeColor = isEdgeInPath ? '#34d399' : '#334155';
            const strokeWidth = isEdgeInPath ? 3.5 : 1.5;

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
                  className={isEdgeInPath ? 'animate-path-draw' : 'group-hover:stroke-indigo-400'}
                />
                {/* Weight badge */}
                <rect
                  x={midX - 14}
                  y={midY - 9}
                  width="28"
                  height="18"
                  rx="4"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 3.5}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-semibold fill-slate-300"
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

            let nodeFill = '#1e293b';
            let strokeColor = '#475569';
            let textColor = '#e2e8f0';

            if (isStart) {
              nodeFill = '#10b981';
              strokeColor = '#34d399';
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
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isStart || isGoal ? 20 : 18}
                  fill={nodeFill}
                  stroke={strokeColor}
                  strokeWidth={isActive || isPath ? 3 : 2}
                  className={`transition-all duration-150 ${
                    isActive ? 'animate-ping' : ''
                  }`}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="text-[11px] font-bold font-mono pointer-events-none"
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
