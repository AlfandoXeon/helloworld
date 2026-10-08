import { DomUtils } from '../core/DomUtils.js';

/**
 * ExportView - High-Resolution Design Snapshot & PNG Downloader
 * Renders pristine 4K wallpapers compositing WebGL 3D particles, 
 * 2D constellation network, ambient cyber grid, and kinetic typography.
 */
export class ExportView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   * @param {import('../models/ThemeModel.js').ThemeModel} themeModel 
   * @param {import('./ThreeSceneView.js').ThreeSceneView} threeSceneView 
   * @param {import('./CanvasBackgroundView.js').CanvasBackgroundView} canvasBgView 
   */
  constructor(eventBus, stateModel, themeModel, threeSceneView, canvasBgView) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;
    this._themeModel = themeModel;
    this._threeSceneView = threeSceneView;
    this._canvasBgView = canvasBgView;

    this._isExporting = false;
    this._flashOverlay = DomUtils.$('#export-flash-overlay');
    this._toast = DomUtils.$('#export-toast');
    this._toastMsg = DomUtils.$('#export-toast-msg');

    this._bindEvents();
  }

  _bindEvents() {
    this._eventBus.on('ui:exportDesign', () => {
      this.exportDesign();
    });
  }

  /**
   * Trigger the full export sequence
   */
  async exportDesign() {
    if (this._isExporting) return;
    this._isExporting = true;

    try {
      // 1. Audio shutter sound cue
      this._eventBus.emit('ui:shutterSound');

      // 2. Camera flash visual feedback
      this._triggerFlash();

      // 3. Immediately render 3D scene to ensure latest WebGL buffer
      if (this._threeSceneView && typeof this._threeSceneView.renderImmediate === 'function') {
        this._threeSceneView.renderImmediate();
      }

      // 4. Generate high-resolution composite canvas
      const compositeCanvas = await this._renderCompositeCanvas();
      if (!compositeCanvas) {
        throw new Error('Canvas render failed');
      }

      // 5. Generate filename based on current text and theme
      const filename = this._generateFilename();

      // 6. Download PNG
      await this._downloadCanvas(compositeCanvas, filename);

      // 7. Show success toast notification
      const dimStr = `${compositeCanvas.width}×${compositeCanvas.height}`;
      this._showToast(`📸 DESIGN SAVED // ${filename} (${dimStr})`);

    } catch (err) {
      console.error('Export error:', err);
      this._showToast('⚠️ Export failed. Please try again.');
    } finally {
      this._isExporting = false;
    }
  }

  /**
   * Shutter camera flash animation
   */
  _triggerFlash() {
    if (!this._flashOverlay) return;

    if (window.gsap) {
      window.gsap.killTweensOf(this._flashOverlay);
      window.gsap.fromTo(this._flashOverlay,
        { opacity: 0.8 },
        { opacity: 0, duration: 0.45, ease: 'power2.out' }
      );
    } else {
      this._flashOverlay.style.opacity = '0.8';
      setTimeout(() => {
        this._flashOverlay.style.opacity = '0';
      }, 150);
    }
  }

  /**
   * Render high-DPI composite canvas of the entire graphic design
   */
  async _renderCompositeCanvas() {
    // 2x DPR multiplier produces razor-sharp 4K Ultra-HD wallpaper (e.g. 3840x2160 on 1080p)
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Background Fill
    const theme = this._themeModel.getCurrentTheme();
    ctx.fillStyle = theme.bg || '#070709';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Ambient Cyber Grid
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 3. 2D Constellation Particles Canvas (#canvas-bg)
    const bgCanvas = DomUtils.$('#canvas-bg');
    if (bgCanvas && bgCanvas.width > 0 && bgCanvas.height > 0) {
      ctx.drawImage(bgCanvas, 0, 0, canvas.width, canvas.height);
    }

    // 4. 3D WebGL Scene (#canvas-webgl)
    const webglCanvas = DomUtils.$('#canvas-webgl');
    if (webglCanvas && webglCanvas.width > 0 && webglCanvas.height > 0) {
      ctx.drawImage(webglCanvas, 0, 0, canvas.width, canvas.height);
    }

    // 5. 2D Kinetic Typography & Sub-caption (only if not hidden by 3D morph mode)
    const is3DMorph = this._stateModel.is3DMorph;
    if (!is3DMorph) {
      ctx.save();
      ctx.scale(dpr, dpr);

      // Render each character of hero-title
      const titleEl = DomUtils.$('.hero-title');
      if (titleEl) {
        const chars = titleEl.querySelectorAll('.char');
        chars.forEach((charEl) => {
          const rect = charEl.getBoundingClientRect();
          const charText = charEl.textContent;
          const computed = window.getComputedStyle(charEl);
          const isAccent = !!(charEl.closest('.word-accent') || charEl.classList.contains('hero-punctuation'));

          const fontSize = parseFloat(computed.fontSize) || 120;
          const fontFamily = computed.fontFamily || "'Syne', sans-serif";
          const fontWeight = computed.fontWeight || '900';
          const primaryColor = theme.primaryColor || '#f59e0b';
          const glowColor = theme.glowColor || primaryColor;
          const textColor = isAccent ? primaryColor : '#ffffff';

          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';

          // Multi-pass radiant neon glow for accented characters
          if (isAccent) {
            ctx.save();
            // Pass 1: Wide diffused atmospheric glow
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 45;
            ctx.fillStyle = textColor;
            ctx.fillText(charText, rect.left, rect.top);

            // Pass 2: High intensity inner bloom
            ctx.shadowBlur = 20;
            ctx.fillText(charText, rect.left, rect.top);
            ctx.restore();
          }

          // Sharp core text glyph
          ctx.fillStyle = textColor;
          ctx.fillText(charText, rect.left, rect.top);
        });
      }

      // Render Sub-caption text: "[ Hover letters to bend • Click 3D Morph to assemble ]"
      const cueEl = DomUtils.$('main div.text-\\[11px\\]') || DomUtils.$('main .font-mono');
      if (cueEl) {
        const cueRect = cueEl.getBoundingClientRect();
        const cueText = cueEl.textContent.trim();
        ctx.font = "500 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#64748b'; // slate-500
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cueText, cueRect.left + cueRect.width / 2, cueRect.top + cueRect.height / 2);
      }

      ctx.restore();
    }

    return canvas;
  }

  /**
   * Convert canvas to blob and trigger native browser file download
   * @param {HTMLCanvasElement} canvas 
   * @param {string} filename 
   */
  _downloadCanvas(canvas, filename) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas blob conversion failed'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve();
        }, 1500);
      }, 'image/png');
    });
  }

  /**
   * Generate clean slugged filename based on current text and active theme
   */
  _generateFilename() {
    const rawText = this._stateModel.currentText || 'hello-world';
    const rawTheme = this._themeModel.getCurrentTheme()?.name || 'obsidian';

    const textSlug = rawText
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'design';

    const themeSlug = rawTheme
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'theme';

    return `${textSlug}-${themeSlug}-wallpaper.png`;
  }

  /**
   * Show notification toast
   * @param {string} message 
   */
  _showToast(message) {
    if (!this._toast) return;

    if (this._toastMsg) {
      this._toastMsg.textContent = message;
    }

    if (window.gsap) {
      window.gsap.killTweensOf(this._toast);
      window.gsap.timeline()
        .to(this._toast, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out'
        })
        .to(this._toast, {
          opacity: 0,
          y: -16,
          duration: 0.4,
          delay: 3.2,
          ease: 'power2.in'
        });
    } else {
      this._toast.style.opacity = '1';
      this._toast.style.transform = 'translateY(0)';
      setTimeout(() => {
        this._toast.style.opacity = '0';
        this._toast.style.transform = 'translateY(-16px)';
      }, 3500);
    }
  }
}
