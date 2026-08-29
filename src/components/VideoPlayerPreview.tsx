import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldAlert,
  Clock,
  Award,
  FastForward,
  Film,
  Layers,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { RenderOptions, TimerConfig } from '../types';
import {
  drawFlipClockFrame,
  drawIntroSlideFrame,
  drawDisclaimerSlideFrame,
  drawOutroSlideFrame,
  getResolutionDimensions,
} from '../utils/canvasRenderer';

interface VideoPlayerPreviewProps {
  timer: TimerConfig;
  options: RenderOptions;
}

export const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({ timer, options }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Timeline durations
  const introEnabled = options.slides?.intro?.enabled ?? true;
  const introSec = introEnabled ? (options.slides?.intro?.durationSeconds ?? 5) : 0;

  const disclaimerEnabled = options.slides?.disclaimer?.enabled ?? true;
  const disclaimerSec = disclaimerEnabled ? (options.slides?.disclaimer?.durationSeconds ?? 5) : 0;

  const clockDurationSec = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
  const holdSec = options.holdEndSeconds || 0;

  const outroEnabled = options.slides?.outro?.enabled ?? true;
  const outroSec = outroEnabled ? (options.slides?.outro?.durationSeconds ?? 5) : 0;

  const totalVideoDurationSec = Math.max(1, introSec + disclaimerSec + clockDurationSec + holdSec + outroSec);

  // Current Segment determination
  const getCurrentSegment = (timeSec: number) => {
    let cursor = 0;
    if (introEnabled && timeSec < cursor + introSec) {
      const segTime = timeSec - cursor;
      const progress = segTime / Math.max(0.1, introSec);
      return { type: 'intro' as const, label: 'Slide 1: Intro', progress, remainingSec: Math.ceil(introSec - segTime) };
    }
    cursor += introSec;

    if (disclaimerEnabled && timeSec < cursor + disclaimerSec) {
      const segTime = timeSec - cursor;
      const progress = segTime / Math.max(0.1, disclaimerSec);
      return { type: 'disclaimer' as const, label: 'Slide 2: Disclaimer', progress, remainingSec: Math.ceil(disclaimerSec - segTime) };
    }
    cursor += disclaimerSec;

    if (timeSec < cursor + clockDurationSec) {
      const segTime = timeSec - cursor;
      const progress = segTime / Math.max(1, clockDurationSec);
      const remainingClock = Math.max(0, clockDurationSec - segTime);
      return { type: 'clock' as const, label: 'Countdown Timer', progress, remainingClock };
    }
    cursor += clockDurationSec;

    if (holdSec > 0 && timeSec < cursor + holdSec) {
      return { type: 'hold' as const, label: 'End Hold (00:00:00)', progress: 1, remainingClock: 0 };
    }
    cursor += holdSec;

    if (outroEnabled && timeSec <= cursor + outroSec) {
      const segTime = timeSec - cursor;
      const progress = segTime / Math.max(0.1, outroSec);
      return { type: 'outro' as const, label: 'Slide 3: Outro', progress, remainingSec: Math.ceil(outroSec - segTime) };
    }

    return { type: 'outro' as const, label: 'Completed', progress: 1, remainingSec: 0 };
  };

  const activeSegment = getCurrentSegment(currentTimeSec);

  // Render a specific frame onto Canvas given timestamp in seconds
  const renderFrameAtTime = (timeSec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getResolutionDimensions(options.resolution);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    let cursor = 0;

    // 1. Intro Slide
    if (introEnabled && timeSec < cursor + introSec) {
      const segProgress = Math.max(0, Math.min(1, (timeSec - cursor) / Math.max(0.1, introSec)));
      drawIntroSlideFrame(ctx, width, height, timer, options, segProgress);
      return;
    }
    cursor += introSec;

    // 2. Disclaimer Slide
    if (disclaimerEnabled && timeSec < cursor + disclaimerSec) {
      const segProgress = Math.max(0, Math.min(1, (timeSec - cursor) / Math.max(0.1, disclaimerSec)));
      drawDisclaimerSlideFrame(ctx, width, height, options, segProgress);
      return;
    }
    cursor += disclaimerSec;

    // 3. Flip Clock Countdown & Hold
    if (timeSec < cursor + clockDurationSec + holdSec) {
      const clockElapsedSec = Math.max(0, timeSec - cursor);
      let curDisplay = 0;
      let nextDisplay = 0;
      let frac = 0;

      if (clockElapsedSec >= clockDurationSec) {
        curDisplay = 0;
        nextDisplay = 0;
        frac = 0;
      } else {
        const secIndex = Math.floor(clockElapsedSec);
        curDisplay = Math.max(0, clockDurationSec - secIndex);
        nextDisplay = Math.max(0, curDisplay - 1);
        frac = clockElapsedSec - secIndex;
      }

      drawFlipClockFrame(
        ctx,
        width,
        height,
        {
          currentDisplaySeconds: curDisplay,
          nextDisplaySeconds: nextDisplay,
          fractionalSecond: frac,
          totalTargetSeconds: clockDurationSec,
          isFinished: clockElapsedSec >= clockDurationSec,
        },
        options
      );
      return;
    }
    cursor += clockDurationSec + holdSec;

    // 4. Outro Slide
    if (outroEnabled) {
      const outroElapsed = Math.max(0, timeSec - cursor);
      const segProgress = Math.max(0, Math.min(1, outroElapsed / Math.max(0.1, outroSec)));
      drawOutroSlideFrame(ctx, width, height, options, segProgress);
      return;
    }

    // Default Fallback
    drawOutroSlideFrame(ctx, width, height, options, 1);
  };

  // Re-draw current frame when config or currentTimeSec changes while paused
  useEffect(() => {
    if (!isPlaying) {
      renderFrameAtTime(currentTimeSec);
    }
  }, [currentTimeSec, options, timer, isPlaying]);

  // Real-time smooth animation ticker
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentTimeSec((prev) => {
        const next = prev + delta * playbackSpeed;
        if (next >= totalVideoDurationSec) {
          setIsPlaying(false);
          renderFrameAtTime(totalVideoDurationSec);
          return totalVideoDurationSec;
        }
        renderFrameAtTime(next);
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, totalVideoDurationSec, options, timer]);

  // Jump to specific slide or section
  const jumpToSlide = (type: 'intro' | 'disclaimer' | 'clock' | 'outro') => {
    let targetSec = 0;
    if (type === 'intro') targetSec = 0;
    if (type === 'disclaimer') targetSec = introSec;
    if (type === 'clock') targetSec = introSec + disclaimerSec;
    if (type === 'outro') targetSec = introSec + disclaimerSec + clockDurationSec + holdSec;

    setCurrentTimeSec(targetSec);
    renderFrameAtTime(targetSec);
  };

  // Formatting helper
  const formatTime = (secs: number) => {
    const totalSecs = Math.max(0, Math.floor(secs));
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const { width, height } = getResolutionDimensions(options.resolution);
  const isPortrait = height > width;

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Segment Quick-Jump Bar & Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          {introEnabled && (
            <button
              type="button"
              onClick={() => jumpToSlide('intro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSegment.type === 'intro'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intro ({introSec}s)</span>
            </button>
          )}

          {disclaimerEnabled && (
            <button
              type="button"
              onClick={() => jumpToSlide('disclaimer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSegment.type === 'disclaimer'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Disclaimer ({disclaimerSec}s)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => jumpToSlide('clock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSegment.type === 'clock' || activeSegment.type === 'hold'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Countdown Clock</span>
          </button>

          {outroEnabled && (
            <button
              type="button"
              onClick={() => jumpToSlide('outro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSegment.type === 'outro'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Outro ({outroSec}s)</span>
            </button>
          )}
        </div>

        {/* Speed multiplier selector */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <FastForward className="w-3.5 h-3.5 text-neutral-400 ml-1.5" />
          {[1, 2, 5, 20, 60].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition cursor-pointer ${
                playbackSpeed === spd
                  ? 'bg-rose-500 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title={`Fast-forward preview at ${spd}x realtime`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Player Viewport Card */}
      <div
        ref={containerRef}
        className={`group relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl flex flex-col items-center justify-center select-none ${
          isPortrait ? 'aspect-[9/16] max-h-[660px]' : 'aspect-[16/9]'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block cursor-pointer"
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ imageRendering: 'high-quality' }}
        />

        {/* Top Floating Badge overlay showing active segment info */}
        <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none transition-opacity duration-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-bold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{activeSegment.label}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300 font-mono text-[11px]">
            {width}×{height} @ {options.fps}fps
          </div>
        </div>

        {/* Bottom Integrated Video Player Controls Bar (YouTube-style) */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col gap-2.5 transition-opacity">
          {/* Segmented Interactive Timeline Scrubber */}
          <div className="relative flex items-center group/scrubber cursor-pointer">
            {/* Background Segment Track */}
            <div className="w-full h-2 bg-neutral-800/80 rounded-full overflow-hidden flex relative">
              {/* Intro segment mark */}
              {introEnabled && (
                <div
                  style={{ width: `${(introSec / totalVideoDurationSec) * 100}%` }}
                  className="h-full bg-rose-500/40 border-r border-black/60 relative group-hover/scrubber:h-2.5 transition-all"
                  title={`Intro Slide (${introSec}s)`}
                />
              )}
              {/* Disclaimer segment mark */}
              {disclaimerEnabled && (
                <div
                  style={{ width: `${(disclaimerSec / totalVideoDurationSec) * 100}%` }}
                  className="h-full bg-amber-500/40 border-r border-black/60 relative group-hover/scrubber:h-2.5 transition-all"
                  title={`Disclaimer Slide (${disclaimerSec}s)`}
                />
              )}
              {/* Flip clock segment */}
              <div
                style={{ width: `${((clockDurationSec + holdSec) / totalVideoDurationSec) * 100}%` }}
                className="h-full bg-neutral-600/40 border-r border-black/60 relative group-hover/scrubber:h-2.5 transition-all"
                title={`Countdown Clock (${clockDurationSec}s)`}
              />
              {/* Outro segment */}
              {outroEnabled && (
                <div
                  style={{ width: `${(outroSec / totalVideoDurationSec) * 100}%` }}
                  className="h-full bg-emerald-500/40 relative group-hover/scrubber:h-2.5 transition-all"
                  title={`Outro Slide (${outroSec}s)`}
                />
              )}

              {/* Played progress fill bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-rose-500 rounded-full pointer-events-none transition-all duration-75"
                style={{ width: `${(currentTimeSec / totalVideoDurationSec) * 100}%` }}
              />
            </div>

            {/* Native Slider overlay for smooth dragging */}
            <input
              type="range"
              min="0"
              max={totalVideoDurationSec}
              step="0.05"
              value={currentTimeSec}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                setCurrentTimeSec(newTime);
                renderFrameAtTime(newTime);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Lower Controls & Indicators */}
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) {
                    setIsPlaying(false);
                  } else {
                    if (currentTimeSec >= totalVideoDurationSec) {
                      setCurrentTimeSec(0);
                    }
                    setIsPlaying(true);
                  }
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex items-center justify-center"
                title={isPlaying ? 'Pause' : 'Play Video'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-amber-400 fill-amber-400" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                )}
              </button>

              {/* Reset to Start */}
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentTimeSec(0);
                  renderFrameAtTime(0);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
                title="Restart Video from 00:00"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Time Code Stamp */}
              <div className="font-mono text-xs text-neutral-300 font-semibold tracking-wider">
                <span className="text-white">{formatTime(currentTimeSec)}</span>
                <span className="text-neutral-500 mx-1.5">/</span>
                <span className="text-neutral-400">{formatTime(totalVideoDurationSec)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Active Slide Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900/80 border border-neutral-700/60 text-[11px] font-mono text-neutral-300">
                <Film className="w-3 h-3 text-rose-400" />
                <span>{activeSegment.label}</span>
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
