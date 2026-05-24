(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const RED = 'rgba(255,70,85,';
  const CYAN = 'rgba(0,200,190,';
  const WHITE = 'rgba(236,232,225,';
  const NUM_BLOCKS = 28;

  class Block {
    constructor() { this.reset(true); }

    reset(initial) {
      this.x = Math.random() * (W || 1200);
      this.y = initial ? Math.random() * (H || 800) : (H || 800) + 20;
      this.w = 4 + Math.random() * 80;
      this.h = 2 + Math.random() * 18;

      if (Math.random() < 0.3) {
        this.w = 3 + Math.random() * 10;
        this.h = 3 + Math.random() * 10;
      }

      this.vy = -(0.12 + Math.random() * 0.35);
      this.vx = (Math.random() - 0.5) * 0.18;

      this.alpha = 0.04 + Math.random() * 0.18;
      this.alphaBase = this.alpha;
      this.alphaSpeed = 0.003 + Math.random() * 0.007;
      this.alphaPhase = Math.random() * Math.PI * 2;

      this.glitchTimer = 60 + Math.random() * 200;
      this.glitchCountdown = this.glitchTimer;
      this.glitching = false;
      this.glitchDuration = 0;
      this.glitchOffsetX = 0;

      const r = Math.random();
      this.colorBase = r < 0.70 ? RED : r < 0.90 ? CYAN : WHITE;

      this.filled = Math.random() < 0.45;
      this.scaleX = 1;
      this.scaleSpeed = 0.008 + Math.random() * 0.012;
      this.scalePhase = Math.random() * Math.PI * 2;
    }

    update(t) {
      this.y += this.vy;
      this.x += this.vx;

      this.alpha = this.alphaBase * (0.5 + 0.5 * Math.sin(t * this.alphaSpeed + this.alphaPhase));
      this.scaleX = 0.8 + 0.4 * Math.abs(Math.sin(t * this.scaleSpeed + this.scalePhase));

      this.glitchCountdown--;
      if (this.glitchCountdown <= 0 && !this.glitching) {
        this.glitching = true;
        this.glitchDuration = 3 + Math.floor(Math.random() * 6);
        this.glitchOffsetX = (Math.random() - 0.5) * 40;
        this.alpha = Math.min(1, this.alphaBase * 3.5);
      }
      if (this.glitching) {
        this.glitchDuration--;
        if (this.glitchDuration <= 0) {
          this.glitching = false;
          this.glitchCountdown = this.glitchTimer * (0.7 + Math.random() * 0.6);
          this.glitchOffsetX = 0;
        }
      }

      if (this.y < -40) this.reset(false);
    }

    draw(ctx) {
      const dx = this.x + (this.glitching ? this.glitchOffsetX : 0);
      const dy = this.y;
      const dw = this.w * this.scaleX;
      const dh = this.h;

      ctx.save();
      const a = Math.max(0, Math.min(1, this.alpha));
      if (this.filled) {
        ctx.fillStyle = this.colorBase + a + ')';
        ctx.fillRect(dx, dy, dw, dh);
      } else {
        ctx.strokeStyle = this.colorBase + a + ')';
        ctx.lineWidth   = 1;
        ctx.strokeRect(dx + 0.5, dy + 0.5, dw - 1, dh - 1);
      }

      if (this.glitching) {
        ctx.globalAlpha = a * 0.4;
        if (this.filled) {
          ctx.fillStyle = this.colorBase + (a * 0.4) + ')';
          ctx.fillRect(dx - this.glitchOffsetX * 0.6, dy + 2, dw, dh);
        } else {
          ctx.strokeStyle = this.colorBase + (a * 0.4) + ')';
          ctx.strokeRect(dx - this.glitchOffsetX * 0.6 + 0.5, dy + 2 + 0.5, dw - 1, dh - 1);
        }
      }
      ctx.restore();
    }
  }

  class Scanline {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * (W || 1200);
      this.y = initial ? Math.random() * (H || 800) : -4;
      this.w = 30 + Math.random() * 200;
      this.vy = 0.2 + Math.random() * 0.5;
      this.alpha = 0.03 + Math.random() * 0.07;
    }
    update() {
      this.y += this.vy;
      if (this.y > (H || 800) + 4) this.reset(false);
    }
    draw(ctx) {
      ctx.save();
      ctx.fillStyle = RED + this.alpha + ')';
      ctx.fillRect(this.x, this.y, this.w, 1);
      ctx.restore();
    }
  }

  const blocks = Array.from({ length: NUM_BLOCKS }, () => new Block());
  const scanlines = Array.from({ length: 12 }, () => new Scanline());

  let t = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.strokeStyle = 'rgba(255,70,85,0.025)';
    ctx.lineWidth = 0.5;
    const step = 60;
    for (let i = -H; i < W + H; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }
    ctx.restore();

    scanlines.forEach(s => { s.update(); s.draw(ctx); });
    blocks.forEach(b => { b.update(t); b.draw(ctx); });

    t++;
    requestAnimationFrame(loop);
  }
  loop();
})();
