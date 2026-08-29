import React from 'react';
import { Loader2, Zap, XCircle, Clock, Film } from 'lucide-react';
import { RenderProgress } from '../types';

interface RenderProgressModalProps {
  progress: RenderProgress;
  onCancel: () => void;
}

export const RenderProgressModal: React.FC<RenderProgressModalProps> = ({ progress, onCancel }) => {
  const formatTimeMs = (ms: number) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-rose-500/40 shadow-2xl shadow-rose-950/40 flex flex-col gap-5">
      {/* Header & Status Text */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">
              {progress.status === 'muxing' ? 'Muxing & Finalizing Video...' : 'Rendering Video Frame-by-Frame'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-mono text-rose-400 font-semibold">
                Rendering {progress.currentDisplayTime || '00:00:00'}...
              </span>
              {progress.engineUsed && (
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700 font-medium">
                  {progress.engineUsed}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold transition"
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-neutral-400 font-medium">Progress</span>
          <span className="text-white font-bold text-sm">{progress.percent}%</span>
        </div>

        <div className="w-full h-3.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-400 rounded-full transition-all duration-150 relative overflow-hidden"
            style={{ width: `${progress.percent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-[pulse_1.5s_infinite]" />
          </div>
        </div>
      </div>

      {/* Real-time Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Encoding Speed */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Speed
          </div>
          <div className="text-base font-mono font-bold text-white">
            {progress.fpsActual} <span className="text-xs text-neutral-400">FPS</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium font-mono">
            {progress.speedMultiplier > 0 ? `${progress.speedMultiplier}x Realtime` : 'Fast GPU'}
          </div>
        </div>

        {/* Frames Processed */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase">
            <Film className="w-3.5 h-3.5 text-rose-400" /> Frames
          </div>
          <div className="text-base font-mono font-bold text-white">
            {progress.currentFrame.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">
            of {progress.totalFrames.toLocaleString()} total
          </div>
        </div>

        {/* Elapsed Time */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase">
            <Clock className="w-3.5 h-3.5 text-neutral-400" /> Elapsed
          </div>
          <div className="text-base font-mono font-bold text-white">
            {formatTimeMs(progress.elapsedMs)}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">render time</div>
        </div>

        {/* Estimated Remaining */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase">
            <Clock className="w-3.5 h-3.5 text-neutral-400" /> Remaining
          </div>
          <div className="text-base font-mono font-bold text-white">
            {progress.status === 'muxing' ? 'Finishing...' : formatTimeMs(progress.estimatedRemainingMs)}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">estimated ETA</div>
        </div>
      </div>
    </div>
  );
};
