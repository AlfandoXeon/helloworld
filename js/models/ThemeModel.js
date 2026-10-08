/**
 * ThemeModel - Manages Visual Themes, Curated Palettes & Arbitrary Custom Colors
 */
export class ThemeModel {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   */
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._isModalOpen = false;

    this._themes = [
      {
        id: 'obsidian',
        name: 'Obsidian Eclipse',
        description: 'Ultra-dark luxury black with glowing amber & cyan accents',
        primaryColor: '#f59e0b',
        secondaryColor: '#06b6d4',
        particleColor: '148, 163, 184',
        threePrimary: 0xf59e0b,
        threeSecondary: 0x06b6d4,
        fogColor: 0x070709
      },
      {
        id: 'cyber',
        name: 'Cyber Neon',
        description: 'Vibrant cyberpunk neon magenta and electric cyan',
        primaryColor: '#ff007f',
        secondaryColor: '#00f0ff',
        particleColor: '139, 92, 246',
        threePrimary: 0xff007f,
        threeSecondary: 0x00f0ff,
        fogColor: 0x080314
      },
      {
        id: 'ethereal',
        name: 'Ethereal Pearl',
        description: 'Cosmic icy blue and celestial violet aurora',
        primaryColor: '#38bdf8',
        secondaryColor: '#818cf8',
        particleColor: '148, 163, 184',
        threePrimary: 0x38bdf8,
        threeSecondary: 0x818cf8,
        fogColor: 0x0a0f1d
      },
      {
        id: 'matrix',
        name: 'Matrix Protocol',
        description: 'Phosphor emerald digital rain and scanlines',
        primaryColor: '#10b981',
        secondaryColor: '#34d399',
        particleColor: '16, 185, 129',
        threePrimary: 0x10b981,
        threeSecondary: 0x34d399,
        fogColor: 0x030804
      },
      {
        id: 'crimson',
        name: 'Crimson Void',
        description: 'Obsidian dark with burning ruby and blood orange neon',
        primaryColor: '#ef4444',
        secondaryColor: '#f97316',
        particleColor: '148, 163, 184',
        threePrimary: 0xef4444,
        threeSecondary: 0xf97316,
        fogColor: 0x0a0304
      },
      {
        id: 'amethyst',
        name: 'Royal Amethyst',
        description: 'Deep royal purple with ultraviolet and rose glow',
        primaryColor: '#a855f7',
        secondaryColor: '#ec4899',
        particleColor: '148, 163, 184',
        threePrimary: 0xa855f7,
        threeSecondary: 0xec4899,
        fogColor: 0x090312
      },
      {
        id: 'solaris',
        name: 'Solaris Flare',
        description: 'Warm solar sunset with electric coral and sunburst gold',
        primaryColor: '#f97316',
        secondaryColor: '#eab308',
        particleColor: '148, 163, 184',
        threePrimary: 0xf97316,
        threeSecondary: 0xeab308,
        fogColor: 0x0a0502
      },
      {
        id: 'nordic',
        name: 'Nordic Glacier',
        description: 'Crisp glacier mint and frosted celestial cyan',
        primaryColor: '#2dd4bf',
        secondaryColor: '#38bdf8',
        particleColor: '148, 163, 184',
        threePrimary: 0x2dd4bf,
        threeSecondary: 0x38bdf8,
        fogColor: 0x050b11
      }
    ];

    this._currentThemeId = 'obsidian';
    this._customTheme = null;
  }

  get isModalOpen() {
    return this._isModalOpen;
  }

  /**
   * Get list of all available preset themes
   * @returns {Array<Object>}
   */
  getThemes() {
    return [...this._themes];
  }

  /**
   * Get current active theme
   * @returns {Object}
   */
  getCurrentTheme() {
    if (this._currentThemeId === 'custom' && this._customTheme) {
      return this._customTheme;
    }
    return this._themes.find(t => t.id === this._currentThemeId) || this._themes[0];
  }

  /**
   * Set theme by preset ID
   * @param {string} themeId 
   */
  setTheme(themeId) {
    const target = this._themes.find(t => t.id === themeId);
    if (!target) return;

    this._currentThemeId = target.id;
    this._customTheme = null;

    // Reset any inline overrides
    document.documentElement.style.removeProperty('--accent-primary');
    document.documentElement.style.removeProperty('--accent-secondary');
    document.documentElement.style.removeProperty('--accent-glow');
    document.documentElement.style.removeProperty('--cursor-dot');
    document.documentElement.style.removeProperty('--cursor-ring');

    if (target.id === 'obsidian') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', target.id);
    }

    this._eventBus.emit('theme:changed', target);
  }

  /**
   * Set an arbitrary custom hex color
   * @param {string} hex 
   */
  setCustomColor(hex) {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

    // Convert hex to rgb components
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Complementary / shifted secondary color (slightly rotated/brighter)
    const secR = Math.min(255, Math.floor(r * 0.8 + 40));
    const secG = Math.min(255, Math.floor(g * 0.9 + 50));
    const secB = Math.min(255, Math.floor(b * 1.1 + 60));
    const secHex = `#${secR.toString(16).padStart(2, '0')}${secG.toString(16).padStart(2, '0')}${secB.toString(16).padStart(2, '0')}`;

    // Apply directly to root inline styles for instant CSS reactive glow
    document.documentElement.style.setProperty('--accent-primary', hex);
    document.documentElement.style.setProperty('--accent-secondary', secHex);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
    document.documentElement.style.setProperty('--cursor-dot', hex);
    document.documentElement.style.setProperty('--cursor-ring', `rgba(${r}, ${g}, ${b}, 0.7)`);

    const numPrimary = parseInt(hex.replace('#', ''), 16);
    const numSecondary = parseInt(secHex.replace('#', ''), 16);

    this._currentThemeId = 'custom';
    this._customTheme = {
      id: 'custom',
      name: `Custom (${hex.toUpperCase()})`,
      description: 'User-defined bespoke radiant neon palette',
      primaryColor: hex,
      secondaryColor: secHex,
      particleColor: '148, 163, 184',
      threePrimary: numPrimary,
      threeSecondary: numSecondary,
      fogColor: 0x070709
    };

    this._eventBus.emit('theme:changed', this._customTheme);
  }

  /**
   * Cycle to next theme
   */
  cycleTheme() {
    const currentIndex = this._themes.findIndex(t => t.id === this._currentThemeId);
    const nextIndex = (currentIndex + 1) % this._themes.length;
    this.setTheme(this._themes[nextIndex].id);
  }

  setModalOpen(isOpen) {
    this._isModalOpen = isOpen;
    this._eventBus.emit('modal:themePaletteChanged', isOpen);
  }

  toggleModal() {
    this.setModalOpen(!this._isModalOpen);
    return this._isModalOpen;
  }
}
