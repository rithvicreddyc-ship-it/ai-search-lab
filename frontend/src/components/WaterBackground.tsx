import React, { useState, useEffect } from 'react';
import { Waves, Sparkles, Eye, EyeOff } from 'lucide-react';

export const WaterBackground: React.FC = () => {
  // Watermark intensity presets: 'bold' (prominent kinetic typography), 'vivid' (colorful gradient), 'subtle' (gentle ambient), 'hidden' (off)
  const [intensity, setIntensity] = useState<'bold' | 'vivid' | 'subtle' | 'hidden'>(() => {
    return (localStorage.getItem('ai_search_watermark_intensity') as any) || 'bold';
  });

  useEffect(() => {
    localStorage.setItem('ai_search_watermark_intensity', intensity);
  }, [intensity]);

  const stream1 =
    'AI SEARCH LAB ✦ ARTIFICIAL INTELLIGENCE FOUNDATIONS ✦ STATE-SPACE EXPLORATION ✦ A* ALGORITHM ✦ HEURISTIC DOMINANCE ✦ ';
  const stream2 =
    '⬡ UNIFORM COST SEARCH ⬡ BREADTH-FIRST ⬡ DEPTH-FIRST ⬡ GREEDY BEST-FIRST ⬡ IDA* ⬡ HILL CLIMBING ⬡ OPTIMAL DETOURS ⬡ ';
  const stream3 =
    '✦ ADMISSIBILITY: h(n) ≤ h*(n) ✦ CONSISTENCY: h(n) ≤ c(n,a,n\') + h(n\') ✦ f(n) = g(n) + h(n) ✦ EMPIRICAL BENCHMARKS ✦ ';
  const stream4 =
    '⬡ TIME COMPLEXITY O(b^d) ⬡ SPACE COMPLEXITY O(b^d) ⬡ EFFECTIVE BRANCHING b* ⬡ ROMANIA ROAD MAP ⬡ PEER RESEARCH ⬡ ';

  // Opacity styles based on intensity
  const opacityConfig = {
    bold: {
      stream1: 'from-indigo-900/[0.12] via-sky-800/[0.18] to-teal-800/[0.12]',
      stream2: 'from-violet-900/[0.14] via-indigo-800/[0.19] to-cyan-800/[0.14]',
      stream3: 'from-teal-900/[0.11] via-indigo-800/[0.16] to-sky-800/[0.11]',
      stream4: 'from-sky-900/[0.10] via-violet-800/[0.15] to-indigo-800/[0.10]',
      caustics: 'opacity-40',
      rings: 'opacity-40',
    },
    vivid: {
      stream1: 'from-blue-600/[0.16] via-indigo-600/[0.22] to-teal-500/[0.16]',
      stream2: 'from-purple-600/[0.18] via-sky-600/[0.24] to-cyan-500/[0.18]',
      stream3: 'from-emerald-600/[0.15] via-teal-600/[0.20] to-indigo-600/[0.15]',
      stream4: 'from-indigo-600/[0.15] via-violet-600/[0.20] to-sky-600/[0.15]',
      caustics: 'opacity-55',
      rings: 'opacity-50',
    },
    subtle: {
      stream1: 'from-indigo-900/[0.05] via-sky-800/[0.07] to-teal-800/[0.05]',
      stream2: 'from-violet-900/[0.06] via-indigo-800/[0.08] to-cyan-800/[0.06]',
      stream3: 'from-teal-900/[0.04] via-indigo-800/[0.06] to-sky-800/[0.04]',
      stream4: 'from-sky-900/[0.04] via-violet-800/[0.06] to-indigo-800/[0.04]',
      caustics: 'opacity-25',
      rings: 'opacity-20',
    },
    hidden: {
      stream1: 'opacity-0',
      stream2: 'opacity-0',
      stream3: 'opacity-0',
      stream4: 'opacity-0',
      caustics: 'opacity-10',
      rings: 'opacity-10',
    },
  }[intensity];

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      >
        {/* 1. Dynamic Fluid Ambient Aurora Glow Pools */}
        <div className="absolute inset-0">
          {/* Deep Indigo-Sky Fluid Pool */}
          <div className="absolute -top-[15%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-indigo-300/22 via-sky-200/18 to-teal-200/14 blur-[130px] animate-water-wave-1" />

          {/* Deep Violet-Cyan Fluid Pool */}
          <div className="absolute top-[35%] -right-[15%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-tl from-purple-200/20 via-indigo-200/18 to-cyan-200/14 blur-[140px] animate-water-wave-2" />

          {/* Center-Bottom Water Caustic Pool */}
          <div className="absolute bottom-[-12%] left-[20%] w-[58vw] h-[58vw] rounded-full bg-gradient-to-tr from-emerald-200/14 via-sky-300/20 to-indigo-200/16 blur-[120px] animate-water-ripple" />
        </div>

        {/* 2. Moving Fluid Harmonic SVG Waves (Water Caustics) */}
        <svg
          className={`absolute inset-0 w-full h-full ${opacityConfig.caustics} animate-water-wave-1 transition-opacity duration-700`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waterFlowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="waterFlowGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Harmonic Wave Layer 1 */}
          <path
            d="M0,240 C320,360 440,160 720,270 C1000,380 1120,200 1440,310 L1440,900 L0,900 Z"
            fill="url(#waterFlowGrad1)"
          />

          {/* Harmonic Wave Layer 2 */}
          <path
            d="M0,460 C360,330 520,540 840,430 C1160,310 1280,480 1440,390 L1440,900 L0,900 Z"
            fill="url(#waterFlowGrad2)"
          />
        </svg>

        {/* 3. Concentric State-Space Search Contour Rings (f(n) = g(n) + h(n)) */}
        <div className={`absolute top-1/4 right-[4%] w-[520px] h-[520px] ${opacityConfig.rings} animate-slow-orbit pointer-events-none transition-opacity duration-700`}>
          <svg viewBox="0 0 500 500" className="w-full h-full stroke-indigo-500">
            <circle cx="250" cy="250" r="70" fill="none" strokeWidth="1.4" strokeDasharray="4 6" opacity="0.45" />
            <circle cx="250" cy="250" r="130" fill="none" strokeWidth="1.2" strokeDasharray="8 8" opacity="0.55" />
            <circle cx="250" cy="250" r="190" fill="none" strokeWidth="1" strokeDasharray="6 12" opacity="0.4" />
            <circle cx="250" cy="250" r="235" fill="none" strokeWidth="0.8" strokeDasharray="3 9" opacity="0.3" />
            <line x1="15" y1="250" x2="485" y2="250" strokeWidth="0.8" opacity="0.3" />
            <line x1="250" y1="15" x2="250" y2="485" strokeWidth="0.8" opacity="0.3" />
          </svg>
        </div>

        {/* 4. Subtle Constellation Graph Network (Nodes & Edges) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="animate-float-gentle">
            <line x1="120" y1="180" x2="240" y2="130" stroke="#6366f1" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1="240" y1="130" x2="380" y2="200" stroke="#0ea5e9" strokeOpacity="0.2" strokeWidth="1.2" />
            <line x1="240" y1="130" x2="290" y2="280" stroke="#8b5cf6" strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="120" cy="180" r="4.5" fill="#6366f1" opacity="0.45" />
            <circle cx="240" cy="130" r="6" fill="#4f46e5" opacity="0.5" />
            <circle cx="380" cy="200" r="5" fill="#0ea5e9" opacity="0.45" />
            <circle cx="290" cy="280" r="4" fill="#8b5cf6" opacity="0.35" />
          </g>

          <g className="animate-float-reverse-gentle">
            <line x1="1080" y1="620" x2="1200" y2="540" stroke="#0ea5e9" strokeOpacity="0.25" strokeWidth="1.2" />
            <line x1="1200" y1="540" x2="1320" y2="600" stroke="#6366f1" strokeOpacity="0.2" strokeWidth="1.2" strokeDasharray="4 4" />
            <line x1="1200" y1="540" x2="1260" y2="700" stroke="#10b981" strokeOpacity="0.2" strokeWidth="1.2" />
            <circle cx="1080" cy="620" r="4.5" fill="#0ea5e9" opacity="0.4" />
            <circle cx="1200" cy="540" r="6" fill="#6366f1" opacity="0.45" />
            <circle cx="1320" cy="600" r="4" fill="#10b981" opacity="0.35" />
            <circle cx="1260" cy="700" r="5" fill="#8b5cf6" opacity="0.4" />
          </g>
        </svg>

        {/* 5. Bold, Continuous Motion Kinetic Watermark Typography Streams */}
        {intensity !== 'hidden' && (
          <div className="absolute inset-0 flex flex-col justify-around py-6 -rotate-6 scale-110 pointer-events-none transition-all duration-700">
            {/* Stream 1 - Flowing Left (Upper River) */}
            <div className="flex whitespace-nowrap animate-watermark-left">
              <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.24em] text-transparent bg-clip-text bg-gradient-to-r ${opacityConfig.stream1} select-none`}>
                {stream1.repeat(4)}
              </span>
              <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.24em] text-transparent bg-clip-text bg-gradient-to-r ${opacityConfig.stream1} select-none`}>
                {stream1.repeat(4)}
              </span>
            </div>

            {/* Stream 2 - Flowing Right (Center-Upper Accent River) */}
            <div className="flex whitespace-nowrap animate-watermark-right">
              <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.26em] text-transparent bg-clip-text bg-gradient-to-r ${opacityConfig.stream2} select-none`}>
                {stream2.repeat(4)}
              </span>
              <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.26em] text-transparent bg-clip-text bg-gradient-to-r ${opacityConfig.stream2} select-none`}>
                {stream2.repeat(4)}
              </span>
            </div>

            {/* Stream 3 - Flowing Left (Core Mathematical Invariants) */}
            <div className="flex whitespace-nowrap animate-watermark-left">
              <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r ${opacityConfig.stream3} select-none`}>
                {stream3.repeat(4)}
              </span>
              <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r ${opacityConfig.stream3} select-none`}>
                {stream3.repeat(4)}
              </span>
            </div>

            {/* Stream 4 - Flowing Right (Deep Foundation Stream) */}
            <div className="flex whitespace-nowrap animate-watermark-right">
              <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r ${opacityConfig.stream4} select-none`}>
                {stream4.repeat(4)}
              </span>
              <span className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r ${opacityConfig.stream4} select-none`}>
                {stream4.repeat(4)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Interactive Watermark Intensity Controller */}
      <div className="fixed bottom-4 right-4 z-40 print:hidden">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-glass-card text-[11px] font-semibold text-slate-700">
          <span className="flex items-center gap-1 pl-1.5 pr-1 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <Waves className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">Motion Watermark:</span>
          </span>

          <button
            type="button"
            title="Set watermark to Bold (prominent kinetic typography)"
            onClick={() => setIntensity('bold')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              intensity === 'bold'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Bold
          </button>

          <button
            type="button"
            title="Set watermark to Vivid (high-contrast gradient)"
            onClick={() => setIntensity('vivid')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              intensity === 'vivid'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Vivid
          </button>

          <button
            type="button"
            title="Set watermark to Subtle (delicate ambient drift)"
            onClick={() => setIntensity('subtle')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              intensity === 'subtle'
                ? 'bg-slate-700 text-white shadow-xs font-bold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Subtle
          </button>

          <button
            type="button"
            title="Hide motion watermark text"
            onClick={() => setIntensity('hidden')}
            className={`px-1.5 py-0.5 rounded-lg transition-colors ${
              intensity === 'hidden'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            {intensity === 'hidden' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </>
  );
};
