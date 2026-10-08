/**
 * StateModel - Centralized Reactive State Store
 */
export class StateModel {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   */
  constructor(eventBus) {
    this._eventBus = eventBus;

    this._state = {
      stage: 'preloading', // 'preloading' | 'ready'
      mouse: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        targetX: window.innerWidth / 2,
        targetY: window.innerHeight / 2,
        vx: 0,
        vy: 0,
        isDown: false,
        isHovering: false,
        isActive: false // true while a mouse is inside the window or a finger is touching
      },
      viewport: StateModel._computeViewport(window.innerWidth, window.innerHeight),
      isZeroG: false,
      is3DMorph: false,
      isBgParticlesVisible: true,
      isTerminalOpen: false,
      isCustomTextOpen: false,
      currentText: 'Hello, World!',
      fps: 60,
      orbit: {
        rotateX: 0,
        rotateY: 0,
        targetRotateX: 0,
        targetRotateY: 0,
        isDragging: false
      }
    };
  }

  get state() {
    return this._state;
  }

  get isBgParticlesVisible() {
    return this._state.isBgParticlesVisible;
  }

  get currentText() {
    return this._state.currentText;
  }

  get isCustomTextOpen() {
    return this._state.isCustomTextOpen;
  }

  get is3DMorph() {
    return this._state.is3DMorph;
  }

  get orbit() {
    return this._state.orbit;
  }

  get mouse() {
    return this._state.mouse;
  }

  get viewport() {
    return this._state.viewport;
  }

  get isZeroG() {
    return this._state.isZeroG;
  }

  get isTerminalOpen() {
    return this._state.isTerminalOpen;
  }

  get stage() {
    return this._state.stage;
  }

  /**
   * Update mouse position and delta
   * @param {number} x 
   * @param {number} y 
   */
  setMousePos(x, y) {
    this._state.mouse.targetX = x;
    this._state.mouse.targetY = y;
  }

  setMouseDown(isDown) {
    this._state.mouse.isDown = isDown;
    this._eventBus.emit('mouse:stateChanged', { isDown });
  }

  setHoveringInteractive(isHovering) {
    if (this._state.mouse.isHovering !== isHovering) {
      this._state.mouse.isHovering = isHovering;
      this._eventBus.emit('cursor:hoverChanged', isHovering);
    }
  }

  setPointerActive(isActive) {
    if (this._state.mouse.isActive !== isActive) {
      this._state.mouse.isActive = isActive;
      this._eventBus.emit('pointer:activeChanged', isActive);
    }
  }

  setViewport(width, height) {
    this._state.viewport = StateModel._computeViewport(width, height);
    this._eventBus.emit('viewport:resized', this._state.viewport);
  }

  /**
   * Derive viewport metrics and responsive breakpoint flags
   * @param {number} width
   * @param {number} height
   */
  static _computeViewport(width, height) {
    return {
      width,
      height,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      aspect: width / Math.max(height, 1),
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1100,
      isPortrait: height >= width,
      isShortLandscape: height < 520 && width > height
    };
  }

  toggleZeroG() {
    this._state.isZeroG = !this._state.isZeroG;
    this._eventBus.emit('physics:zeroGChanged', this._state.isZeroG);
    return this._state.isZeroG;
  }

  toggle3DMorph() {
    this._state.is3DMorph = !this._state.is3DMorph;
    this._eventBus.emit('webgl:morphChanged', this._state.is3DMorph);
    return this._state.is3DMorph;
  }

  updateOrbitDelta(dx, dy) {
    this._state.orbit.targetRotateY += dx * 0.005;
    this._state.orbit.targetRotateX += dy * 0.005;
    this._state.orbit.targetRotateX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this._state.orbit.targetRotateX));
  }

  setOrbitDragging(isDragging) {
    this._state.orbit.isDragging = isDragging;
  }

  setTerminalOpen(isOpen) {
    this._state.isTerminalOpen = isOpen;
    this._eventBus.emit('terminal:stateChanged', isOpen);
  }

  toggleTerminal() {
    this.setTerminalOpen(!this._state.isTerminalOpen);
    return this._state.isTerminalOpen;
  }

  toggleBgParticles() {
    this._state.isBgParticlesVisible = !this._state.isBgParticlesVisible;
    this._eventBus.emit('particles:toggleVisibility', this._state.isBgParticlesVisible);
    return this._state.isBgParticlesVisible;
  }

  setText(newText) {
    if (!newText || typeof newText !== 'string') return;
    const sanitized = newText.trim().slice(0, 24);
    if (!sanitized) return;
    this._state.currentText = sanitized;
    this._eventBus.emit('text:changed', sanitized);
    return this._state.currentText;
  }

  setCustomTextModalOpen(isOpen) {
    this._state.isCustomTextOpen = isOpen;
    this._eventBus.emit('modal:customTextChanged', isOpen);
  }

  toggleCustomTextModal() {
    this.setCustomTextModalOpen(!this._state.isCustomTextOpen);
    return this._state.isCustomTextOpen;
  }

  setStage(stage) {
    this._state.stage = stage;
    this._eventBus.emit('stage:changed', stage);
  }

  setFps(fps) {
    this._state.fps = fps;
    this._eventBus.emit('performance:fpsUpdated', fps);
  }
}
