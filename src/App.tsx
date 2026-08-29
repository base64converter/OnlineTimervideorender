import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { FlipClockPreview } from './components/FlipClockPreview';
import { ControlPanel } from './components/ControlPanel';
import { RenderProgressModal } from './components/RenderProgressModal';
import { VideoResultView } from './components/VideoResultView';
import { CodecSupportStatus, RenderOptions, RenderProgress, TimerConfig } from './types';
import { checkSystemCapabilities, VideoRenderEngine } from './utils/videoEncoderEngine';
import { AlertCircle, Zap, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  const [timer, setTimer] = useState<TimerConfig>({
    hours: 0,
    minutes: 5,
    seconds: 0,
  });

  const [options, setOptions] = useState<RenderOptions>({
    fps: 30,
    resolution: '1080p',
    format: 'mp4',
    animationMode: 'smooth-flip',
    themeId: 'white-red',
    showLabels: true,
    autoHideHours: false,
    holdEndSeconds: 0,
    includeAudio: false,
    bitrateMbps: 8,
    speedMultiplier: 1,
    watermark: {
      enabled: false,
      type: 'image',
      positionPreset: 'top-right',
      xPercent: 95,
      yPercent: 5,
      opacity: 0.85,
      scalePercent: 12,
      text: '',
    },
    codecPreference: 'auto',
  });

  const [codecStatus, setCodecStatus] = useState<CodecSupportStatus | null>(null);
  const [progress, setProgress] = useState<RenderProgress>({
    status: 'idle',
    currentFrame: 0,
    totalFrames: 0,
    currentSecondLeft: 0,
    currentDisplayTime: '00:05:00',
    fpsActual: 0,
    percent: 0,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    speedMultiplier: 0,
  });

  const engineRef = useRef<VideoRenderEngine | null>(null);

  // Check WebCodecs and GPU status on mount
  useEffect(() => {
    checkSystemCapabilities().then(setCodecStatus);
  }, []);

  const handleStartRender = async () => {
    try {
      const engine = new VideoRenderEngine();
      engineRef.current = engine;

      const totalSecs = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
      const videoDuration = totalSecs + (options.holdEndSeconds || 0);
      const fps = Math.max(30, options.fps || 30);
      const totalFrames = Math.max(1, Math.round(videoDuration * fps));

      setProgress({
        status: 'preparing',
        currentFrame: 0,
        totalFrames,
        currentSecondLeft: totalSecs,
        currentDisplayTime: `${String(timer.hours).padStart(2, '0')}:${String(timer.minutes).padStart(2, '0')}:${String(timer.seconds).padStart(2, '0')}`,
        fpsActual: 0,
        percent: 0,
        elapsedMs: 0,
        estimatedRemainingMs: 0,
        speedMultiplier: 1,
        videoDurationSeconds: Number(videoDuration.toFixed(1)),
        countdownDurationSeconds: totalSecs,
      });

      const result = await engine.renderVideo(
        timer,
        options,
        (p) => setProgress(p)
      );

      setProgress((prev) => ({
        ...prev,
        status: 'completed',
        outputBlobUrl: result.blobUrl,
        outputBlob: result.blob,
        outputFileName: result.fileName,
        outputFileSize: result.fileSize,
      }));
    } catch (err: any) {
      if (err?.isCancellation || err?.message?.includes('cancelled by user')) {
        setProgress((prev) => ({
          ...prev,
          status: 'cancelled',
        }));
        return;
      }
      console.error('Render error:', err);
      setProgress((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err?.message || 'An unexpected error occurred during video rendering.',
      }));
    }
  };

  const handleCancelRender = () => {
    if (engineRef.current) {
      engineRef.current.cancel();
    }
    setProgress((prev) => ({ ...prev, status: 'cancelled' }));
  };

  const handleReset = () => {
    setProgress({
      status: 'idle',
      currentFrame: 0,
      totalFrames: 0,
      currentSecondLeft: 0,
      currentDisplayTime: '00:00:00',
      fpsActual: 0,
      percent: 0,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
      speedMultiplier: 0,
    });
  };

  const isRendering = progress.status === 'preparing' || progress.status === 'rendering' || progress.status === 'muxing';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Header codecStatus={codecStatus} onExportStandaloneHtml={() => {}} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Error Notification banner */}
        {progress.status === 'error' && (
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-red-100">Rendering Encountered an Error</h4>
                <p className="text-xs text-red-300 mt-1">{progress.errorMessage}</p>
                <p className="text-xs text-red-400/80 mt-1">
                  Tip: Switch format to WebM (VP9/VP8) or try Google Chrome/Edge if your browser has strict codec permissions.
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: Control Panel (Left) & Canvas/Video (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Duration Inputs & Encoder Settings */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <ControlPanel
              timer={timer}
              onTimerChange={setTimer}
              options={options}
              onOptionsChange={setOptions}
              onStartRender={handleStartRender}
              isRendering={isRendering}
            />

            {/* Hardware WebCodecs Specs Card */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-400 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-neutral-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>WebCodecs Hardware Engine</span>
              </div>
              <p className="leading-relaxed">
                Uses the browser's native <code className="text-neutral-200 font-mono">VideoEncoder</code> pipeline to render frame-by-frame directly to GPU hardware at maximum speed without screen recording or external server dependencies.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] font-mono text-neutral-300">
                  H.264 / AVC
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] font-mono text-neutral-300">
                  VP9 / VP8
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] font-mono text-neutral-300">
                  1080p 60fps
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] font-mono text-neutral-300">
                  Zero CDN / Offline
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Stage (Preview -> Progress -> Result) - Sticky on Large Screens */}
          <div className="lg:col-span-7 lg:sticky lg:top-6 flex flex-col gap-6">
            {progress.status === 'completed' ? (
              <VideoResultView
                progress={progress}
                timer={timer}
                options={options}
                onReset={handleReset}
              />
            ) : isRendering ? (
              <div className="flex flex-col gap-6">
                <RenderProgressModal
                  progress={progress}
                  onCancel={handleCancelRender}
                />
                <FlipClockPreview timer={timer} options={options} />
              </div>
            ) : (
              <FlipClockPreview timer={timer} options={options} />
            )}

            {/* Quick Tips Section */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 flex items-start gap-3.5">
              <HelpCircle className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-400 space-y-1">
                <span className="font-semibold text-neutral-300">Why Frame-by-Frame Video Generation?</span>
                <p>
                  Instead of capturing a real-time screen (where a 10-minute countdown would take 10 real minutes), frame-by-frame rendering draws each frame in memory and pipes it to the GPU encoder, rendering minutes of 1080p video in just a few seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
