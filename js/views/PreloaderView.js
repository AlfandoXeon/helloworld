import { DomUtils } from '../core/DomUtils.js';

/**
 * PreloaderView - Cinematic Shutter & Digital Counter Intro
 */
export class PreloaderView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   */
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._shutterTop = DomUtils.$('.preloader-shutter-top');
    this._shutterBottom = DomUtils.$('.preloader-shutter-bottom');
    this._content = DomUtils.$('.preloader-content');
    this._counter = DomUtils.$('#preloader-counter');
    this._barFill = DomUtils.$('.preloader-bar-fill');
    this._status = DomUtils.$('.preloader-status');

    this._statusTexts = [
      'SYS_BOOT // ESTABLISHING LINK',
      'ALLOCATING QUANTUM BUFFERS',
      'COMPILING KINETIC MATRIX',
      'GENESIS PROTOCOL ENGAGED'
    ];
  }

  /**
   * Start the intro sequence
   */
  start() {
    if (!window.gsap) {
      this._onComplete();
      return;
    }

    const counterObj = { value: 0 };
    const tl = window.gsap.timeline({
      onComplete: () => this._onComplete()
    });

    // Animate progress and status text
    tl.to(counterObj, {
      value: 100,
      duration: 2.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        const val = Math.round(counterObj.value);
        if (this._counter) {
          this._counter.textContent = String(val).padStart(2, '0');
        }
        if (this._barFill) {
          this._barFill.style.width = `${val}%`;
        }

        // Change status text at milestones
        if (this._status) {
          if (val > 80) this._status.textContent = this._statusTexts[3];
          else if (val > 50) this._status.textContent = this._statusTexts[2];
          else if (val > 25) this._status.textContent = this._statusTexts[1];
        }
      }
    });

    // Fade out counter content
    tl.to(this._content, {
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)',
      duration: 0.5,
      ease: 'power2.in'
    }, '+=0.1');

    // Split shutter reveal
    tl.to(this._shutterTop, {
      yPercent: -100,
      duration: 1.1,
      ease: 'power4.inOut'
    }, '-=0.1');

    tl.to(this._shutterBottom, {
      yPercent: 100,
      duration: 1.1,
      ease: 'power4.inOut'
    }, '<');
  }

  _onComplete() {
    if (this._content) this._content.style.display = 'none';
    if (this._shutterTop) this._shutterTop.style.display = 'none';
    if (this._shutterBottom) this._shutterBottom.style.display = 'none';
    this._eventBus.emit('preloader:completed');
  }
}
