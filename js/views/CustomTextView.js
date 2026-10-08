import { DomUtils } from '../core/DomUtils.js';

/**
 * CustomTextView - Interactive Floating Modal for Live Custom Text
 */
export class CustomTextView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   */
  constructor(eventBus, stateModel) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;

    this._modal = DomUtils.$('#custom-text-modal');
    this._input = DomUtils.$('#custom-text-input');
    this._closeBtn = DomUtils.$('#custom-text-close');
    this._cancelBtn = DomUtils.$('#custom-text-cancel');
    this._applyBtn = DomUtils.$('#custom-text-apply');
    this._counter = DomUtils.$('#custom-text-counter');

    this._bindEvents();
  }

  _bindEvents() {
    // Open / Close listener from StateModel
    this._eventBus.on('modal:customTextChanged', (isOpen) => {
      if (!this._modal) return;
      if (isOpen) {
        this._modal.classList.add('open');
        if (this._input) {
          this._input.value = this._stateModel.currentText;
          this._updateCounter();
          setTimeout(() => {
            this._input.focus();
            this._input.select();
          }, 120);
        }
      } else {
        this._modal.classList.remove('open');
      }
    });

    // Close button & Cancel button
    if (this._closeBtn) {
      this._closeBtn.addEventListener('click', () => {
        this._stateModel.setCustomTextModalOpen(false);
      });
    }

    if (this._cancelBtn) {
      this._cancelBtn.addEventListener('click', () => {
        this._stateModel.setCustomTextModalOpen(false);
      });
    }

    // Backdrop click
    if (this._modal) {
      this._modal.addEventListener('click', (e) => {
        if (e.target === this._modal) {
          this._stateModel.setCustomTextModalOpen(false);
        }
      });
    }

    // Input typing & counter update
    if (this._input) {
      this._input.addEventListener('input', () => {
        this._updateCounter();
      });

      this._input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._applyText(true);
        }
      });
    }

    // Apply button click
    if (this._applyBtn) {
      this._applyBtn.addEventListener('click', () => {
        this._applyText();
      });
    }
  }

  _updateCounter() {
    if (!this._input || !this._counter) return;
    const len = this._input.value.length;
    this._counter.textContent = `${len}/24`;
  }

  /**
   * @param {boolean} [fromKeyboard=false] Button clicks already get sound via event delegation
   */
  _applyText(fromKeyboard = false) {
    if (!this._input) return;
    const val = this._input.value.trim();
    if (val.length === 0) return;

    this._stateModel.setText(val);
    this._stateModel.setCustomTextModalOpen(false);
    if (fromKeyboard) this._eventBus.emit('ui:click'); // trigger sound feedback
  }
}
