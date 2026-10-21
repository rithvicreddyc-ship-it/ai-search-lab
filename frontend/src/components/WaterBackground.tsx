import React from 'react';

export const WaterBackground: React.FC = () => {
  const row1Text =
    'AI SEARCH LAB ✦ HEURISTIC EXPLORATION ✦ A* ALGORITHM ✦ UNIFORM COST SEARCH ✦ OPTIMAL PATHFINDING ✦ BREADTH FIRST ✦ DEPTH FIRST ✦ ';
  const row2Text =
    'ARTIFICIAL INTELLIGENCE FOUNDATIONS ✦ STATE SPACE ✦ ADMISSIBLE HEURISTICS ✦ DIJKSTRA ✦ MANHATTAN ✦ EUCLIDEAN ✦ OCTILE ✦ ';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Dynamic Fluid Water Waves & Liquid Glows */}
      <div className="absolute inset-0">
        {/* Deep Water Ripple Pool 1 */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-cyan-600/12 via-indigo-600/10 to-teal-500/8 blur-[120px] animate-water-wave-1"
        />

        {/* Deep Water Ripple Pool 2 */}
        <div
          className="absolute top-[35%] -right-[15%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-tl from-indigo-600/14 via-violet-600/10 to-cyan-500/8 blur-[130px] animate-water-wave-2"
        />

        {/* Ambient Moving Center Water Caustic */}
        <div
          className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-teal-500/10 via-cyan-600/12 to-indigo-600/10 blur-[110px] animate-water-ripple"
        />
      </div>

      {/* Moving SVG Wave Caustic Ribbons */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 animate-water-wave-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waterWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="waterWaveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Harmonic Water Wave Layer 1 */}
        <path
          d="M0,260 C320,380 440,160 720,280 C1000,400 1120,200 1440,320 L1440,900 L0,900 Z"
          fill="url(#waterWaveGrad1)"
        />

        {/* Harmonic Water Wave Layer 2 */}
        <path
          d="M0,480 C360,340 520,560 840,440 C1160,320 1280,500 1440,400 L1440,900 L0,900 Z"
          fill="url(#waterWaveGrad2)"
        />
      </svg>

      {/* Moving Watermark Streams (Angled Kinetic Rivers of Typography) */}
      <div className="absolute inset-0 flex flex-col justify-around -rotate-12 scale-125 opacity-70">
        {/* Stream 1 - Flowing Left */}
        <div className="flex whitespace-nowrap animate-watermark-left">
          <span className="text-[7vw] font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400/[0.04] via-indigo-400/[0.06] to-teal-400/[0.04]">
            {row1Text.repeat(4)}
          </span>
          <span className="text-[7vw] font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400/[0.04] via-indigo-400/[0.06] to-teal-400/[0.04]">
            {row1Text.repeat(4)}
          </span>
        </div>

        {/* Stream 2 - Flowing Right */}
        <div className="flex whitespace-nowrap animate-watermark-right">
          <span className="text-[6.5vw] font-black uppercase tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-r from-violet-400/[0.035] via-cyan-400/[0.055] to-indigo-400/[0.035]">
            {row2Text.repeat(4)}
          </span>
          <span className="text-[6.5vw] font-black uppercase tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-r from-violet-400/[0.035] via-cyan-400/[0.055] to-indigo-400/[0.035]">
            {row2Text.repeat(4)}
          </span>
        </div>

        {/* Stream 3 - Flowing Left (Deeper Subtle River) */}
        <div className="flex whitespace-nowrap animate-watermark-left">
          <span className="text-[8vw] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-teal-400/[0.03] via-indigo-400/[0.05] to-cyan-400/[0.03]">
            {row1Text.repeat(4)}
          </span>
          <span className="text-[8vw] font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-teal-400/[0.03] via-indigo-400/[0.05] to-cyan-400/[0.03]">
            {row1Text.repeat(4)}
          </span>
        </div>
      </div>
    </div>
  );
};
