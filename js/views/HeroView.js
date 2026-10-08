import { DomUtils } from '../core/DomUtils.js';
import { MathUtils } from '../core/MathUtils.js';

/**
 * HeroView - Kinetic Typography Presentation & 3D Interactive Physics
 */
export class HeroView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   */
  constructor(eventBus, stateModel) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;

    this._wrapper = DomUtils.$('.hero-title-wrapper');
    this._titleEl = DomUtils.$('.hero-title');
    this._subtitle = DomUtils.$('.subtitle-lead');
    this._metaTags = DomUtils.$$('.meta-tag');

    this._chars = [];
    this._renderText(this._stateModel.currentText || 'Hello, World!');
    this._bindEvents();
  }

  _renderText(text) {
    if (!this._titleEl) return;

    this._titleEl.innerHTML = '';
    this._chars = [];

    const words = text.split(' ').filter(w => w.length > 0);
    const accentIndex = words.length > 1 ? words.length - 1 : 0;

    words.forEach((word, wordIdx) => {
      const wordSpan = DomUtils.create('span', 'word');
      if (wordIdx === accentIndex) {
        wordSpan.classList.add('word-accent');
      }

      Array.from(word).forEach((char) => {
        const charSpan = DomUtils.create('span', 'char');
        charSpan.textContent = char;
        if (['!', '?', '.', ',', ':', ';'].includes(char)) {
          charSpan.classList.add('hero-punctuation');
        }
        wordSpan.appendChild(charSpan);
        this._chars.push(charSpan);
      });

      this._titleEl.appendChild(wordSpan);
    });

    this._bindCharEvents();
  }

  _bindCharEvents() {
    this._chars.forEach((charEl, idx) => {
      charEl.addEventListener('mouseenter', () => {
        if (!window.gsap || this._stateModel.isZeroG) return;

        window.gsap.to(charEl, {
          y: -18,
          scale: 1.18,
          rotateZ: MathUtils.random(-8, 8),
          duration: 0.4,
          ease: 'back.out(2.5)',
          overwrite: 'auto'
        });

        this._eventBus.emit('letter:hover', { index: idx, char: charEl.textContent });
      });

      charEl.addEventListener('mouseleave', () => {
        if (!window.gsap || this._stateModel.isZeroG) return;

        window.gsap.to(charEl, {
          y: 0,
          scale: 1,
          rotateZ: 0,
          duration: 0.6,
          ease: 'elastic.out(1.2, 0.4)',
          overwrite: 'auto'
        });
      });
    });
  }

  _bindEvents() {
    // Custom Text Changed Listener
    this._eventBus.on('text:changed', (newText) => {
      this.updateText(newText);
    });

    // Zero-G Scatter / Restore Listener
    this._eventBus.on('physics:zeroGChanged', (isZeroG) => {
      this._handleZeroG(isZeroG);
    });

    // 3D Morph Listener - Soften HTML text to highlight 3D particles
    this._eventBus.on('webgl:morphChanged', (is3DMorph) => {
      if (!window.gsap || !this._titleEl) return;
      window.gsap.to(this._titleEl, {
        opacity: is3DMorph ? 0.08 : 1,
        scale: is3DMorph ? 0.95 : 1,
        filter: is3DMorph ? 'blur(6px)' : 'blur(0px)',
        duration: 1.0,
        ease: 'power2.out'
      });
    });
  }

  /**
   * Update display text dynamically with snappy entrance animation
   * @param {string} newText 
   */
  updateText(newText) {
    this._renderText(newText);

    if (window.gsap && this._chars.length > 0) {
      window.gsap.fromTo(this._chars,
        {
          opacity: 0,
          y: 60,
          scale: 0.7,
          rotateX: -45,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.035,
          ease: 'back.out(2.0)'
        }
      );
    }
  }

  /**
   * Play entrance choreography with GSAP
   */
  animateEntrance() {
    if (!window.gsap) return;

    const tl = window.gsap.timeline({
      defaults: { ease: 'power4.out' }
    });

    // Animate characters with staggered 3D drop
    tl.fromTo(this._chars, 
      {
        opacity: 0,
        y: 120,
        rotateX: -75,
        rotateY: () => MathUtils.random(-25, 25),
        scale: 0.6,
        filter: 'blur(15px)'
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.4,
        stagger: 0.05,
        ease: 'back.out(1.7)'
      }
    );

    // Animate subtitle & meta badges
    if (this._subtitle) {
      tl.fromTo(this._subtitle,
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0 },
        '-=0.8'
      );
    }

    if (this._metaTags && this._metaTags.length > 0) {
      tl.fromTo(this._metaTags,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.8 },
        '-=0.9'
      );
    }
  }

  /**
   * 3D Mouse Parallax Tilt
   */
  updateTilt() {
    if (!this._wrapper || !window.gsap || this._stateModel.isZeroG) return;

    const mouse = this._stateModel.mouse;
    const { width, height } = this._stateModel.viewport;

    const normX = (mouse.targetX / width) * 2 - 1;
    const normY = (mouse.targetY / height) * 2 - 1;

    const rotateY = normX * 12; // tilt left/right
    const rotateX = -normY * 12; // tilt up/down

    window.gsap.to(this._wrapper, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  /**
   * Handle Zero-Gravity Dispersion / Restore
   * @param {boolean} isZeroG 
   */
  _handleZeroG(isZeroG) {
    if (!window.gsap) return;

    if (isZeroG) {
      // Disperse letters chaotically across 3D space
      this._chars.forEach((charEl) => {
        window.gsap.to(charEl, {
          x: MathUtils.random(-280, 280),
          y: MathUtils.random(-200, 260),
          z: MathUtils.random(-300, 200),
          rotateX: MathUtils.random(-180, 180),
          rotateY: MathUtils.random(-180, 180),
          rotateZ: MathUtils.random(-180, 180),
          duration: MathUtils.random(1.2, 2.0),
          ease: 'power3.out'
        });
      });
    } else {
      // Snap letters back to origin with spring elasticity
      this._chars.forEach((charEl, idx) => {
        window.gsap.to(charEl, {
          x: 0,
          y: 0,
          z: 0,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          duration: 1.4,
          delay: idx * 0.03,
          ease: 'elastic.out(1.1, 0.4)'
        });
      });
    }
  }
}
