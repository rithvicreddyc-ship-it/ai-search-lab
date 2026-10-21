import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Zap,
  Activity
} from 'lucide-react';

interface PlaybackBarProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onScrub: (step: number) => void;
  speedMs: number;
  onSpeedChange: (speed: number) => void;
  searchStatus: 'idle' | 'running' | 'paused' | 'success' | 'failed';
  algorithmName?: string;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayToggle,
  onStepForward,
  onStepBackward,
  onReset,
  onScrub,
  speedMs,
  onSpeedChange,
  searchStatus,
  algorithmName,
}) => {
  const isComplete = totalSteps > 0 && currentStep >= totalSteps;
  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="p-3 sm:p-4 rounded-3xl bg-[#0b101e]/90 border border-lab-border/80 shadow-glass-card backdrop-blur-2xl space-y-3.5 transition-all">
      {/* Top Deck: Transport Controls + Status Badge + Velocity Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Central Ergonomic Transport Island */}
        <div className="flex items-center gap-1.5 bg-[#050813] p-1.5 rounded-2xl border border-lab-border/70 shadow-inner">
          <button
            onClick={onReset}
            disabled={totalSteps === 0 && currentStep === 0}
            title="Reset playback (Hotkey: R)"
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={currentStep <= 0}
            title="Step backward (Hotkey: Left Arrow)"
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            disabled={totalSteps === 0}
            title={isPlaying ? 'Pause (Space)' : 'Play / Resume (Space)'}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30 ring-1 ring-amber-300'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-glow-indigo'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isComplete ? 'REPLAY' : currentStep > 0 ? 'RESUME' : 'PLAY'}</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            title="Step forward (Hotkey: Right Arrow)"
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Hologram Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-[#050813] px-3.5 py-1.5 rounded-xl border border-lab-border/70 shadow-inner">
            <span className="text-slate-500 text-[11px]">STEP</span>
            <span className="font-bold text-white text-sm">{currentStep}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{totalSteps}</span>
            {totalSteps > 0 && (
              <span className="text-[10px] text-cyan-400 font-sans ml-1">
                ({Math.round(progressPercent)}%)
              </span>
            )}
          </div>

          <div>
            {searchStatus === 'success' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold text-xs shadow-glow-emerald">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Goal Discovered!
              </span>
            )}
            {searchStatus === 'failed' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-500/40 font-semibold text-xs shadow-glow-rose">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Goal Unreachable
              </span>
            )}
            {searchStatus === 'running' && isPlaying && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold text-xs shadow-glow-cyan">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Expanding State Space...
              </span>
            )}
            {searchStatus === 'paused' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-500/40 font-semibold text-xs shadow-glow-amber">
                Playback Paused
              </span>
            )}
            {searchStatus === 'idle' && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#050813] text-slate-400 border border-slate-800 text-xs">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Ready to execute
              </span>
            )}
          </div>
        </div>

        {/* Speed Selector Preset Chips */}
        <div className="flex items-center gap-1.5 bg-[#050813] p-1.5 rounded-2xl border border-lab-border/70">
          <span className="text-[10px] uppercase font-semibold text-slate-500 px-1 hidden md:inline">Speed:</span>
          {[
            { label: 'Slow', ms: 220 },
            { label: 'Normal', ms: 60 },
            { label: 'Fast', ms: 20 },
            { label: 'Instant', ms: 5 },
          ].map((sp) => {
            const isSelected = Math.abs(speedMs - sp.ms) < 20;
            return (
              <button
                key={sp.label}
                onClick={() => onSpeedChange(sp.ms)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {sp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Deck: Precision Scrubber Timeline */}
      <div className="space-y-1 pt-1">
        <div className="relative w-full h-3 bg-[#050813] rounded-full overflow-hidden cursor-pointer group border border-slate-800/80 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-400 to-cyan-400 transition-all duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="absolute right-0 top-0 bottom-0 w-2 bg-white/80 rounded-full shadow-glow-cyan" />
          </div>
          <input
            type="range"
            min="0"
            max={totalSteps}
            value={currentStep}
            disabled={totalSteps === 0}
            onChange={(e) => onScrub(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-1">
          <span>Start State</span>
          <span className="hidden sm:inline font-sans text-slate-400">
            Hotkeys: <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Space</kbd> Play • <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">←/→</kbd> Step • <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">R</kbd> Reset
          </span>
          <span>Goal / Termination</span>
        </div>
      </div>
    </div>
  );
};

