import { DomUtils } from '../core/DomUtils.js';

/**
 * TerminalView - Interactive Cyber Terminal Modal (Easter Egg Console)
 */
export class TerminalView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   * @param {import('../models/ThemeModel.js').ThemeModel} themeModel 
   */
  constructor(eventBus, stateModel, themeModel) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;
    this._themeModel = themeModel;

    this._backdrop = DomUtils.$('#terminal-modal');
    this._window = this._backdrop ? DomUtils.$('.terminal-window', this._backdrop) : null;
    this._closeBtn = DomUtils.$('#terminal-close-btn');
    this._body = this._backdrop ? DomUtils.$('.terminal-body', this._backdrop) : null;
    this._input = DomUtils.$('#terminal-input');

    this._bindEvents();
  }

  _bindEvents() {
    if (this._closeBtn) {
      this._closeBtn.addEventListener('click', () => {
        this._eventBus.emit('ui:terminalToggle');
      });
    }

    if (this._backdrop) {
      this._backdrop.addEventListener('click', (e) => {
        if (e.target === this._backdrop) {
          this._eventBus.emit('ui:terminalToggle');
        }
      });
    }

    if (this._input) {
      this._input.addEventListener('keydown', (e) => {
        this._eventBus.emit('terminal:key');

        if (e.key === 'Enter') {
          const command = this._input.value.trim();
          this._handleCommand(command);
          this._input.value = '';
        }
      });
    }

    this._eventBus.on('terminal:stateChanged', (isOpen) => {
      if (this._backdrop) {
        if (isOpen) {
          this._backdrop.classList.add('open');
          setTimeout(() => this._input && this._input.focus(), 100);
        } else {
          this._backdrop.classList.remove('open');
          if (this._input) this._input.blur();
        }
      }
    });
  }

  _print(text, type = 'normal') {
    if (!this._body) return;
    const line = DomUtils.create('div', `terminal-log-line ${type}`);
    line.textContent = text;
    if (type === 'system') line.style.color = 'var(--accent-primary)';
    if (type === 'error') line.style.color = '#ef4444';
    if (type === 'cyan') line.style.color = 'var(--accent-secondary)';

    // Insert before prompt
    const promptLine = DomUtils.$('.terminal-prompt-line', this._body);
    if (promptLine) {
      this._body.insertBefore(line, promptLine);
    } else {
      this._body.appendChild(line);
    }

    this._body.scrollTop = this._body.scrollHeight;
  }

  _handleCommand(cmd) {
    if (!cmd) return;
    this._print(`> ${cmd}`, 'cmd');

    const parts = cmd.toLowerCase().split(/\s+/);
    const root = parts[0];
    const arg = parts[1];
    const themeIds = this._themeModel.getThemes().map((t) => t.id);

    switch (root) {
      case 'help':
        this._print('Available Commands:', 'system');
        this._print('  help             - Show this cheat sheet');
        this._print('  text <words>     - Change displayed text (e.g. text CODING)');
        this._print('  theme <name>     - Change theme');
        this._print(`                     (${themeIds.join(', ')})`);
        this._print('  morph / 3d       - Toggle 3D WebGL particle text morph');
        this._print('  particles / bg   - Toggle background ball particles');
        this._print('  export / save    - Download high-res PNG wallpaper');
        this._print('  gravity          - Toggle Zero-G dispersion');
        this._print('  audio            - Toggle audio synthesizer');
        this._print('  about            - Read the legend of "Hello, World!"');
        this._print('  clear            - Clear terminal output');
        this._print('  exit             - Close terminal window');
        break;

      case 'export':
      case 'save':
      case 'screenshot':
      case 'download':
        this._eventBus.emit('ui:exportDesign');
        this._print('[OK] Rendering high-resolution PNG snapshot...', 'system');
        break;

      case 'text':
      case 'say':
        const newCustomText = cmd.slice(root.length).trim();
        if (newCustomText.length > 0) {
          this._stateModel.setText(newCustomText);
          this._print(`[OK] Text updated to: "${newCustomText.slice(0, 24)}"`, 'system');
        } else {
          this._print('Error: Specify text, e.g.: text HELLO DEVELOPER', 'error');
        }
        break;

      case 'theme':
        if (themeIds.includes(arg)) {
          this._themeModel.setTheme(arg);
          this._print(`[OK] Theme switched to: ${arg.toUpperCase()}`, 'system');
        } else {
          this._print(`Error: Specify a valid theme: ${themeIds.join(', ')}`, 'error');
        }
        break;

      case 'particles':
      case 'bg':
        this._eventBus.emit('ui:particlesToggle');
        this._print('[OK] Background particles visibility toggled.', 'system');
        break;

      case '3d':
      case 'morph':
        this._eventBus.emit('ui:morphToggle');
        this._print('[OK] 3D WebGL particle morph toggled.', 'system');
        break;

      case 'gravity':
        this._eventBus.emit('ui:gravityToggle');
        this._print('[OK] Zero-G physics toggled.', 'system');
        break;

      case 'audio':
        this._eventBus.emit('ui:soundToggle');
        this._print('[OK] Audio state toggled.', 'system');
        break;

      case 'about':
        this._print('=== HELLO, WORLD! // ORIGIN STORY ===', 'cyan');
        this._print('First introduced in 1972 by Brian Kernighan in Bell Labs internal tutorial');
        this._print('for the B programming language: "A Tutorial Introduction to the Language B".');
        this._print('Later immortalized in Kernighan & Ritchie\'s legendary 1978 book "The C Programming Language".');
        this._print('It stands as every developer\'s timeless rite of passage into creation.', 'cyan');
        break;

      case 'clear':
        const logs = this._body.querySelectorAll('.terminal-log-line');
        logs.forEach(l => l.remove());
        break;

      case 'exit':
        this._eventBus.emit('ui:terminalToggle');
        break;

      default:
        this._print(`Command not recognized: "${cmd}". Type "help" for instructions.`, 'error');
        break;
    }
  }
}
