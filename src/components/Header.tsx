import React from 'react';
import { Cpu, Download, Sparkles, CheckCircle2, AlertTriangle, Code2 } from 'lucide-react';
import { CodecSupportStatus } from '../types';
import { generateStandaloneHtmlFile } from '../utils/standaloneHtmlGenerator';
import { downloadFile } from '../utils/fileDownloader';

interface HeaderProps {
  codecStatus: CodecSupportStatus | null;
  onExportStandaloneHtml: () => void;
}

export const Header: React.FC<HeaderProps> = ({ codecStatus, onExportStandaloneHtml }) => {
  const downloadStandaloneHtml = async () => {
    const html = generateStandaloneHtmlFile();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    await downloadFile({
      blob,
      fileName: 'flip-clock-video-generator-standalone.html',
      mimeType: 'text/html',
    });
  };

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Flip Clock Video Generator</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Cpu className="w-3 h-3" /> WebCodecs 30+ FPS
              </span>
            </div>
            <p className="text-xs text-neutral-400">High-speed hardware-accelerated frame-by-frame countdown renderer</p>
          </div>
        </div>

        {/* Action Controls & Hardware Status */}
        <div className="flex items-center gap-3">
          {codecStatus && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700/60 text-xs">
              {codecStatus.webCodecsSupported ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-neutral-300 font-medium">GPU Hardware Acceleration Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-amber-300">Use Chrome/Edge for WebCodecs</span>
                </>
              )}
            </div>
          )}

          <button
            id="btn-export-standalone"
            onClick={downloadStandaloneHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-semibold transition shadow-sm"
            title="Download single-file offline HTML"
          >
            <Code2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Standalone .HTML File</span>
            <Download className="w-3 h-3 ml-0.5 opacity-70" />
          </button>
        </div>
      </div>
    </header>
  );
};
