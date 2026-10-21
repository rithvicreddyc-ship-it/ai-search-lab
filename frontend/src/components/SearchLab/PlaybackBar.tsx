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
    <div className="p-3 sm:p-4 rounded-3xl bg-white/95 border border-slate-200/90 shadow-glass-card backdrop-blur-2xl space-y-3.5 transition-all">
      {/* Top Deck: Transport Controls + Status Badge + Velocity Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Central Ergonomic Transport Island */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={onReset}
            disabled={totalSteps === 0 && currentStep === 0}
            title="Reset playback (Hotkey: R)"
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={currentStep <= 0}
            title="Step backward (Hotkey: Left Arrow)"
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            disabled={totalSteps === 0}
            title={isPlaying ? 'Pause (Space)' : 'Play / Resume (Space)'}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-300'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md'
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
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Hologram Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-inner">
            <span className="text-slate-500 text-[11px]">STEP</span>
            <span className="font-bold text-slate-900 text-sm">{currentStep}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">{totalSteps}</span>
            {totalSteps > 0 && (
              <span className="text-[10px] text-indigo-600 font-sans font-semibold ml-1">
                ({Math.round(progressPercent)}%)
              </span>
            )}
          </div>

          <div>
            {searchStatus === 'success' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Goal Discovered!
              </span>
            )}
            {searchStatus === 'failed' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-xs shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Goal Unreachable
              </span>
            )}
            {searchStatus === 'running' && isPlaying && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-semibold text-xs shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                Expanding State Space...
              </span>
            )}
            {searchStatus === 'paused' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs shadow-sm">
                Playback Paused
              </span>
            )}
            {searchStatus === 'idle' && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                Ready to execute
              </span>
            )}
          </div>
        </div>

        {/* Speed Selector Preset Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
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
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
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
        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden cursor-pointer group border border-slate-300 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-sm" />
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
          <span className="hidden sm:inline font-sans text-slate-600">
            Hotkeys: <kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-700">Space</kbd> Play • <kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-700">←/→</kbd> Step • <kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-700">R</kbd> Reset
          </span>
          <span>Goal / Termination</span>
        </div>
      </div>
    </div>
  );
};

