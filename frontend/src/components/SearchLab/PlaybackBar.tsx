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
    <div className="p-3.5 rounded-2xl bg-lab-panel/90 border border-lab-border shadow-xl space-y-3">
      {/* Top Row: Playback Controls & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Button Group */}
        <div className="flex items-center gap-1.5 bg-[#0e1320] p-1 rounded-xl border border-lab-border/70">
          <button
            onClick={onReset}
            disabled={totalSteps === 0 && currentStep === 0}
            title="Reset playback (Key: R)"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={currentStep <= 0}
            title="Step backward (Key: Left Arrow)"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            disabled={totalSteps === 0}
            title={isPlaying ? 'Pause (Space)' : 'Play / Resume (Space)'}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 font-semibold text-xs transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            } disabled:opacity-40`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isComplete ? 'Replay' : currentStep > 0 ? 'Resume' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            title="Step forward (Key: Right Arrow)"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Step Counter & Status Badge */}
        <div className="flex items-center gap-3 text-xs">
          <div className="font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            Step <span className="font-bold text-white">{currentStep}</span> / {totalSteps}
          </div>

          <div className="flex items-center gap-1.5">
            {searchStatus === 'success' && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Goal Discovered!
              </span>
            )}
            {searchStatus === 'failed' && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Goal Unreachable
              </span>
            )}
            {searchStatus === 'running' && isPlaying && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Exploring...
              </span>
            )}
            {searchStatus === 'paused' && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                Paused
              </span>
            )}
          </div>
        </div>

        {/* Speed Slider */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#0e1320] px-3 py-1.5 rounded-xl border border-lab-border/70">
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-medium hidden sm:inline">Speed:</span>
          <input
            type="range"
            min="10"
            max="400"
            step="10"
            value={410 - speedMs}
            onChange={(e) => onSpeedChange(410 - Number(e.target.value))}
            className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            title="Adjust animation replay speed"
          />
          <span className="font-mono text-[11px] text-slate-300 w-10 text-right">
            {speedMs <= 30 ? 'Fast' : speedMs >= 250 ? 'Slow' : 'Med'}
          </span>
        </div>
      </div>

      {/* Bottom Row: Interactive Timeline Scrubber */}
      <div className="space-y-1">
        <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden cursor-pointer group border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
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
      </div>
    </div>
  );
};
