import { DomUtils } from '../core/DomUtils.js';
import { MathUtils } from '../core/MathUtils.js';

/**
 * CursorView - Fluid Custom Magnetic Cursor with Velocity Dynamics
 */
export class CursorView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   */
  constructor(eventBus, stateModel) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;

    this._dot = DomUtils.$('.cursor-dot');
    this._ring = DomUtils.$('.cursor-ring');

    this._pos = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2
    };

    this._velocity = { x: 0, y: 0 };
    this._isInitialized = false;

    this._bindEvents();
  }

  _bindEvents() {
    this._eventBus.on('cursor:hoverChanged', (isHovering) => {
      if (!this._ring) return;
      if (isHovering) {
        this._ring.classList.add('is-hovering');
      } else {
        this._ring.classList.remove('is-hovering');
      }
    });

    this._eventBus.on('mouse:stateChanged', ({ isDown }) => {
      if (!this._ring) return;
      if (isDown) {
        this._ring.classList.add('is-clicking');
      } else {
        this._ring.classList.remove('is-clicking');
      }
    });

    // Hide custom cursor until the mouse enters, and when it leaves the window
    this._eventBus.on('pointer:activeChanged', (isActive) => {
      document.documentElement.classList.toggle('cursor-visible', isActive);
      if (isActive && !this._isInitialized) {
        // Snap ring to the first known position instead of flying in from the center
        this._pos.x = this._stateModel.mouse.targetX;
        this._pos.y = this._stateModel.mouse.targetY;
        this._isInitialized = true;
      }
    });
  }

  /**
   * Update cursor position and physics on each frame
   */
  update() {
    const mouse = this._stateModel.mouse;
    this._pos.targetX = mouse.targetX;
    this._pos.targetY = mouse.targetY;

    // Instant dot movement for responsiveness (centered on the pointer)
    if (this._dot) {
      this._dot.style.transform = `translate3d(${this._pos.targetX}px, ${this._pos.targetY}px, 0) translate(-50%, -50%)`;
    }

    // Smooth lerp for outer ring
    const prevX = this._pos.x;
    const prevY = this._pos.y;

    this._pos.x = MathUtils.lerp(this._pos.x, this._pos.targetX, 0.18);
    this._pos.y = MathUtils.lerp(this._pos.y, this._pos.targetY, 0.18);

    this._velocity.x = this._pos.x - prevX;
    this._velocity.y = this._pos.y - prevY;

    const speed = Math.hypot(this._velocity.x, this._velocity.y);
    const angle = Math.atan2(this._velocity.y, this._velocity.x) * (180 / Math.PI);
    const stretch = Math.min(speed * 0.02, 0.4);
    const press = mouse.isDown ? 0.75 : 1;

    if (this._ring) {
      const base = `translate3d(${this._pos.x}px, ${this._pos.y}px, 0) translate(-50%, -50%)`;
      if (!this._ring.classList.contains('is-hovering')) {
        this._ring.style.transform = `${base} rotate(${angle}deg) scale(${(1 + stretch) * press}, ${(1 - stretch * 0.5) * press})`;
      } else {
        this._ring.style.transform = `${base} scale(${press})`;
      }
    }
  }
}
