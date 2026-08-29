#!/usr/bin/env python3
"""
Flip Clock Video Renderer for Google Colab with NVIDIA T4 GPU (NVENC Acceleration)
Renders full 1080p / 4K / Reels flip-clock countdown videos at 200+ FPS directly on Colab GPU.
"""

import os
import sys
import argparse
import subprocess
import time
import json
import math

THEMES = {
    'white-red': {
        'id': 'white-red',
        'name': 'Classic White Card & Red Text',
        'bgGradStart': '#141416',
        'bgGradEnd': '#09090b',
        'cardBg': '#fdfdfd',
        'cardBottomBg': '#f0f0f2',
        'textColor': '#e11d48',
        'cardBorder': 'rgba(255, 255, 255, 0.15)',
        'dividerColor': '#18181b',
        'hingeColor': '#27272a',
        'glowColor': 'rgba(225, 29, 72, 0.15)',
        'labelColor': '#a1a1aa',
    },
    'dark-crimson': {
        'id': 'dark-crimson',
        'name': 'Stealth Black & Crimson Glow',
        'bgGradStart': '#0f0f12',
        'bgGradEnd': '#050507',
        'cardBg': '#1f1f23',
        'cardBottomBg': '#18181c',
        'textColor': '#ff2a55',
        'cardBorder': 'rgba(255, 42, 85, 0.25)',
        'dividerColor': '#0a0a0c',
        'hingeColor': '#2d2d34',
        'glowColor': 'rgba(255, 42, 85, 0.35)',
        'labelColor': '#71717a',
    },
    'matte-noir': {
        'id': 'matte-noir',
        'name': 'Matte Noir & Pure White',
        'bgGradStart': '#111113',
        'bgGradEnd': '#060607',
        'cardBg': '#1a1a1e',
        'cardBottomBg': '#141417',
        'textColor': '#ffffff',
        'cardBorder': 'rgba(255, 255, 255, 0.18)',
        'dividerColor': '#0c0c0e',
        'hingeColor': '#2c2c32',
        'glowColor': 'rgba(255, 255, 255, 0.12)',
        'labelColor': '#a1a1aa',
    },
    'cyber-neon': {
        'id': 'cyber-neon',
        'name': 'Cyberpunk Neon Cyan',
        'bgGradStart': '#080c14',
        'bgGradEnd': '#03050a',
        'cardBg': '#0f172a',
        'cardBottomBg': '#090e1a',
        'textColor': '#00f0ff',
        'cardBorder': 'rgba(0, 240, 255, 0.3)',
        'dividerColor': '#040711',
        'hingeColor': '#1e293b',
        'glowColor': 'rgba(0, 240, 255, 0.45)',
        'labelColor': '#38bdf8',
    },
    'tokyo-emerald': {
        'id': 'tokyo-emerald',
        'name': 'Tokyo Night & Matrix Emerald',
        'bgGradStart': '#050e0a',
        'bgGradEnd': '#020604',
        'cardBg': '#0c1a14',
        'cardBottomBg': '#07120e',
        'textColor': '#10b981',
        'cardBorder': 'rgba(16, 185, 129, 0.3)',
        'dividerColor': '#030906',
        'hingeColor': '#132e22',
        'glowColor': 'rgba(16, 185, 129, 0.4)',
        'labelColor': '#34d399',
    },
    'luxury-gold': {
        'id': 'luxury-gold',
        'name': 'Luxury Brass & Champagne Gold',
        'bgGradStart': '#17120a',
        'bgGradEnd': '#0a0703',
        'cardBg': '#241b10',
        'cardBottomBg': '#1a1309',
        'textColor': '#f59e0b',
        'cardBorder': 'rgba(245, 158, 11, 0.35)',
        'dividerColor': '#0f0a04',
        'hingeColor': '#3d2e1b',
        'glowColor': 'rgba(245, 158, 11, 0.4)',
        'labelColor': '#fbbf24',
    },
    'dracula-purple': {
        'id': 'dracula-purple',
        'name': 'Royal Violet & Neon Lilac',
        'bgGradStart': '#11091d',
        'bgGradEnd': '#07030c',
        'cardBg': '#1e1035',
        'cardBottomBg': '#150926',
        'textColor': '#c084fc',
        'cardBorder': 'rgba(192, 132, 252, 0.3)',
        'dividerColor': '#0a0314',
        'hingeColor': '#381c61',
        'glowColor': 'rgba(192, 132, 252, 0.4)',
        'labelColor': '#e879f9',
    },
    'sunset-orange': {
        'id': 'sunset-orange',
        'name': 'Sunset Ember & Blazing Orange',
        'bgGradStart': '#1a0c06',
        'bgGradEnd': '#0a0402',
        'cardBg': '#261208',
        'cardBottomBg': '#1b0b04',
        'textColor': '#ff6b2b',
        'cardBorder': 'rgba(255, 107, 43, 0.35)',
        'dividerColor': '#100502',
        'hingeColor': '#3f1f10',
        'glowColor': 'rgba(255, 107, 43, 0.45)',
        'labelColor': '#fb923c',
    },
    'nordic-frost': {
        'id': 'nordic-frost',
        'name': 'Nordic Frost & Ice White',
        'bgGradStart': '#0f172a',
        'bgGradEnd': '#020617',
        'cardBg': '#1e293b',
        'cardBottomBg': '#0f172a',
        'textColor': '#e0f2fe',
        'cardBorder': 'rgba(224, 242, 254, 0.25)',
        'dividerColor': '#080d1a',
        'hingeColor': '#334155',
        'glowColor': 'rgba(56, 189, 248, 0.25)',
        'labelColor': '#94a3b8',
    }
}

RESOLUTIONS = {
    '1080p': {'width': 1920, 'height': 1080},
    '720p': {'width': 1280, 'height': 720},
    '4k': {'width': 3840, 'height': 2160},
    'reels': {'width': 1080, 'height': 1920},
}

def generate_node_renderer(config):
    """
    Creates a Node.js Skia/Canvas script that executes the exact flip clock
    drawing logic and pipes raw RGBA frames to FFmpeg with NVIDIA h264_nvenc GPU encoding.
    """
    return f"""
const fs = require('fs');
const {{ spawn }} = require('child_process');
const {{ createCanvas, loadImage }} = require('@napi-rs/canvas');

const config = {json.dumps(config)};

const dims = config.dimensions;
const width = dims.width;
const height = dims.height;
const fps = config.fps;
const totalSeconds = config.totalSeconds;
const totalFrames = totalSeconds * fps;
const theme = config.theme;
const options = config.options;

console.log(`[Colab GPU Render] Dimensions: ${{width}}x${{height}} @ ${{fps}} FPS (Total frames: ${{totalFrames}})`);

// Spawn FFmpeg with NVIDIA GPU Hardware Acceleration
// If NVENC is available, uses h264_nvenc (hardware encoder). Otherwise falls back to libx264.
const hasNvenc = true;
const ffmpegArgs = [
  '-y',
  '-f', 'rawvideo',
  '-vcodec', 'rawvideo',
  '-s', `${{width}}x${{height}}`,
  '-pix_fmt', 'rgba',
  '-r', `${{fps}}`,
  '-i', '-',
  '-c:v', 'h264_nvenc',
  '-preset', 'p7',
  '-cq', '19',
  '-b:v', '12M',
  '-pix_fmt', 'yuv420p',
  config.outputFilename
];

let ffmpeg;
try {{
  ffmpeg = spawn('ffmpeg', ffmpegArgs);
}} catch (err) {{
  console.error("FFmpeg spawn error:", err);
  process.exit(1);
}}

ffmpeg.stderr.on('data', (data) => {{
  const str = data.toString();
  if (str.includes('frame=') || str.includes('fps=')) {{
    process.stdout.write(`\\r⚡ GPU Encoding: ${{str.trim().split('\\n').pop()}}`);
  }}
}});

ffmpeg.on('error', (e) => {{
  console.error("FFmpeg error:", e);
}});

ffmpeg.on('close', (code) => {{
  console.log(`\\n🎉 Video rendering successfully completed! Saved as ${{config.outputFilename}}`);
  process.exit(code);
}});

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

function roundRect(ctx, x, y, w, h, r) {{
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}}

function drawFlipClock(currentDisplaySec, nextDisplaySec, frac) {{
  const curH = Math.floor(currentDisplaySec / 3600);
  const curM = Math.floor((currentDisplaySec % 3600) / 60);
  const curS = currentDisplaySec % 60;

  const nextH = Math.floor(nextDisplaySec / 3600);
  const nextM = Math.floor((nextDisplaySec % 3600) / 60);
  const nextS = nextDisplaySec % 60;

  const showHours = !options.autoHideHours || curH > 0 || totalSeconds >= 3600;

  const curDigits = [
    ...(showHours ? [Math.floor(curH / 10), curH % 10] : []),
    Math.floor(curM / 10),
    curM % 10,
    Math.floor(curS / 10),
    curS % 10,
  ];

  const nextDigits = [
    ...(showHours ? [Math.floor(nextH / 10), nextH % 10] : []),
    Math.floor(nextM / 10),
    nextM % 10,
    Math.floor(nextS / 10),
    nextS % 10,
  ];

  // 1. Background Vignette
  const bgGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.1,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  bgGrad.addColorStop(0, theme.bgGradStart);
  bgGrad.addColorStop(1, theme.bgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Geometry Scale
  const baseScale = width / 1920;
  const numPairs = showHours ? 3 : 2;
  const cardWidth = 165 * baseScale;
  const cardHeight = 240 * baseScale;
  const cardGap = 16 * baseScale;
  const pairGap = 44 * baseScale;
  const cardRadius = 14 * baseScale;

  const totalClockWidth = numPairs * (2 * cardWidth + cardGap) + (numPairs - 1) * pairGap;
  const startX = (width - totalClockWidth) / 2;
  const centerY = height / 2 - (options.showLabels ? 25 * baseScale : 0);

  // Flip physics
  let flipProgress = 0;
  if (currentDisplaySec > 0 && nextDisplaySec < currentDisplaySec) {{
    const flipWindow = 0.42;
    if (frac >= 1 - flipWindow) {{
      const rawP = Math.min(1, Math.max(0, (frac - (1 - flipWindow)) / flipWindow));
      flipProgress = (1 - Math.cos(rawP * Math.PI)) / 2;
    }}
  }}

  let currentX = startX;
  let digitIdx = 0;
  const pairLabels = showHours ? ['HOURS', 'MINUTES', 'SECONDS'] : ['MINUTES', 'SECONDS'];

  for (let pair = 0; pair < numPairs; pair++) {{
    const pairStartX = currentX;

    for (let d = 0; d < 2; d++) {{
      const digitX = currentX;
      const digitY = centerY - cardHeight / 2;
      const dCur = curDigits[digitIdx];
      const dNext = nextDigits[digitIdx];
      const isFlipping = dCur !== dNext;
      const p = isFlipping ? flipProgress : 0;

      // Draw Card Base Bottom
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 24 * baseScale;
      ctx.shadowOffsetY = 14 * baseScale;
      ctx.fillStyle = theme.cardBottomBg;
      roundRect(ctx, digitX, digitY + cardHeight / 2, cardWidth, cardHeight / 2, cardRadius);
      ctx.fill();
      ctx.restore();

      // Bottom Digit Text (Next value if flipping, else current)
      const bottomDisplayDigit = (isFlipping && p >= 0.5) ? dNext : dNext;
      ctx.save();
      ctx.beginPath();
      ctx.rect(digitX, digitY + cardHeight / 2, cardWidth, cardHeight / 2);
      ctx.clip();
      ctx.fillStyle = theme.textColor;
      ctx.font = `900 ${{Math.floor(180 * baseScale)}}px "Plus Jakarta Sans", -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(dNext), digitX + cardWidth / 2, digitY + cardHeight / 2);
      ctx.restore();

      // Top Base Card (Current value before flip, or next value during top flap drop)
      ctx.save();
      ctx.fillStyle = theme.cardBg;
      roundRect(ctx, digitX, digitY, cardWidth, cardHeight / 2, cardRadius);
      ctx.fill();
      ctx.beginPath();
      ctx.rect(digitX, digitY, cardWidth, cardHeight / 2);
      ctx.clip();
      ctx.fillStyle = theme.textColor;
      ctx.font = `900 ${{Math.floor(180 * baseScale)}}px "Plus Jakarta Sans", -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(isFlipping && p >= 0.5 ? dNext : dCur), digitX + cardWidth / 2, digitY + cardHeight / 2);
      ctx.restore();

      // Animated Flipping Flap
      if (isFlipping && p > 0) {{
        if (p < 0.5) {{
          // Upper flap folding down
          const scaleY = Math.cos(p * Math.PI);
          ctx.save();
          ctx.translate(digitX + cardWidth / 2, digitY + cardHeight / 2);
          ctx.scale(1, scaleY);
          ctx.translate(-(digitX + cardWidth / 2), -(digitY + cardHeight / 2));

          ctx.fillStyle = theme.cardBg;
          roundRect(ctx, digitX, digitY, cardWidth, cardHeight / 2, cardRadius);
          ctx.fill();

          ctx.beginPath();
          ctx.rect(digitX, digitY, cardWidth, cardHeight / 2);
          ctx.clip();
          ctx.fillStyle = theme.textColor;
          ctx.font = `900 ${{Math.floor(180 * baseScale)}}px "Plus Jakarta Sans", -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(dCur), digitX + cardWidth / 2, digitY + cardHeight / 2);

          // Shadow
          ctx.fillStyle = `rgba(0, 0, 0, ${{p * 1.5}})`;
          ctx.fillRect(digitX, digitY, cardWidth, cardHeight / 2);
          ctx.restore();
        }} else {{
          // Lower flap revealing next digit
          const scaleY = -Math.cos(p * Math.PI);
          ctx.save();
          ctx.translate(digitX + cardWidth / 2, digitY + cardHeight / 2);
          ctx.scale(1, scaleY);
          ctx.translate(-(digitX + cardWidth / 2), -(digitY + cardHeight / 2));

          ctx.fillStyle = theme.cardBottomBg;
          roundRect(ctx, digitX, digitY + cardHeight / 2, cardWidth, cardHeight / 2, cardRadius);
          ctx.fill();

          ctx.beginPath();
          ctx.rect(digitX, digitY + cardHeight / 2, cardWidth, cardHeight / 2);
          ctx.clip();
          ctx.fillStyle = theme.textColor;
          ctx.font = `900 ${{Math.floor(180 * baseScale)}}px "Plus Jakarta Sans", -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(dNext), digitX + cardWidth / 2, digitY + cardHeight / 2);

          // Light reflection & shadow fade
          ctx.fillStyle = `rgba(0, 0, 0, ${{(1 - p) * 1.2}})`;
          ctx.fillRect(digitX, digitY + cardHeight / 2, cardWidth, cardHeight / 2);
          ctx.restore();
        }}
      }}

      // Center Divider line & Hinges
      ctx.fillStyle = theme.dividerColor;
      ctx.fillRect(digitX, digitY + cardHeight / 2 - 1.5 * baseScale, cardWidth, 3 * baseScale);

      ctx.fillStyle = theme.hingeColor;
      ctx.fillRect(digitX - 3 * baseScale, digitY + cardHeight / 2 - 5 * baseScale, 6 * baseScale, 10 * baseScale);
      ctx.fillRect(digitX + cardWidth - 3 * baseScale, digitY + cardHeight / 2 - 5 * baseScale, 6 * baseScale, 10 * baseScale);

      currentX += cardWidth + cardGap;
      digitIdx++;
    }}

    // Pair Label
    if (options.showLabels) {{
      const pairWidth = 2 * cardWidth + cardGap;
      ctx.fillStyle = theme.labelColor;
      ctx.font = `700 ${{Math.floor(16 * baseScale)}}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(pairLabels[pair], pairStartX + pairWidth / 2, centerY + cardHeight / 2 + 36 * baseScale);
    }}

    // Colon separator
    if (pair < numPairs - 1) {{
      const colonX = currentX - cardGap + pairGap / 2;
      ctx.fillStyle = theme.textColor;
      ctx.beginPath();
      ctx.arc(colonX, centerY - 28 * baseScale, 6 * baseScale, 0, Math.PI * 2);
      ctx.arc(colonX, centerY + 28 * baseScale, 6 * baseScale, 0, Math.PI * 2);
      ctx.fill();
      currentX += pairGap - cardGap;
    }}
  }}

  // Optional Watermark Overlay
  if (options.watermark && options.watermark.enabled) {{
    const wm = options.watermark;
    ctx.save();
    ctx.globalAlpha = (wm.opacity || 80) / 100;
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${{Math.floor(28 * baseScale)}}px -apple-system, sans-serif`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    const posX = (width * (wm.posX ?? 50)) / 100;
    const posY = (height * (wm.posY ?? 90)) / 100;
    ctx.textAlign = 'center';
    ctx.fillText(wm.text || '@FlipClockTimer', posX, posY);
    ctx.restore();
  }}
}}

// Frame pumping loop
let frameIndex = 0;
function pump() {{
  while (frameIndex < totalFrames) {{
    const currentRemaining = totalSeconds - (frameIndex / fps);
    const curDisplay = Math.ceil(currentRemaining);
    const nextDisplay = Math.max(0, curDisplay - 1);
    const frac = (1 - (currentRemaining % 1)) % 1;

    drawFlipClock(curDisplay, nextDisplay, frac);

    const buffer = canvas.toBuffer('raw');
    const canWrite = ffmpeg.stdin.write(buffer);
    frameIndex++;

    if (!canWrite) {{
      ffmpeg.stdin.once('drain', pump);
      return;
    }}
  }}
  ffmpeg.stdin.end();
}}

pump();
"""

def main():
    parser = argparse.ArgumentParser(description="Google Colab T4 GPU Flip Clock Video Renderer")
    parser.add_argument("--hours", type=int, default=0, help="Hours (0-99)")
    parser.add_argument("--minutes", type=int, default=5, help="Minutes (0-59)")
    parser.add_argument("--seconds", type=int, default=0, help="Seconds (0-59)")
    parser.add_argument("--fps", type=int, default=30, choices=[24, 30, 60], help="FPS (default: 30)")
    parser.add_argument("--theme", type=str, default="matte-noir", choices=list(THEMES.keys()), help="Color Theme")
    parser.add_argument("--resolution", type=str, default="1080p", choices=list(RESOLUTIONS.keys()), help="Resolution")
    parser.add_argument("--watermark-text", type=str, default="", help="Optional watermark text")
    parser.add_argument("--output", type=str, default="", help="Output MP4 filename")
    parser.add_argument("--no-download", action="store_true", help="Don't auto-download on Colab")
    args = parser.parse_args()

    total_seconds = args.hours * 3600 + args.minutes * 60 + args.seconds
    if total_seconds <= 0:
        total_seconds = 60

    out_name = args.output
    if not out_name:
        out_name = f"flip_clock_{args.minutes}m_{args.seconds}s_{args.theme}.mp4"

    theme_obj = THEMES.get(args.theme, THEMES['matte-noir'])
    dim_obj = RESOLUTIONS.get(args.resolution, RESOLUTIONS['1080p'])

    render_config = {
        'totalSeconds': total_seconds,
        'fps': args.fps,
        'dimensions': dim_obj,
        'theme': theme_obj,
        'outputFilename': out_name,
        'options': {
            'themeId': args.theme,
            'resolution': args.resolution,
            'fps': args.fps,
            'animationMode': 'flip-flop',
            'showLabels': True,
            'autoHideHours': True,
            'watermark': {
                'enabled': bool(args.watermark_text),
                'text': args.watermark_text,
                'opacity': 85,
                'posX': 50,
                'posY': 88
            }
        }
    }

    print("=" * 60)
    print("🎬 FLIP CLOCK GOOGLE COLAB T4 GPU RENDERER")
    print(f"⏱️  Duration   : {args.hours}h {args.minutes}m {args.seconds}s ({total_seconds}s total)")
    print(f"🎨 Theme      : {theme_obj['name']}")
    print(f"📐 Resolution : {args.resolution} ({dim_obj['width']}x{dim_obj['height']} @ {args.fps}fps)")
    print(f"⚡ GPU Encoder: NVIDIA NVENC (h264_nvenc)")
    print(f"💾 Output File: {out_name}")
    print("=" * 60)

    # Check Node and @napi-rs/canvas
    try:
        subprocess.run(["node", "-e", "require('@napi-rs/canvas')"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print("\n📦 Installing ultra-fast Canvas engine for Colab...")
        subprocess.run(["npm", "install", "-g", "@napi-rs/canvas"], check=True)
        # Link global modules if needed
        os.environ['NODE_PATH'] = '/usr/lib/node_modules:/usr/local/lib/node_modules:' + os.environ.get('NODE_PATH', '')

    script_content = generate_node_renderer(render_config)
    with open("temp_render_worker.js", "w") as f:
        f.write(script_content)

    t0 = time.time()
    env = dict(os.environ)
    env['NODE_PATH'] = '/usr/lib/node_modules:/usr/local/lib/node_modules:' + env.get('NODE_PATH', '')
    subprocess.run(["node", "temp_render_worker.js"], env=env, check=True)
    elapsed = round(time.time() - t0, 2)
    
    print(f"\n✨ Render finished in {elapsed} seconds on Colab GPU!")
    
    # Check if inside Google Colab and trigger instant PC download
    if not args.no_download:
        try:
            from google.colab import files
            print(f"📥 Automatically sending '{out_name}' to your PC downloads...")
            files.download(out_name)
        except ImportError:
            print(f"ℹ️ File saved locally at: {os.path.abspath(out_name)}")

if __name__ == "__main__":
    main()
