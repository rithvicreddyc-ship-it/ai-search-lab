import React from 'react';
import {
  X,
  Calendar,
  Sparkles,
  GitBranch,
  Users,
  Gift,
  ExternalLink,
  Download,
  BookOpen,
  Award,
  CheckCircle2,
  Terminal,
  Heart,
  Globe
} from 'lucide-react';

export type ModalType = 'events' | 'projects' | 'community' | 'perks' | 'history' | null;

interface ArchitecturalModalProps {
  type: ModalType;
  onClose: () => void;
  onNavigateToLab?: () => void;
}

export const ArchitecturalModal: React.FC<ArchitecturalModalProps> = ({
  type,
  onClose,
  onNavigateToLab,
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            {type === 'events' && (
              <div className="w-10 h-10 rounded-2xl bg-[#FEE58A] text-[#78350F] flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
            )}
            {type === 'projects' && (
              <div className="w-10 h-10 rounded-2xl bg-[#E5D7FA] text-[#4C1D95] flex items-center justify-center font-bold">
                <GitBranch className="w-5 h-5" />
              </div>
            )}
            {type === 'community' && (
              <div className="w-10 h-10 rounded-2xl bg-[#D0F4DE] text-[#065F46] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            )}
            {type === 'perks' && (
              <div className="w-10 h-10 rounded-2xl bg-[#FFDFC8] text-[#9A3412] flex items-center justify-center font-bold">
                <Gift className="w-5 h-5" />
              </div>
            )}
            {type === 'history' && (
              <div className="w-10 h-10 rounded-2xl bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-slate-900 capitalize">
                {type === 'events' && 'AWS SBG & AI Lab Events'}
                {type === 'projects' && 'Open-Source AI & Builder Projects'}
                {type === 'community' && 'Community & Academic Network'}
                {type === 'perks' && '100% Free Perks & Student Resources'}
                {type === 'history' && 'Search & Attendance History Details'}
              </h2>
              <p className="text-xs text-slate-500">
                {type === 'events' && 'Workshops, hackathons, and algorithm defense sessions.'}
                {type === 'projects' && 'Community-engineered state-space benchmarks & visualizers.'}
                {type === 'community' && 'Lovely Professional University chapter & global student builders.'}
                {type === 'perks' && 'Completely free educational tools, cheat sheets, and templates.'}
                {type === 'history' && 'Audited session event logs and state expansion telemetry.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-7 space-y-6 overflow-y-auto flex-1 text-slate-700 text-sm">
          {/* EVENTS CONTENT */}
          {type === 'events' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEE58A] text-[#78350F]">
                    Upcoming Workshop
                  </span>
                  <span className="text-xs text-amber-800 font-mono">28 Oct 2026 • 4:00 PM</span>
                </div>
                <h3 className="font-bold text-slate-900">Mastering State-Space Search & A* Optimality</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join AWS Student Builder Group at Lovely Professional University for a deep-dive interactive session on heuristic admissibility ($h(n) \le h^*(n)$), weighted graphs, and step-by-step priority queue debugging.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Hackathon Track
                  </span>
                  <span className="text-xs text-indigo-800 font-mono">05 Nov 2026 • Global</span>
                </div>
                <h3 className="font-bold text-slate-900">AWS Cloud & AI Search Optimization Challenge</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deploy search engines at scale on AWS Lambda, analyze effective branching factors ($b^*$), and benchmark pathfinding algorithms on massive terrain maps.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Viva Mock Defense
                  </span>
                  <span className="text-xs text-emerald-800 font-mono">Every Saturday</span>
                </div>
                <h3 className="font-bold text-slate-900">University Viva Voce Preparation Circle</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Practice oral defense with peer mentors on completeness of IDA*, admissibility proofs, and local optima traps in Hill Climbing.
                </p>
              </div>
            </div>
          )}

          {/* PROJECTS CONTENT */}
          {type === 'projects' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D8] space-y-2 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span>AI Search Lab Core Engine</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      TypeScript + Vite
                    </span>
                  </h3>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deterministic, zero-latency search engine implementing BFS, DFS, UCS, Greedy, A*, IDA*, and Hill Climbing with genuine queue/stack telemetry.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D8] space-y-2 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Romania Road Map Benchmark</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      AIMA Standard
                    </span>
                  </h3>
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigateToLab) onNavigateToLab();
                    }}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                  >
                    <span>Explore in Lab</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Interactive graph exploration with 20 cities, straight-line distance heuristics to Bucharest, and dynamic step-by-step priority queue visualization.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE4D8] space-y-2 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Weighted Terrain Mud Maze Generator</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Algorithmic
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generates non-uniform cost grid terrains ($4.5\times$ cost multiplier) to demonstrate why BFS produces suboptimal path costs compared to UCS and A*.
                </p>
              </div>
            </div>
          )}

          {/* COMMUNITY CONTENT */}
          {type === 'community' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D0F4DE] text-[#065F46] flex items-center justify-center font-bold">
                    <Heart className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">AWS Student Builder Group • LPU</h3>
                    <p className="text-xs text-slate-600">Lovely Professional University Student Chapter</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A vibrant, student-led tech community dedicated to cloud computing, artificial intelligence foundations, and hands-on software engineering.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 shadow-2xs"
                  >
                    <span>Instagram Community ↗</span>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 shadow-2xs"
                  >
                    <span>LinkedIn Network ↗</span>
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 shadow-2xs"
                  >
                    <span>GitHub Organization ↗</span>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Open Collaboration Guidelines
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Free open-source contributions are warmly welcomed on GitHub.</li>
                  <li>Join weekly peer problem-solving sessions on Discord and in-person campus labs.</li>
                  <li>Share algorithm visualizations and educational course projects freely.</li>
                </ul>
              </div>
            </div>
          )}

          {/* PERKS CONTENT */}
          {type === 'perks' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#FEEACD] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" />
                  <h3 className="font-bold text-slate-900">100% Free Educational Web Access</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No subscriptions, no hidden paywalls, and no account requirements. Everything in AI Search Lab is fully accessible to students, researchers, and educators globally.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 hover:border-orange-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Search Algorithm Cheat Sheet</h4>
                  <p className="text-[11px] text-slate-500">
                    Asymptotic Big-O complexities, completeness invariants, and heuristic admissibility cheat sheet.
                  </p>
                  <button
                    onClick={() => alert('Downloaded AI Search Cheat Sheet (Ready for university viva)!')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-900 pt-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Free PDF</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 hover:border-purple-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    TEX
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">LaTeX Paper Benchmark Tables</h4>
                  <p className="text-[11px] text-slate-500">
                    Ready-to-paste LaTeX table code for research papers and laboratory project reports.
                  </p>
                  <button
                    onClick={() => alert('LaTeX benchmark tables copied to clipboard!')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 pt-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Copy LaTeX Tables</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 hover:border-emerald-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    CSV
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Empirical Benchmark Datasets</h4>
                  <p className="text-[11px] text-slate-500">
                    Seeded maze configurations, obstacle density matrices, and algorithm comparison records.
                  </p>
                  <button
                    onClick={() => alert('Exporting empirical dataset JSON...')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 pt-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export CSV / JSON</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 hover:border-sky-300 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    QA
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">University Viva Defense Deck</h4>
                  <p className="text-[11px] text-slate-500">
                    35 curated viva examination questions with model examiner-approved answers.
                  </p>
                  <button
                    onClick={() => alert('Viva preparation deck unlocked!')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 pt-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Access Viva Deck</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY CONTENT */}
          {type === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Session ID: #AI-FOUNDATIONS-2026</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified Active
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Attendance is continuously tracked for your active session without limits or throttling.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Event</th>
                      <th className="py-2.5 px-3 font-semibold">Algorithm / Action</th>
                      <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Session Check-In</td>
                      <td className="py-2.5 px-3">AI Search Lab Web App</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">23 Oct 2026, 12:39 pm</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-semibold">Completed</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Engine Boot</td>
                      <td className="py-2.5 px-3">A* Search (Manhattan)</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">23 Oct 2026, 12:40 pm</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-semibold">Success (0ms)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Open Access Verified</td>
                      <td className="py-2.5 px-3">Free Academic License</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">23 Oct 2026, 12:40 pm</td>
                      <td className="py-2.5 px-3 text-indigo-600 font-semibold">Active Free</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 border-t border-slate-100 bg-[#FAF8F5] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            AWS Student Builder Group • Lovely Professional University
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
