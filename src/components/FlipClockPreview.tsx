import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Eye } from 'lucide-react';
import { RenderOptions, TimerConfig } from '../types';
import { drawFlipClockFrame, getResolutionDimensions } from '../utils/canvasRenderer';

interface FlipClockPreviewProps {
  timer: TimerConfig;
  options: RenderOptions;
}

export const FlipClockPreview: React.FC<FlipClockPreviewProps> = ({ timer, options }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewRemainingSeconds, setPreviewRemainingSeconds] = useState<number>(0);
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
    };

    render();

    // If watermark image is set, ensure it re-renders as soon as image element decodes
    if (options.watermark?.enabled && options.watermark?.imageDataUrl) {
      const img = new Image();
      img.onload = render;
      img.src = options.watermark.imageDataUrl;
    }
  }, [timer, options, isPlayingPreview, initialTotalSeconds]);

  // Real-time animation loop when user tests the clock preview
  useEffect(() => {
    if (!isPlayingPreview) return;

    let animId: number;
    let lastTime = performance.now();
    let currentSec = previewRemainingSeconds > 0 ? previewRemainingSeconds : initialTotalSeconds;

    const speedMult = Math.max(0.01, options.speedMultiplier || 1);

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Scale time delta by speedMultiplier for realistic interactive preview
      currentSec = Math.max(0, currentSec - delta * speedMult);
      setPreviewRemainingSeconds(currentSec);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const { width, height } = getResolutionDimensions(options.resolution);
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

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
        }
      }

      if (currentSec <= 0) {
        setIsPlayingPreview(false);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingPreview, options, initialTotalSeconds]);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Canvas Live Preview</h2>
          <span className="text-xs text-neutral-500 font-mono">
            ({width} × {height} @ {options.fps}fps)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isPlayingPreview) {
                setIsPlayingPreview(false);
              } else {
                if (previewRemainingSeconds <= 0) {
                  setPreviewRemainingSeconds(initialTotalSeconds);
                }
                setIsPlayingPreview(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition border border-neutral-700"
          >
            {isPlayingPreview ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause Preview</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Animation</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsPlayingPreview(false);
              setPreviewRemainingSeconds(initialTotalSeconds);
            }}
            className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition border border-neutral-700"
            title="Reset Preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition border border-neutral-700"
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
