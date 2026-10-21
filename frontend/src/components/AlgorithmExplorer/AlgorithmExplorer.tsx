import React, { useState, useEffect } from 'react';
import {
  Cpu,
  BookOpen,
  Code2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  PlayCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { AlgorithmMetadata, AlgorithmType } from '../../types';
import { fetchAlgorithms } from '../../api/client';
import { NavTab } from '../Navbar';

interface AlgorithmExplorerProps {
  onLoadAlgorithmInLab: (algId: AlgorithmType) => void;
  onNavigate: (tab: NavTab) => void;
}

export const AlgorithmExplorer: React.FC<AlgorithmExplorerProps> = ({
  onLoadAlgorithmInLab,
  onNavigate,
}) => {
  const [algorithms, setAlgorithms] = useState<AlgorithmMetadata[]>([]);
  const [selectedAlgId, setSelectedAlgId] = useState<AlgorithmType>('astar');
  const [expandedViva, setExpandedViva] = useState<number | null>(null);

  useEffect(() => {
    fetchAlgorithms()
      .then((data) => setAlgorithms(data))
      .catch((err) => console.error('Failed to load algorithms:', err));
  }, []);

  const activeAlg = algorithms.find((a) => a.id === selectedAlgId) || algorithms[0];

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-indigo-600" />
            <span>Algorithm Explorer & Viva Preparation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Examine formal pseudocode, time/space asymptotic complexity, completeness proofs, and common viva questions.
          </p>
        </div>

        {activeAlg && (
          <button
            onClick={() => {
              onLoadAlgorithmInLab(activeAlg.id);
              onNavigate('lab');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Open {activeAlg.name.split('(')[0].trim()} in Search Lab</span>
          </button>
        )}
      </div>

      {/* Algorithm Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {algorithms.map((alg) => {
          const isSelected = alg.id === selectedAlgId;
          return (
            <button
              key={alg.id}
              onClick={() => {
                setSelectedAlgId(alg.id);
                setExpandedViva(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-400/40'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
              }`}
            >
              {alg.name.split('(')[0].trim()}
            </button>
          );
        })}
      </div>

      {/* Main Content Details Grid */}
      {activeAlg && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Asymptotic Complexity & Properties */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeAlg.category}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">{activeAlg.name}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeAlg.description}</p>
              </div>

              {/* Complexity Matrix Table */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200/80 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-200/70 shadow-xs">
                  <span className="text-slate-600 font-semibold">Time Complexity</span>
                  <span className="font-mono font-bold text-amber-800">{activeAlg.time_complexity}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/50 border border-sky-200/70 shadow-xs">
                  <span className="text-slate-600 font-semibold">Space Complexity</span>
                  <span className="font-mono font-bold text-sky-800">{activeAlg.space_complexity}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-1">
                  <span className="text-slate-600 font-semibold block">Completeness:</span>
                  <span className="text-slate-700 block text-[11px] leading-relaxed">{activeAlg.completeness}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-1">
                  <span className="text-slate-600 font-semibold block">Optimality Guarantee:</span>
                  <span className="text-slate-700 block text-[11px] leading-relaxed">{activeAlg.optimality}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                  <span className="text-slate-600 font-semibold">Heuristic Required:</span>
                  <span className={`font-bold ${activeAlg.requires_heuristic ? 'text-purple-700' : 'text-slate-500'}`}>
                    {activeAlg.requires_heuristic ? 'Yes (Informed)' : 'No (Uninformed)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
                  <span className="text-slate-600 font-semibold">Supports Non-Unit Step Costs:</span>
                  <span className={`font-bold ${activeAlg.supports_weights ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {activeAlg.supports_weights ? 'Yes (Cost-aware)' : 'No (Assumes unit)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Formal Pseudocode & Viva Questions */}
          <div className="lg:col-span-8 space-y-6">
            {/* Pseudocode Panel */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Formal Algorithm Pseudocode</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">Standard AIMA Specification</span>
              </div>

              <div className="font-mono text-xs text-slate-800 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 overflow-x-auto leading-relaxed shadow-inner">
                {activeAlg.pseudocode.map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-8 text-slate-400 select-none text-right pr-4 text-[11px]">
                      {idx + 1}
                    </span>
                    <span
                      className={
                        line.trim().startsWith('function')
                          ? 'text-indigo-600 font-bold'
                          : line.trim().startsWith('return')
                          ? 'text-rose-600 font-semibold'
                          : line.includes('PriorityQueue') || line.includes('FIFOQueue') || line.includes('LIFOStack')
                          ? 'text-sky-700 font-medium'
                          : line.includes('if') || line.includes('for') || line.includes('while')
                          ? 'text-amber-700 font-semibold'
                          : 'text-slate-800'
                      }
                    >
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* University Viva Preparation Questions */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Common Viva Examination Questions & Answers
                </h3>
              </div>

              <div className="space-y-3">
                {activeAlg.viva_questions.map((viva, idx) => {
                  const isOpen = expandedViva === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedViva(isOpen ? null : idx)}
                        className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-slate-900"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px]">
                            Q{idx + 1}
                          </span>
                          <span>{viva.question}</span>
                        </div>
                        <span className="text-indigo-600 text-xs font-mono ml-2 font-medium">
                          {isOpen ? '▲ Hide' : '▼ Show Answer'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 bg-white">
                          <p className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950">
                            <strong className="text-indigo-900">Model Viva Answer:</strong> {viva.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
