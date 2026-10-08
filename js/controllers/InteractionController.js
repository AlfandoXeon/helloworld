/**
 * InteractionController - Handles Pointer, Magnetic Physics & Keyboard Shortcuts
 */
const HOVER_SELECTOR = 'button, a, .char, .hud-pill-btn, input';
const UI_SELECTOR = 'button, input, nav, .hud-glass-panel, .terminal-window';

// Mouse events synthesized by mobile browsers after a tap arrive within this window
const EMULATED_MOUSE_WINDOW_MS = 800;

export class InteractionController {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   */
  constructor(eventBus, stateModel) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;

    this._boundOnMouseMove = this._onMouseMove.bind(this);
    this._boundOnMouseDown = this._onMouseDown.bind(this);
    this._boundOnMouseUp = this._onMouseUp.bind(this);
    this._boundOnMouseOut = this._onMouseOut.bind(this);
    this._boundOnKeyDown = this._onKeyDown.bind(this);

    this._boundOnTouchStart = this._onTouchStart.bind(this);
    this._boundOnTouchMove = this._onTouchMove.bind(this);
    this._boundOnTouchEnd = this._onTouchEnd.bind(this);

    this._magneticElements = [];
    this._hoverTarget = null;
    this._lastTouchTime = 0;
    this._isDragging = false;

    this._finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  }

  /**
   * Initialize event listeners
   */
  init() {
    window.addEventListener('mousemove', this._boundOnMouseMove, { passive: true });
    window.addEventListener('mousedown', this._boundOnMouseDown);
    window.addEventListener('mouseup', this._boundOnMouseUp);
    window.addEventListener('mouseout', this._boundOnMouseOut);
    window.addEventListener('keydown', this._boundOnKeyDown);
    window.addEventListener('blur', () => this._endInteraction());

    // Touch events for mobile & Android
    window.addEventListener('touchstart', this._boundOnTouchStart, { passive: true });
    window.addEventListener('touchmove', this._boundOnTouchMove, { passive: true });
    window.addEventListener('touchend', this._boundOnTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this._boundOnTouchEnd, { passive: true });

    this._initMagneticElements();
    this._initHoverables();
  }

  _isEmulatedMouse() {
    return performance.now() - this._lastTouchTime < EMULATED_MOUSE_WINDOW_MS;
  }

  _initMagneticElements() {
    this._magneticElements = document.querySelectorAll('[data-magnetic], .hud-pill-btn');

    this._magneticElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        // Magnetic pull only makes sense for a real mouse; on touch it leaves buttons displaced
        if (!window.gsap || !this._finePointerQuery.matches || this._isEmulatedMouse()) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.35;
        const deltaY = (e.clientY - centerY) * 0.35;

        window.gsap.to(el, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      el.addEventListener('mouseleave', () => {
        if (!window.gsap) return;
        window.gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1.1, 0.3)',
          overwrite: 'auto'
        });
      });
    });
  }

  /**
   * Event delegation so dynamically created elements (re-rendered letters,
   * theme presets) are tracked without re-binding listeners.
   */
  _initHoverables() {
    document.addEventListener('mouseover', (e) => {
      if (this._isEmulatedMouse()) return;
      const target = e.target instanceof Element ? e.target.closest(HOVER_SELECTOR) : null;
      if (target === this._hoverTarget) return;

      this._hoverTarget = target;
      if (target) {
        this._stateModel.setHoveringInteractive(true);
        this._eventBus.emit('ui:hover');
      } else {
        this._stateModel.setHoveringInteractive(false);
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target instanceof Element ? e.target.closest(HOVER_SELECTOR) : null;
      if (target) {
        this._eventBus.emit('ui:click');
      }
    });
  }

  _onMouseMove(e) {
    if (this._isEmulatedMouse()) return;

    if (this._isDragging) {
      const dx = e.clientX - this._lastMouseX;
      const dy = e.clientY - this._lastMouseY;
      this._stateModel.updateOrbitDelta(dx, dy);
    }
    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    this._stateModel.setMousePos(e.clientX, e.clientY);
    this._stateModel.setPointerActive(true);
  }

  _onMouseOut(e) {
    // relatedTarget is null when the pointer leaves the browser window
    if (!e.relatedTarget) {
      this._hoverTarget = null;
      this._stateModel.setHoveringInteractive(false);
      this._stateModel.setPointerActive(false);
    }
  }

  _onMouseDown(e) {
    if (this._isEmulatedMouse() || e.button !== 0) return;
    this._stateModel.setMouseDown(true);

    // Clicking HUD buttons / modals should not grab the 3D orbit
    if (e.target instanceof Element && e.target.closest(UI_SELECTOR)) return;
    this._isDragging = true;
    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;
    this._stateModel.setOrbitDragging(true);
  }

  _onMouseUp() {
    if (this._isEmulatedMouse()) return;
    this._isDragging = false;
    this._stateModel.setMouseDown(false);
    this._stateModel.setOrbitDragging(false);
  }

  _onTouchStart(e) {
    this._lastTouchTime = performance.now();
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    if (e.target instanceof Element && e.target.closest(UI_SELECTOR)) {
      return;
    }
    this._isDragging = true;
    this._lastMouseX = touch.clientX;
    this._lastMouseY = touch.clientY;
    this._stateModel.setPointerActive(true);
    this._stateModel.setMouseDown(true);
    this._stateModel.setOrbitDragging(true);
    this._stateModel.setMousePos(touch.clientX, touch.clientY);
  }

  _onTouchMove(e) {
    this._lastTouchTime = performance.now();
    if (!e.touches || e.touches.length === 0 || !this._isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this._lastMouseX;
    const dy = touch.clientY - this._lastMouseY;
    this._stateModel.updateOrbitDelta(dx, dy);
    this._lastMouseX = touch.clientX;
    this._lastMouseY = touch.clientY;
    this._stateModel.setMousePos(touch.clientX, touch.clientY);
  }

  _onTouchEnd(e) {
    this._lastTouchTime = performance.now();
    if (e.touches && e.touches.length > 0) return;
    this._endInteraction();
  }

  /**
   * Release drag and let pointer-driven effects relax back to neutral
   */
  _endInteraction() {
    this._isDragging = false;
    this._stateModel.setMouseDown(false);
    this._stateModel.setOrbitDragging(false);
    if (this._isEmulatedMouse() || !this._finePointerQuery.matches) {
      this._stateModel.setPointerActive(false);
    }
  }

  _onKeyDown(e) {
    // Leave browser / OS shortcuts (Ctrl+S, Cmd+P, Alt+...) untouched
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const openModal = document.querySelector('.terminal-backdrop.open');
    const isTerminalOpen = this._stateModel.isTerminalOpen;

    // Escape closes whichever modal is currently open
    if (e.key === 'Escape') {
      if (openModal) {
        e.preventDefault();
        this._eventBus.emit('ui:escape');
      }
      return;
    }

    // Toggle terminal via Backquote (~), unless the user is typing in another modal
    if (e.key === '`' || e.key === '~') {
      if (openModal && !isTerminalOpen) return;
      e.preventDefault();
      this._eventBus.emit('ui:terminalToggle');
      return;
    }

    // Ignore single key shortcuts if any modal/terminal is currently open
    if (openModal) return;

    // Holding a key should not rapidly toggle features on and off
    if (e.repeat) return;

    const key = e.key.toLowerCase();
    if (key === 'm') {
      this._eventBus.emit('ui:soundToggle');
    } else if (key === 'g') {
      this._eventBus.emit('ui:gravityToggle');
    } else if (key === 't') {
      this._eventBus.emit('ui:themePaletteToggle');
    } else if (key === 'e') {
      this._eventBus.emit('ui:customTextToggle');
    } else if (key === 'p') {
      this._eventBus.emit('ui:particlesToggle');
    } else if (key === 's') {
      e.preventDefault();
      this._eventBus.emit('ui:exportDesign');
    } else if (key === '3') {
      this._eventBus.emit('ui:morphToggle');
    }
  }
}
