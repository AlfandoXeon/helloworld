import { DomUtils } from '../core/DomUtils.js';

/**
 * ThemePaletteView - Color Studio & Interactive Theme Palette Popover
 * Allows choosing from 8 luxury palettes or picking arbitrary custom hex colors.
 */
export class ThemePaletteView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/ThemeModel.js').ThemeModel} themeModel 
   */
  constructor(eventBus, themeModel) {
    this._eventBus = eventBus;
    this._themeModel = themeModel;

    this._modal = DomUtils.$('#theme-palette-modal');
    this._closeBtn = DomUtils.$('#theme-modal-close');
    this._presetsGrid = DomUtils.$('#theme-presets-grid');
    this._colorPicker = DomUtils.$('#theme-custom-color-input');
    this._hexInput = DomUtils.$('#theme-hex-input');
    this._previewBox = DomUtils.$('#theme-color-preview-box');
    this._applyBtn = DomUtils.$('#theme-custom-apply');

    this._renderPresets();
    this._bindEvents();
  }

  _renderPresets() {
    if (!this._presetsGrid) return;
    this._presetsGrid.innerHTML = '';

    const themes = this._themeModel.getThemes();
    const current = this._themeModel.getCurrentTheme();

    themes.forEach((theme) => {
      const btn = DomUtils.create('button', 'p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex flex-col items-center gap-2 transition-all cursor-pointer group text-left w-full');
      btn.dataset.themeId = theme.id;

      if (current.id === theme.id) {
        btn.classList.add('border-amber-400', 'bg-white/15', 'shadow-lg');
      }

      // Dual color dots
      const dotsRow = DomUtils.create('div', 'flex items-center gap-1.5');
      const dot1 = DomUtils.create('span', 'w-3.5 h-3.5 rounded-full inline-block shadow-sm');
      dot1.style.backgroundColor = theme.primaryColor;
      const dot2 = DomUtils.create('span', 'w-2.5 h-2.5 rounded-full inline-block opacity-75');
      dot2.style.backgroundColor = theme.secondaryColor;

      dotsRow.appendChild(dot1);
      dotsRow.appendChild(dot2);

      // Name label
      const name = DomUtils.create('span', 'text-[11px] font-mono text-slate-300 group-hover:text-white truncate max-w-full');
      name.textContent = theme.name.split(' ')[0]; // short name

      btn.appendChild(dotsRow);
      btn.appendChild(name);

      btn.addEventListener('click', () => {
        this._themeModel.setTheme(theme.id);
        this._themeModel.setModalOpen(false);
        this._eventBus.emit('ui:click');
      });

      this._presetsGrid.appendChild(btn);
    });
  }

  _bindEvents() {
    // Modal state listener
    this._eventBus.on('modal:themePaletteChanged', (isOpen) => {
      if (!this._modal) return;
      if (isOpen) {
        this._modal.classList.add('open');
        this._updateActiveSelection();
      } else {
        this._modal.classList.remove('open');
      }
    });

    // Theme changed listener
    this._eventBus.on('theme:changed', (theme) => {
      this._updateActiveSelection();
      if (theme && theme.primaryColor && this._previewBox && this._hexInput) {
        this._previewBox.style.backgroundColor = theme.primaryColor;
        this._previewBox.style.boxShadow = `0 0 10px ${theme.primaryColor}`;
        this._hexInput.value = theme.primaryColor.toUpperCase();
        if (this._colorPicker && theme.primaryColor.startsWith('#')) {
          this._colorPicker.value = theme.primaryColor;
        }
      }
    });

    // Close button
    if (this._closeBtn) {
      this._closeBtn.addEventListener('click', () => {
        this._themeModel.setModalOpen(false);
      });
    }

    // Backdrop click
    if (this._modal) {
      this._modal.addEventListener('click', (e) => {
        if (e.target === this._modal) {
          this._themeModel.setModalOpen(false);
        }
      });
    }

    // Color picker real-time input
    if (this._colorPicker) {
      this._colorPicker.addEventListener('input', (e) => {
        const hex = e.target.value;
        if (this._hexInput) this._hexInput.value = hex.toUpperCase();
        if (this._previewBox) {
          this._previewBox.style.backgroundColor = hex;
          this._previewBox.style.boxShadow = `0 0 10px ${hex}`;
        }
        this._themeModel.setCustomColor(hex);
      });
    }

    // Hex text input Apply
    if (this._applyBtn) {
      this._applyBtn.addEventListener('click', () => {
        this._applyHexInput();
      });
    }

    if (this._hexInput) {
      this._hexInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._applyHexInput();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this._themeModel.setModalOpen(false);
        }
      });
    }
  }

  _applyHexInput() {
    if (!this._hexInput) return;
    let hex = this._hexInput.value.trim();
    if (!hex.startsWith('#')) hex = `#${hex}`;

    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this._themeModel.setCustomColor(hex);
      this._themeModel.setModalOpen(false);
      this._eventBus.emit('ui:click');
    }
  }

  _updateActiveSelection() {
    if (!this._presetsGrid) return;
    const current = this._themeModel.getCurrentTheme();

    const buttons = this._presetsGrid.querySelectorAll('button');
    buttons.forEach((btn) => {
      if (btn.dataset.themeId === current.id) {
        btn.classList.add('border-amber-400', 'bg-white/15', 'shadow-lg');
      } else {
        btn.classList.remove('border-amber-400', 'bg-white/15', 'shadow-lg');
      }
    });
  }
}
