import { ArrayBufferTarget as Mp4ArrayBufferTarget, Muxer as Mp4Muxer } from 'mp4-muxer';
import { ArrayBufferTarget as WebmArrayBufferTarget, Muxer as WebmMuxer } from 'webm-muxer';
import { CodecSupportStatus, RenderOptions, RenderProgress, TimerConfig } from '../types';
import { drawFlipClockFrame, getResolutionDimensions } from './canvasRenderer';

interface EncoderSelectionResult {
  codec: string;
  hardwareAcceleration: HardwareAcceleration;
  muxerType: 'mp4' | 'webm';
}

export class VideoRenderEngine {
  private isCancelled = false;
  private isPaused = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) {
      throw new Error('Unable to create 2D Canvas rendering context.');
    }
    this.ctx = ctx;
  }

  public cancel() {
    this.isCancelled = true;
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  /**
   * Main render function that attempts WebCodecs hardware rendering first,
   * with seamless fallback to MediaRecorder if necessary.
   */
  public async renderVideo(
    timer: TimerConfig,
    options: RenderOptions,
    onProgress: (progress: RenderProgress) => void,
    onPreviewFrame?: (canvas: HTMLCanvasElement) => void
  ): Promise<{ blobUrl: string; fileName: string; fileSize: number; blob: Blob }> {
    this.isCancelled = false;
    this.isPaused = false;

    const totalSeconds = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
    if (totalSeconds <= 0) {
      throw new Error('Countdown duration must be greater than 0 seconds.');
    }

    const hasWebCodecs =
      typeof window !== 'undefined' &&
      typeof window.VideoEncoder !== 'undefined' &&
      typeof window.VideoFrame !== 'undefined';

    if (hasWebCodecs) {
      try {
        return await this.renderWithWebCodecs(timer, options, onProgress, onPreviewFrame);
      } catch (err: any) {
        if (this.isCancelled) {
          throw new Error('Video rendering was cancelled by user.');
        }
        console.warn('WebCodecs rendering failed, switching to MediaRecorder fallback:', err);
        return await this.renderWithMediaRecorder(timer, options, onProgress, onPreviewFrame);
      }
    } else {
      return await this.renderWithMediaRecorder(timer, options, onProgress, onPreviewFrame);
    }
  }

  /**
   * High-speed frame-by-frame WebCodecs encoder with robust codec negotiation.
   */
  private async renderWithWebCodecs(
    timer: TimerConfig,
    options: RenderOptions,
    onProgress: (progress: RenderProgress) => void,
    onPreviewFrame?: (canvas: HTMLCanvasElement) => void
  ): Promise<{ blobUrl: string; fileName: string; fileSize: number; blob: Blob }> {
    const totalSeconds = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
    const { width, height } = getResolutionDimensions(options.resolution);
    this.canvas.width = width;
    this.canvas.height = height;

    const fps = Math.max(30, options.fps || 30);
    // Real-time 1:1 countdown video (1 second clock = 1 second video playback)
    const speedMultiplier = 1;

    const videoCountdownDurationSec = totalSeconds / speedMultiplier;
    const holdSeconds = options.holdEndSeconds || 0;
    const totalVideoDurationSec = videoCountdownDurationSec + holdSeconds;

    const countdownFrames = Math.max(1, Math.round(videoCountdownDurationSec * fps));
    const holdFrames = Math.round(holdSeconds * fps);
    const totalFrames = countdownFrames + holdFrames;
    const frameDurationMicros = Math.round(1_000_000 / fps);

    // Find a working encoder configuration
    const selected = await this.findWorkingEncoderConfig(
      options.format,
      width,
      height,
      options.bitrateMbps,
      fps,
      options.codecPreference
    );

    if (!selected) {
      throw new Error('No compatible video encoder found for this resolution and format.');
    }

    // Initialize Muxer
    let mp4Muxer: Mp4Muxer<Mp4ArrayBufferTarget> | null = null;
    let webmMuxer: WebmMuxer<WebmArrayBufferTarget> | null = null;

    if (selected.muxerType === 'mp4') {
      mp4Muxer = new Mp4Muxer({
        target: new Mp4ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width,
          height,
        },
        fastStart: 'in-memory',
        firstTimestampBehavior: 'offset',
      });
    } else {
      let webmCodecTag: 'V_VP9' | 'V_VP8' | 'V_AV1' = 'V_VP9';
      if (selected.codec.startsWith('vp8')) webmCodecTag = 'V_VP8';
      else if (selected.codec.startsWith('av01') || selected.codec.startsWith('av1')) webmCodecTag = 'V_AV1';

      webmMuxer = new WebmMuxer({
        target: new WebmArrayBufferTarget(),
        video: {
          codec: webmCodecTag,
          width,
          height,
        },
        firstTimestampBehavior: 'offset',
      });
    }

    let encoderError: Error | null = null;

    const encoder = new VideoEncoder({
      output: (chunk, meta) => {
        if (mp4Muxer) {
          mp4Muxer.addVideoChunk(chunk, meta);
        } else if (webmMuxer) {
          webmMuxer.addVideoChunk(chunk, meta);
        }
      },
      error: (e) => {
        console.error('VideoEncoder error:', e);
        encoderError = e instanceof Error ? e : new Error(String(e));
      },
    });

    const encoderConfig: VideoEncoderConfig = {
      codec: selected.codec,
      width,
      height,
      bitrate: options.bitrateMbps * 1_000_000,
      framerate: fps,
      hardwareAcceleration: selected.hardwareAcceleration,
    };

    if (selected.codec.startsWith('avc')) {
      encoderConfig.avc = { format: 'avc' };
    }

    encoder.configure(encoderConfig);

    const startTime = performance.now();
    let lastStatsTime = startTime;
    let framesRenderedSinceStats = 0;
    let currentFpsActual = 0;

    // Main frame-by-frame render loop
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (this.isCancelled) {
        try {
          encoder.close();
        } catch {}
        const cancelError = new Error('Video rendering was cancelled by user.');
        (cancelError as any).isCancellation = true;
        throw cancelError;
      }

      while (this.isPaused && !this.isCancelled) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (encoderError) {
        throw encoderError;
      }

      // Calculate exact time state for frame taking speed multiplier into account
      let currentDisplaySeconds = 0;
      let nextDisplaySeconds = 0;
      let fractionalSecond = 0;

      if (frameIndex < countdownFrames) {
        const videoSecElapsed = frameIndex / fps;
        const countdownSecElapsed = videoSecElapsed * speedMultiplier;
        if (countdownSecElapsed >= totalSeconds) {
          currentDisplaySeconds = 0;
          nextDisplaySeconds = 0;
          fractionalSecond = 0;
        } else {
          const secIndex = Math.floor(countdownSecElapsed);
          currentDisplaySeconds = Math.max(0, totalSeconds - secIndex);
          nextDisplaySeconds = Math.max(0, currentDisplaySeconds - 1);
          fractionalSecond = countdownSecElapsed - secIndex;
        }
      } else {
        currentDisplaySeconds = 0;
        nextDisplaySeconds = 0;
        fractionalSecond = 0;
      }

      // Draw clock on canvas
      drawFlipClockFrame(
        this.ctx,
        width,
        height,
        {
          currentDisplaySeconds,
          nextDisplaySeconds,
          fractionalSecond,
          totalTargetSeconds: totalSeconds,
          isFinished: frameIndex >= countdownFrames,
        },
        options
      );

      // Create timestamp in microseconds
      const timestampMicros = frameIndex * frameDurationMicros;
      const isKeyFrame = frameIndex % (fps * 2) === 0;

      // Wrap in VideoFrame
      const videoFrame = new VideoFrame(this.canvas, {
        timestamp: timestampMicros,
        duration: frameDurationMicros,
      });

      encoder.encode(videoFrame, { keyFrame: isKeyFrame });
      videoFrame.close();

      framesRenderedSinceStats++;

      // Manage GPU encoder backpressure: if queue exceeds threshold, await drain
      if (encoder.encodeQueueSize > 12) {
        while (encoder.encodeQueueSize > 4 && !this.isCancelled) {
          await new Promise((resolve) => setTimeout(resolve, 2));
        }
      }

      // Progress update every 15 frames or at completion
      if (frameIndex % 15 === 0 || frameIndex === totalFrames - 1) {
        const now = performance.now();
        const timeDelta = (now - lastStatsTime) / 1000;
        if (timeDelta >= 0.15 || frameIndex === totalFrames - 1) {
          currentFpsActual = Math.round(framesRenderedSinceStats / Math.max(0.001, timeDelta));
          lastStatsTime = now;
          framesRenderedSinceStats = 0;
        }

        const elapsedMs = now - startTime;
        const progressFrac = (frameIndex + 1) / totalFrames;
        const estimatedTotalMs = elapsedMs / Math.max(0.0001, progressFrac);
        const remainingMs = Math.max(0, estimatedTotalMs - elapsedMs);
        const speedMultActual = currentFpsActual > 0 ? Number((currentFpsActual / fps).toFixed(1)) : 1;

        const dispH = Math.floor(currentDisplaySeconds / 3600);
        const dispM = Math.floor((currentDisplaySeconds % 3600) / 60);
        const dispS = currentDisplaySeconds % 60;
        const timeString = `${String(dispH).padStart(2, '0')}:${String(dispM).padStart(2, '0')}:${String(dispS).padStart(2, '0')}`;

        onProgress({
          status: 'rendering',
          currentFrame: frameIndex + 1,
          totalFrames,
          currentSecondLeft: currentDisplaySeconds,
          currentDisplayTime: timeString,
          fpsActual: currentFpsActual,
          percent: Math.min(100, Math.round(progressFrac * 100)),
          elapsedMs,
          estimatedRemainingMs: remainingMs,
          speedMultiplier: speedMultActual,
          videoDurationSeconds: Number(totalVideoDurationSec.toFixed(1)),
          countdownDurationSeconds: totalSeconds,
          engineUsed: `WebCodecs GPU (${selected.muxerType.toUpperCase()} - ${selected.codec})`,
        });

        if (onPreviewFrame && (frameIndex % 45 === 0 || frameIndex === totalFrames - 1)) {
          onPreviewFrame(this.canvas);
        }

        // Give browser event loop room to breathe smoothly
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    onProgress({
      status: 'muxing',
      currentFrame: totalFrames,
      totalFrames,
      currentSecondLeft: 0,
      currentDisplayTime: '00:00:00',
      fpsActual: currentFpsActual,
      percent: 100,
      elapsedMs: performance.now() - startTime,
      estimatedRemainingMs: 0,
      speedMultiplier: Number((currentFpsActual / fps).toFixed(1)),
      videoDurationSeconds: Number(totalVideoDurationSec.toFixed(1)),
      countdownDurationSeconds: totalSeconds,
      engineUsed: `WebCodecs (${selected.muxerType.toUpperCase()})`,
    });

    await encoder.flush();
    encoder.close();

    // Finalize Muxer and construct Blob
    let buffer: ArrayBuffer;
    let mimeType: string;
    let extension: string;

    if (mp4Muxer) {
      mp4Muxer.finalize();
      buffer = mp4Muxer.target.buffer;
      mimeType = 'video/mp4';
      extension = 'mp4';
    } else if (webmMuxer) {
      webmMuxer.finalize();
      buffer = webmMuxer.target.buffer;
      mimeType = 'video/webm';
      extension = 'webm';
    } else {
      throw new Error('No muxer available.');
    }

    const blob = new Blob([buffer], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const pad = (n: number) => String(n).padStart(2, '0');
    const speedTag = speedMultiplier !== 1 ? `_${speedMultiplier}x-speed` : '';
    const fileName = `flip-clock_${pad(timer.hours)}h${pad(timer.minutes)}m${pad(timer.seconds)}s${speedTag}_${options.resolution}_${fps}fps.${extension}`;

    return {
      blobUrl,
      fileName,
      fileSize: blob.size,
      blob,
    };
  }

  /**
   * MediaRecorder fallback for environments without WebCodecs support.
   */
  private async renderWithMediaRecorder(
    timer: TimerConfig,
    options: RenderOptions,
    onProgress: (progress: RenderProgress) => void,
    onPreviewFrame?: (canvas: HTMLCanvasElement) => void
  ): Promise<{ blobUrl: string; fileName: string; fileSize: number; blob: Blob }> {
    const totalSeconds = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
    const { width, height } = getResolutionDimensions(options.resolution);
    this.canvas.width = width;
    this.canvas.height = height;

    const fps = Math.max(30, options.fps || 30);
    const speedMultiplier = Math.max(0.01, options.speedMultiplier || 1);

    const videoCountdownDurationSec = totalSeconds / speedMultiplier;
    const holdSeconds = options.holdEndSeconds || 0;
    const totalVideoDurationSec = videoCountdownDurationSec + holdSeconds;

    const countdownFrames = Math.max(1, Math.round(videoCountdownDurationSec * fps));
    const holdFrames = Math.round(holdSeconds * fps);
    const totalFrames = countdownFrames + holdFrames;

    const mimeCandidates =
      options.format === 'mp4'
        ? ['video/mp4;codecs=avc1', 'video/mp4;codecs=h264', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];

    let selectedMime = '';
    for (const m of mimeCandidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    if (!selectedMime && typeof MediaRecorder !== 'undefined') {
      selectedMime = 'video/webm';
    }

    const isMp4Output = selectedMime.includes('mp4');
    const extension = isMp4Output ? 'mp4' : 'webm';
    const mimeType = isMp4Output ? 'video/mp4' : 'video/webm';

    const stream = this.canvas.captureStream ? this.canvas.captureStream(fps) : (this.canvas as any).mozCaptureStream(fps);
    const chunks: Blob[] = [];

    const recorderOptions: MediaRecorderOptions = {
      videoBitsPerSecond: options.bitrateMbps * 1_000_000,
    };
    if (selectedMime) {
      recorderOptions.mimeType = selectedMime;
    }

    const recorder = new MediaRecorder(stream, recorderOptions);
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.start(100);

    const startTime = performance.now();
    const frameIntervalMs = 1000 / fps;

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (this.isCancelled) {
        recorder.stop();
        throw new Error('Video rendering was cancelled by user.');
      }

      while (this.isPaused && !this.isCancelled) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const frameStartTime = performance.now();

      let currentDisplaySeconds = 0;
      let nextDisplaySeconds = 0;
      let fractionalSecond = 0;

      if (frameIndex < countdownFrames) {
        const videoSecElapsed = frameIndex / fps;
        const countdownSecElapsed = videoSecElapsed * speedMultiplier;
        if (countdownSecElapsed >= totalSeconds) {
          currentDisplaySeconds = 0;
          nextDisplaySeconds = 0;
          fractionalSecond = 0;
        } else {
          const secIndex = Math.floor(countdownSecElapsed);
          currentDisplaySeconds = Math.max(0, totalSeconds - secIndex);
          nextDisplaySeconds = Math.max(0, currentDisplaySeconds - 1);
          fractionalSecond = countdownSecElapsed - secIndex;
        }
      } else {
        currentDisplaySeconds = 0;
        nextDisplaySeconds = 0;
        fractionalSecond = 0;
      }

      drawFlipClockFrame(
        this.ctx,
        width,
        height,
        {
          currentDisplaySeconds,
          nextDisplaySeconds,
          fractionalSecond,
          totalTargetSeconds: totalSeconds,
          isFinished: frameIndex >= countdownFrames,
        },
        options
      );

      if (frameIndex % 5 === 0 || frameIndex === totalFrames - 1) {
        const now = performance.now();
        const elapsedMs = now - startTime;
        const progressFrac = (frameIndex + 1) / totalFrames;
        const estimatedTotalMs = elapsedMs / progressFrac;
        const remainingMs = Math.max(0, estimatedTotalMs - elapsedMs);

        const dispH = Math.floor(currentDisplaySeconds / 3600);
        const dispM = Math.floor((currentDisplaySeconds % 3600) / 60);
        const dispS = currentDisplaySeconds % 60;
        const timeString = `${String(dispH).padStart(2, '0')}:${String(dispM).padStart(2, '0')}:${String(dispS).padStart(2, '0')}`;

        onProgress({
          status: 'rendering',
          currentFrame: frameIndex + 1,
          totalFrames,
          currentSecondLeft: currentDisplaySeconds,
          currentDisplayTime: timeString,
          fpsActual: fps,
          percent: Math.min(100, Math.round(progressFrac * 100)),
          elapsedMs,
          estimatedRemainingMs: remainingMs,
          speedMultiplier: 1,
          videoDurationSeconds: Number(totalVideoDurationSec.toFixed(1)),
          countdownDurationSeconds: totalSeconds,
          engineUsed: 'Universal Media Engine (Standard)',
        });

        if (onPreviewFrame) {
          onPreviewFrame(this.canvas);
        }
      }

      const elapsedRender = performance.now() - frameStartTime;
      const sleepTime = Math.max(2, frameIntervalMs - elapsedRender);
      await new Promise((r) => setTimeout(r, sleepTime));
    }

    onProgress({
      status: 'muxing',
      currentFrame: totalFrames,
      totalFrames,
      currentSecondLeft: 0,
      currentDisplayTime: '00:00:00',
      fpsActual: fps,
      percent: 100,
      elapsedMs: performance.now() - startTime,
      estimatedRemainingMs: 0,
      speedMultiplier: 1,
      videoDurationSeconds: Number(totalVideoDurationSec.toFixed(1)),
      countdownDurationSeconds: totalSeconds,
      engineUsed: 'Universal Media Engine (Standard)',
    });

    const recordedBlobPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: mimeType });
        resolve(fullBlob);
      };
    });

    recorder.stop();
    const finalBlob = await recordedBlobPromise;
    const blobUrl = URL.createObjectURL(finalBlob);

    const pad = (n: number) => String(n).padStart(2, '0');
    const speedTag = speedMultiplier !== 1 ? `_${speedMultiplier}x-speed` : '';
    const fileName = `flip-clock_${pad(timer.hours)}h${pad(timer.minutes)}m${pad(timer.seconds)}s${speedTag}_${options.resolution}_${fps}fps.${extension}`;

    return {
      blobUrl,
      fileName,
      fileSize: finalBlob.size,
      blob: finalBlob,
    };
  }

  /**
   * Generates candidate codecs suitable for the target resolution, fps, and format,
   * and verifies support using VideoEncoder.isConfigSupported.
   */
  private async findWorkingEncoderConfig(
    preferredFormat: 'mp4' | 'webm',
    width: number,
    height: number,
    bitrateMbps: number,
    fps: number,
    codecPreference?: string
  ): Promise<EncoderSelectionResult | null> {
    const bitRate = bitrateMbps * 1_000_000;
    const isHighRes = width >= 1920 || height >= 1080;
    const is4K = width >= 3840 || height >= 2160;

    // AVC level calculation:
    // Level 3.1: 720p
    // Level 4.0: 1080p @ 30fps (0x28)
    // Level 4.2: 1080p @ 60fps (0x2a)
    // Level 5.1: 4K (0x33)
    const avcLevelHex = is4K ? '33' : isHighRes ? (fps > 30 ? '2a' : '28') : '1f';

    const candidateList: Array<{ codec: string; muxerType: 'mp4' | 'webm' }> = [];

    if (codecPreference && codecPreference !== 'auto') {
      const explicitMap: Record<string, { codec: string; muxerType: 'mp4' | 'webm' }> = {
        'avc-baseline': { codec: `avc1.4200${avcLevelHex}`, muxerType: 'mp4' },
        'avc-main': { codec: `avc1.4d00${avcLevelHex}`, muxerType: 'mp4' },
        'avc-high': { codec: `avc1.6400${avcLevelHex}`, muxerType: 'mp4' },
        'vp9': { codec: is4K ? 'vp09.00.51.08' : 'vp09.00.41.08', muxerType: 'webm' },
        'vp8': { codec: 'vp8', muxerType: 'webm' },
        'av1': { codec: is4K ? 'av01.0.12M.08' : 'av01.0.08M.08', muxerType: 'webm' },
      };
      if (explicitMap[codecPreference]) {
        candidateList.push(explicitMap[codecPreference]);
      }
    }

    if (preferredFormat === 'mp4') {
      candidateList.push(
        // Modern AVC profiles
        { codec: `avc1.4d00${avcLevelHex}`, muxerType: 'mp4' }, // Main
        { codec: `avc1.6400${avcLevelHex}`, muxerType: 'mp4' }, // High
        { codec: `avc1.4200${avcLevelHex}`, muxerType: 'mp4' }, // Baseline
        { codec: 'avc1.4d002a', muxerType: 'mp4' },
        { codec: 'avc1.640028', muxerType: 'mp4' },
        { codec: 'avc1.42001f', muxerType: 'mp4' },
        // WebM fallbacks if H.264 is unavailable on this host
        { codec: is4K ? 'vp09.00.51.08' : 'vp09.00.41.08', muxerType: 'webm' },
        { codec: 'vp09.00.10.08', muxerType: 'webm' },
        { codec: 'vp8', muxerType: 'webm' }
      );
    } else {
      candidateList.push(
        { codec: is4K ? 'vp09.00.51.08' : 'vp09.00.41.08', muxerType: 'webm' },
        { codec: 'vp09.00.10.08', muxerType: 'webm' },
        { codec: 'vp8', muxerType: 'webm' },
        { codec: is4K ? 'av01.0.12M.08' : 'av01.0.08M.08', muxerType: 'webm' },
        { codec: `avc1.4d00${avcLevelHex}`, muxerType: 'mp4' }
      );
    }

    const accelModes: HardwareAcceleration[] = ['no-preference', 'prefer-hardware', 'prefer-software'];

    for (const item of candidateList) {
      for (const accel of accelModes) {
        const config: VideoEncoderConfig = {
          codec: item.codec,
          width,
          height,
          bitrate: bitRate,
          framerate: fps,
          hardwareAcceleration: accel,
        };

        if (item.codec.startsWith('avc')) {
          config.avc = { format: 'avc' };
        }

        try {
          if (typeof VideoEncoder !== 'undefined' && VideoEncoder.isConfigSupported) {
            const support = await VideoEncoder.isConfigSupported(config);
            if (support && support.supported) {
              return {
                codec: support.config?.codec || item.codec,
                hardwareAcceleration: accel,
                muxerType: item.muxerType,
              };
            }
          }
        } catch {
          // ignore and continue trying next profile
        }
      }
    }

    return null;
  }
}

/**
 * Checks system capability and codec support.
 */
export async function checkSystemCapabilities(): Promise<CodecSupportStatus> {
  const isWebCodecsSupported =
    typeof window !== 'undefined' &&
    typeof window.VideoEncoder !== 'undefined' &&
    typeof window.VideoFrame !== 'undefined';

  if (!isWebCodecsSupported) {
    return {
      webCodecsSupported: false,
      h264Supported: false,
      vp9Supported: false,
      vp8Supported: false,
      av1Supported: false,
      notes: [
        'WebCodecs hardware acceleration not detected in this browser.',
        'Universal Media Engine enabled (Supports MP4/WebM output).',
      ],
    };
  }

  let h264Supported = false;
  let vp9Supported = false;
  let vp8Supported = false;
  let av1Supported = false;

  try {
    const h264 = await VideoEncoder.isConfigSupported({
      codec: 'avc1.4d0028',
      width: 1280,
      height: 720,
      bitrate: 4_000_000,
      framerate: 30,
    });
    h264Supported = !!h264.supported;
  } catch {}

  try {
    const vp9 = await VideoEncoder.isConfigSupported({
      codec: 'vp09.00.10.08',
      width: 1280,
      height: 720,
      bitrate: 4_000_000,
      framerate: 30,
    });
    vp9Supported = !!vp9.supported;
  } catch {}

  try {
    const vp8 = await VideoEncoder.isConfigSupported({
      codec: 'vp8',
      width: 1280,
      height: 720,
      bitrate: 4_000_000,
      framerate: 30,
    });
    vp8Supported = !!vp8.supported;
  } catch {}

  try {
    const av1 = await VideoEncoder.isConfigSupported({
      codec: 'av01.0.04M.08',
      width: 1280,
      height: 720,
      bitrate: 4_000_000,
      framerate: 30,
    });
    av1Supported = !!av1.supported;
  } catch {}

  const notes: string[] = [];
  if (h264Supported) notes.push('H.264 (MP4) Hardware Acceleration Available');
  if (vp9Supported) notes.push('VP9 (WebM) High Efficiency Codec Available');
  if (vp8Supported) notes.push('VP8 (WebM) Legacy Codec Available');
  if (av1Supported) notes.push('AV1 Next-Gen Codec Available');
  notes.push('Universal Media Engine Fallback Active');

  return {
    webCodecsSupported: true,
    h264Supported,
    vp9Supported,
    vp8Supported,
    av1Supported,
    notes,
  };
}
