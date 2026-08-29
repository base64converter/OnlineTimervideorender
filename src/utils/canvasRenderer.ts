import { RenderOptions, ThemeColors, VideoResolution, WatermarkConfig } from '../types';

export const THEMES: Record<string, ThemeColors> = {
  'white-red': {
    id: 'white-red',
    name: 'Classic White Card & Red Text',
    bgGradStart: '#141416',
    bgGradEnd: '#09090b',
    cardBg: '#fdfdfd',
    cardBottomBg: '#f0f0f2',
    textColor: '#e11d48', // bold vivid red
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    dividerColor: '#18181b',
    hingeColor: '#27272a',
    glowColor: 'rgba(225, 29, 72, 0.15)',
    labelColor: '#a1a1aa',
  },
  'dark-crimson': {
    id: 'dark-crimson',
    name: 'Stealth Black & Crimson Glow',
    bgGradStart: '#0f0f12',
    bgGradEnd: '#050507',
    cardBg: '#1f1f23',
    cardBottomBg: '#18181c',
    textColor: '#ff2a55',
    cardBorder: 'rgba(255, 42, 85, 0.25)',
    dividerColor: '#0a0a0c',
    hingeColor: '#2d2d34',
    glowColor: 'rgba(255, 42, 85, 0.35)',
    labelColor: '#71717a',
  },
  'matte-noir': {
    id: 'matte-noir',
    name: 'Matte Noir & Pure White',
    bgGradStart: '#111113',
    bgGradEnd: '#060607',
    cardBg: '#1a1a1e',
    cardBottomBg: '#141417',
    textColor: '#ffffff',
    cardBorder: 'rgba(255, 255, 255, 0.18)',
    dividerColor: '#0c0c0e',
    hingeColor: '#2c2c32',
    glowColor: 'rgba(255, 255, 255, 0.12)',
    labelColor: '#a1a1aa',
  },
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon Cyan',
    bgGradStart: '#080c14',
    bgGradEnd: '#03050a',
    cardBg: '#0f172a',
    cardBottomBg: '#090e1a',
    textColor: '#00f0ff',
    cardBorder: 'rgba(0, 240, 255, 0.3)',
    dividerColor: '#040711',
    hingeColor: '#1e293b',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    labelColor: '#38bdf8',
  },
  'tokyo-emerald': {
    id: 'tokyo-emerald',
    name: 'Tokyo Night & Matrix Emerald',
    bgGradStart: '#050e0a',
    bgGradEnd: '#020604',
    cardBg: '#0c1a14',
    cardBottomBg: '#07120e',
    textColor: '#10b981',
    cardBorder: 'rgba(16, 185, 129, 0.3)',
    dividerColor: '#030906',
    hingeColor: '#132e22',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    labelColor: '#34d399',
  },
  'luxury-gold': {
    id: 'luxury-gold',
    name: 'Luxury Brass & Champagne Gold',
    bgGradStart: '#17120a',
    bgGradEnd: '#0a0703',
    cardBg: '#241b10',
    cardBottomBg: '#1a1309',
    textColor: '#f59e0b',
    cardBorder: 'rgba(245, 158, 11, 0.35)',
    dividerColor: '#0f0a04',
    hingeColor: '#3d2e1b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    labelColor: '#fbbf24',
  },
  'dracula-purple': {
    id: 'dracula-purple',
    name: 'Royal Violet & Neon Lilac',
    bgGradStart: '#11091d',
    bgGradEnd: '#07030c',
    cardBg: '#1e1035',
    cardBottomBg: '#150926',
    textColor: '#c084fc',
    cardBorder: 'rgba(192, 132, 252, 0.3)',
    dividerColor: '#0a0314',
    hingeColor: '#381c61',
    glowColor: 'rgba(192, 132, 252, 0.4)',
    labelColor: '#e879f9',
  },
  'sunset-orange': {
    id: 'sunset-orange',
    name: 'Sunset Ember & Blazing Orange',
    bgGradStart: '#1a0c06',
    bgGradEnd: '#0a0402',
    cardBg: '#261208',
    cardBottomBg: '#1b0b04',
    textColor: '#ff6b2b',
    cardBorder: 'rgba(255, 107, 43, 0.35)',
    dividerColor: '#100502',
    hingeColor: '#3f1f10',
    glowColor: 'rgba(255, 107, 43, 0.45)',
    labelColor: '#fb923c',
  },
  'nordic-frost': {
    id: 'nordic-frost',
    name: 'Nordic Frost & Ice White',
    bgGradStart: '#0f172a',
    bgGradEnd: '#020617',
    cardBg: '#1e293b',
    cardBottomBg: '#0f172a',
    textColor: '#e0f2fe',
    cardBorder: 'rgba(224, 242, 254, 0.25)',
    dividerColor: '#080d1a',
    hingeColor: '#334155',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    labelColor: '#94a3b8',
  },
  'retro-amber': {
    id: 'retro-amber',
    name: 'Vintage White & Amber Gold',
    bgGradStart: '#1c1917',
    bgGradEnd: '#0c0a09',
    cardBg: '#fefce8',
    cardBottomBg: '#fef08a',
    textColor: '#b45309',
    cardBorder: 'rgba(217, 119, 6, 0.2)',
    dividerColor: '#292524',
    hingeColor: '#44403c',
    glowColor: 'rgba(245, 158, 11, 0.2)',
    labelColor: '#a8a29e',
  },
  'clean-mono': {
    id: 'clean-mono',
    name: 'Minimal White Card & Charcoal',
    bgGradStart: '#18181b',
    bgGradEnd: '#09090b',
    cardBg: '#ffffff',
    cardBottomBg: '#f4f4f5',
    textColor: '#09090b',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    dividerColor: '#27272a',
    hingeColor: '#3f3f46',
    glowColor: 'transparent',
    labelColor: '#71717a',
  },
  'rose-gold': {
    id: 'rose-gold',
    name: 'Rose Gold & Slate Grey',
    bgGradStart: '#191518',
    bgGradEnd: '#0a0709',
    cardBg: '#251c22',
    cardBottomBg: '#1b1318',
    textColor: '#fda4af',
    cardBorder: 'rgba(253, 164, 175, 0.3)',
    dividerColor: '#0f0a0d',
    hingeColor: '#3e2e38',
    glowColor: 'rgba(253, 164, 175, 0.35)',
    labelColor: '#f472b6',
  },
};

// In-memory cache for preloaded watermark image elements
const watermarkImageCache = new Map<string, HTMLImageElement>();

export function getOrLoadWatermarkImage(dataUrl?: string): HTMLImageElement | null {
  if (!dataUrl) return null;
  const cached = watermarkImageCache.get(dataUrl);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }
  if (!cached) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;
    watermarkImageCache.set(dataUrl, img);
    return img.complete && img.naturalWidth > 0 ? img : null;
  }
  return null;
}

export function getResolutionDimensions(res: VideoResolution): { width: number; height: number } {
  switch (res) {
    case '4k':
      return { width: 3840, height: 2160 };
    case '720p':
      return { width: 1280, height: 720 };
    case 'reels':
      return { width: 1080, height: 1920 };
    case '1080p':
    default:
      return { width: 1920, height: 1080 };
  }
}

export interface DrawTimeState {
  currentTotalSeconds?: number;
  fractionalSecond?: number; // 0.0 to 1.0 (elapsed fraction within the current second)
  currentDisplaySeconds?: number; // integer seconds remaining to display (e.g. 300)
  nextDisplaySeconds?: number; // integer seconds to flip towards (e.g. 299)
  totalTargetSeconds?: number; // original countdown duration to keep hours layout stable
  isFinished?: boolean;
}

export function drawFlipClockFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeState: DrawTimeState,
  options: RenderOptions
) {
  const theme = THEMES[options.themeId] || THEMES['white-red'];
  
  // Accurately resolve current display second, next second, and fractional progress
  let curSec = 0;
  let nextSec = 0;
  let frac = timeState.fractionalSecond ?? 0;

  if (timeState.isFinished) {
    curSec = 0;
    nextSec = 0;
    frac = 0;
  } else if (
    typeof timeState.currentDisplaySeconds === 'number' &&
    typeof timeState.nextDisplaySeconds === 'number'
  ) {
    curSec = Math.max(0, timeState.currentDisplaySeconds);
    nextSec = Math.max(0, timeState.nextDisplaySeconds);
  } else {
    // Fallback when only currentTotalSeconds is supplied
    const rem = Math.max(0, timeState.currentTotalSeconds ?? 0);
    if (rem <= 0) {
      curSec = 0;
      nextSec = 0;
      frac = 0;
    } else {
      curSec = Math.ceil(rem);
      nextSec = Math.max(0, curSec - 1);
      frac = timeState.fractionalSecond ?? ((1 - (rem % 1)) % 1);
    }
  }

  const curH = Math.floor(curSec / 3600);
  const curM = Math.floor((curSec % 3600) / 60);
  const curS = curSec % 60;

  const nextH = Math.floor(nextSec / 3600);
  const nextM = Math.floor((nextSec % 3600) / 60);
  const nextS = nextSec % 60;

  const targetSec = timeState.totalTargetSeconds ?? curSec;
  const showHours = !options.autoHideHours || curH > 0 || targetSec >= 3600;

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

  // 1. Draw Background (Clean dark studio vignette)
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.1,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75
  );
  bgGrad.addColorStop(0, theme.bgGradStart);
  bgGrad.addColorStop(1, theme.bgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Geometry & Scale
  const baseScale = width / 1920;
  const numPairs = showHours ? 3 : 2;

  // Card dimensions
  const cardWidth = 165 * baseScale;
  const cardHeight = 240 * baseScale;
  const cardGap = 16 * baseScale;
  const pairGap = 44 * baseScale;
  const cardRadius = 14 * baseScale;

  // Total cluster width
  const totalClockWidth =
    numPairs * (2 * cardWidth + cardGap) + (numPairs - 1) * pairGap;
  const startX = (width - totalClockWidth) / 2;
  const centerY = height / 2 - (options.showLabels ? 25 * baseScale : 0);

  // Flip-flop mechanical animation timing
  // Every changing digit uses pure split-flap flip-flop physics
  let flipProgress = 0;
  if (curSec > 0 && nextSec < curSec) {
    const flipWindow = 0.42; // last 42% of the second for a prominent, realistic flip
    if (frac >= 1 - flipWindow) {
      const rawP = Math.min(1, Math.max(0, (frac - (1 - flipWindow)) / flipWindow));
      
      if (options.animationMode === 'mechanical-snap') {
        // Fast snap with realistic spring gravity acceleration
        flipProgress = Math.min(1, Math.pow(rawP, 1.75));
      } else if (options.animationMode === 'cascade-flip') {
        // Harmonic flip with mechanical flap settle
        if (rawP < 0.88) {
          flipProgress = Math.sin((rawP / 0.88) * (Math.PI / 2));
        } else {
          const settleP = (rawP - 0.88) / 0.12;
          flipProgress = 1 - 0.025 * Math.sin(settleP * Math.PI);
        }
      } else {
        // Smooth sine 3D split-flap flip-flop
        flipProgress = (1 - Math.cos(rawP * Math.PI)) / 2;
      }
    }
  }

  // Draw pairs
  let currentX = startX;
  let digitIndex = 0;

  const pairLabels = showHours ? ['HOURS', 'MINUTES', 'SECONDS'] : ['MINUTES', 'SECONDS'];

  for (let pair = 0; pair < numPairs; pair++) {
    const pairStartX = currentX;

    // Draw Digit 1
    const d1Cur = curDigits[digitIndex];
    const d1Next = nextDigits[digitIndex];
    const d1Flipping = d1Cur !== d1Next;
    drawFlipCard(
      ctx,
      currentX,
      centerY - cardHeight / 2,
      cardWidth,
      cardHeight,
      cardRadius,
      d1Cur.toString(),
      d1Next.toString(),
      d1Flipping ? flipProgress : 0,
      theme,
      baseScale
    );
    digitIndex++;
    currentX += cardWidth + cardGap;

    // Draw Digit 2
    const d2Cur = curDigits[digitIndex];
    const d2Next = nextDigits[digitIndex];
    const d2Flipping = d2Cur !== d2Next;
    drawFlipCard(
      ctx,
      currentX,
      centerY - cardHeight / 2,
      cardWidth,
      cardHeight,
      cardRadius,
      d2Cur.toString(),
      d2Next.toString(),
      d2Flipping ? flipProgress : 0,
      theme,
      baseScale
    );
    digitIndex++;
    currentX += cardWidth;

    // Optional Label under pair
    if (options.showLabels) {
      const labelCenterX = pairStartX + (2 * cardWidth + cardGap) / 2;
      const labelY = centerY + cardHeight / 2 + 40 * baseScale;
      ctx.save();
      ctx.font = `700 ${16 * baseScale}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = theme.labelColor;
      ctx.letterSpacing = '4px';
      ctx.fillText(pairLabels[pair], labelCenterX, labelY);
      ctx.restore();
    }

    // Draw Colon Separator between pairs (if not last pair)
    if (pair < numPairs - 1) {
      const colonX = currentX + pairGap / 2;
      drawColonSeparator(
        ctx,
        colonX,
        centerY,
        cardHeight,
        theme,
        baseScale,
        frac
      );
      currentX += pairGap;
    }
  }

  // 3. Vignette & Subtle Cinema Border
  ctx.save();
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.45,
    width / 2,
    height / 2,
    width * 0.7
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // 4. Logo / Watermark Overlay
  if (options.watermark && options.watermark.enabled) {
    drawWatermark(ctx, width, height, options.watermark);
  }
}

/**
 * Draws custom watermark / logo with customizable opacity, position presets,
 * custom X/Y percentages, and size scaling.
 */
export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  watermark: WatermarkConfig
) {
  if (!watermark.enabled) return;

  const opacity = Math.max(0, Math.min(1, watermark.opacity ?? 0.8));
  if (opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;

  const scaleFrac = Math.max(0.04, Math.min(0.5, (watermark.scalePercent || 15) / 100));
  const padX = width * 0.04;
  const padY = height * 0.05;

  // Resolve target center/anchor coordinates
  let posX = 0;
  let posY = 0;
  let alignH: 'left' | 'right' | 'center' = 'left';
  let alignV: 'top' | 'bottom' | 'middle' = 'top';

  switch (watermark.positionPreset) {
    case 'top-left':
      posX = padX;
      posY = padY;
      alignH = 'left';
      alignV = 'top';
      break;
    case 'top-right':
      posX = width - padX;
      posY = padY;
      alignH = 'right';
      alignV = 'top';
      break;
    case 'bottom-left':
      posX = padX;
      posY = height - padY;
      alignH = 'left';
      alignV = 'bottom';
      break;
    case 'bottom-right':
      posX = width - padX;
      posY = height - padY;
      alignH = 'right';
      alignV = 'bottom';
      break;
    case 'center':
      posX = width / 2;
      posY = height / 2;
      alignH = 'center';
      alignV = 'middle';
      break;
    case 'custom':
    default:
      posX = (Math.max(0, Math.min(100, watermark.xPercent ?? 50)) / 100) * width;
      posY = (Math.max(0, Math.min(100, watermark.yPercent ?? 50)) / 100) * height;
      alignH = 'center';
      alignV = 'middle';
      break;
  }

  // 1. Image Watermark (Logo)
  if (watermark.type === 'image' && watermark.imageDataUrl) {
    const img = getOrLoadWatermarkImage(watermark.imageDataUrl);
    if (img && img.complete && img.naturalWidth > 0) {
      const imgTargetW = width * scaleFrac;
      const imgTargetH = imgTargetW * (img.naturalHeight / img.naturalWidth);

      let drawX = posX;
      let drawY = posY;

      if (alignH === 'right') drawX = posX - imgTargetW;
      else if (alignH === 'center') drawX = posX - imgTargetW / 2;

      if (alignV === 'bottom') drawY = posY - imgTargetH;
      else if (alignV === 'middle') drawY = posY - imgTargetH / 2;

      // Soft drop shadow behind watermark logo for crisp contrast against any theme
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.drawImage(img, drawX, drawY, imgTargetW, imgTargetH);
      ctx.restore();
      return;
    }
  }

  // 2. Text Watermark (Logo text fallback or explicit text mode)
  if (watermark.text && watermark.text.trim().length > 0) {
    const fontSize = Math.round(width * 0.024 * (scaleFrac / 0.15));
    ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = alignH;
    ctx.textBaseline = alignV === 'middle' ? 'middle' : alignV === 'bottom' ? 'bottom' : 'top';
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.fillText(watermark.text, posX, posY);
  }

  ctx.restore();
}

/**
 * Draws a single flip card with authentic split-flap upper and lower halves,
 * divider line, hinge cutouts, and 3D folding animation.
 */
function drawFlipCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  currentDigit: string,
  nextDigit: string,
  progress: number, // 0 to 1
  theme: ThemeColors,
  scale: number
) {
  const halfH = h / 2;
  const dividerH = Math.max(2, 3 * scale);
  const fontSize = Math.round(155 * scale);
  const font = `800 ${fontSize}px 'JetBrains Mono', -apple-system, sans-serif`;

  ctx.save();

  // Outer drop shadow for the whole card
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 24 * scale;
  ctx.shadowOffsetY = 12 * scale;
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Base Top Half (Static - shows NEXT digit once flip starts, or current digit)
  // When flip progress is happening:
  // - Top static background card shows the NEXT digit.
  // - Bottom static background card shows the CURRENT digit.
  // - Top falling flap shows CURRENT digit (folding down 0 -> 90 deg).
  // - Bottom falling flap shows NEXT digit (folding down 90 -> 180 deg).

  // 1. Static Top Half (Shows NEXT digit during flip, or CURRENT digit if idle)
  const topStaticDigit = progress > 0 ? nextDigit : currentDigit;
  drawCardHalf(
    ctx,
    x,
    y,
    w,
    halfH,
    radius,
    'top',
    topStaticDigit,
    font,
    theme,
    0,
    dividerH
  );

  // 2. Static Bottom Half (Shows CURRENT digit until covered)
  const bottomStaticDigit = progress >= 1 ? nextDigit : currentDigit;
  drawCardHalf(
    ctx,
    x,
    y + halfH,
    w,
    halfH,
    radius,
    'bottom',
    bottomStaticDigit,
    font,
    theme,
    0,
    dividerH
  );

  // Cast shadow on bottom half when top flap is folding down
  if (progress > 0 && progress < 0.5) {
    const castIntensity = Math.sin(progress * Math.PI) * 0.4;
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${castIntensity})`;
    ctx.fillRect(x, y + halfH, w, halfH);
    ctx.restore();
  }

  // 3. Dynamic 3D Folding Flaps during animation
  if (progress > 0 && progress < 1) {
    if (progress < 0.5) {
      // Upper flap folding down (0 -> 90 deg)
      const angle = progress * Math.PI; // 0 to PI/2
      const scaleY = Math.cos(angle); // 1 down to 0
      const flapShadow = Math.sin(angle) * 0.45;

      ctx.save();
      ctx.translate(x, y + halfH);
      ctx.scale(1, scaleY);
      ctx.translate(-x, -(y + halfH));

      drawCardHalf(
        ctx,
        x,
        y,
        w,
        halfH,
        radius,
        'top',
        currentDigit,
        font,
        theme,
        flapShadow,
        dividerH
      );
      ctx.restore();
    } else {
      // Lower flap completing the fall (90 -> 180 deg)
      const angle = progress * Math.PI; // PI/2 to PI
      const scaleY = -Math.cos(angle); // 0 up to 1
      const flapShadow = Math.sin(angle) * 0.45;

      ctx.save();
      ctx.translate(x, y + halfH);
      ctx.scale(1, scaleY);
      ctx.translate(-x, -(y + halfH));

      drawCardHalf(
        ctx,
        x,
        y + halfH,
        w,
        halfH,
        radius,
        'bottom',
        nextDigit,
        font,
        theme,
        flapShadow,
        dividerH
      );
      ctx.restore();
    }
  }

  // 4. Center Horizontal Divider Groove
  ctx.fillStyle = theme.dividerColor;
  ctx.fillRect(x, y + halfH - dividerH / 2, w, dividerH);

  // Inner subtle divider highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(x, y + halfH + dividerH / 2, w, Math.max(1, 1 * scale));

  // 5. Side Hinge Rivets / Cutouts
  const hingeW = 6 * scale;
  const hingeH = 14 * scale;
  ctx.fillStyle = theme.hingeColor;
  // Left hinge
  roundRect(
    ctx,
    x - hingeW / 2,
    y + halfH - hingeH / 2,
    hingeW,
    hingeH,
    2 * scale
  );
  ctx.fill();
  // Right hinge
  roundRect(
    ctx,
    x + w - hingeW / 2,
    y + halfH - hingeH / 2,
    hingeW,
    hingeH,
    2 * scale
  );
  ctx.fill();

  ctx.restore();
}

/**
 * Draws either the upper or lower half of a split-flap card with clipped typography.
 */
function drawCardHalf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  half: 'top' | 'bottom',
  digit: string,
  font: string,
  theme: ThemeColors,
  shadowIntensity: number,
  dividerH: number
) {
  ctx.save();

  // Clip to half bounds
  ctx.beginPath();
  if (half === 'top') {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.clip();

  // Background gradient for realistic lighting
  const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
  if (half === 'top') {
    cardGrad.addColorStop(0, theme.cardBg);
    cardGrad.addColorStop(1, theme.cardBottomBg);
  } else {
    cardGrad.addColorStop(0, theme.cardBottomBg);
    cardGrad.addColorStop(1, theme.cardBg);
  }
  ctx.fillStyle = cardGrad;
  ctx.fillRect(x, y, w, h);

  // Card border
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw Digit Text
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = theme.textColor;

  // Slight digit text glow if configured
  if (theme.glowColor && theme.glowColor !== 'transparent') {
    ctx.shadowColor = theme.glowColor;
    ctx.shadowBlur = 10;
  }

  // Text Y position: positioned at the center of the FULL card
  const fullCenterY = half === 'top' ? y + h : y;
  ctx.fillText(digit, x + w / 2, fullCenterY + 2);

  // Dynamic Flap Shadow overlay during 3D rotation
  if (shadowIntensity > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.7, shadowIntensity)})`;
    ctx.fillRect(x, y, w, h);
  }

  // Top half slight highlight sheen
  if (half === 'top') {
    const sheen = ctx.createLinearGradient(x, y, x, y + h * 0.4);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, w, h * 0.4);
  }

  ctx.restore();
}

/**
 * Draws colon dots separator between hours/minutes and minutes/seconds.
 */
function drawColonSeparator(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  cardH: number,
  theme: ThemeColors,
  scale: number,
  _fractionalSecond: number
) {
  const dotRadius = 9 * scale;
  const dotOffset = cardH * 0.22;

  ctx.save();
  ctx.fillStyle = theme.textColor;
  if (theme.glowColor && theme.glowColor !== 'transparent') {
    ctx.shadowColor = theme.glowColor;
    ctx.shadowBlur = 8 * scale;
  }

  // Top dot
  ctx.beginPath();
  ctx.arc(x, centerY - dotOffset, dotRadius, 0, Math.PI * 2);
  ctx.fill();

  // Bottom dot
  ctx.beginPath();
  ctx.arc(x, centerY + dotOffset, dotRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Dynamically formats the countdown title string for any timer duration (e.g. 10 HOURS -> "10 HOUR COUNTDOWN TIMER")
 */
export function formatDynamicCountdownTitle(hours: number, minutes: number, seconds: number): string {
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} HOUR`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} MINUTE`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} SECOND`);
  }
  return `${parts.join(' ')} COUNTDOWN TIMER`;
}

/**
 * Helper to wrap text cleanly across multiple lines on Canvas.
 */
function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Slide 1: Intro Slide (5 seconds)
 * [Title - Large & Centered] {DYNAMIC} COUNTDOWN TIMER  Deep Focus & Productivity
 * [Subtitle - Medium] Visit: blankscreen.cc Support the channel: buymeacoffee.com/prosun
 * [Bottom - Bold] Like, Share & Subscribe!
 */
export function drawIntroSlideFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timer: { hours: number; minutes: number; seconds: number },
  options: RenderOptions,
  slideProgress: number = 0 // 0.0 to 1.0 (fraction of slide duration)
) {
  const theme = THEMES[options.themeId] || THEMES['white-red'];
  const baseScale = Math.min(width / 1920, height / 1080);
  const isPortrait = height > width;

  // Background radial gradient
  const bgGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.1,
    width / 2, height / 2, Math.max(width, height) * 0.8
  );
  bgGrad.addColorStop(0, theme.bgGradStart);
  bgGrad.addColorStop(1, theme.bgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle animated entry opacity / zoom
  const alpha = slideProgress < 0.15 ? slideProgress / 0.15 : slideProgress > 0.88 ? (1 - slideProgress) / 0.12 : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0.01, Math.min(1, alpha));

  const introConfig = options.slides?.intro || {
    enabled: true,
    durationSeconds: 5,
    tagline: 'Deep Focus & Productivity',
    subtitle: 'Visit: blankscreen.cc  •  Support the channel: buymeacoffee.com/prosun',
    bottomCallout: 'Like, Share & Subscribe!',
  };

  const dynamicTimerTitle = formatDynamicCountdownTitle(timer.hours, timer.minutes, timer.seconds);

  // Central Card Container
  const cardW = isPortrait ? width * 0.9 : Math.min(width * 0.85, 1400 * baseScale);
  const cardH = isPortrait ? height * 0.75 : Math.min(height * 0.72, 680 * baseScale);
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;

  // Background Card with smooth border
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 35 * baseScale;
  ctx.shadowOffsetY = 18 * baseScale;
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24 * baseScale);
  ctx.fill();

  ctx.strokeStyle = theme.cardBorder || 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2 * baseScale;
  ctx.stroke();
  ctx.restore();

  // Top Pill Badge
  const badgeW = 280 * baseScale;
  const badgeH = 38 * baseScale;
  const badgeX = width / 2 - badgeW / 2;
  const badgeY = cardY + 45 * baseScale;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 19 * baseScale);
  ctx.fill();
  ctx.strokeStyle = theme.textColor;
  ctx.lineWidth = 1.5 * baseScale;
  ctx.stroke();

  ctx.fillStyle = theme.textColor;
  ctx.font = `700 ${Math.floor(14 * baseScale)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⏳ COUNTDOWN FOCUS SESSION', width / 2, badgeY + badgeH / 2);
  ctx.restore();

  // Large Dynamic Title
  ctx.save();
  ctx.fillStyle = theme.textColor;
  if (theme.glowColor && theme.glowColor !== 'transparent') {
    ctx.shadowColor = theme.glowColor;
    ctx.shadowBlur = 20 * baseScale;
  }
  ctx.font = `900 ${Math.floor(isPortrait ? 44 * baseScale : 62 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleY = cardY + (isPortrait ? 170 : 155) * baseScale;
  ctx.fillText(dynamicTimerTitle, width / 2, titleY);
  ctx.restore();

  // Tagline: "Deep Focus & Productivity"
  ctx.save();
  ctx.fillStyle = '#f4f4f5';
  ctx.font = `700 ${Math.floor(isPortrait ? 28 * baseScale : 36 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const taglineY = titleY + (isPortrait ? 60 : 65) * baseScale;
  ctx.fillText(introConfig.tagline || 'Deep Focus & Productivity', width / 2, taglineY);
  ctx.restore();

  // Accent Line Divider
  ctx.save();
  const divW = Math.min(cardW * 0.6, 500 * baseScale);
  const divX = (width - divW) / 2;
  const divY = taglineY + 45 * baseScale;
  const lineGrad = ctx.createLinearGradient(divX, divY, divX + divW, divY);
  lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  lineGrad.addColorStop(0.5, theme.textColor);
  lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(divX, divY, divW, 2.5 * baseScale);
  ctx.restore();

  // Subtitle: "Visit: blankscreen.cc Support the channel: buymeacoffee.com/prosun"
  ctx.save();
  ctx.fillStyle = '#a1a1aa';
  ctx.font = `600 ${Math.floor(isPortrait ? 18 * baseScale : 23 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const subY = divY + 55 * baseScale;
  ctx.fillText(introConfig.subtitle || 'Visit: blankscreen.cc   Support the channel: buymeacoffee.com/prosun', width / 2, subY);
  ctx.restore();

  // Bottom Callout Box: "Like, Share & Subscribe!"
  const calloutW = Math.min(cardW * 0.7, 480 * baseScale);
  const calloutH = 56 * baseScale;
  const calloutX = (width - calloutW) / 2;
  const calloutY = cardY + cardH - (isPortrait ? 100 : 90) * baseScale;

  ctx.save();
  ctx.fillStyle = theme.cardBottomBg || 'rgba(0, 0, 0, 0.4)';
  roundRect(ctx, calloutX, calloutY, calloutW, calloutH, 16 * baseScale);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5 * baseScale;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${Math.floor(isPortrait ? 20 * baseScale : 24 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(introConfig.bottomCallout || 'Like, Share & Subscribe!', width / 2, calloutY + calloutH / 2);
  ctx.restore();

  // Draw Bottom Progress Bar for the 5-sec slide
  ctx.save();
  const progW = cardW * 0.9;
  const progX = (width - progW) / 2;
  const progY = cardY + cardH - 16 * baseScale;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  roundRect(ctx, progX, progY, progW, 4 * baseScale, 2 * baseScale);
  ctx.fill();
  ctx.fillStyle = theme.textColor;
  roundRect(ctx, progX, progY, progW * Math.min(1, slideProgress), 4 * baseScale, 2 * baseScale);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Slide 2: Mandatory Disclaimer (5 seconds)
 * [Title - Medium & Centered] DISCLAIMER
 * [Body - Smaller Text] This video is for educational and entertainment purposes only and is not medical advice.
 * Do not drive or operate heavy machinery while listening. Please consult a physician regarding any medical conditions.
 */
export function drawDisclaimerSlideFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: RenderOptions,
  slideProgress: number = 0
) {
  const theme = THEMES[options.themeId] || THEMES['white-red'];
  const baseScale = Math.min(width / 1920, height / 1080);
  const isPortrait = height > width;

  // Radial Background
  const bgGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.1,
    width / 2, height / 2, Math.max(width, height) * 0.8
  );
  bgGrad.addColorStop(0, '#120d10');
  bgGrad.addColorStop(1, '#080507');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const alpha = slideProgress < 0.15 ? slideProgress / 0.15 : slideProgress > 0.88 ? (1 - slideProgress) / 0.12 : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0.01, Math.min(1, alpha));

  const disclaimerConfig = options.slides?.disclaimer || {
    enabled: true,
    durationSeconds: 5,
    title: 'DISCLAIMER',
    body: 'This video is for educational and entertainment purposes only and is not medical advice. Do not drive or operate heavy machinery while listening. Please consult a physician regarding any medical conditions.',
  };

  const cardW = isPortrait ? width * 0.9 : Math.min(width * 0.82, 1300 * baseScale);
  const cardH = isPortrait ? height * 0.72 : Math.min(height * 0.65, 580 * baseScale);
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;

  // Background Card
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 35 * baseScale;
  ctx.shadowOffsetY = 18 * baseScale;
  ctx.fillStyle = '#17171c';
  roundRect(ctx, cardX, cardY, cardW, cardH, 24 * baseScale);
  ctx.fill();

  ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'; // red accent border
  ctx.lineWidth = 2 * baseScale;
  ctx.stroke();
  ctx.restore();

  // Top Shield / Warning Badge
  const badgeW = 200 * baseScale;
  const badgeH = 36 * baseScale;
  const badgeX = width / 2 - badgeW / 2;
  const badgeY = cardY + 45 * baseScale;

  ctx.save();
  ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 18 * baseScale);
  ctx.fill();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5 * baseScale;
  ctx.stroke();

  ctx.fillStyle = '#fca5a5';
  ctx.font = `700 ${Math.floor(13 * baseScale)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚠️ NOTICE', width / 2, badgeY + badgeH / 2);
  ctx.restore();

  // Title: "DISCLAIMER"
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.floor(isPortrait ? 38 * baseScale : 52 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleY = cardY + 140 * baseScale;
  ctx.fillText(disclaimerConfig.title || 'DISCLAIMER', width / 2, titleY);
  ctx.restore();

  // Divider Line
  ctx.save();
  const divW = Math.min(cardW * 0.4, 300 * baseScale);
  const divX = (width - divW) / 2;
  const divY = titleY + 40 * baseScale;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
  ctx.fillRect(divX, divY, divW, 2 * baseScale);
  ctx.restore();

  // Body text wrapped
  ctx.save();
  ctx.fillStyle = '#e4e4e7';
  ctx.font = `500 ${Math.floor(isPortrait ? 19 * baseScale : 26 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const bodyText = disclaimerConfig.body ||
    'This video is for educational and entertainment purposes only and is not medical advice. Do not drive or operate heavy machinery while listening. Please consult a physician regarding any medical conditions.';

  const maxTextWidth = cardW * 0.85;
  const lines = wrapTextLines(ctx, bodyText, maxTextWidth);
  const lineHeight = (isPortrait ? 32 : 44) * baseScale;
  const textStartY = divY + 45 * baseScale;

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, textStartY + idx * lineHeight);
  });
  ctx.restore();

  // Progress bar
  ctx.save();
  const progW = cardW * 0.9;
  const progX = (width - progW) / 2;
  const progY = cardY + cardH - 16 * baseScale;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  roundRect(ctx, progX, progY, progW, 4 * baseScale, 2 * baseScale);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  roundRect(ctx, progX, progY, progW * Math.min(1, slideProgress), 4 * baseScale, 2 * baseScale);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Outro Slide (End of video, 5 seconds)
 * [Title - Large & Centered] TIME'S UP! Great job focusing today.
 * [Subtitle - Medium] For more timers, tools, and resources, visit: blankscreen.cc
 * [Bottom - Bold] If this timer helped you, please Like & Subscribe! (buymeacoffee.com/prosun)
 */
export function drawOutroSlideFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: RenderOptions,
  slideProgress: number = 0
) {
  const theme = THEMES[options.themeId] || THEMES['white-red'];
  const baseScale = Math.min(width / 1920, height / 1080);
  const isPortrait = height > width;

  // Background
  const bgGrad = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.1,
    width / 2, height / 2, Math.max(width, height) * 0.8
  );
  bgGrad.addColorStop(0, theme.bgGradStart);
  bgGrad.addColorStop(1, theme.bgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const alpha = slideProgress < 0.15 ? slideProgress / 0.15 : slideProgress > 0.88 ? (1 - slideProgress) / 0.12 : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0.01, Math.min(1, alpha));

  const outroConfig = options.slides?.outro || {
    enabled: true,
    durationSeconds: 5,
    title: "TIME'S UP! Great job focusing today.",
    subtitle: 'For more timers, tools, and resources, visit: blankscreen.cc',
    bottomCallout: 'If this timer helped you, please Like & Subscribe! (buymeacoffee.com/prosun)',
  };

  const cardW = isPortrait ? width * 0.9 : Math.min(width * 0.85, 1400 * baseScale);
  const cardH = isPortrait ? height * 0.75 : Math.min(height * 0.72, 680 * baseScale);
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2;

  // Card Background
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 35 * baseScale;
  ctx.shadowOffsetY = 18 * baseScale;
  ctx.fillStyle = theme.cardBg;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24 * baseScale);
  ctx.fill();

  ctx.strokeStyle = theme.cardBorder || 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2 * baseScale;
  ctx.stroke();
  ctx.restore();

  // Top Badge
  const badgeW = 240 * baseScale;
  const badgeH = 38 * baseScale;
  const badgeX = width / 2 - badgeW / 2;
  const badgeY = cardY + 45 * baseScale;

  ctx.save();
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 19 * baseScale);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5 * baseScale;
  ctx.stroke();

  ctx.fillStyle = '#6ee7b7';
  ctx.font = `700 ${Math.floor(14 * baseScale)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎉 SESSION COMPLETE', width / 2, badgeY + badgeH / 2);
  ctx.restore();

  // Main Outro Title: "TIME'S UP! Great job focusing today."
  ctx.save();
  ctx.fillStyle = theme.textColor;
  if (theme.glowColor && theme.glowColor !== 'transparent') {
    ctx.shadowColor = theme.glowColor;
    ctx.shadowBlur = 20 * baseScale;
  }
  ctx.font = `900 ${Math.floor(isPortrait ? 40 * baseScale : 56 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleY = cardY + 160 * baseScale;
  ctx.fillText(outroConfig.title || "TIME'S UP! Great job focusing today.", width / 2, titleY);
  ctx.restore();

  // Subtitle: "For more timers, tools, and resources, visit: blankscreen.cc"
  ctx.save();
  ctx.fillStyle = '#e4e4e7';
  ctx.font = `600 ${Math.floor(isPortrait ? 20 * baseScale : 26 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const subY = titleY + 70 * baseScale;
  ctx.fillText(outroConfig.subtitle || 'For more timers, tools, and resources, visit: blankscreen.cc', width / 2, subY);
  ctx.restore();

  // Divider Line
  ctx.save();
  const divW = Math.min(cardW * 0.5, 400 * baseScale);
  const divX = (width - divW) / 2;
  const divY = subY + 45 * baseScale;
  const lineGrad = ctx.createLinearGradient(divX, divY, divX + divW, divY);
  lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  lineGrad.addColorStop(0.5, '#10b981');
  lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(divX, divY, divW, 2.5 * baseScale);
  ctx.restore();

  // Bottom Box: "If this timer helped you, please Like & Subscribe! (buymeacoffee.com/prosun)"
  const calloutW = Math.min(cardW * 0.85, 780 * baseScale);
  const calloutH = 64 * baseScale;
  const calloutX = (width - calloutW) / 2;
  const calloutY = cardY + cardH - (isPortrait ? 110 : 100) * baseScale;

  ctx.save();
  ctx.fillStyle = theme.cardBottomBg || 'rgba(0, 0, 0, 0.4)';
  roundRect(ctx, calloutX, calloutY, calloutW, calloutH, 18 * baseScale);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1.5 * baseScale;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${Math.floor(isPortrait ? 17 * baseScale : 22 * baseScale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    outroConfig.bottomCallout || 'If this timer helped you, please Like & Subscribe! (buymeacoffee.com/prosun)',
    width / 2,
    calloutY + calloutH / 2
  );
  ctx.restore();

  // Progress bar
  ctx.save();
  const progW = cardW * 0.9;
  const progX = (width - progW) / 2;
  const progY = cardY + cardH - 16 * baseScale;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  roundRect(ctx, progX, progY, progW, 4 * baseScale, 2 * baseScale);
  ctx.fill();
  ctx.fillStyle = '#10b981';
  roundRect(ctx, progX, progY, progW * Math.min(1, slideProgress), 4 * baseScale, 2 * baseScale);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
