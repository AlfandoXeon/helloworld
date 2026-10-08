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

    this._stage = DomUtils.$('.hero-stage');
    this._wrapper = DomUtils.$('.hero-title-wrapper');
    this._titleEl = DomUtils.$('.hero-title');
    this._hint = DomUtils.$('.hero-hint');
    this._subtitle = DomUtils.$('.subtitle-lead');
    this._metaTags = DomUtils.$$('.meta-tag');

    this._chars = [];
    this._lastSwipeChar = null;
    this._tiltTarget = { x: NaN, y: NaN };

    // quickTo reuses a single tween per property instead of creating one per frame
    if (window.gsap && this._wrapper && typeof window.gsap.quickTo === 'function') {
      this._tiltX = window.gsap.quickTo(this._wrapper, 'rotateX', { duration: 0.8, ease: 'power2.out' });
      this._tiltY = window.gsap.quickTo(this._wrapper, 'rotateY', { duration: 0.8, ease: 'power2.out' });
    }

    this._renderText(this._stateModel.currentText || 'Hello, World!');
    this._bindEvents();
    this._bindSwipe();

    // Webfont swaps change glyph widths, so fit again once Syne is ready
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this._fitText());
    }
  }

  _renderText(text) {
    if (!this._titleEl) return;

    // Responsive scaling classes based on text length
    if (text.length > 18) {
      this._titleEl.classList.add('hero-title-long');
      this._titleEl.classList.remove('hero-title-medium');
    } else if (text.length > 12) {
      this._titleEl.classList.add('hero-title-medium');
      this._titleEl.classList.remove('hero-title-long');
    } else {
      this._titleEl.classList.remove('hero-title-long', 'hero-title-medium');
    }

    this._titleEl.innerHTML = '';
    this._chars = [];

    // Screen readers get the whole phrase instead of letter-by-letter spans
    this._titleEl.setAttribute('aria-label', text);

    const words = text.split(' ').filter(w => w.length > 0);
    const accentIndex = words.length > 1 ? words.length - 1 : 0;

    words.forEach((word, wordIdx) => {
      const wordSpan = DomUtils.create('span', 'word', { 'aria-hidden': 'true' });
      if (wordIdx === accentIndex) {
        wordSpan.classList.add('word-accent');
      }

      Array.from(word).forEach((char) => {
        const charSpan = DomUtils.create('span', 'char');
        charSpan.textContent = char;
        charSpan.dataset.index = String(this._chars.length);
        if (['!', '?', '.', ',', ':', ';'].includes(char)) {
          charSpan.classList.add('hero-punctuation');
        }
        wordSpan.appendChild(charSpan);
        this._chars.push(charSpan);
      });

      this._titleEl.appendChild(wordSpan);
    });

    this._bindCharEvents();
    this._fitText();
  }

  /**
   * Shrink the title so the longest word fits the width and all lines fit the
   * height left between the safe-area top and the HUD dock.
   */
  _fitText() {
    const title = this._titleEl;
    const wrapper = this._wrapper;
    if (!title || !wrapper) return;

    title.style.fontSize = '';

    const availW = wrapper.clientWidth;
    const availH = this._getAvailableHeight();
    if (!availW || !availH) return;

    let size = parseFloat(getComputedStyle(title).fontSize);
    const words = title.querySelectorAll('.word');

    for (let i = 0; i < 8; i++) {
      // offsetWidth/Height ignore CSS transforms, so animations don't skew the measurement
      let widestWord = 0;
      words.forEach((w) => { widestWord = Math.max(widestWord, w.offsetWidth); });
      const height = title.offsetHeight;
      if (!widestWord || !height) return;

      const ratio = Math.min(availW / widestWord, availH / height);
      if (ratio >= 0.995) break;

      size = Math.max(14, Math.floor(size * Math.min(ratio, 0.97)));
      title.style.fontSize = `${size}px`;
      if (size === 14) break;
    }
  }

  _getAvailableHeight() {
    const stage = this._stage || this._wrapper.parentElement;
    if (!stage) return window.innerHeight;
    const cs = getComputedStyle(stage);
    let h = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);

    if (this._hint && this._hint.offsetParent !== null) {
      h -= this._hint.offsetHeight + parseFloat(getComputedStyle(this._hint).marginTop || 0);
    }
    // Breathing room for the bounce / glow and wrapper margins
    return Math.max(40, h * 0.9 - 16);
  }

  _bindCharEvents() {
    this._chars.forEach((charEl, idx) => {
      // Desktop mouse hover (pointer events avoid double-firing from emulated mouse on touch)
      charEl.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') this._animateCharBounce(charEl, idx);
      });

      charEl.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') this._resetCharBounce(charEl);
      });

      // Mobile / Android / stylus tap
      charEl.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        this._tapBounce(charEl, idx);
      });
    });
  }

  /**
   * Swipe a finger across the title to ripple through the letters
   */
  _bindSwipe() {
    if (!this._wrapper) return;

    this._wrapper.addEventListener('touchmove', (e) => {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const charEl = el && el.closest ? el.closest('.char') : null;
      if (charEl && charEl !== this._lastSwipeChar) {
        this._lastSwipeChar = charEl;
        this._tapBounce(charEl, Number(charEl.dataset.index) || 0);
      }
    }, { passive: true });

    const resetSwipe = () => { this._lastSwipeChar = null; };
    this._wrapper.addEventListener('touchend', resetSwipe, { passive: true });
    this._wrapper.addEventListener('touchcancel', resetSwipe, { passive: true });
  }

  _tapBounce(charEl, idx) {
    this._animateCharBounce(charEl, idx);
    clearTimeout(charEl._resetTimer);
    charEl._resetTimer = setTimeout(() => {
      this._resetCharBounce(charEl);
    }, 450);
  }

  _animateCharBounce(charEl, idx) {
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
  }

  _resetCharBounce(charEl) {
    if (!window.gsap || this._stateModel.isZeroG) return;

    window.gsap.to(charEl, {
      y: 0,
      scale: 1,
      rotateZ: 0,
      duration: 0.6,
      ease: 'elastic.out(1.2, 0.4)',
      overwrite: 'auto'
    });
  }

  _bindEvents() {
    // Custom Text Changed Listener
    this._eventBus.on('text:changed', (newText) => {
      this.updateText(newText);
    });

    // Responsive refit on resize / rotation / dock size change
    this._eventBus.on('viewport:resized', () => {
      this._fitText();
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
    this._fitText();
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
   * 3D Mouse Parallax Tilt (relaxes to neutral when no pointer is present)
   */
  updateTilt() {
    if (!this._wrapper || !window.gsap || this._stateModel.isZeroG) return;

    const mouse = this._stateModel.mouse;
    const { width, height, isMobile } = this._stateModel.viewport;

    let rotateX = 0;
    let rotateY = 0;
    if (mouse.isActive) {
      const normX = (mouse.targetX / width) * 2 - 1;
      const normY = (mouse.targetY / height) * 2 - 1;
      const strength = isMobile ? 8 : 12;
      rotateY = MathUtils.clamp(normX, -1, 1) * strength; // tilt left/right
      rotateX = -MathUtils.clamp(normY, -1, 1) * strength; // tilt up/down
    }

    // Skip if the target hasn't meaningfully changed
    if (Math.abs(rotateX - this._tiltTarget.x) < 0.01 && Math.abs(rotateY - this._tiltTarget.y) < 0.01) return;
    this._tiltTarget.x = rotateX;
    this._tiltTarget.y = rotateY;

    if (this._tiltX && this._tiltY) {
      this._tiltX(rotateX);
      this._tiltY(rotateY);
    } else {
      window.gsap.to(this._wrapper, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  }

  /**
   * Handle Zero-Gravity Dispersion / Restore
   * @param {boolean} isZeroG 
   */
  _handleZeroG(isZeroG) {
    if (!window.gsap) return;

    // Scale dispersion to the viewport so letters stay on screen on phones
    const { width, height } = this._stateModel.viewport;
    const spreadX = Math.min(280, width * 0.35);
    const spreadY = Math.min(240, height * 0.28);

    if (isZeroG) {
      // Disperse letters chaotically across 3D space
      this._chars.forEach((charEl) => {
        window.gsap.to(charEl, {
          x: MathUtils.random(-spreadX, spreadX),
          y: MathUtils.random(-spreadY, spreadY),
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
