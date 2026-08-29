import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Eye, Sparkles, ShieldAlert, Award, Clock } from 'lucide-react';
import { RenderOptions, TimerConfig } from '../types';
import {
  drawFlipClockFrame,
  drawIntroSlideFrame,
  drawDisclaimerSlideFrame,
  drawOutroSlideFrame,
  getResolutionDimensions
} from '../utils/canvasRenderer';

type PreviewMode = 'clock' | 'intro' | 'disclaimer' | 'outro';

interface FlipClockPreviewProps {
  timer: TimerConfig;
  options: RenderOptions;
}

export const FlipClockPreview: React.FC<FlipClockPreviewProps> = ({ timer, options }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('clock');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewRemainingSeconds, setPreviewRemainingSeconds] = useState<number>(0);
  const [slideProgress, setSlideProgress] = useState<number>(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const initialTotalSeconds = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;

  // Sync initial seconds
  useEffect(() => {
    setPreviewRemainingSeconds(initialTotalSeconds);
  }, [initialTotalSeconds]);

  // Static frame draw when not playing
  useEffect(() => {
    if (isPlayingPreview) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getResolutionDimensions(options.resolution);
    canvas.width = width;
    canvas.height = height;

    const curDisplay = initialTotalSeconds;
    const nextDisplay = Math.max(0, initialTotalSeconds - 1);

    const render = () => {
      if (previewMode === 'intro') {
        drawIntroSlideFrame(ctx, width, height, timer, options, 0.5);
      } else if (previewMode === 'disclaimer') {
        drawDisclaimerSlideFrame(ctx, width, height, options, 0.5);
      } else if (previewMode === 'outro') {
        drawOutroSlideFrame(ctx, width, height, options, 0.5);
      } else {
        drawFlipClockFrame(
          ctx,
          width,
          height,
          {
            currentDisplaySeconds: curDisplay,
            nextDisplaySeconds: nextDisplay,
            fractionalSecond: 0,
            totalTargetSeconds: initialTotalSeconds,
          },
          options
        );
      }
    };

    render();

    // If watermark image is set, ensure it re-renders as soon as image element decodes
    if (options.watermark?.enabled && options.watermark?.imageDataUrl) {
      const img = new Image();
      img.onload = render;
      img.src = options.watermark.imageDataUrl;
    }
  }, [timer, options, isPlayingPreview, initialTotalSeconds, previewMode]);

  // Real-time animation loop when user tests preview
  useEffect(() => {
    if (!isPlayingPreview) return;

    let animId: number;
    let lastTime = performance.now();
    let currentSec = previewRemainingSeconds > 0 ? previewRemainingSeconds : initialTotalSeconds;
    let slideProg = 0;

    const speedMult = Math.max(0.01, options.speedMultiplier || 1);

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = getResolutionDimensions(options.resolution);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      if (previewMode === 'intro') {
        slideProg = (slideProg + delta / 5) % 1;
        setSlideProgress(slideProg);
        drawIntroSlideFrame(ctx, width, height, timer, options, slideProg);
      } else if (previewMode === 'disclaimer') {
        slideProg = (slideProg + delta / 5) % 1;
        setSlideProgress(slideProg);
        drawDisclaimerSlideFrame(ctx, width, height, options, slideProg);
      } else if (previewMode === 'outro') {
        slideProg = (slideProg + delta / 5) % 1;
        setSlideProgress(slideProg);
        drawOutroSlideFrame(ctx, width, height, options, slideProg);
      } else {
        // Clock animation
        currentSec = Math.max(0, currentSec - delta * speedMult);
        setPreviewRemainingSeconds(currentSec);

        const elapsed = Math.max(0, initialTotalSeconds - currentSec);
        let curDisplay = 0;
        let nextDisplay = 0;
        let frac = 0;

        if (currentSec <= 0 || elapsed >= initialTotalSeconds) {
          curDisplay = 0;
          nextDisplay = 0;
          frac = 0;
        } else {
          const secIndex = Math.floor(elapsed);
          curDisplay = Math.max(0, initialTotalSeconds - secIndex);
          nextDisplay = Math.max(0, curDisplay - 1);
          frac = elapsed - secIndex;
        }

        drawFlipClockFrame(
          ctx,
          width,
          height,
          {
            currentDisplaySeconds: curDisplay,
            nextDisplaySeconds: nextDisplay,
            fractionalSecond: frac,
            totalTargetSeconds: initialTotalSeconds,
            isFinished: currentSec <= 0,
          },
          options
        );

        if (currentSec <= 0) {
          setIsPlayingPreview(false);
          return;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingPreview, options, initialTotalSeconds, previewMode]);

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
      {/* Top Preview Controls & Slide Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setPreviewMode('intro');
              setIsPlayingPreview(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              previewMode === 'intro'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Slide 1: Intro (5s)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewMode('disclaimer');
              setIsPlayingPreview(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              previewMode === 'disclaimer'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Slide 2: Disclaimer (5s)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewMode('clock');
              setIsPlayingPreview(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              previewMode === 'clock'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Flip Clock Timer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewMode('outro');
              setIsPlayingPreview(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              previewMode === 'outro'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Outro Slide (5s)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isPlayingPreview) {
                setIsPlayingPreview(false);
              } else {
                if (previewMode === 'clock' && previewRemainingSeconds <= 0) {
                  setPreviewRemainingSeconds(initialTotalSeconds);
                }
                setIsPlayingPreview(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition border border-neutral-700 cursor-pointer"
          >
            {isPlayingPreview ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Test Animation</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlayingPreview(false);
              setPreviewRemainingSeconds(initialTotalSeconds);
              setSlideProgress(0.5);
            }}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition border border-neutral-700 cursor-pointer"
            title="Reset Preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition border border-neutral-700 cursor-pointer"
            title="Fullscreen Preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl flex items-center justify-center ${
          isPortrait ? 'aspect-[9/16] max-h-[640px]' : 'aspect-[16/9]'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block"
          style={{ imageRendering: 'high-quality' }}
        />
      </div>
    </div>
  );
};

