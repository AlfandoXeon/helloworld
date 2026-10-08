/**
 * AudioModel - Procedural Web Audio API Sound Synthesizer
 * Produces modern micro-interaction soundscapes without external audio files.
 */
export class AudioModel {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   */
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._ctx = null;
    this._isMuted = true;
    this._masterGain = null;
    this._droneGain = null;
    this._droneOsc1 = null;
    this._droneOsc2 = null;
  }

  /**
   * Initialize and unlock AudioContext on user interaction
   */
  initContext() {
    if (!this._ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this._ctx = new AudioCtx();

      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.setValueAtTime(this._isMuted ? 0 : 0.25, this._ctx.currentTime);
      this._masterGain.connect(this._ctx.destination);
    }

    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  /**
   * Toggle mute status
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.initContext();
    this._isMuted = !this._isMuted;

    if (this._masterGain && this._ctx) {
      const targetGain = this._isMuted ? 0 : 0.25;
      this._masterGain.gain.setTargetAtTime(targetGain, this._ctx.currentTime, 0.05);
    }

    if (!this._isMuted) {
      this.startAmbientDrone();
    } else {
      this.stopAmbientDrone();
    }

    this._eventBus.emit('audio:muteChanged', this._isMuted);
    return this._isMuted;
  }

  isMuted() {
    return this._isMuted;
  }

  /**
   * Play delicate futuristic hover chime
   * @param {number} [freq=880]
   */
  playHover(freq = 880) {
    if (this._isMuted || !this._ctx) return;
    this.initContext();

    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.08);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

    osc.connect(gain);
    gain.connect(this._masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Play letter interaction elastic tone
   * @param {number} noteIndex 
   */
  playLetterSound(noteIndex = 0) {
    if (this._isMuted || !this._ctx) return;
    this.initContext();

    // Pentatonic scale base frequencies
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
    const freq = pentatonic[noteIndex % pentatonic.length];

    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(gain);
    gain.connect(this._masterGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  /**
   * Play tactile UI button click
   */
  playClick() {
    if (this._isMuted || !this._ctx) return;
    this.initContext();

    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

    osc.connect(gain);
    gain.connect(this._masterGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  /**
   * Play theme transition harmonic chord
   */
  playThemeTransition() {
    if (this._isMuted || !this._ctx) return;
    this.initContext();

    const chord = [329.63, 493.88, 659.25];
    const t = this._ctx.currentTime;

    chord.forEach((freq, idx) => {
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.05, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(this._masterGain);

      osc.start(t + idx * 0.04);
      osc.stop(t + 0.46);
    });
  }

  /**
   * Play gravity scatter/restore whoosh
   * @param {boolean} isDispersing 
   */
  playGravitySound(isDispersing) {
    if (this._isMuted || !this._ctx) return;
    this.initContext();

    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.type = 'sawtooth';
    const startFreq = isDispersing ? 600 : 120;
    const endFreq = isDispersing ? 90 : 700;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.4);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

    osc.connect(gain);
    gain.connect(this._masterGain);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  /**
   * Play 3D particle morphing crystalline sound
   * @param {boolean} isText 
   */
  playMorphSound(isText) {
    if (this._isMuted || !this._ctx) return;
    this.initContext();

    const t = this._ctx.currentTime;
    const baseFreqs = isText ? [440, 554.37, 659.25, 880] : [880, 659.25, 554.37, 330];

    baseFreqs.forEach((freq, idx) => {
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.04, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this._masterGain);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.36);
    });
  }

  /**
   * Play cyber terminal keystroke tick
   */
  playKeystroke() {
    if (this._isMuted || !this._ctx) return;
    this.initContext();

    const t = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400 + Math.random() * 400, t);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(gain);
    gain.connect(this._masterGain);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  /**
   * Play futuristic camera shutter sound
   */
  playShutter() {
    if (this._isMuted || !this._ctx) return;
    this.initContext();
    const t = this._ctx.currentTime;

    // 1. Shutter snap (white noise / quick ramp)
    const osc1 = this._ctx.createOscillator();
    const gain1 = this._ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2400, t);
    osc1.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    gain1.gain.setValueAtTime(0.12, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc1.connect(gain1);
    gain1.connect(this._masterGain);
    osc1.start(t);
    osc1.stop(t + 0.06);

    // 2. High-tech confirmation chime
    const osc2 = this._ctx.createOscillator();
    const gain2 = this._ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, t + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(2093.0, t + 0.16);
    gain2.gain.setValueAtTime(0.08, t + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc2.connect(gain2);
    gain2.connect(this._masterGain);
    osc2.start(t + 0.04);
    osc2.stop(t + 0.23);
  }

  /**
   * Start ambient harmonic drone
   */
  startAmbientDrone() {
    if (!this._ctx || this._droneOsc1) return;

    this._droneGain = this._ctx.createGain();
    this._droneGain.gain.setValueAtTime(0.001, this._ctx.currentTime);
    this._droneGain.gain.linearRampToValueAtTime(0.03, this._ctx.currentTime + 2.0);

    const filter = this._ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, this._ctx.currentTime);

    this._droneOsc1 = this._ctx.createOscillator();
    this._droneOsc2 = this._ctx.createOscillator();

    this._droneOsc1.type = 'sine';
    this._droneOsc1.frequency.setValueAtTime(55, this._ctx.currentTime); // A1 note

    this._droneOsc2.type = 'sine';
    this._droneOsc2.frequency.setValueAtTime(110, this._ctx.currentTime); // A2 note

    this._droneOsc1.connect(filter);
    this._droneOsc2.connect(filter);
    filter.connect(this._droneGain);
    this._droneGain.connect(this._masterGain);

    this._droneOsc1.start();
    this._droneOsc2.start();
  }

  /**
   * Stop ambient drone
   */
  stopAmbientDrone() {
    if (!this._droneGain || !this._ctx) return;
    this._droneGain.gain.linearRampToValueAtTime(0.0001, this._ctx.currentTime + 0.5);

    setTimeout(() => {
      try {
        if (this._droneOsc1) {
          this._droneOsc1.stop();
          this._droneOsc1.disconnect();
          this._droneOsc1 = null;
        }
        if (this._droneOsc2) {
          this._droneOsc2.stop();
          this._droneOsc2.disconnect();
          this._droneOsc2 = null;
        }
      } catch (e) {
        // ignored
      }
    }, 600);
  }
}
