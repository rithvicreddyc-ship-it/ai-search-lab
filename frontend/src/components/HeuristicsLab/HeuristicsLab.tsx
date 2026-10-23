import React, { useState, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const HeuristicsLab: React.FC = () => {
  const [startPos, setStartPos] = useState<[number, number]>([2, 3]);
  const [goalPos, setGoalPos] = useState<[number, number]>([12, 18]);
  const [vivaSearch, setVivaSearch] = useState<string>('');
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [expandedViva, setExpandedViva] = useState<number | null>(null);

  const dx = Math.abs(startPos[0] - goalPos[0]);
  const dy = Math.abs(startPos[1] - goalPos[1]);

  const manhattan = dx + dy;
  const euclidean = Math.hypot(dx, dy);
  const octile = Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  const chebyshev = Math.max(dx, dy);

  const heuristicVivaQuestions = [
    {
      question: 'Does consistency always imply admissibility? What does the converse state?',
      answer: 'Yes! A consistent heuristic is ALWAYS admissible. Consistency requires h(n) <= c(n, a, n\') + h(n\') for all steps, which by induction guarantees h(n) <= h*(n). However, the converse is FALSE: an admissible heuristic is NOT necessarily consistent (it can violate the triangle inequality across edges).',
      tip: 'Remember: Consistency is a stronger condition than admissibility. Consistent => Admissible, but Admissible !=> Consistent.'
    },
    {
      question: 'Can an admissible heuristic ever be inconsistent? Provide a concrete counterexample.',
      answer: 'Yes. Consider Start S, intermediate node A, and Goal G with edges S->A (cost 1), A->G (cost 4), and direct edge S->G (cost 6). The true lowest costs are h*(S)=5, h*(A)=4, h*(G)=0. Suppose h(S)=4, h(A)=1, h(G)=0. Both are <= true costs, so h is admissible. But across edge S->A: h(S) = 4 > c(S,A) + h(A) = 1 + 1 = 2. This violates the triangle inequality, making h inconsistent.',
      tip: 'Faculty love seeing students sketch the 3-node S-A-G triangle counterexample during oral blackboard defense.'
    },
    {
      question: 'What happens if h(n) = 0 for all nodes? What does A* devolve into?',
      answer: 'If h(n) = 0 everywhere, the heuristic is trivially admissible and consistent (since 0 <= true cost). The evaluation function f(n) = g(n) + h(n) becomes simply f(n) = g(n). A* expands nodes strictly in non-decreasing order of path cost, becoming completely identical to Uniform Cost Search (Dijkstra\'s algorithm).',
      tip: 'h(n)=0 represents complete lack of domain knowledge, collapsing informed search into uninformed blind search.'
    },
    {
      question: 'Define heuristic dominance mathematically. Why is a dominating heuristic computationally superior?',
      answer: 'Given two admissible heuristics h1 and h2, h2 dominates h1 if h2(n) >= h1(n) for all nodes n, with h2(n) > h1(n) for at least one node. Because h2 provides higher estimates closer to the true cost h*(n), A* with h2 will never expand more nodes than A* with h1 (except for tie-breaking). Thus, dominating heuristics guarantee fewer expanded states and faster runtimes.',
      tip: 'Mathematical definition: For all n, h2(n) >= h1(n) and h2 is admissible.'
    },
    {
      question: 'Why is Manhattan distance admissible on a 4-connected grid, but inadmissible if diagonal steps are permitted?',
      answer: 'On a 4-connected grid, movement is restricted to horizontal and vertical steps of cost 1, making dx + dy the absolute minimum possible travel cost. However, on an 8-connected grid where diagonal movement costs √2 ≈ 1.414, moving from (0,0) to (1,1) costs 1.414, whereas Manhattan computes |1-0| + |1-0| = 2.0. Since 2.0 > 1.414, Manhattan overestimates the true cost, breaking admissibility and A* optimality.',
      tip: 'Always state the movement model: Manhattan is admissible for 4-way movement only, Octile or Chebyshev for 8-way.'
    },
    {
      question: 'Why does Euclidean distance underestimate Manhattan distance on an orthogonal grid, and what is the consequence?',
      answer: 'By the Pythagorean theorem, √(dx² + dy²) <= dx + dy for all coordinates. While Euclidean distance is admissible on a 4-way grid (since √ <= true cost), it severely underestimates the true orthogonal cost. Because the estimate is weaker, A* is forced to expand significantly more candidate states in circular contours rather than focusing forward along Manhattan corridors.',
      tip: 'Underestimation retains optimality but sacrifices search efficiency by generating wider wavefronts.'
    },
    {
      question: 'What is the Octile distance, and why is it the gold standard for 8-connected grid navigation?',
      answer: 'Octile distance computes the exact cost of diagonal steps (cost √2) followed by straight steps (cost 1): h(n) = (√2 - 1) * min(dx, dy) + max(dx, dy). It represents the true shortest obstacle-free distance on an 8-connected grid, making it both strictly admissible and consistent, dominating Euclidean distance.',
      tip: 'Formula: (√2 - 1) * min(dx, dy) + max(dx, dy) ≈ 0.414 * min + max.'
    },
    {
      question: 'How does Weighted A* (f = g + w*h where w > 1) trade optimality for search speed?',
      answer: 'Weighted A* inflates the heuristic weight by factor w > 1: f(n) = g(n) + w * h(n). This pushes the search strongly toward the goal like Greedy search, drastically reducing node expansions. The solution cost is mathematically bounded to be no worse than w * C* (where C* is optimal cost). It guarantees ε-admissible bounded suboptimality while running up to 10-100x faster.',
      tip: 'Cite the bounded suboptimality theorem: Cost(Weighted A*) <= w * Cost(Optimal A*).'
    }
  ];

  const filteredViva = useMemo(() => {
    if (!vivaSearch.trim()) return heuristicVivaQuestions;
    const q = vivaSearch.toLowerCase();
    return heuristicVivaQuestions.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q) || item.tip.toLowerCase().includes(q)
    );
  }, [vivaSearch]);

  const heuristicsInfo = [
    {
      id: 'manhattan',
      name: 'Manhattan Distance (L1 Norm)',
      formula: 'h(n) = |r1 - r2| + |c1 - c2|',
      calculated: manhattan.toFixed(2),
      is4DirAdmissible: true,
      is8DirAdmissible: false,
      notes: 'Optimal & consistent for 4-directional unit grids. Violates admissibility if diagonal moves are permitted.'
    },
    {
      id: 'euclidean',
      name: 'Euclidean Distance (L2 Norm)',
      formula: 'h(n) = √((r1 - r2)² + (c1 - c2)²)',
      calculated: euclidean.toFixed(2),
      is4DirAdmissible: true,
      is8DirAdmissible: true,
      notes: 'Strictly admissible for both 4-way and 8-way movement, but weaker than Manhattan on 4-way unit grids (expands more nodes).'
    },
    {
      id: 'octile',
      name: 'Octile Distance (Diagonal Metric)',
      formula: 'h(n) = max(dx, dy) + (√2 - 1)·min(dx, dy)',
      calculated: octile.toFixed(2),
      is4DirAdmissible: false,
      is8DirAdmissible: true,
      notes: 'The exact admissible and consistent heuristic for 8-directional grids where diagonal step cost = √2 ≈ 1.414.'
    },
    {
      id: 'chebyshev',
      name: 'Chebyshev Distance (L∞ Norm)',
      formula: 'h(n) = max(|r1 - r2|, |c1 - c2|)',
      calculated: chebyshev.toFixed(2),
      is4DirAdmissible: false,
      is8DirAdmissible: true,
      notes: 'Admissible only if diagonal movement cost equals orthogonal cost (cost = 1.0, e.g. King moves in chess).'
    },
    {
      id: 'zero',
      name: 'Zero Heuristic h(n) = 0',
      formula: 'h(n) = 0.0',
      calculated: '0.00',
      is4DirAdmissible: true,
      is8DirAdmissible: true,
      notes: 'Trivially admissible. Converts A* directly into Dijkstra / Uniform Cost Search.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 py-2 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFF8F2] text-emerald-800 border border-[#DCF1E2]">
            100% Free Open Academic Web
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
            <Compass className="w-5 h-5" />
          </div>
          <span>Heuristics Laboratory & Admissibility Sandbox</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Explore mathematical heuristic formulas, verify admissibility conditions, and observe how heuristic choice dictates A* pruning efficiency.
        </p>
      </div>

      {/* Interactive Coordinate Probe */}
      <div className="p-7 sm:p-8 rounded-[2rem] bg-white/95 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Interactive State Distance Probe</span>
          </span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              <span className="text-emerald-700 font-semibold">Start:</span>
              <span className="text-slate-800">({startPos[0]}, {startPos[1]})</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              <span className="text-rose-700 font-semibold">Goal:</span>
              <span className="text-slate-800">({goalPos[0]}, {goalPos[1]})</span>
            </div>
            <div className="text-slate-600 font-mono">
              Δr = {dx}, Δc = {dy}
            </div>
          </div>
        </div>

        {/* Sliders to test coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Start Row: <strong className="text-slate-900">{startPos[0]}</strong></span>
              <span>Start Col: <strong className="text-slate-900">{startPos[1]}</strong></span>
            </div>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="25"
                value={startPos[0]}
                onChange={(e) => setStartPos([Number(e.target.value), startPos[1]])}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="35"
                value={startPos[1]}
                onChange={(e) => setStartPos([startPos[0], Number(e.target.value)])}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Goal Row: <strong className="text-slate-900">{goalPos[0]}</strong></span>
              <span>Goal Col: <strong className="text-slate-900">{goalPos[1]}</strong></span>
            </div>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="25"
                value={goalPos[0]}
                onChange={(e) => setGoalPos([Number(e.target.value), goalPos[1]])}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="35"
                value={goalPos[1]}
                onChange={(e) => setGoalPos([goalPos[0], Number(e.target.value)])}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Calculated Heuristic Values Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
          {heuristicsInfo.map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-2 hover:border-indigo-300 transition-colors"
            >
              <div className="text-[11px] font-bold text-slate-900 truncate">{h.name.split('(')[0]}</div>
              <div className="text-2xl font-bold font-mono text-indigo-700">{h.calculated}</div>
              <div className="text-[10px] font-mono text-slate-500">{h.formula}</div>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">4-Way Admissible:</span>
                  <span className={h.is4DirAdmissible ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {h.is4DirAdmissible ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">8-Way Admissible:</span>
                  <span className={h.is8DirAdmissible ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {h.is8DirAdmissible ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Explanations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admissibility Explained */}
        <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Admissibility: Never Overestimating Cost
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A heuristic <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">h(n)</code> is <strong>admissible</strong> if it never overestimates the true lowest cost <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">h*(n)</code> to reach the goal:
          </p>
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center font-mono text-xs text-amber-900 shadow-xs">
            0 ≤ h(n) ≤ h*(n)  for all nodes n
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Viva Key Point:</strong> In Tree Search, admissibility alone guarantees that A* discovers an optimal path. If a heuristic overestimates by even 0.01, A* can prune an optimal branch in favor of a seemingly shorter one.
          </p>
        </div>

        {/* Consistency / Monotonicity Explained */}
        <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Consistency (Monotonicity): The Triangle Inequality
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A heuristic is <strong>consistent</strong> if for every node <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">n</code> and successor <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">n'</code> generated by action <code className="text-indigo-700 font-mono bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">a</code>:
          </p>
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 text-center font-mono text-xs text-sky-900 shadow-xs">
            h(n) ≤ c(n, a, n') + h(n')
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Viva Key Point:</strong> Consistency implies admissibility. In Graph Search, consistency guarantees that when any node is selected from the priority queue and expanded, its path cost is already strictly optimal, eliminating the need to reopen closed nodes.
          </p>
        </div>
      </div>

      {/* Heuristic Functions Viva Voce Defense Bank */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Heuristic Functions Oral Viva Exam Defense Bank</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                  {heuristicVivaQuestions.length} Questions
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Top questions asked by faculty on admissibility proofs, consistency, triangle inequality, and distance metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setExpandAll(!expandAll);
                setExpandedViva(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5"
            >
              {expandAll ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expand All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={vivaSearch}
            onChange={(e) => setVivaSearch(e.target.value)}
            placeholder="Search viva questions (e.g. consistency, triangle inequality, Manhattan, dominance)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#EDE7DC] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Scroll Container for Viva Questions ("Schrool Option") */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {filteredViva.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-[#FAF8F5] rounded-2xl border border-dashed border-slate-200">
              No viva questions match "{vivaSearch}". Clear search to view all questions.
            </div>
          ) : (
            filteredViva.map((viva, idx) => {
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
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-[10px] shrink-0 group-hover:scale-105 transition-transform">
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
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 bg-white animate-fade-in space-y-2">
                      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 mt-2 space-y-1">
                        <strong className="text-indigo-900 block font-bold text-xs uppercase tracking-wider">
                          Examiner-Approved Model Viva Answer:
                        </strong>
                        <p className="leading-relaxed text-slate-700 text-xs sm:text-[13px]">
                          {viva.answer}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">Examiner Tip: </strong>
                          {viva.tip}
                        </span>
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
          <span>{filteredViva.length} Total Curated Questions</span>
        </div>
      </div>
    </div>
  );
};
