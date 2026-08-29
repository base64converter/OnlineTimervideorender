/**
 * Generates a completely standalone, zero-dependency single .html file
 * containing the full flip-clock canvas renderer, WebCodecs VideoEncoder engine,
 * and built-in pure JavaScript WebM/Matroska EBML muxer.
 * Works offline on any browser with WebCodecs (Chrome, Edge, Opera, etc).
 */
export function generateStandaloneHtmlFile(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fast Flip-Clock Countdown Video Generator</title>
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #18181b;
      --border: #27272a;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --primary: #e11d48;
      --primary-hover: #be123c;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }
    .container {
      width: 100%;
      max-width: 900px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    header {
      text-align: center;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.5rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(225, 29, 72, 0.15);
      color: #f43f5e;
      border: 1px solid rgba(225, 29, 72, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
    }
    .inputs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    input[type="number"], select {
      background: #0f0f11;
      border: 1px solid var(--border);
      color: #fff;
      font-size: 1.5rem;
      font-family: monospace;
      font-weight: 700;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      text-align: center;
      width: 100%;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="number"]:focus, select:focus {
      border-color: var(--primary);
    }
    .btn-row {
      display: flex;
      gap: 1rem;
      margin-top: 1.25rem;
    }
    button {
      flex: 1;
      background: var(--primary);
      color: white;
      border: none;
      font-size: 1rem;
      font-weight: 700;
      padding: 0.85rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background-color 0.2s, transform 0.1s;
    }
    button:hover:not(:disabled) {
      background: var(--primary-hover);
    }
    button:active:not(:disabled) {
      transform: scale(0.98);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .canvas-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }
    .progress-box {
      margin-top: 1rem;
      display: none;
      flex-direction: column;
      gap: 0.75rem;
    }
    .progress-bar-bg {
      width: 100%;
      height: 12px;
      background: #27272a;
      border-radius: 6px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #e11d48, #f43f5e);
      transition: width 0.1s linear;
    }
    .stats-row {
      display: flex;
      justify-content: space-between;
      font-family: monospace;
      font-size: 0.85rem;
      color: var(--muted);
    }
    .status-highlight {
      color: #f43f5e;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="badge">Hardware Accelerated (WebCodecs)</span>
      <h1>Countdown Video Generator</h1>
      <p style="color: var(--muted); font-size: 0.9rem;">Standalone Frame-by-Frame Flip Clock Video Renderer</p>
    </header>

    <div class="card">
      <div class="inputs-grid">
        <div class="input-group">
          <label for="hours">Hours</label>
          <input type="number" id="hours" min="0" max="99" value="0">
        </div>
        <div class="input-group">
          <label for="minutes">Minutes</label>
          <input type="number" id="minutes" min="0" max="59" value="5">
        </div>
        <div class="input-group">
          <label for="seconds">Seconds</label>
          <input type="number" id="seconds" min="0" max="59" value="0">
        </div>
      </div>

      <div class="btn-row">
        <button id="renderBtn" onclick="startRender()">
          <span>Render 1080p Video</span>
        </button>
        <button id="cancelBtn" onclick="cancelRender()" style="background: #27272a; display: none;">
          Cancel
        </button>
      </div>

      <div class="progress-box" id="progressBox">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progressBar"></div>
        </div>
        <div class="stats-row">
          <span id="statusText" class="status-highlight">Preparing encoder...</span>
          <span id="speedText">0 FPS</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="canvas-container">
        <canvas id="previewCanvas" width="1920" height="1080"></canvas>
      </div>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    let isRendering = false;
    let cancelRequested = false;

    // Draw initial preview with authentic split-flap flip-flop
    function drawFlipClock(h, m, s, frac = 0) {
      const w = 1920, height = 1080;
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, w, height);

      // Background grid
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      for(let x=0; x<w; x+=60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }

      const totalSec = h * 3600 + m * 60 + s;
      const nextTotalSec = Math.max(0, totalSec - 1);

      const nextH = Math.floor(nextTotalSec / 3600);
      const nextM = Math.floor((nextTotalSec % 3600) / 60);
      const nextS = nextTotalSec % 60;

      const digits = [
        Math.floor(h / 10), h % 10,
        Math.floor(m / 10), m % 10,
        Math.floor(s / 10), s % 10
      ];

      const nextDigits = [
        Math.floor(nextH / 10), nextH % 10,
        Math.floor(nextM / 10), nextM % 10,
        Math.floor(nextS / 10), nextS % 10
      ];

      // Flip progress in last 40% of second
      let flipP = 0;
      if (totalSec > 0 && frac >= 0.6) {
        const raw = (frac - 0.6) / 0.4;
        flipP = (1 - Math.cos(raw * Math.PI)) / 2;
      }

      const cardW = 165, cardH = 240, cardGap = 16, pairGap = 44, halfH = cardH / 2;
      const totalW = 3 * (2 * cardW + cardGap) + 2 * pairGap;
      let startX = (w - totalW) / 2;
      const centerY = height / 2;

      let dIdx = 0;
      for (let p = 0; p < 3; p++) {
        for (let d = 0; d < 2; d++) {
          const curVal = digits[dIdx];
          const nextVal = nextDigits[dIdx];
          const isFlipping = curVal !== nextVal;
          const progress = isFlipping ? flipP : 0;
          dIdx++;

          const cardX = startX;
          const cardY = centerY - halfH;

          // Shadow
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 24;
          ctx.shadowOffsetY = 12;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, 14);
          ctx.fill();
          ctx.restore();

          // Static Top Half (Shows NEXT digit during flip)
          drawHalf(cardX, cardY, cardW, halfH, 'top', progress > 0 ? nextVal : curVal);

          // Static Bottom Half (Shows CURRENT digit)
          drawHalf(cardX, cardY + halfH, cardW, halfH, 'bottom', progress >= 1 ? nextVal : curVal);

          // Dynamic Flip Flap
          if (progress > 0 && progress < 1) {
            if (progress < 0.5) {
              const angle = progress * Math.PI;
              ctx.save();
              ctx.translate(cardX, cardY + halfH);
              ctx.scale(1, Math.cos(angle));
              ctx.translate(-cardX, -(cardY + halfH));
              drawHalf(cardX, cardY, cardW, halfH, 'top', curVal, Math.sin(angle) * 0.4);
              ctx.restore();
            } else {
              const angle = progress * Math.PI;
              ctx.save();
              ctx.translate(cardX, cardY + halfH);
              ctx.scale(1, -Math.cos(angle));
              ctx.translate(-cardX, -(cardY + halfH));
              drawHalf(cardX, cardY + halfH, cardW, halfH, 'bottom', nextVal, Math.sin(angle) * 0.4);
              ctx.restore();
            }
          }

          // Center Divider
          ctx.fillStyle = '#18181b';
          ctx.fillRect(cardX, centerY - 1.5, cardW, 3);

          // Hinges
          ctx.fillStyle = '#27272a';
          ctx.beginPath();
          ctx.roundRect(cardX - 3, centerY - 7, 6, 14, 2);
          ctx.roundRect(cardX + cardW - 3, centerY - 7, 6, 14, 2);
          ctx.fill();

          startX += cardW + (d === 0 ? cardGap : 0);
        }
        if (p < 2) {
          // Colon dots
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(startX + pairGap / 2, centerY - 35, 9, 0, Math.PI * 2);
          ctx.arc(startX + pairGap / 2, centerY + 35, 9, 0, Math.PI * 2);
          ctx.fill();
          startX += pairGap;
        }
      }
    }

    function drawHalf(x, y, w, h, half, digit, shadow = 0) {
      ctx.save();
      ctx.beginPath();
      if (half === 'top') {
        ctx.roundRect(x, y, w, h, [14, 14, 0, 0]);
      } else {
        ctx.roundRect(x, y, w, h, [0, 0, 14, 14]);
      }
      ctx.clip();

      ctx.fillStyle = half === 'top' ? '#fdfdfd' : '#f0f0f2';
      ctx.fillRect(x, y, w, h);

      ctx.font = "800 155px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#e11d48";
      ctx.fillText(digit, x + w / 2, half === 'top' ? y + h : y);

      if (shadow > 0) {
        ctx.fillStyle = 'rgba(0,0,0,' + shadow + ')';
        ctx.fillRect(x, y, w, h);
      }
      ctx.restore();
    }

    // Initial render
    drawFlipClock(0, 5, 0);

    // Update canvas preview on input change
    ['hours', 'minutes', 'seconds'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        if (!isRendering) {
          const h = parseInt(document.getElementById('hours').value) || 0;
          const m = parseInt(document.getElementById('minutes').value) || 0;
          const s = parseInt(document.getElementById('seconds').value) || 0;
          drawFlipClock(h, m, s);
        }
      });
    });

    async function startRender() {
      if (typeof VideoEncoder === 'undefined') {
        alert('WebCodecs API is not supported in this browser. Please use Chrome, Opera, or Edge.');
        return;
      }

      const h = parseInt(document.getElementById('hours').value) || 0;
      const m = parseInt(document.getElementById('minutes').value) || 0;
      const s = parseInt(document.getElementById('seconds').value) || 0;
      const totalSec = h * 3600 + m * 60 + s;

      if (totalSec <= 0) {
        alert('Please enter a duration greater than 0 seconds.');
        return;
      }

      isRendering = true;
      cancelRequested = false;
      document.getElementById('renderBtn').disabled = true;
      document.getElementById('cancelBtn').style.display = 'inline-flex';
      document.getElementById('progressBox').style.display = 'flex';

      const fps = 30;
      const totalFrames = totalSec * fps;
      const frameDurationMicros = 1000000 / fps;

      // Pure JS WebM Writer
      const chunks = [];
      let lastKeyFrame = 0;

      const encoder = new VideoEncoder({
        output: (chunk, meta) => {
          const buf = new Uint8Array(chunk.byteLength);
          chunk.copyTo(buf);
          chunks.push({
            data: buf,
            isKey: chunk.type === 'key',
            timestamp: chunk.timestamp
          });
        },
        error: (e) => console.error(e)
      });

      await encoder.configure({
        codec: 'vp8',
        width: 1920,
        height: 1080,
        bitrate: 8000000,
        framerate: fps
      });

      const startTime = performance.now();

      for (let f = 0; f < totalFrames; f++) {
        if (cancelRequested) {
          encoder.close();
          finishUI();
          return;
        }

        const secRemaining = Math.max(0, totalSec - Math.floor(f / fps));
        const curH = Math.floor(secRemaining / 3600);
        const curM = Math.floor((secRemaining % 3600) / 60);
        const curS = secRemaining % 60;

        drawFlipClock(curH, curM, curS, (f % fps) / fps);

        const vf = new VideoFrame(canvas, {
          timestamp: f * frameDurationMicros,
          duration: frameDurationMicros
        });

        encoder.encode(vf, { keyFrame: f % 60 === 0 });
        vf.close();

        if (f % 5 === 0 || f === totalFrames - 1) {
          const pct = Math.round(((f + 1) / totalFrames) * 100);
          document.getElementById('progressBar').style.width = pct + '%';
          const pad = n => String(n).padStart(2, '0');
          document.getElementById('statusText').innerText =
            'Rendering ' + pad(curH) + ':' + pad(curM) + ':' + pad(curS) + '... (' + pct + '%)';

          const elapsedSec = (performance.now() - startTime) / 1000;
          const currentFps = Math.round((f + 1) / (elapsedSec || 0.001));
          document.getElementById('speedText').innerText = currentFps + ' FPS (' + (currentFps / fps).toFixed(1) + 'x)';
          await new Promise(r => setTimeout(r, 0));
        }
      }

      document.getElementById('statusText').innerText = 'Muxing WebM container...';
      await encoder.flush();
      encoder.close();

      // Simple WebM Container Packager
      const blob = packageSimpleWebM(chunks, 1920, 1080, totalSec * 1000);
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flip-countdown-' + totalSec + 's.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      document.getElementById('statusText').innerText = 'Complete! Video Downloaded.';
      finishUI();
    }

    function cancelRender() {
      cancelRequested = true;
    }

    function finishUI() {
      isRendering = false;
      document.getElementById('renderBtn').disabled = false;
      document.getElementById('cancelBtn').style.display = 'none';
    }

    // Lightweight EBML WebM packager
    function packageSimpleWebM(chunks, width, height, durationMs) {
      function vint(val) {
        if (val < 0x7f) return [0x80 | val];
        if (val < 0x3fff) return [0x40 | (val >> 8), val & 0xff];
        if (val < 0x1fffff) return [0x20 | (val >> 16), (val >> 8) & 0xff, val & 0xff];
        return [0x10 | (val >> 24), (val >> 16) & 0xff, (val >> 8) & 0xff, val & 0xff];
      }
      function el(id, data) {
        const idBytes = [];
        let temp = id;
        while (temp > 0) { idBytes.unshift(temp & 0xff); temp >>= 8; }
        const lenBytes = vint(data.length);
        const res = new Uint8Array(idBytes.length + lenBytes.length + data.length);
        res.set(idBytes, 0);
        res.set(lenBytes, idBytes.length);
        res.set(data, idBytes.length + lenBytes.length);
        return res;
      }
      function concat(...arrays) {
        const total = arrays.reduce((acc, a) => acc + a.length, 0);
        const res = new Uint8Array(total);
        let offset = 0;
        for (const a of arrays) { res.set(a, offset); offset += a.length; }
        return res;
      }

      // EBML Header
      const header = el(0x1a45dfa3, concat(
        el(0x4286, new Uint8Array([1])),
        el(0x42f7, new Uint8Array([1])),
        el(0x42f2, new Uint8Array([4])),
        el(0x42f3, new Uint8Array([8])),
        el(0x4282, new TextEncoder().encode('webm')),
        el(0x4287, new Uint8Array([2])),
        el(0x4285, new Uint8Array([2]))
      ));

      // Segment Info
      const info = el(0x1549a966, concat(
        el(0x2ad7b1, new Uint8Array([0x0f, 0x42, 0x40])), // TimecodeScale = 1,000,000 (1ms)
        el(0x4d80, new TextEncoder().encode('WebCodecsFastRenderer'))
      ));

      // Tracks
      const trackEntry = el(0xae, concat(
        el(0xd7, new Uint8Array([1])), // TrackNumber
        el(0x73c5, new Uint8Array([1])), // TrackUID
        el(0x83, new Uint8Array([1])), // Video Type
        el(0x86, new TextEncoder().encode('V_VP8')),
        el(0xe0, concat(
          el(0xb0, vint(width)),
          el(0xba, vint(height))
        ))
      ));
      const tracks = el(0x1654ae6b, trackEntry);

      // Cluster containing SimpleBlocks
      const blockBytes = [];
      for (const chunk of chunks) {
        const timecode = Math.round(chunk.timestamp / 1000); // ms
        const flags = chunk.isKey ? 0x80 : 0x00;
        const blockHeader = new Uint8Array([
          0x81, // Track 1
          (timecode >> 8) & 0xff,
          timecode & 0xff,
          flags
        ]);
        const blockData = concat(blockHeader, chunk.data);
        blockBytes.push(el(0xa3, blockData));
      }

      const cluster = el(0x1f43b675, concat(
        el(0xe7, new Uint8Array([0])), // Timecode 0
        ...blockBytes
      ));

      const segment = el(0x18538067, concat(info, tracks, cluster));
      const webmFile = concat(header, segment);
      return new Blob([webmFile], { type: 'video/webm' });
    }
  </script>
</body>
</html>`;
}
