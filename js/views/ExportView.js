import { DomUtils } from '../core/DomUtils.js';

/**
 * ExportView - High-Resolution Design Snapshot & Wallpaper Downloader
 * Leverages html2canvas with WebGL preserved buffers to capture pixel-perfect
 * wallpapers matching 100% of what is displayed in the browser.
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
   * Trigger high-fidelity wallpaper capture sequence
   */
  async exportDesign() {
    if (this._isExporting) return;
    this._isExporting = true;

    try {
      // 1. Audio shutter sound cue
      this._eventBus.emit('ui:shutterSound');

      // 2. Camera flash visual feedback
      this._triggerFlash();

      // 3. Ensure fonts are completely ready
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // 4. Force immediate render of 3D WebGL scene to ensure buffer is hot
      if (this._threeSceneView && typeof this._threeSceneView.renderImmediate === 'function') {
        this._threeSceneView.renderImmediate();
      }

      // 5. Apply clean export mask to hide UI docks, cursor, and modals
      document.body.classList.add('exporting-mode');

      // Allow 1 frame for browser to settle DOM styles
      await new Promise((r) => requestAnimationFrame(r));

      // 6. Capture pixel-perfect screen using html2canvas
      if (typeof window.html2canvas !== 'function') {
        throw new Error('html2canvas library is not loaded');
      }

      const scaleFactor = Math.max(window.devicePixelRatio || 1, 2);
      const themeBg = getComputedStyle(document.body).backgroundColor || '#070709';

      const canvas = await window.html2canvas(document.body, {
        backgroundColor: themeBg,
        scale: scaleFactor,
        useCORS: true,
        allowTaint: true,
        logging: false,
        ignoreElements: (el) => {
          return (
            el.tagName === 'FOOTER' ||
            el.id === 'hud-dock' ||
            el.id === 'export-flash-overlay' ||
            el.id === 'export-toast' ||
            el.classList?.contains('cursor-dot') ||
            el.classList?.contains('cursor-ring') ||
            el.classList?.contains('terminal-backdrop') ||
            el.classList?.contains('preloader-content') ||
            el.classList?.contains('preloader-shutter-top') ||
            el.classList?.contains('preloader-shutter-bottom')
          );
        }
      });

      // Remove export mask immediately
      document.body.classList.remove('exporting-mode');

      if (!canvas) {
        throw new Error('Canvas render failed');
      }

      // 7. Generate clean filename based on current text and theme
      const filename = this._generateFilename();

      // 8. Download PNG
      await this._downloadCanvas(canvas, filename);

      // 9. Show confirmation toast notification
      const dimStr = `${canvas.width}×${canvas.height}`;
      this._showToast(`📸 DESIGN SAVED // ${filename} (${dimStr})`);

    } catch (err) {
      console.error('Export error:', err);
      document.body.classList.remove('exporting-mode');
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
