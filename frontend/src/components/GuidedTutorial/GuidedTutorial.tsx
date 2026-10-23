import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  PlayCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Zap,
  Search,
  Clock,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AlgorithmType, HeuristicType, ProblemType, TutorialLesson, TutorialModuleType } from '../../types';
import { NavTab } from '../Navbar';
import { TUTORIAL_LESSONS } from './tutorialData';

interface GuidedTutorialProps {
  onLoadTutorialSetup: (
    presetId: string,
    alg: AlgorithmType,
    heuristic?: HeuristicType,
    diagonal?: boolean,
    problemType?: ProblemType
  ) => void;
  onNavigate: (tab: NavTab) => void;
}

export const GuidedTutorial: React.FC<GuidedTutorialProps> = ({
  onLoadTutorialSetup,
  onNavigate,
}) => {
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set([1]));
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [vivaSearch, setVivaSearch] = useState<string>('');
  const [expandAllViva, setExpandAllViva] = useState<boolean>(false);

  const modules: { id: string; label: string; count: number }[] = [
    { id: 'All', label: 'All Topics', count: TUTORIAL_LESSONS.length },
    { id: 'Foundations', label: '1. Foundations', count: 3 },
    { id: 'Uninformed', label: '2. Blind Search', count: 4 },
    { id: 'Heuristics', label: '3. Informed Search', count: 4 },
    { id: 'LocalSearch', label: '4. Memory & Local', count: 3 },
    { id: 'AdvancedRealWorld', label: '5. Real-World & Viva', count: 2 },
  ];

  // Filter lessons based on module and search query
  const filteredLessons = useMemo(() => {
    return TUTORIAL_LESSONS.filter((l) => {
      const matchesModule = selectedModule === 'All' || l.module === selectedModule;
      const matchesSearch =
        searchQuery.trim() === '' ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesModule && matchesSearch;
    });
  }, [selectedModule, searchQuery]);

  const currentLesson: TutorialLesson =
    TUTORIAL_LESSONS.find((l) => l.id === activeLessonId) || TUTORIAL_LESSONS[0];

  const filteredVivaQuestions = useMemo(() => {
    if (!currentLesson.vivaQuestions) return [];
    if (!vivaSearch.trim()) return currentLesson.vivaQuestions;
    const q = vivaSearch.toLowerCase();
    return currentLesson.vivaQuestions.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.examinerTip && item.examinerTip.toLowerCase().includes(q))
    );
  }, [currentLesson, vivaSearch]);

  const currentIndex = TUTORIAL_LESSONS.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? TUTORIAL_LESSONS[currentIndex - 1] : null;
  const nextLesson = currentIndex < TUTORIAL_LESSONS.length - 1 ? TUTORIAL_LESSONS[currentIndex + 1] : null;

  const toggleComplete = (id: number) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAnswer = (key: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectQuizOption = (lessonId: number, optIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [lessonId]: optIdx }));
  };

  const progressPct = Math.round((completedLessons.size / TUTORIAL_LESSONS.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 py-2 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFF8F2] text-emerald-800 border border-[#DCF1E2]">
              100% Free Open Academic Web
            </span>
            <span className="text-xs text-slate-500 font-mono">16 Comprehensive Modules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <GraduationCap className="w-6 h-6 shrink-0" />
            </div>
            <span>AI Search Foundations & Pedagogical Tutorial</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            University-level curriculum covering state-space formulation, blind strategies, heuristic admissibility proofs, local landscape pathologies, and formal viva defense questions.
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-glass-card backdrop-blur-xl shrink-0 w-full sm:w-72 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Course Mastery
            </span>
            <span className="font-mono font-bold text-indigo-600">
              {completedLessons.size} / {TUTORIAL_LESSONS.length} ({progressPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 shadow-sm shadow-indigo-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{completedLessons.has(currentLesson.id) ? '✓ Current Lesson Mastered' : 'In Progress'}</span>
            <button
              onClick={() => toggleComplete(currentLesson.id)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              {completedLessons.has(currentLesson.id) ? 'Mark Incomplete' : 'Mark as Mastered'}
            </button>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Module Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {modules.map((m) => {
            const isSelected = selectedModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-400/40'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{m.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts, heuristics..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Lesson Selector Carousel / List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {filteredLessons.map((lesson) => {
          const isActive = lesson.id === currentLesson.id;
          const isDone = completedLessons.has(lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => setActiveLessonId(lesson.id)}
              className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between relative group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-400/40 scale-[1.02]'
                  : 'bg-white/90 hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[10px] font-mono font-bold ${
                    isActive ? 'text-indigo-200' : 'text-slate-600'
                  }`}
                >
                  #{lesson.id}
                </span>
                {isDone && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`}
                  />
                )}
              </div>
              <div
                className={`text-[11px] font-bold line-clamp-2 leading-tight ${
                  isActive ? 'text-white' : 'text-slate-800'
                }`}
              >
                {lesson.title.split(':')[1]?.trim() || lesson.title}
              </div>
              <div
                className={`text-[9px] mt-2 font-mono uppercase tracking-wider ${
                  isActive ? 'text-indigo-200' : 'text-indigo-600'
                }`}
              >
                {lesson.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Lesson Card with Classy Fade In */}
      <div key={currentLesson.id} className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-7 animate-fade-in">
        {/* Top Header of Lesson */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentLesson.moduleLabel}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {currentLesson.badge}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {currentLesson.estMinutes} min study
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentLesson.title}
            </h2>
          </div>

          {/* Action Button: Load into Search Lab */}
          <button
            onClick={() => {
              onLoadTutorialSetup(
                currentLesson.presetId,
                currentLesson.algId,
                currentLesson.heuristic,
                currentLesson.diagonal,
                currentLesson.problemType
              );
              onNavigate('lab');
            }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all self-start lg:self-auto active:scale-95 group"
          >
            <PlayCircle className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
            <span>{currentLesson.actionText}</span>
            <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Formal Mathematical Model & Core Concept */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Mathematical Formulation */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 shadow-xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Mathematical & Formal Model
            </span>
            <div className="font-mono text-xs sm:text-sm text-indigo-100 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 overflow-x-auto">
              {currentLesson.formalDefinition.math}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {currentLesson.formalDefinition.description}
            </p>
          </div>

          {/* Core Theoretical Principle */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Pedagogical Principle
              </span>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {currentLesson.concept}
              </p>
            </div>
            <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[11px] text-indigo-800 font-mono">
              <span>Preset: {currentLesson.presetId}</span>
              <span className="font-bold">Algorithm: {currentLesson.algId.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Complexity & Guarantee Matrix */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Algorithmic Invariants & Complexity Matrix:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 block">
                Time Complexity
              </span>
              <span className="font-mono font-bold text-slate-900 block text-xs">
                {currentLesson.complexity.time}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 block">
                Space Complexity
              </span>
              <span className="font-mono font-bold text-slate-900 block text-xs">
                {currentLesson.complexity.space}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 block">
                Completeness
              </span>
              <span className="font-sans font-semibold text-emerald-700 block text-xs">
                {currentLesson.complexity.completeness}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 block">
                Optimality
              </span>
              <span className="font-sans font-semibold text-indigo-700 block text-xs">
                {currentLesson.complexity.optimality}
              </span>
            </div>
          </div>
        </div>

        {/* In-Depth Explanation Section */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Theoretical Walkthrough & Mechanism:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentLesson.inDepthExplanation.map((paragraph, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p>{paragraph}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Execution Trace Table (Worked Example) */}
        {currentLesson.traceExample && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Step-by-Step Execution Trace Table:
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Worked Numerical Walkthrough</span>
            </div>
            <p className="text-xs text-slate-600 mb-1">{currentLesson.traceExample.description}</p>
            <div className="rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-sans font-semibold">
                  <tr>
                    <th className="px-3.5 py-2.5">Step</th>
                    <th className="px-3 py-2.5">Node</th>
                    <th className="px-3 py-2.5">Action</th>
                    <th className="px-3 py-2.5">g</th>
                    <th className="px-3 py-2.5">h</th>
                    <th className="px-3 py-2.5">f</th>
                    <th className="px-3.5 py-2.5">Frontier (Open)</th>
                    <th className="px-3.5 py-2.5">Explored (Closed)</th>
                    <th className="px-4 py-2.5 font-sans">Pedagogical Observation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentLesson.traceExample.steps.map((st) => (
                    <tr key={st.step} className="hover:bg-slate-50">
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">{st.step}</td>
                      <td className="px-3 py-2.5 font-bold text-indigo-700">{st.node}</td>
                      <td className="px-3 py-2.5 text-slate-800 font-sans">{st.action}</td>
                      <td className="px-3 py-2.5 text-emerald-700">{st.g}</td>
                      <td className="px-3 py-2.5 text-amber-700">{st.h}</td>
                      <td className="px-3 py-2.5 font-bold text-purple-700">{st.f}</td>
                      <td className="px-3.5 py-2.5 text-slate-600 text-[11px]">{st.frontier}</td>
                      <td className="px-3.5 py-2.5 text-slate-600 text-[11px]">{st.explored}</td>
                      <td className="px-4 py-2.5 font-sans text-[11px] text-slate-600">{st.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Key Teaching Points & Invariants */}
        {currentLesson.keyTeachingPoints && currentLesson.keyTeachingPoints.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Deep Pedagogical Invariants & Key Exam Takeaways:</span>
              </span>
              <span className="text-[11px] text-indigo-600 font-semibold font-mono">High-Yield Academic Summary</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentLesson.keyTeachingPoints.map((point, pIdx) => (
                <div
                  key={pIdx}
                  className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formal Mathematical Proof & Derivation Invariant */}
        {currentLesson.mathematicalDerivation && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white space-y-3.5 shadow-md border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Formal Mathematical Derivation: {currentLesson.mathematicalDerivation.title}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Rigorous AI Invariant
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs text-slate-300">
              {currentLesson.mathematicalDerivation.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                  <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {sIdx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 font-sans font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-emerald-300 font-mono text-[11px] uppercase block mb-0.5">Theorem Conclusion:</strong>
                <span>{currentLesson.mathematicalDerivation.conclusion}</span>
              </div>
            </div>
          </div>
        )}

        {/* Real-World Industrial & Robotics Engineering Context */}
        {currentLesson.industrialApplications && currentLesson.industrialApplications.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-sky-600" />
              <span>Real-World Engineering & Industrial Production Parallels:</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {currentLesson.industrialApplications.map((app, aIdx) => (
                <div
                  key={aIdx}
                  className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200 text-slate-800 space-y-1.5 shadow-xs"
                >
                  <span className="font-bold text-sky-900 text-[11px] uppercase tracking-wider block font-mono">
                    Production System #{aIdx + 1}
                  </span>
                  <p className="leading-relaxed text-slate-700">{app}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Student Pitfalls & Misconceptions */}
        {currentLesson.pitfalls.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Common Student Pitfalls & Exam Misconceptions:</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentLesson.pitfalls.map((pitfall, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 text-[10px] flex items-center justify-center shrink-0">
                      ✗
                    </span>
                    <span>Misconception: {pitfall.misconception}</span>
                  </div>
                  <div className="text-slate-700 pl-5.5 font-medium leading-relaxed">
                    <span className="font-bold text-emerald-800">Correction: </span>
                    {pitfall.correction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examiner Trap High-Alert Box */}
        {currentLesson.vivaExaminerTrap && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-amber-950 text-xs space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Professor's Oral Defense Trap Warning (Oral Viva Watchout):</span>
            </div>
            <p className="leading-relaxed text-amber-900 font-medium pl-6">
              {currentLesson.vivaExaminerTrap}
            </p>
          </div>
        )}


        {/* Interactive Knowledge-Check Quiz */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-emerald-400" />
              Interactive Knowledge Check Quiz
            </span>
            <span className="text-[11px] text-slate-400 font-mono">1 Question • Immediate Feedback</span>
          </div>

          <h3 className="text-sm font-bold text-white leading-relaxed">
            {currentLesson.quiz.question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {currentLesson.quiz.options.map((opt, optIdx) => {
              const selectedIdx = quizAnswers[currentLesson.id];
              const hasAnswered = selectedIdx !== undefined && selectedIdx !== null;
              const isSelected = selectedIdx === optIdx;
              const isCorrect = optIdx === currentLesson.quiz.correctIndex;

              let btnStyle = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';
              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                } else {
                  btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectQuizOption(currentLesson.id, optIdx)}
                  className={`p-3 rounded-xl text-left text-xs font-medium border transition-all flex items-start gap-2.5 ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-700/80 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Quiz Feedback Explanation */}
          {quizAnswers[currentLesson.id] !== undefined && quizAnswers[currentLesson.id] !== null && (
            <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-300 leading-relaxed space-y-1">
              <span className="font-bold text-emerald-400 block font-mono text-[11px] uppercase">
                {quizAnswers[currentLesson.id] === currentLesson.quiz.correctIndex
                  ? '✓ Correct Answer!'
                  : '✗ Incorrect — Review Explanation:'}
              </span>
              <p>{currentLesson.quiz.explanation}</p>
            </div>
          )}
        </div>

        {/* University Viva Voce Oral Defense Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <span>University Viva Voce Oral Defense Bank</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900">
                    {currentLesson.vivaQuestions.length} Questions
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Comprehensive examiner questions & model answers curated for oral laboratory exams.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const willExpand = !expandAllViva;
                  setExpandAllViva(willExpand);
                  const updated: Record<string, boolean> = {};
                  currentLesson.vivaQuestions.forEach((_, idx) => {
                    updated[`${currentLesson.id}-${idx}`] = willExpand;
                  });
                  setRevealedAnswers(updated);
                }}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold bg-amber-100/70 hover:bg-amber-200/70 text-amber-900 border border-amber-300/60 transition-all flex items-center gap-1"
              >
                {expandAllViva ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-amber-800" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-800" />
                    <span>Expand All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Filter Search for Viva Questions */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-amber-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={vivaSearch}
              onChange={(e) => setVivaSearch(e.target.value)}
              placeholder="Search viva questions by keyword (e.g. admissibility, memory, RAM, optimal)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-amber-50/40 border border-amber-200/80 text-amber-950 placeholder-amber-800/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Scroll Container for Viva Questions ("Schrool Option") */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-50">
            {filteredVivaQuestions.length === 0 ? (
              <div className="p-6 text-center text-xs text-amber-800/70 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200">
                No viva questions match "{vivaSearch}". Clear search to view all questions.
              </div>
            ) : (
              filteredVivaQuestions.map((q, qIdx) => {
                const key = `${currentLesson.id}-${qIdx}`;
                const isRevealed = expandAllViva || !!revealedAnswers[key];

                return (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-amber-200 bg-amber-50/50 overflow-hidden shadow-xs transition-colors hover:border-amber-300"
                  >
                    <button
                      onClick={() => toggleAnswer(key)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3 text-xs sm:text-sm font-bold text-amber-950 hover:bg-amber-100/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-mono text-[10px] flex items-center justify-center shrink-0">
                          Q{qIdx + 1}
                        </span>
                        <span>{q.question}</span>
                      </span>
                      {isRevealed ? (
                        <ChevronUp className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      )}
                    </button>

                    {isRevealed && (
                      <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 text-xs text-slate-800 space-y-2 bg-white/60">
                        <div className="leading-relaxed">
                          <span className="font-bold text-emerald-800 block mb-1">Examiner Model Answer:</span>
                          <p>{q.answer}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-100/70 text-amber-900 text-[11px] flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <span>
                            <strong className="font-semibold">Faculty Exam Tip: </strong>
                            {q.examinerTip}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Scroll Indicator Footer */}
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-800/60 pt-2 border-t border-amber-200/60">
            <span>✦ Scrollable Question Bank</span>
            <span>{filteredVivaQuestions.length} Total Curated Questions</span>
          </div>
        </div>

        {/* Bottom Pagination & Quick Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80">
          <button
            disabled={!prevLesson}
            onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              prevLesson
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                : 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-100'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous: {prevLesson?.title.split(':')[0] || 'Start'}</span>
          </button>

          <button
            onClick={() => toggleComplete(currentLesson.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              completedLessons.has(currentLesson.id)
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {completedLessons.has(currentLesson.id) ? 'Mastered (Completed)' : 'Mark Lesson as Mastered'}
            </span>
          </button>

          <button
            disabled={!nextLesson}
            onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              nextLesson
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-100'
            }`}
          >
            <span>Next: {nextLesson?.title.split(':')[0] || 'End'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
