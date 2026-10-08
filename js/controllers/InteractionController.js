import { MathUtils } from '../core/MathUtils.js';

/**
 * InteractionController - Handles Pointer, Magnetic Physics & Keyboard Shortcuts
 */
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
    this._boundOnKeyDown = this._onKeyDown.bind(this);
    this._boundOnResize = this._onResize.bind(this);

    this._magneticElements = [];
  }

  /**
   * Initialize event listeners
   */
  init() {
    window.addEventListener('mousemove', this._boundOnMouseMove, { passive: true });
    window.addEventListener('mousedown', this._boundOnMouseDown);
    window.addEventListener('mouseup', this._boundOnMouseUp);
    window.addEventListener('keydown', this._boundOnKeyDown);
    window.addEventListener('resize', this._boundOnResize);

    this._initMagneticElements();
    this._initHoverables();
  }

  _initMagneticElements() {
    this._magneticElements = document.querySelectorAll('[data-magnetic], .hud-pill-btn');

    this._magneticElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        if (!window.gsap) return;
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

  _initHoverables() {
    const hoverables = document.querySelectorAll('button, a, .char, .hud-pill-btn, input');

    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this._stateModel.setHoveringInteractive(true);
        this._eventBus.emit('ui:hover');
      });

      el.addEventListener('mouseleave', () => {
        this._stateModel.setHoveringInteractive(false);
      });

      el.addEventListener('click', () => {
        this._eventBus.emit('ui:click');
      });
    });
  }

  _onMouseMove(e) {
    if (this._isDragging) {
      const dx = e.clientX - this._lastMouseX;
      const dy = e.clientY - this._lastMouseY;
      this._stateModel.updateOrbitDelta(dx, dy);
    }
    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;

    this._stateModel.setMousePos(e.clientX, e.clientY);
  }

  _onMouseDown(e) {
    this._isDragging = true;
    this._lastMouseX = e.clientX;
    this._lastMouseY = e.clientY;
    this._stateModel.setMouseDown(true);
    this._stateModel.setOrbitDragging(true);
  }

  _onMouseUp() {
    this._isDragging = false;
    this._stateModel.setMouseDown(false);
    this._stateModel.setOrbitDragging(false);
  }

  _onResize() {
    this._stateModel.setViewport(window.innerWidth, window.innerHeight);
  }

  _onKeyDown(e) {
    // Toggle terminal via Backquote (~)
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      this._eventBus.emit('ui:terminalToggle');
      return;
    }

    // Close terminal via Escape
    if (e.key === 'Escape' && this._stateModel.isTerminalOpen) {
      this._eventBus.emit('ui:terminalToggle');
      return;
    }

    // Ignore single key shortcuts if any modal/terminal is currently open
    if (document.querySelector('.terminal-backdrop.open')) return;

    if (e.key === 'm' || e.key === 'M') {
      this._eventBus.emit('ui:soundToggle');
    } else if (e.key === 'g' || e.key === 'G') {
      this._eventBus.emit('ui:gravityToggle');
    } else if (e.key === 't' || e.key === 'T') {
      this._eventBus.emit('ui:themePaletteToggle');
    } else if (e.key === 'e' || e.key === 'E') {
      this._eventBus.emit('ui:customTextToggle');
    } else if (e.key === 'p' || e.key === 'P') {
      this._eventBus.emit('ui:particlesToggle');
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      this._eventBus.emit('ui:exportDesign');
    } else if (e.key === '3') {
      this._eventBus.emit('ui:morphToggle');
    }
  }
}
