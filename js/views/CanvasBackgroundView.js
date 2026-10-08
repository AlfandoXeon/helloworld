import { DomUtils } from '../core/DomUtils.js';
import { MathUtils } from '../core/MathUtils.js';

/**
 * CanvasBackgroundView - High-Performance Interactive Particle Nebula
 */
export class CanvasBackgroundView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   * @param {import('../models/ThemeModel.js').ThemeModel} themeModel 
   */
  constructor(eventBus, stateModel, themeModel) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;
    this._themeModel = themeModel;

    this._canvas = DomUtils.$('#canvas-bg');
    this._ctx = this._canvas ? this._canvas.getContext('2d') : null;

    this._particles = [];
    this._particleCount = window.innerWidth < 768 ? 45 : 95;
    this._maxDistance = 140;

    this._particleColor = '245, 158, 11';
    this._secondaryColor = '6, 182, 212';

    this._initCanvas();
    this._createParticles();
    this._bindEvents();
  }

  _bindEvents() {
    this._eventBus.on('viewport:resized', () => {
      this._initCanvas();
      this._createParticles();
    });

    this._eventBus.on('theme:changed', (theme) => {
      if (theme && theme.particleColor) {
        this._particleColor = theme.particleColor;
      }
    });
  }

  _initCanvas() {
    if (!this._canvas || !this._ctx) return;
    const { width, height, dpr } = this._stateModel.viewport;

    this._canvas.width = width * dpr;
    this._canvas.height = height * dpr;
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._ctx.scale(dpr, dpr);
  }

  _createParticles() {
    const { width, height } = this._stateModel.viewport;
    this._particles = [];

    for (let i = 0; i < this._particleCount; i++) {
      this._particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 1.5 + 0.8,
        baseAlpha: Math.random() * 0.2 + 0.08,
        currentAlpha: 0.1
      });
    }
  }

  /**
   * Render frame
   */
  render() {
    if (!this._ctx || !this._canvas) return;

    const { width, height } = this._stateModel.viewport;
    const mouse = this._stateModel.mouse;
    const isZeroG = this._stateModel.isZeroG;

    this._ctx.clearRect(0, 0, width, height);

    // Update & draw particles
    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];

      // Mouse repulsion / attraction
      const dx = mouse.targetX - p.x;
      const dy = mouse.targetY - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 180) {
        const force = (180 - dist) / 180;
        const angle = Math.atan2(dy, dx);
        const factor = mouse.isDown ? 2.5 : -2; // Attract on click, repel on hover

        p.x += Math.cos(angle) * force * factor;
        p.y += Math.sin(angle) * force * factor;
      }

      // Movement
      p.x += p.vx * (isZeroG ? 3.0 : 1.0);
      p.y += p.vy * (isZeroG ? 3.0 : 1.0);

      // Bounce/wrap borders
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle circle
      this._ctx.beginPath();
      this._ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this._ctx.fillStyle = `rgba(${this._particleColor}, ${p.baseAlpha})`;
      this._ctx.fill();

      // Proximity lines
      for (let j = i + 1; j < this._particles.length; j++) {
        const p2 = this._particles[j];
        const lineDist = Math.hypot(p2.x - p.x, p2.y - p.y);

        if (lineDist < this._maxDistance) {
          const alpha = (1 - lineDist / this._maxDistance) * 0.25;
          this._ctx.beginPath();
          this._ctx.moveTo(p.x, p.y);
          this._ctx.lineTo(p2.x, p2.y);
          this._ctx.strokeStyle = `rgba(${this._particleColor}, ${alpha})`;
          this._ctx.lineWidth = 0.8;
          this._ctx.stroke();
        }
      }
    }
  }

  get canvas() {
    return this._canvas;
  }
}
