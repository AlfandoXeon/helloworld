/**
 * ViewportController - Responsive Layout Coordinator
 * Tracks window / visual viewport changes (rotation, mobile URL bar, on-screen
 * keyboard), publishes layout CSS variables and notifies views once per frame.
 */
export class ViewportController {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus
   * @param {import('../models/StateModel.js').StateModel} stateModel
   */
  constructor(eventBus, stateModel) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;

    this._root = document.documentElement;
    this._footer = document.querySelector('footer');
    this._dock = document.querySelector('.hud-dock');

    this._rafId = 0;
    this._boundSchedule = this._schedule.bind(this);
    this._boundUpdateVisual = this._updateVisualViewport.bind(this);
  }

  init() {
    window.addEventListener('resize', this._boundSchedule, { passive: true });
    window.addEventListener('orientationchange', this._boundSchedule, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this._boundUpdateVisual, { passive: true });
      window.visualViewport.addEventListener('scroll', this._boundUpdateVisual, { passive: true });
    }

    // Dock size changes (fonts / icons loading, breakpoint switches)
    if (window.ResizeObserver && this._dock) {
      this._dockObserver = new ResizeObserver(() => this._updateDockMetrics());
      this._dockObserver.observe(this._dock);
    }

    // Re-measure once webfonts are ready (they change text widths)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this._schedule());
    }

    this._update();
  }

  _schedule() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = 0;
      this._update();
    });
  }

  _update() {
    this._updateVisualViewport();
    this._updateDockMetrics(false);
    this._stateModel.setViewport(window.innerWidth, window.innerHeight);
  }

  /**
   * Visible area excluding the on-screen keyboard (used by modals)
   */
  _updateVisualViewport() {
    const vv = window.visualViewport;
    const height = vv ? vv.height : window.innerHeight;
    const top = vv ? vv.offsetTop : 0;
    this._root.style.setProperty('--app-height', `${Math.round(height)}px`);
    this._root.style.setProperty('--vv-top', `${Math.round(top)}px`);
  }

  /**
   * Reserve exact space for the floating HUD dock so content never sits under it
   * @param {boolean} [notify=true]
   */
  _updateDockMetrics(notify = true) {
    if (this._footer) {
      const rect = this._footer.getBoundingClientRect();
      const reserved = Math.max(0, Math.round(window.innerHeight - rect.top));
      const prev = this._root.style.getPropertyValue('--dock-h');
      const next = `${reserved}px`;
      if (prev !== next) {
        this._root.style.setProperty('--dock-h', next);
        if (notify) this._schedule();
      }
    }

    if (this._dock) {
      const overflowing = this._dock.scrollWidth > this._dock.clientWidth + 1;
      this._dock.classList.toggle('is-overflowing', overflowing);
    }
  }
}
