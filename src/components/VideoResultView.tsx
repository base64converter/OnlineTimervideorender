import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, RotateCcw, Film, HardDrive, Zap, Share2, ExternalLink, FileCheck, FolderDown, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RenderOptions, RenderProgress, TimerConfig } from '../types';
import { downloadFile, blobToDataUrl } from '../utils/fileDownloader';

interface VideoResultViewProps {
  progress: RenderProgress;
  timer: TimerConfig;
  options: RenderOptions;
  onReset: () => void;
}

export const VideoResultView: React.FC<VideoResultViewProps> = ({
  progress,
  timer,
  options,
  onReset,
}) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'saving' | 'success' | 'fallback'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f43f5e', '#ffffff', '#fb7185'],
      });
    } catch {}
  }, []);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    if (!progress.outputFileName) return;
    setDownloadStatus('saving');
    setStatusMessage('Initiating download...');

    try {
      const res = await downloadFile({
        blob: progress.outputBlob,
        blobUrl: progress.outputBlobUrl,
        fileName: progress.outputFileName,
        mimeType: options.format === 'mp4' ? 'video/mp4' : 'video/webm',
      });

      if (res.success) {
        setDownloadStatus('success');
        setStatusMessage(
          res.method === 'filesystem-api'
            ? 'Saved directly to your selected directory!'
            : 'Download triggered successfully!'
        );
        setTimeout(() => setDownloadStatus('idle'), 4000);
      } else {
        setDownloadStatus('fallback');
        setStatusMessage(res.error || 'Please use "Open in New Tab" or right-click the video player below.');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      setDownloadStatus('fallback');
      setStatusMessage('Download blocked by iframe policy. Please use the fallback buttons below.');
    }
  };

  const handleOpenInNewTab = () => {
    if (progress.outputBlobUrl) {
      const win = window.open(progress.outputBlobUrl, '_blank');
      if (!win) {
        // Popups might be blocked, create a temporary link with target="_blank"
        const a = document.createElement('a');
        a.href = progress.outputBlobUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  const handleCopyVideoDataUri = async () => {
    if (!progress.outputBlob) return;
    try {
      const dataUri = await blobToDataUrl(progress.outputBlob);
      await navigator.clipboard.writeText(dataUri);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error('Copy data URI failed:', err);
    }
  };

  const totalSecs = timer.hours * 3600 + timer.minutes * 60 + timer.seconds;
  const renderTimeSec = (progress.elapsedMs / 1000).toFixed(1);

  const hasFileSystemApi = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-emerald-500/40 shadow-2xl shadow-emerald-950/20 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">Video Rendered Successfully!</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Rendered {progress.totalFrames.toLocaleString()} frames in {renderTimeSec}s ({progress.speedMultiplier}x realtime speed)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Render Another</span>
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-neutral-800 shadow-inner group">
        {progress.outputBlobUrl && (
          <video
            src={progress.outputBlobUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Meta Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
          <Film className="w-4 h-4 text-rose-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-500">Video Duration</div>
            <div className="text-sm font-mono font-bold text-neutral-200">
              {progress.videoDurationSeconds ? `${progress.videoDurationSeconds}s` : `${(totalSecs / (options.speedMultiplier || 1)).toFixed(1)}s`}
              {options.speedMultiplier !== 1 && (
                <span className="text-[11px] text-amber-400 font-normal ml-1">({options.speedMultiplier}x)</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
          <HardDrive className="w-4 h-4 text-rose-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-500">File Size</div>
            <div className="text-sm font-mono font-bold text-neutral-200">{formatBytes(progress.outputFileSize)}</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-500">Encoding Speed</div>
            <div className="text-sm font-mono font-bold text-neutral-200">{progress.fpsActual} FPS</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-500">Format & Quality</div>
            <div className="text-sm font-mono font-bold text-neutral-200">
              {options.format.toUpperCase()} ({options.resolution.toUpperCase()} @ {options.fps}fps)
            </div>
          </div>
        </div>
      </div>

      {/* Download Status Notification */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-3 ${
            downloadStatus === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
              : downloadStatus === 'saving'
              ? 'bg-neutral-800 border border-neutral-700 text-neutral-200'
              : 'bg-amber-950/60 border border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {downloadStatus === 'success' ? (
              <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Download className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Action Buttons Grid */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Primary Download Button */}
        <button
          id="btn-download-video"
          onClick={handleDownload}
          disabled={downloadStatus === 'saving'}
          className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>Download {progress.outputFileName} ({formatBytes(progress.outputFileSize)})</span>
        </button>

        {/* Direct Link / Open in New Tab Button */}
        <button
          id="btn-open-video-tab"
          onClick={handleOpenInNewTab}
          className="py-4 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          title="Open raw video in a separate browser tab to download directly"
        >
          <ExternalLink className="w-4 h-4 text-teal-400" />
          <span>Open in New Tab</span>
        </button>
      </div>

      {/* Native Direct Anchor & Tips for Iframe/Sandbox */}
      <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col gap-2 text-xs text-neutral-400">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-neutral-300">Alternative Download Options:</span>
          <div className="flex items-center gap-3">
            {progress.outputBlobUrl && (
              <a
                href={progress.outputBlobUrl}
                download={progress.outputFileName || 'countdown.mp4'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-1"
              >
                <FolderDown className="w-3.5 h-3.5" />
                Direct Link
              </a>
            )}
            {progress.outputBlob && (
              <button
                onClick={handleCopyVideoDataUri}
                className="text-neutral-400 hover:text-neutral-200 transition flex items-center gap-1 cursor-pointer"
                title="Copy Base64 Data URL to clipboard"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Data URL!' : 'Copy Data URL'}</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 leading-relaxed">
          Tip: If your browser or iframe security blocks automatic file downloads, click <strong className="text-neutral-300">Open in New Tab</strong> or right-click the video player above and choose <strong className="text-neutral-300">&quot;Save video as...&quot;</strong>.
        </p>
      </div>
    </div>
  );
};
