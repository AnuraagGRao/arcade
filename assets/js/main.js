/**
 * Arcade Hub Web Audio & Starfield Engine
 */

class ArcadeUI {
  constructor() {
    this.canvas = document.getElementById('starfield');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.stars = [];
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('arcade_muted') === 'true';

    this.initCanvas();
    this.initAudioToggle();
    this.bindHoverSounds();
    this.animate();
  }

  initCanvas() {
    if (!this.canvas || !this.ctx) return;
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.createStars();
    };
    window.addEventListener('resize', resize);
    resize();
  }

  createStars() {
    this.stars = [];
    const count = Math.floor((this.canvas.width * this.canvas.height) / 7000);
    const colors = ['#ffffff', '#38bdf8', '#818cf8', '#f59e0b', '#34d399'];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 1.8 + 0.4,
        speed: Math.random() * 0.35 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }
  }

  animate() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const star of this.stars) {
      star.y -= star.speed;
      if (star.y < 0) {
        star.y = this.canvas.height;
        star.x = Math.random() * this.canvas.width;
      }
      star.alpha += Math.sin(Date.now() * star.pulseSpeed) * 0.01;
      star.alpha = Math.max(0.2, Math.min(0.9, star.alpha));

      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = star.alpha;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }

  getAudioCtx() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playBlip() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  playCoin() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioCtx();
      const now = ctx.currentTime;

      // Note 1 (B5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      // Note 2 (E6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.14, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.36);
    } catch {}
  }

  initAudioToggle() {
    const btn = document.getElementById('audioToggle');
    if (!btn) return;

    const updateLabel = () => {
      btn.innerHTML = this.isMuted 
        ? '<span>🔇</span> SFX: OFF' 
        : '<span>🔊</span> SFX: ON';
    };
    updateLabel();

    btn.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      localStorage.setItem('arcade_muted', this.isMuted.toString());
      updateLabel();
      if (!this.isMuted) {
        this.playCoin();
      }
    });
  }

  bindHoverSounds() {
    const interactive = document.querySelectorAll('.game-card, .btn-launch, .btn-repo, .track-item');
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => this.playBlip());
    });

    const launchBtns = document.querySelectorAll('.btn-launch');
    launchBtns.forEach(btn => {
      btn.addEventListener('click', () => this.playCoin());
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ArcadeUI();
});
