import React, { useState, useEffect } from 'react';
import {
  Cpu,
  BookOpen,
  Code2,
  CheckCircle2,
  HelpCircle,
  PlayCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  Layers
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
  const [vivaSearch, setVivaSearch] = useState<string>('');
  const [expandAll, setExpandAll] = useState<boolean>(false);

  useEffect(() => {
    fetchAlgorithms()
      .then((data) => setAlgorithms(data))
      .catch((err) => console.error('Failed to load algorithms:', err));
  }, []);

  const activeAlg = algorithms.find((a) => a.id === selectedAlgId) || algorithms[0];

  const filteredVivaQuestions = activeAlg?.viva_questions.filter((q) => {
    if (!vivaSearch.trim()) return true;
    const query = vivaSearch.toLowerCase();
    return q.question.toLowerCase().includes(query) || q.answer.toLowerCase().includes(query);
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 py-2 animate-fade-in">
      {/* Header with Spacious Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFF8F2] text-emerald-800 border border-[#DCF1E2]">
              100% Free Open Academic Web
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
            <span>Algorithm Explorer & Viva Defense</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Examine formal pseudocode, asymptotic complexity proofs, and university viva defense questions with dedicated scroll navigation.
          </p>
        </div>

        {activeAlg && (
          <button
            onClick={() => {
              onLoadAlgorithmInLab(activeAlg.id);
              onNavigate('lab');
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all hover-lift self-start sm:self-auto active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Open {activeAlg.name.split('(')[0].trim()} in Lab</span>
          </button>
        )}
      </div>

      {/* Algorithm Selector Pills with Pastel Design & Comfortable Touch Targets */}
      <div className="flex flex-wrap gap-2.5 p-2 bg-[#FAF8F5] rounded-2xl border border-[#EDE7DC]">
        {algorithms.map((alg) => {
          const isSelected = alg.id === selectedAlgId;
          return (
            <button
              key={alg.id}
              onClick={() => {
                setSelectedAlgId(alg.id);
                setExpandedViva(null);
                setVivaSearch('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs hover:scale-[1.01]'
              }`}
            >
              {alg.name.split('(')[0].trim()}
            </button>
          );
        })}
      </div>

      {/* Main Content Details Grid */}
      {activeAlg && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Asymptotic Complexity & Properties */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-7 sm:p-8 rounded-[2rem] bg-white/95 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeAlg.category}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-3">{activeAlg.name}</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{activeAlg.description}</p>
              </div>

              {/* Complexity Matrix Table with Pastel Cards */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9EE] border border-[#FEEACD] shadow-2xs">
                  <span className="text-slate-700 font-semibold">Time Complexity</span>
                  <span className="font-mono font-bold text-amber-800">{activeAlg.time_complexity}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F2FD] border border-[#E2E6FA] shadow-2xs">
                  <span className="text-slate-700 font-semibold">Space Complexity</span>
                  <span className="font-mono font-bold text-indigo-800">{activeAlg.space_complexity}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DC] shadow-2xs space-y-1.5">
                  <span className="text-slate-700 font-semibold block">Completeness:</span>
                  <span className="text-slate-600 block text-xs leading-relaxed">{activeAlg.completeness}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DC] shadow-2xs space-y-1.5">
                  <span className="text-slate-700 font-semibold block">Optimality Guarantee:</span>
                  <span className="text-slate-600 block text-xs leading-relaxed">{activeAlg.optimality}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DC] shadow-2xs">
                  <span className="text-slate-700 font-semibold">Heuristic Required:</span>
                  <span className={`font-bold ${activeAlg.requires_heuristic ? 'text-purple-700' : 'text-slate-500'}`}>
                    {activeAlg.requires_heuristic ? 'Yes (Informed)' : 'No (Uninformed)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EDE7DC] shadow-2xs">
                  <span className="text-slate-700 font-semibold">Step Weights Support:</span>
                  <span className={`font-bold ${activeAlg.supports_weights ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {activeAlg.supports_weights ? 'Yes (Cost-aware)' : 'No (Assumes unit)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Formal Pseudocode & University Viva Questions */}
          <div className="lg:col-span-8 space-y-8">
            {/* Pseudocode Panel with Generous Breathing Room */}
            <div className="p-7 sm:p-8 rounded-[2rem] bg-white/95 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Formal Algorithm Pseudocode</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">Standard AIMA Specification</span>
              </div>

              <div className="font-mono text-xs text-slate-800 bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#EDE7DC] overflow-x-auto leading-relaxed shadow-inner max-h-72 overflow-y-auto scrollbar-thin">
                {activeAlg.pseudocode.map((line, idx) => (
                  <div key={idx} className="flex py-0.5">
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

            {/* University Viva Preparation Questions - WITH SCROLL OPTION */}
            <div className="p-7 sm:p-8 rounded-[2rem] bg-white/95 border border-slate-200/90 shadow-sm space-y-5">
              
              {/* Header with Title and Scroll Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      University Viva Voce Examination Questions & Answers
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Examiner-approved defense responses • Scroll through all questions below
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF8F5] text-slate-600 border border-[#EDE7DC]">
                    {filteredVivaQuestions.length} Questions
                  </span>

                  <button
                    type="button"
                    onClick={() => setExpandAll(!expandAll)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 transition-colors"
                  >
                    {expandAll ? 'Collapse All' : 'Expand All'}
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar for Viva Questions */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vivaSearch}
                  onChange={(e) => setVivaSearch(e.target.value)}
                  placeholder={`Search ${activeAlg.name.split('(')[0].trim()} viva questions (e.g. optimality, memory, pruning, graph)...`}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#EDE7DC] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Scroll Container for Viva Questions ("Schrool Option") */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {filteredVivaQuestions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-[#FAF8F5] rounded-2xl border border-dashed border-slate-200">
                    No viva questions matched "{vivaSearch}". Clear search to view all questions.
                  </div>
                ) : (
                  filteredVivaQuestions.map((viva, idx) => {
                    const isOpen = expandAll || expandedViva === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[#EDE7DC] bg-[#FAF8F5] overflow-hidden transition-all hover:border-slate-300"
                      >
                        <button
                          onClick={() => {
                            if (expandAll) {
                              setExpandAll(false);
                              setExpandedViva(null);
                            } else {
                              setExpandedViva(isOpen ? null : idx);
                            }
                          }}
                          className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-slate-900 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#FEE58A] text-[#78350F] font-bold flex items-center justify-center text-[10px] shrink-0 group-hover:scale-105 transition-transform">
                              Q{idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {viva.question}
                            </span>
                          </div>
                          <span className="text-indigo-600 text-xs font-mono ml-2 font-medium shrink-0 flex items-center gap-1">
                            {isOpen ? (
                              <>
                                <span>Hide</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Answer</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 bg-white animate-fade-in">
                            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 mt-2 space-y-1">
                              <strong className="text-indigo-900 block font-bold text-xs uppercase tracking-wider">
                                Examiner-Approved Model Viva Answer:
                              </strong>
                              <p className="leading-relaxed text-slate-700 text-xs sm:text-[13px]">
                                {viva.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Scroll Helper Footer Indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                <span>✦ Scrollable Question Bank</span>
                <span>{filteredVivaQuestions.length} Total Curated Questions</span>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
