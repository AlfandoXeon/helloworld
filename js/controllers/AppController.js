import { EventEmitter } from '../core/EventEmitter.js';
import { StateModel } from '../models/StateModel.js';
import { ThemeModel } from '../models/ThemeModel.js';
import { AudioModel } from '../models/AudioModel.js';
import { PreloaderView } from '../views/PreloaderView.js';
import { CursorView } from '../views/CursorView.js';
import { CanvasBackgroundView } from '../views/CanvasBackgroundView.js';
import { HeroView } from '../views/HeroView.js';
import { HudView } from '../views/HudView.js';
import { TerminalView } from '../views/TerminalView.js';
import { ThreeSceneView } from '../views/ThreeSceneView.js';
import { CustomTextView } from '../views/CustomTextView.js';
import { ThemePaletteView } from '../views/ThemePaletteView.js';
import { ExportView } from '../views/ExportView.js';
import { InteractionController } from './InteractionController.js';
import { AudioController } from './AudioController.js';
import { ViewportController } from './ViewportController.js';

/**
 * AppController - Master Lifecycle Orchestrator
 */
export class AppController {
  constructor() {
    this._eventBus = new EventEmitter();

    // Models
    this._stateModel = new StateModel(this._eventBus);
    this._themeModel = new ThemeModel(this._eventBus);
    this._audioModel = new AudioModel(this._eventBus);

    // Views
    this._preloaderView = new PreloaderView(this._eventBus);
    this._cursorView = new CursorView(this._eventBus, this._stateModel);
    this._canvasView = new CanvasBackgroundView(this._eventBus, this._stateModel, this._themeModel);
    this._threeView = new ThreeSceneView(this._eventBus, this._stateModel, this._themeModel);
    this._heroView = new HeroView(this._eventBus, this._stateModel);
    this._hudView = new HudView(this._eventBus, this._themeModel, this._stateModel);
    this._terminalView = new TerminalView(this._eventBus, this._stateModel, this._themeModel);
    this._customTextView = new CustomTextView(this._eventBus, this._stateModel);
    this._themePaletteView = new ThemePaletteView(this._eventBus, this._themeModel);
    this._exportView = new ExportView(this._eventBus, this._stateModel, this._themeModel, this._threeView, this._canvasView);

    // Controllers
    this._interactionController = new InteractionController(this._eventBus, this._stateModel);
    this._audioController = new AudioController(this._eventBus, this._audioModel);
    this._viewportController = new ViewportController(this._eventBus, this._stateModel);

    // Performance metrics
    this._lastFrameTime = performance.now();
    this._frameCount = 0;
    this._fpsTimer = performance.now();

    this._boundLoop = this._loop.bind(this);
  }

  /**
   * Bootstrap application
   */
  init() {
    this._bindCoreEvents();

    // Initialize interaction and audio listeners right away
    this._interactionController.init();
    this._audioController.init();

    // Measure layout (dock, safe areas, keyboard) and broadcast viewport
    this._viewportController.init();

    // Start preloader sequence
    this._preloaderView.start();

    // Start render loop immediately for cursor & canvas
    requestAnimationFrame(this._boundLoop);
  }

  _bindCoreEvents() {
    // Escape: close whichever modal is open (terminal, custom text, color studio)
    this._eventBus.on('ui:escape', () => {
      if (this._stateModel.isTerminalOpen) this._stateModel.setTerminalOpen(false);
      if (this._stateModel.isCustomTextOpen) this._stateModel.setCustomTextModalOpen(false);
      if (this._themeModel.isModalOpen) this._themeModel.setModalOpen(false);
    });

    // Theme cycle / palette actions
    this._eventBus.on('ui:themeCycle', () => {
      this._themeModel.cycleTheme();
    });

    this._eventBus.on('ui:themePaletteToggle', () => {
      this._themeModel.toggleModal();
    });

    // Custom Text modal toggle action
    this._eventBus.on('ui:customTextToggle', () => {
      this._stateModel.toggleCustomTextModal();
    });

    // 3D Morph toggle action
    this._eventBus.on('ui:morphToggle', () => {
      this._stateModel.toggle3DMorph();
    });

    // Background particles toggle action
    this._eventBus.on('ui:particlesToggle', () => {
      this._stateModel.toggleBgParticles();
    });

    // Zero-G toggle action
    this._eventBus.on('ui:gravityToggle', () => {
      this._stateModel.toggleZeroG();
    });

    // Terminal toggle action
    this._eventBus.on('ui:terminalToggle', () => {
      this._stateModel.toggleTerminal();
    });

    // Preloader finish
    this._eventBus.once('preloader:completed', () => {
      this._stateModel.setStage('ready');
      this._heroView.animateEntrance();
    });
  }

  /**
   * Main Animation Loop (RAF)
   */
  _loop(now) {
    // Calculate FPS
    this._frameCount++;
    if (now - this._fpsTimer >= 1000) {
      const currentFps = Math.round((this._frameCount * 1000) / (now - this._fpsTimer));
      this._stateModel.setFps(currentFps);
      this._frameCount = 0;
      this._fpsTimer = now;
    }

    // Update Views
    this._cursorView.update();
    this._canvasView.render();
    if (this._threeView) {
      this._threeView.render();
    }
    this._heroView.updateTilt();

    requestAnimationFrame(this._boundLoop);
  }
}
