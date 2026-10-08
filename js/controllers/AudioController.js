/**
 * AudioController - Coordinates Audio Synthesizer Triggers with App Events
 */
export class AudioController {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/AudioModel.js').AudioModel} audioModel 
   */
  constructor(eventBus, audioModel) {
    this._eventBus = eventBus;
    this._audioModel = audioModel;
  }

  /**
   * Bind event listeners
   */
  init() {
    this._eventBus.on('ui:soundToggle', () => {
      this._audioModel.toggleMute();
    });

    this._eventBus.on('letter:hover', ({ index }) => {
      this._audioModel.playLetterSound(index);
    });

    this._eventBus.on('ui:hover', () => {
      this._audioModel.playHover(920);
    });

    this._eventBus.on('ui:click', () => {
      this._audioModel.playClick();
    });

    this._eventBus.on('theme:changed', () => {
      this._audioModel.playThemeTransition();
    });

    this._eventBus.on('physics:zeroGChanged', (isZeroG) => {
      this._audioModel.playGravitySound(isZeroG);
    });

    this._eventBus.on('webgl:morphChanged', (is3DMorph) => {
      this._audioModel.playMorphSound(is3DMorph);
    });

    this._eventBus.on('terminal:key', () => {
      this._audioModel.playKeystroke();
    });

    this._eventBus.on('ui:shutterSound', () => {
      this._audioModel.playShutter();
    });
  }
}
