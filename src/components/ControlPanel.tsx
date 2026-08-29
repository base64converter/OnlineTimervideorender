import React, { useRef } from 'react';
import {
  Clock,
  Settings2,
  Video,
  Film,
  Layers,
  Palette,
  Play,
  Zap,
  Check,
  Gauge,
  Sparkles,
  Volume2,
  ShieldCheck,
  ShieldAlert,
  Award,
  Image as ImageIcon,
  Upload,
  Trash2,
  Sliders,
  Move,
  Type,
  FileText,
} from 'lucide-react';
import {
  FlipAnimationMode,
  RenderOptions,
  TimerConfig,
  VideoFormat,
  VideoResolution,
  WatermarkConfig,
  WatermarkPositionPreset,
  InterstitialSlidesConfig,
} from '../types';
import { THEMES } from '../utils/canvasRenderer';

interface ControlPanelProps {
  timer: TimerConfig;
  onTimerChange: (timer: TimerConfig) => void;
  options: RenderOptions;
  onOptionsChange: (options: RenderOptions) => void;
  onStartRender: () => void;
  isRendering: boolean;
}

const TIMER_PRESETS = [
  { label: '5s', h: 0, m: 0, s: 5 },
  { label: '10s', h: 0, m: 0, s: 10 },
  { label: '30s', h: 0, m: 0, s: 30 },
  { label: '1 min', h: 0, m: 1, s: 0 },
  { label: '2 min', h: 0, m: 2, s: 0 },
  { label: '3 min', h: 0, m: 3, s: 0 },
  { label: '5 min', h: 0, m: 5, s: 0 },
  { label: '10 min', h: 0, m: 10, s: 0 },
  { label: '15 min', h: 0, m: 15, s: 0 },
  { label: '30 min', h: 0, m: 30, s: 0 },
  { label: '45 min', h: 0, m: 45, s: 0 },
  { label: '1 hour', h: 1, m: 0, s: 0 },
];

const POSITION_PRESETS: { id: WatermarkPositionPreset; label: string; x: number; y: number }[] = [
  { id: 'top-left', label: 'Top Left', x: 5, y: 5 },
  { id: 'top-right', label: 'Top Right', x: 95, y: 5 },
  { id: 'bottom-left', label: 'Bottom Left', x: 5, y: 95 },
  { id: 'bottom-right', label: 'Bottom Right', x: 95, y: 95 },
  { id: 'center', label: 'Center', x: 50, y: 50 },
  { id: 'custom', label: 'Custom (X, Y)', x: 50, y: 50 },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  timer,
  onTimerChange,
  options,
  onOptionsChange,
  onStartRender,
  isRendering,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalCountdownSeconds = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
  const holdSec = options.holdEndSeconds || 0;
  
  const slides = options.slides || {
    intro: {
      enabled: true,
      durationSeconds: 5,
      tagline: 'Deep Focus & Productivity',
      subtitle: 'Visit: blankscreen.cc Support the channel: buymeacoffee.com/prosun',
      bottomCallout: 'Like, Share & Subscribe!',
    },
    disclaimer: {
      enabled: true,
      durationSeconds: 5,
      title: 'DISCLAIMER',
      body: 'This video is for educational and entertainment purposes only and is not medical advice. Do not drive or operate heavy machinery while listening. Please consult a physician regarding any medical conditions.',
    },
    outro: {
      enabled: true,
      durationSeconds: 5,
      title: "TIME'S UP! Great job focusing today.",
      subtitle: 'For more timers, tools, and resources, visit: blankscreen.cc',
      bottomCallout: 'If this timer helped you, please Like & Subscribe! (buymeacoffee.com/prosun)',
    },
  };

  const introSec = slides.intro?.enabled ? (slides.intro.durationSeconds || 5) : 0;
  const disclaimerSec = slides.disclaimer?.enabled ? (slides.disclaimer.durationSeconds || 5) : 0;
  const outroSec = slides.outro?.enabled ? (slides.outro.durationSeconds || 5) : 0;
  const totalVideoDurationSec = introSec + disclaimerSec + totalCountdownSeconds + holdSec + outroSec;
  const fps = Math.max(30, options.fps || 30);
  const totalVideoFrames = Math.max(1, Math.round(totalVideoDurationSec * fps));

  const watermark: WatermarkConfig = options.watermark || {
    enabled: false,
    type: 'image',
    positionPreset: 'top-right',
    xPercent: 95,
    yPercent: 5,
    opacity: 0.85,
    scalePercent: 12,
    text: '',
  };

  const formatSecondsToHMS = (totalSecs: number) => {
    const s = Math.max(0, Math.floor(totalSecs));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) {
      return `${h}h ${m}m ${sec}s`;
    }
    if (m > 0) {
      return `${m}m ${sec}s`;
    }
    return `${sec}s`;
  };

  const handleTimerInputChange = (field: keyof TimerConfig, val: number) => {
    const clamped = Math.max(0, Math.min(field === 'hours' ? 99 : 59, Math.floor(val || 0)));
    onTimerChange({
      ...timer,
      [field]: clamped,
    });
  };

  const handlePresetSelect = (preset: { h: number; m: number; s: number }) => {
    onTimerChange({ hours: preset.h, minutes: preset.m, seconds: preset.s });
  };

  const handleLogoFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onOptionsChange({
          ...options,
          watermark: {
            ...watermark,
            enabled: true,
            type: 'image',
            imageDataUrl: dataUrl,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isRendering) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFileUpload(e.dataTransfer.files[0]);
    }
  };

  const updateWatermark = (updates: Partial<WatermarkConfig>) => {
    onOptionsChange({
      ...options,
      watermark: {
        ...watermark,
        ...updates,
      },
    });
  };

  const updateSlides = (updates: Partial<InterstitialSlidesConfig>) => {
    onOptionsChange({
      ...options,
      slides: {
        ...slides,
        ...updates,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Countdown Target Duration Card */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Countdown Duration</h2>
          </div>
          <span className="text-xs font-mono text-rose-400 bg-rose-950/50 px-2.5 py-1 rounded-md border border-rose-800/60 font-bold">
            {String(timer.hours).padStart(2, '0')}:{String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')} ({formatSecondsToHMS(totalCountdownSeconds)})
          </span>
        </div>

        {/* Inputs (Hours, Minutes, Seconds) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Hours */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-hours" className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Hours</span>
              <span className="text-[10px] text-neutral-600">00-99</span>
            </label>
            <div className="relative">
              <input
                id="input-hours"
                type="number"
                min="0"
                max="99"
                value={timer.hours}
                onChange={(e) => handleTimerInputChange('hours', parseInt(e.target.value) || 0)}
                disabled={isRendering}
                className="w-full bg-neutral-950 border border-neutral-700/80 focus:border-rose-500 text-white font-mono font-bold text-2xl py-3 px-3 rounded-xl text-center outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Minutes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-minutes" className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Minutes</span>
              <span className="text-[10px] text-neutral-600">00-59</span>
            </label>
            <div className="relative">
              <input
                id="input-minutes"
                type="number"
                min="0"
                max="59"
                value={timer.minutes}
                onChange={(e) => handleTimerInputChange('minutes', parseInt(e.target.value) || 0)}
                disabled={isRendering}
                className="w-full bg-neutral-950 border border-neutral-700/80 focus:border-rose-500 text-white font-mono font-bold text-2xl py-3 px-3 rounded-xl text-center outline-none transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Seconds */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-seconds" className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Seconds</span>
              <span className="text-[10px] text-neutral-600">00-59</span>
            </label>
            <div className="relative">
              <input
                id="input-seconds"
                type="number"
                min="0"
                max="59"
                value={timer.seconds}
                onChange={(e) => handleTimerInputChange('seconds', parseInt(e.target.value) || 0)}
                disabled={isRendering}
                className="w-full bg-neutral-950 border border-neutral-700/80 focus:border-rose-500 text-white font-mono font-bold text-2xl py-3 px-3 rounded-xl text-center outline-none transition disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-neutral-400">Quick Timer Presets:</span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium">100% Real-Time Video (1:1)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TIMER_PRESETS.map((preset) => {
              const isSelected =
                timer.hours === preset.h &&
                timer.minutes === preset.m &&
                timer.seconds === preset.s;
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isRendering}
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold ring-1 ring-rose-400'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Output Length Banner */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Output Video Length (1:1 Real-Time)</div>
              <div className="text-sm font-bold text-white font-mono">
                {formatSecondsToHMS(totalVideoDurationSec)} ({totalVideoDurationSec.toFixed(1)}s total video)
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-neutral-400">
            <span className="text-emerald-400 font-bold">{totalVideoFrames.toLocaleString()}</span> frames @ {fps} FPS
          </div>
        </div>
      </div>

      {/* 2. Custom Logo & Watermark Overlay Card */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Logo & Watermark Overlay</h2>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={watermark.enabled}
              onChange={(e) => updateWatermark({ enabled: e.target.checked })}
              disabled={isRendering}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>

        {watermark.enabled ? (
          <div className="flex flex-col gap-4 pt-1">
            {/* Watermark Type Selector */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => updateWatermark({ type: 'image' })}
                disabled={isRendering}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  watermark.type === 'image'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Logo Image</span>
              </button>
              <button
                type="button"
                onClick={() => updateWatermark({ type: 'text' })}
                disabled={isRendering}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  watermark.type === 'text'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Brand Text Watermark</span>
              </button>
            </div>

            {/* Type 1: Image Upload Box */}
            {watermark.type === 'image' && (
              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLogoFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {watermark.imageDataUrl ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-700 p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={watermark.imageDataUrl}
                          alt="Watermark Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Custom Logo Active</div>
                        <div className="text-[10px] text-emerald-400 font-medium">Ready for high-res compositing</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRendering}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => updateWatermark({ imageDataUrl: undefined })}
                        disabled={isRendering}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 cursor-pointer"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-700 hover:border-rose-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-neutral-950/60 hover:bg-neutral-950 transition group text-center"
                  >
                    <div className="p-3 rounded-full bg-neutral-800 text-neutral-400 group-hover:text-rose-400 group-hover:scale-110 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-neutral-200">
                      Click to upload or drag & drop logo
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      PNG (transparent), SVG, JPG, or WebP
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Type 2: Text Input */}
            {watermark.type === 'text' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-400 flex items-center justify-between">
                  <span>Watermark Text / Brand</span>
                  <span className="text-[10px] text-neutral-500">e.g. @MyChannel or StudyStream</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. @MyBrand or Countdown Channel"
                  value={watermark.text || ''}
                  onChange={(e) => updateWatermark({ text: e.target.value })}
                  disabled={isRendering}
                  className="bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-rose-500 transition font-medium"
                />
              </div>
            )}

            {/* Position Presets */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-neutral-400" /> Position Placement
                </span>
                <span className="text-[10px] text-rose-400 font-mono uppercase">{watermark.positionPreset}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {POSITION_PRESETS.map((p) => {
                  const isSelected = watermark.positionPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isRendering}
                      onClick={() => {
                        updateWatermark({
                          positionPreset: p.id,
                          xPercent: p.x,
                          yPercent: p.y,
                        });
                      }}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                        isSelected
                          ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30'
                          : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Coordinates Sliders (X & Y) */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Position X</span>
                  <span className="text-rose-400 font-mono font-bold">{Math.round(watermark.xPercent)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={watermark.xPercent}
                  onChange={(e) => {
                    updateWatermark({
                      positionPreset: 'custom',
                      xPercent: parseInt(e.target.value) || 0,
                    });
                  }}
                  disabled={isRendering}
                  className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Position Y</span>
                  <span className="text-rose-400 font-mono font-bold">{Math.round(watermark.yPercent)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={watermark.yPercent}
                  onChange={(e) => {
                    updateWatermark({
                      positionPreset: 'custom',
                      yPercent: parseInt(e.target.value) || 0,
                    });
                  }}
                  disabled={isRendering}
                  className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Opacity & Size Controls */}
            <div className="grid grid-cols-2 gap-3">
              {/* Opacity */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Opacity</span>
                  <span className="text-rose-400 font-mono font-bold">{Math.round(watermark.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={Math.round(watermark.opacity * 100)}
                  onChange={(e) => {
                    updateWatermark({
                      opacity: (parseInt(e.target.value) || 80) / 100,
                    });
                  }}
                  disabled={isRendering}
                  className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Scale / Size */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Logo Scale</span>
                  <span className="text-rose-400 font-mono font-bold">{Math.round(watermark.scalePercent)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={watermark.scalePercent}
                  onChange={(e) => {
                    updateWatermark({
                      scalePercent: parseInt(e.target.value) || 12,
                    });
                  }}
                  disabled={isRendering}
                  className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 leading-relaxed">
            Add a transparent branding logo or watermark text with custom opacity and coordinates (X, Y) on every frame of your video.
          </p>
        )}
      </div>

      {/* 2. Interstitial Video Slides (Intro, Disclaimer, Outro) Card */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
              Interstitial Slides (Intro, Disclaimer & Outro)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
            Total Slides: {introSec + disclaimerSec + outroSec}s
          </span>
        </div>

        {/* Slide 1: Intro */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="toggle-intro-slide"
                type="checkbox"
                checked={slides.intro?.enabled}
                onChange={(e) =>
                  updateSlides({
                    intro: { ...slides.intro, enabled: e.target.checked },
                  })
                }
                disabled={isRendering}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
              <label htmlFor="toggle-intro-slide" className="text-xs font-bold text-neutral-200 cursor-pointer flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Slide 1: Intro Slide</span>
              </label>
            </div>
            {slides.intro?.enabled && (
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <span>Duration:</span>
                <span className="font-mono font-bold text-rose-400">{slides.intro.durationSeconds || 5}s</span>
              </div>
            )}
          </div>

          {slides.intro?.enabled && (
            <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
              {/* Dynamic Title Preview */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-neutral-400">Dynamic Title (Auto-Updated from Timer)</span>
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
                  {timer.hours > 0
                    ? `${timer.hours} HOUR${timer.hours > 1 ? 'S' : ''}${timer.minutes > 0 ? ` ${timer.minutes} MIN` : ''} COUNTDOWN TIMER`
                    : timer.minutes > 0
                    ? `${timer.minutes} MINUTE${timer.minutes > 1 ? 'S' : ''}${timer.seconds > 0 ? ` ${timer.seconds} SEC` : ''} COUNTDOWN TIMER`
                    : `${timer.seconds} SECOND${timer.seconds > 1 ? 'S' : ''} COUNTDOWN TIMER`}
                </div>
              </div>

              {/* Tagline */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-400">Tagline (Title Subhead)</label>
                <input
                  type="text"
                  value={slides.intro.tagline || ''}
                  onChange={(e) =>
                    updateSlides({
                      intro: { ...slides.intro, tagline: e.target.value },
                    })
                  }
                  disabled={isRendering}
                  placeholder="Deep Focus & Productivity"
                  className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-rose-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Subtitle / Channel Links */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-400">Subtitle & Channel Links</label>
                <input
                  type="text"
                  value={slides.intro.subtitle || ''}
                  onChange={(e) =>
                    updateSlides({
                      intro: { ...slides.intro, subtitle: e.target.value },
                    })
                  }
                  disabled={isRendering}
                  placeholder="Visit: blankscreen.cc Support the channel: buymeacoffee.com/prosun"
                  className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-rose-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Bottom Callout */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-400">Bottom Callout</label>
                <input
                  type="text"
                  value={slides.intro.bottomCallout || ''}
                  onChange={(e) =>
                    updateSlides({
                      intro: { ...slides.intro, bottomCallout: e.target.value },
                    })
                  }
                  disabled={isRendering}
                  placeholder="Like, Share & Subscribe!"
                  className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-rose-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Duration Slider */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-neutral-400">Slide Display Duration</span>
                <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={slides.intro.durationSeconds || 5}
                    onChange={(e) =>
                      updateSlides({
                        intro: {
                          ...slides.intro,
                          durationSeconds: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                    disabled={isRendering}
                    className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-rose-400 font-bold w-6 text-right">
                    {slides.intro.durationSeconds || 5}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide 2: Disclaimer */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="toggle-disclaimer-slide"
                type="checkbox"
                checked={slides.disclaimer?.enabled}
                onChange={(e) =>
                  updateSlides({
                    disclaimer: { ...slides.disclaimer, enabled: e.target.checked },
                  })
                }
                disabled={isRendering}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
              <label htmlFor="toggle-disclaimer-slide" className="text-xs font-bold text-neutral-200 cursor-pointer flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Slide 2: Mandatory Disclaimer (5s)</span>
              </label>
            </div>
            {slides.disclaimer?.enabled && (
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <span>Duration:</span>
                <span className="font-mono font-bold text-amber-400">{slides.disclaimer.durationSeconds || 5}s</span>
              </div>
            )}
          </div>

          {slides.disclaimer?.enabled && (
            <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
              {/* Disclaimer Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-400">Heading Title</label>
                <input
                  type="text"
                  value={slides.disclaimer.title || ''}
                  onChange={(e) =>
                    updateSlides({
                      disclaimer: { ...slides.disclaimer, title: e.target.value },
                    })
                  }
                  disabled={isRendering}
                  placeholder="DISCLAIMER"
                  className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-bold"
                />
              </div>

              {/* Disclaimer Body Text */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-400">Body Statement</label>
                <textarea
                  rows={3}
                  value={slides.disclaimer.body || ''}
                  onChange={(e) =>
                    updateSlides({
                      disclaimer: { ...slides.disclaimer, body: e.target.value },
                    })
                  }
                  disabled={isRendering}
                  placeholder="This video is for educational and entertainment purposes only..."
                  className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-amber-500 rounded-lg p-2.5 text-xs text-neutral-200 outline-none leading-relaxed resize-none"
                />
              </div>

              {/* Duration Slider */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-neutral-400">Slide Display Duration</span>
                <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={slides.disclaimer.durationSeconds || 5}
                    onChange={(e) =>
                      updateSlides({
                        disclaimer: {
                          ...slides.disclaimer,
                          durationSeconds: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                    disabled={isRendering}
                    className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 font-bold w-6 text-right">
                    {slides.disclaimer.durationSeconds || 5}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide 3: Outro Slide */}
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="toggle-outro-slide"
                type="checkbox"
                checked={slides.outro?.enabled}
                onChange={(e) =>
                  updateSlides({
                    outro: { ...slides.outro, enabled: e.target.checked },
                  })
                }
                disabled={isRendering}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
              <label htmlFor="toggle-outro-slide" className="text-xs font-bold text-neutral-200 cursor-pointer flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Slide 3: Outro Slide (End of Video)</span>
              </label>
            </div>
            {slides.outro?.enabled && (
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <span>Duration:</span>
                <span className="font-mono font-bold text-emerald-400">{slides.outro.durationSeconds || 5}s</span>
              </div>
            )}
          </div>

          {slides.outro?.enabled && (
            <div className="flex flex-col gap-3 pt-2 border-t border-neutral-800/80">
              {/* Outro Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-400">Outro Heading</label>
                <input
                  type="text"
                  value={slides.outro.title || ''}
                  onChange={(e) =>
                    updateSlides({
                      outro: { ...slides.outro, title: e.target.value },
                    })
                  }
                  disabled={isRendering}
                  placeholder="TIME'S UP! Great job focusing today."
                  className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-bold"
                />
              </div>

              {/* Subtitle */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-400">Outro Subtitle</label>
                <input
                  type="text"
                  value={slides.outro.subtitle || ''}
                  onChange={(e) =>
                    updateSlides({
                      outro: { ...slides.outro, subtitle: e.target.value },
                    })
                  }
                  disabled={isRendering}
                  placeholder="For more timers, tools, and resources, visit: blankscreen.cc"
                  className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Bottom Callout */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-neutral-400">Bottom Callout / Donation Link</label>
                <input
                  type="text"
                  value={slides.outro.bottomCallout || ''}
                  onChange={(e) =>
                    updateSlides({
                      outro: { ...slides.outro, bottomCallout: e.target.value },
                    })
                  }
                  disabled={isRendering}
                  placeholder="If this timer helped you, please Like & Subscribe! (buymeacoffee.com/prosun)"
                  className="w-full bg-neutral-900 border border-neutral-700/80 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Duration Slider */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-neutral-400">Slide Display Duration</span>
                <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={slides.outro.durationSeconds || 5}
                    onChange={(e) =>
                      updateSlides({
                        outro: {
                          ...slides.outro,
                          durationSeconds: parseInt(e.target.value) || 5,
                        },
                      })
                    }
                    disabled={isRendering}
                    className="w-full accent-emerald-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-emerald-400 font-bold w-6 text-right">
                    {slides.outro.durationSeconds || 5}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Hardware-Accelerated Fast Engine Banner */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Ultra-Fast GPU Hardware Rendering</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                WebCodecs Active
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
              Renders full real-time countdown videos at hundreds of frames/sec directly on your GPU without screen recording.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Video Output Format Card */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Video Output Format</h2>
        </div>

        {/* Format Selector Pills */}
        <div className="grid grid-cols-2 gap-3">
          {/* MP4 Option */}
          <button
            type="button"
            disabled={isRendering}
            onClick={() => onOptionsChange({ ...options, format: 'mp4' })}
            className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition cursor-pointer ${
              options.format === 'mp4'
                ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500'
                : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">MP4</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                  H.264 / AVC
                </span>
              </div>
              {options.format === 'mp4' && <Check className="w-4 h-4 text-rose-500" />}
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug">
              Universal hardware compatibility for iOS, Android, macOS, Windows, YouTube, Premiere, and editing tools.
            </p>
          </button>

          {/* WebM Option */}
          <button
            type="button"
            disabled={isRendering}
            onClick={() => onOptionsChange({ ...options, format: 'webm' })}
            className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition cursor-pointer ${
              options.format === 'webm'
                ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500'
                : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">WebM</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                  VP9 / VP8
                </span>
              </div>
              {options.format === 'webm' && <Check className="w-4 h-4 text-rose-500" />}
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug">
              High-efficiency web video standard with open licensing for Chrome, Firefox, VLC, HTML5 players, and Discord.
            </p>
          </button>
        </div>
      </div>

      {/* 5. Resolution, Framerate & Style Settings Card */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Video & Animation Settings</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Resolution */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-neutral-400" /> Resolution
            </label>
            <select
              value={options.resolution}
              disabled={isRendering}
              onChange={(e) => onOptionsChange({ ...options, resolution: e.target.value as VideoResolution })}
              className="bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-white font-medium outline-none focus:border-rose-500 transition"
            >
              <option value="1080p">1080p Full HD (1920 × 1080)</option>
              <option value="720p">720p HD (1280 × 720)</option>
              <option value="4k">4K Ultra HD (3840 × 2160)</option>
              <option value="reels">9:16 Vertical / Reels (1080 × 1920)</option>
            </select>
          </div>

          {/* Framerate - Minimum 30fps */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-neutral-400" /> Frame Rate
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">≥ 30 FPS</span>
            </label>
            <select
              value={options.fps}
              disabled={isRendering}
              onChange={(e) => onOptionsChange({ ...options, fps: Math.max(30, parseInt(e.target.value) || 30) })}
              className="bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-white font-medium outline-none focus:border-rose-500 transition"
            >
              <option value={30}>30 FPS (Standard Smooth - Minimum)</option>
              <option value={60}>60 FPS (Ultra Smooth)</option>
            </select>
          </div>

          {/* Flip-Flop Animation Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" /> Flip-Flop Physics Mode
            </label>
            <select
              value={options.animationMode}
              disabled={isRendering}
              onChange={(e) => onOptionsChange({ ...options, animationMode: e.target.value as FlipAnimationMode })}
              className="bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-white font-medium outline-none focus:border-rose-500 transition"
            >
              <option value="smooth-flip">3D Split-Flap Flip-Flop (Realistic)</option>
              <option value="mechanical-snap">Mechanical Snap Flip-Flop (Spring Gravity)</option>
              <option value="cascade-flip">Harmonic Flap Flip-Flop (Flap Settle)</option>
            </select>
          </div>

          {/* Bitrate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-neutral-400" /> Target Bitrate
            </label>
            <select
              value={options.bitrateMbps}
              disabled={isRendering}
              onChange={(e) => onOptionsChange({ ...options, bitrateMbps: parseInt(e.target.value) || 8 })}
              className="bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-sm text-white font-medium outline-none focus:border-rose-500 transition"
            >
              <option value={8}>8 Mbps (Standard 1080p)</option>
              <option value={16}>16 Mbps (High Fidelity)</option>
              <option value={28}>28 Mbps (Ultra 4K Crisp)</option>
            </select>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-neutral-400" /> Color Theme Library
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">{Object.keys(THEMES).length} Premium Styles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {Object.values(THEMES).map((thm) => {
              const isSelected = options.themeId === thm.id;
              return (
                <button
                  key={thm.id}
                  type="button"
                  disabled={isRendering}
                  onClick={() => onOptionsChange({ ...options, themeId: thm.id })}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500'
                      : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: thm.cardBg, color: thm.textColor, borderColor: thm.cardBorder }}
                    >
                      8
                    </div>
                    <span className="text-xs font-medium text-neutral-200 truncate">{thm.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-rose-500 flex-shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Extra Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-neutral-300">
            <input
              type="checkbox"
              checked={options.showLabels}
              onChange={(e) => onOptionsChange({ ...options, showLabels: e.target.checked })}
              disabled={isRendering}
              className="rounded accent-rose-500 w-4 h-4"
            />
            <span>Show "HOURS", "MIN", "SEC" labels</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none text-neutral-300">
            <input
              type="checkbox"
              checked={options.holdEndSeconds > 0}
              onChange={(e) => onOptionsChange({ ...options, holdEndSeconds: e.target.checked ? 2 : 0 })}
              disabled={isRendering}
              className="rounded accent-rose-500 w-4 h-4"
            />
            <span>Hold 00:00:00 for 2s at end</span>
          </label>
        </div>
      </div>

      {/* 6. Primary Render Button */}
      <button
        id="btn-render-video"
        onClick={onStartRender}
        disabled={isRendering || totalCountdownSeconds <= 0}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 active:scale-[0.99] text-white font-bold text-base shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>
          Render Real-Time {options.format.toUpperCase()} Video ({formatSecondsToHMS(totalVideoDurationSec)} @ {fps} FPS)
        </span>
      </button>
    </div>
  );
};
