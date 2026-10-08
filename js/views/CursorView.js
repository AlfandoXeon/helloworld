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
  }

  /**
   * Update cursor position and physics on each frame
   */
  update() {
    const mouse = this._stateModel.mouse;
    this._pos.targetX = mouse.targetX;
    this._pos.targetY = mouse.targetY;

    // Instant dot movement for responsiveness
    if (this._dot) {
      this._dot.style.transform = `translate3d(${this._pos.targetX}px, ${this._pos.targetY}px, 0)`;
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

    if (this._ring) {
      if (!this._ring.classList.contains('is-hovering')) {
        this._ring.style.transform = `translate3d(${this._pos.x}px, ${this._pos.y}px, 0) rotate(${angle}deg) scale(${1 + stretch}, ${1 - stretch * 0.5})`;
      } else {
        this._ring.style.transform = `translate3d(${this._pos.x}px, ${this._pos.y}px, 0)`;
      }
    }
  }
}
