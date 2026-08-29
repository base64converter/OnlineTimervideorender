export interface TimerConfig {
  hours: number;
  minutes: number;
  seconds: number;
}

export type VideoFormat = 'mp4' | 'webm';
export type VideoResolution = '1080p' | '720p' | '4k' | 'reels';
export type FlipAnimationMode = 'smooth-flip' | 'mechanical-snap' | 'cascade-flip';
export type WatermarkPositionPreset = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'custom';

export interface WatermarkConfig {
  enabled: boolean;
  type: 'image' | 'text';
  imageDataUrl?: string;
  text?: string;
  positionPreset: WatermarkPositionPreset;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  opacity: number; // 0.0 - 1.0
  scalePercent: number; // 5 - 50 % of canvas width
}

export interface ThemeColors {
  id: string;
  name: string;
  bgGradStart: string;
  bgGradEnd: string;
  cardBg: string;
  cardBottomBg: string;
  textColor: string;
  cardBorder: string;
  dividerColor: string;
  hingeColor: string;
  glowColor?: string;
  labelColor: string;
}

export interface IntroSlideConfig {
  enabled: boolean;
  durationSeconds: number; // default 5s
  tagline: string; // e.g. "Deep Focus & Productivity"
  subtitle: string; // e.g. "Visit: blankscreen.cc Support the channel: buymeacoffee.com/prosun"
  bottomCallout: string; // e.g. "Like, Share & Subscribe!"
}

export interface DisclaimerSlideConfig {
  enabled: boolean;
  durationSeconds: number; // default 5s
  title: string; // e.g. "DISCLAIMER"
  body: string; // e.g. "This video is for educational and entertainment purposes only and is not medical advice. Do not drive or operate heavy machinery while listening. Please consult a physician regarding any medical conditions."
}

export interface OutroSlideConfig {
  enabled: boolean;
  durationSeconds: number; // default 5s
  title: string; // e.g. "TIME'S UP! Great job focusing today."
  subtitle: string; // e.g. "For more timers, tools, and resources, visit: blankscreen.cc"
  bottomCallout: string; // e.g. "If this timer helped you, please Like & Subscribe! (buymeacoffee.com/prosun)"
}

export interface InterstitialSlidesConfig {
  intro: IntroSlideConfig;
  disclaimer: DisclaimerSlideConfig;
  outro: OutroSlideConfig;
}

export interface RenderOptions {
  fps: number;
  resolution: VideoResolution;
  format: VideoFormat;
  animationMode: FlipAnimationMode;
  themeId: string;
  showLabels: boolean;
  autoHideHours: boolean;
  holdEndSeconds: number;
  includeAudio: boolean;
  bitrateMbps: number;
  speedMultiplier: number;
  watermark: WatermarkConfig;
  slides?: InterstitialSlidesConfig;
  codecPreference?: 'auto' | 'avc-baseline' | 'avc-main' | 'avc-high' | 'vp9' | 'vp8' | 'av1';
}

export interface RenderProgress {
  status: 'idle' | 'preparing' | 'rendering' | 'muxing' | 'completed' | 'error' | 'cancelled';
  currentFrame: number;
  totalFrames: number;
  currentSecondLeft: number;
  currentDisplayTime: string;
  fpsActual: number;
  percent: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  speedMultiplier: number;
  videoDurationSeconds?: number;
  countdownDurationSeconds?: number;
  engineUsed?: string;
  errorMessage?: string;
  outputBlobUrl?: string;
  outputBlob?: Blob;
  outputFileName?: string;
  outputFileSize?: number;
}

export interface CodecSupportStatus {
  webCodecsSupported: boolean;
  h264Supported: boolean;
  vp9Supported: boolean;
  vp8Supported: boolean;
  av1Supported: boolean;
  notes: string[];
}
