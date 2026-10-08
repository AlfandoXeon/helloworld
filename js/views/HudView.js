import { DomUtils } from '../core/DomUtils.js';

/**
 * HudView - Floating Glassmorphic Control Dock & Performance HUD
 */
export class HudView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/ThemeModel.js').ThemeModel} themeModel 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   */
  constructor(eventBus, themeModel, stateModel) {
    this._eventBus = eventBus;
    this._themeModel = themeModel;
    this._stateModel = stateModel;

    this._soundBtn = DomUtils.$('#hud-sound-btn');
    this._themeBtn = DomUtils.$('#hud-theme-btn');
    this._themeLabel = DomUtils.$('#hud-theme-label');
    this._editBtn = DomUtils.$('#hud-edit-btn');
    this._morphBtn = DomUtils.$('#hud-morph-btn');
    this._particlesBtn = DomUtils.$('#hud-particles-btn');
    this._gravityBtn = DomUtils.$('#hud-gravity-btn');
    this._terminalBtn = DomUtils.$('#hud-terminal-btn');
    this._exportBtn = DomUtils.$('#hud-export-btn');
    this._fpsCounter = DomUtils.$('#hud-fps-counter');
    this._eqContainer = DomUtils.$('.audio-equalizer');

    this._bindEvents();
  }

  _bindEvents() {
    // Sound Button Click
    if (this._soundBtn) {
      this._soundBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:soundToggle');
      });
    }

    // Theme Button Click (Opens Color Studio)
    if (this._themeBtn) {
      this._themeBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:themePaletteToggle');
      });
    }

    // Custom Text Button Click
    if (this._editBtn) {
      this._editBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:customTextToggle');
      });
    }

    // 3D Morph Button Click
    if (this._morphBtn) {
      this._morphBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:morphToggle');
      });
    }

    // Background Particles Toggle Button Click
    if (this._particlesBtn) {
      this._particlesBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:particlesToggle');
      });
    }

    // Gravity Button Click
    if (this._gravityBtn) {
      this._gravityBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:gravityToggle');
      });
    }

    // Terminal Button Click
    if (this._terminalBtn) {
      this._terminalBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:terminalToggle');
      });
    }

    // Export Design Button Click
    if (this._exportBtn) {
      this._exportBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:exportDesign');
      });
    }

    // Sound Mute State Changed
    this._eventBus.on('audio:muteChanged', (isMuted) => {
      if (this._soundBtn && this._eqContainer) {
        if (!isMuted) {
          this._soundBtn.classList.add('active');
          this._eqContainer.classList.add('playing');
        } else {
          this._soundBtn.classList.remove('active');
          this._eqContainer.classList.remove('playing');
        }
      }
    });

    // Theme Changed
    this._eventBus.on('theme:changed', (theme) => {
      if (this._themeLabel && theme) {
        this._themeLabel.textContent = theme.name.split(' ')[0];
      }
    });

    // Theme Palette Modal Changed
    this._eventBus.on('modal:themePaletteChanged', (isOpen) => {
      if (this._themeBtn) {
        if (isOpen) {
          this._themeBtn.classList.add('active');
        } else {
          this._themeBtn.classList.remove('active');
        }
      }
    });

    // 3D Morph Changed
    this._eventBus.on('webgl:morphChanged', (is3DMorph) => {
      if (this._morphBtn) {
        if (is3DMorph) {
          this._morphBtn.classList.add('active');
        } else {
          this._morphBtn.classList.remove('active');
        }
      }
    });

    // Custom Text Modal Changed
    this._eventBus.on('modal:customTextChanged', (isOpen) => {
      if (this._editBtn) {
        if (isOpen) {
          this._editBtn.classList.add('active');
        } else {
          this._editBtn.classList.remove('active');
        }
      }
    });

    // Zero-G Changed
    this._eventBus.on('physics:zeroGChanged', (isZeroG) => {
      if (this._gravityBtn) {
        if (isZeroG) {
          this._gravityBtn.classList.add('active');
        } else {
          this._gravityBtn.classList.remove('active');
        }
      }
    });

    // Background Particles Visibility Changed
    this._eventBus.on('particles:toggleVisibility', (isVisible) => {
      if (this._particlesBtn) {
        if (isVisible) {
          this._particlesBtn.classList.add('active');
        } else {
          this._particlesBtn.classList.remove('active');
        }
      }
    });

    // FPS Updated
    this._eventBus.on('performance:fpsUpdated', (fps) => {
      if (this._fpsCounter) {
        this._fpsCounter.textContent = `${fps} FPS`;
      }
    });
  }
}
