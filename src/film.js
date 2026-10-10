/* Canvas film player: iOS-proof scroll-scrubbed "video".
 * Frames are JPEGs at /films/<name>/f_001.jpg ... f_NNN.jpg.
 * Draws frame 0 the moment it loads (never a black box), then streams the rest.
 * draw(p) maps scroll progress 0..1 to frames. play() runs an rAF loop over a range.
 */
export class Film {
  constructor(canvas, name, count, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.base = `/films/${name}/f_`;
    this.count = count;
    this.frames = new Array(count).fill(null);
    this.loaded = 0;
    this.current = -1;
    this.playing = false;
    this.onFirstFrame = opts.onFirstFrame || (() => {});
    this._firstDrawn = false;
    this._raf = 0;
    this._t0 = 0;
    this._from = 0; this._to = count - 1; this._fps = 6;
    this.resize();
    addEventListener('resize', () => this.resize(), { passive: true });
    this._preload();
  }

  resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = this.canvas.clientWidth || 1280;
    const h = this.canvas.clientHeight || 720;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this._dpr = dpr;
    if (this.current >= 0) this._blit(this.current);
  }

  _preload() {
    // Frame 1 first (index 0), then stream the rest 4-at-a-time.
    const load = (i) => new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        this.frames[i] = img; this.loaded++;
        if (i === 0) { this._blit(0); this.current = 0; this._firstDrawn = true; this.onFirstFrame(); }
        res();
      };
      img.onerror = () => res();
      img.src = `${this.base}${String(i + 1).padStart(3, '0')}.jpg`;
    });
    load(0).then(async () => {
      const queue = [];
      for (let i = 1; i < this.count; i++) queue.push(i);
      const workers = Array.from({ length: 4 }, async () => {
        while (queue.length) { await load(queue.shift()); }
      });
      await Promise.all(workers);
    });
  }

  _blit(i) {
    const img = this.frames[i];
    if (!img) return;
    const c = this.canvas, x = this.ctx;
    const cw = c.width, ch = c.height;
    // Portrait viewport (mobile): contain-fit so the 16:9 film is never cropped.
    // Landscape/desktop: cover-fit for the full-bleed cinematic frame.
    const s = ch > cw
      ? Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
      : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    x.fillStyle = '#000';
    x.fillRect(0, 0, cw, ch);
    x.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  draw(progress) {
    const i = Math.max(0, Math.min(this.count - 1, Math.floor(progress * this.count)));
    if (i === this.current) return;
    // Use nearest loaded frame at or before i (never blank once frame 0 exists)
    let j = i;
    while (j > 0 && !this.frames[j]) j--;
    if (!this.frames[j]) return;
    this.current = j;
    this._blit(j);
  }

  play(from = 0, to = null, fps = 6) {
    this.stop();
    this._from = from; this._to = to === null ? this.count - 1 : to; this._fps = fps;
    this._t0 = performance.now();
    this.playing = true;
    const step = (now) => {
      if (!this.playing) return;
      const el = (now - this._t0) / 1000;
      const span = this._to - this._from + 1;
      const i = this._from + Math.floor(el * this._fps) % span;
      this.draw(i / (this.count - 1));
      this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  }

  stop() { this.playing = false; cancelAnimationFrame(this._raf); }
}
