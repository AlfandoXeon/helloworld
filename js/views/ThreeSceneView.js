import { DomUtils } from '../core/DomUtils.js';
import { MathUtils } from '../core/MathUtils.js';

/**
 * ThreeSceneView - Advanced 3D WebGL Particle Text Morphing Scene
 * Features 3D Volumetric points morphing between Cosmic Nebula and "HELLO WORLD" typography.
 */
export class ThreeSceneView {
  /**
   * @param {import('../core/EventEmitter.js').EventEmitter} eventBus 
   * @param {import('../models/StateModel.js').StateModel} stateModel 
   * @param {import('../models/ThemeModel.js').ThemeModel} themeModel 
   */
  constructor(eventBus, stateModel, themeModel) {
    this._eventBus = eventBus;
    this._stateModel = stateModel;
    this._themeModel = themeModel;

    this._canvas = DomUtils.$('#canvas-webgl');
    this._isSupported = typeof window.THREE !== 'undefined' && !!this._canvas;

    if (!this._isSupported) {
      console.warn('Three.js or #canvas-webgl not available. 3D WebGL view skipped.');
      return;
    }

    this._count = window.innerWidth < 768 ? 3200 : 6400;
    this._morphMode = 'nebula'; // 'nebula' | 'text' | 'zeroG'
    this._morphProgress = 0;
    this._currentText = 'HELLO WORLD';

    // Buffer position arrays
    this._currentPositions = new Float32Array(this._count * 3);
    this._nebulaPositions = new Float32Array(this._count * 3);
    this._textPositions = new Float32Array(this._count * 3);
    this._zeroGPositions = new Float32Array(this._count * 3);

    this._targetPositions = this._nebulaPositions;

    this._initThree();
    this._generateNebulaPositions();
    this._generateTextPositions();
    this._generateZeroGPositions();
    this._initParticles();
    this._bindEvents();
  }

  _initThree() {
    const THREE = window.THREE;
    const { width, height, dpr } = this._stateModel.viewport;

    // Scene & Fog
    this._scene = new THREE.Scene();
    const currentTheme = this._themeModel.getCurrentTheme();
    this._scene.fog = new THREE.FogExp2(currentTheme.fogColor || 0x070709, 0.001);

    // Camera
    const aspect = width / height;
    this._camera = new THREE.PerspectiveCamera(55, aspect, 1, 3000);
    this._camera.position.z = aspect < 0.65 ? 880 : (aspect < 0.95 ? 700 : 520);

    // Renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: this._canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });

    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(dpr);
  }

  /**
   * Create procedural radial glow sprite texture
   */
  _createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new window.THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generate 3D Spherical Cosmic Nebula Positions
   */
  _generateNebulaPositions() {
    for (let i = 0; i < this._count; i++) {
      const idx = i * 3;
      // Spherical distribution with logarithmic arms
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const radius = Math.cbrt(Math.random()) * 320;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      this._nebulaPositions[idx] = x;
      this._nebulaPositions[idx + 1] = y;
      this._nebulaPositions[idx + 2] = z;

      // Initialize current positions to nebula
      this._currentPositions[idx] = x;
      this._currentPositions[idx + 1] = y;
      this._currentPositions[idx + 2] = z;
    }
  }

  /**
   * Sample 2D offscreen canvas pixels to form 3D text coordinates dynamically
   */
  _generateTextPositions() {
    const offscreen = document.createElement('canvas');
    offscreen.width = 1400;
    offscreen.height = 380;
    const ctx = offscreen.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    ctx.fillStyle = '#ffffff';
    const text = (this._currentText || 'HELLO WORLD').toUpperCase();
    const fontSize = Math.max(60, Math.min(130, Math.floor(1250 / Math.max(text.length, 6))));
    ctx.font = `900 ${fontSize}px Syne, Space Grotesk, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, offscreen.width / 2, offscreen.height / 2);

    const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    const pixels = imgData.data;
    const sampledPoints = [];

    // Scan pixels
    const step = 4;
    for (let y = 0; y < offscreen.height; y += step) {
      for (let x = 0; x < offscreen.width; x += step) {
        const pIndex = (y * offscreen.width + x) * 4;
        if (pixels[pIndex] > 128) {
          sampledPoints.push({
            x: (x - offscreen.width / 2) * 0.72,
            y: -(y - offscreen.height / 2) * 0.72
          });
        }
      }
    }

    // Map sampled points to textPositions buffer with 3D volumetric depth
    for (let i = 0; i < this._count; i++) {
      const idx = i * 3;
      if (sampledPoints.length > 0) {
        const pt = sampledPoints[i % sampledPoints.length];
        this._textPositions[idx] = pt.x + (Math.random() - 0.5) * 5;
        this._textPositions[idx + 1] = pt.y + (Math.random() - 0.5) * 5;
        this._textPositions[idx + 2] = (Math.random() - 0.5) * 60; // 3D depth extrusion
      } else {
        this._textPositions[idx] = (Math.random() - 0.5) * 400;
        this._textPositions[idx + 1] = (Math.random() - 0.5) * 100;
        this._textPositions[idx + 2] = (Math.random() - 0.5) * 50;
      }
    }
  }

  /**
   * Generate chaotic supernova dispersion coordinates
   */
  _generateZeroGPositions() {
    for (let i = 0; i < this._count; i++) {
      const idx = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const distance = MathUtils.random(350, 950);

      this._zeroGPositions[idx] = Math.cos(angle) * distance;
      this._zeroGPositions[idx + 1] = (Math.random() - 0.5) * 700;
      this._zeroGPositions[idx + 2] = Math.sin(angle) * distance;
    }
  }

  _initParticles() {
    const THREE = window.THREE;
    this._geometry = new THREE.BufferGeometry();

    this._geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this._currentPositions, 3)
    );

    // Color gradient setup
    this._colors = new Float32Array(this._count * 3);
    this._updateColors(false);

    this._geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(this._colors, 3)
    );

    this._material = new THREE.PointsMaterial({
      size: window.innerWidth < 768 ? 4.5 : 5.8,
      map: this._createGlowTexture(),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    this._points = new THREE.Points(this._geometry, this._material);
    this._scene.add(this._points);
  }

  _updateColors(isTextMode = false) {
    let primary, secondary;
    if (isTextMode) {
      const currentTheme = this._themeModel.getCurrentTheme();
      primary = new window.THREE.Color(currentTheme.threePrimary || 0xf59e0b);
      secondary = new window.THREE.Color(currentTheme.threeSecondary || 0x06b6d4);
    } else {
      // Gentle, elegant cosmic starlight (Slate 400 & soft ice cyan)
      primary = new window.THREE.Color(0x94a3b8);
      secondary = new window.THREE.Color(0x38bdf8);
    }

    for (let i = 0; i < this._count; i++) {
      const idx = i * 3;
      const ratio = Math.random();
      const mixed = primary.clone().lerp(secondary, ratio);

      this._colors[idx] = mixed.r;
      this._colors[idx + 1] = mixed.g;
      this._colors[idx + 2] = mixed.b;
    }

    if (this._geometry && this._geometry.attributes.color) {
      this._geometry.attributes.color.needsUpdate = true;
    }
  }

  _bindEvents() {
    this._eventBus.on('viewport:resized', () => {
      if (!this._renderer || !this._camera) return;
      const { width, height, dpr } = this._stateModel.viewport;
      const aspect = width / height;
      this._camera.aspect = aspect;
      this._camera.position.z = aspect < 0.65 ? 880 : (aspect < 0.95 ? 700 : 520);
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(width, height);
      this._renderer.setPixelRatio(dpr);
    });

    // Theme Changed
    this._eventBus.on('theme:changed', (theme) => {
      this._updateColors(this._morphMode === 'text');
      if (this._scene && this._scene.fog && theme && theme.fogColor) {
        this._scene.fog.color.setHex(theme.fogColor);
      }
    });

    // Custom Text Changed
    this._eventBus.on('text:changed', (newText) => {
      this.updateText(newText);
    });

    // 3D Morph Toggled
    this._eventBus.on('webgl:morphChanged', (is3DMorph) => {
      this.setMorphMode(is3DMorph ? 'text' : 'nebula');
    });

    // Zero-G Physics Toggled
    this._eventBus.on('physics:zeroGChanged', (isZeroG) => {
      if (isZeroG) {
        this.setMorphMode('zeroG');
      } else {
        this.setMorphMode(this._stateModel.is3DMorph ? 'text' : 'nebula');
      }
    });

    // Toggle Background Particles Visibility
    this._eventBus.on('particles:toggleVisibility', (isVisible) => {
      if (this._morphMode === 'nebula') {
        if (window.gsap && this._material) {
          if (isVisible && this._points) this._points.visible = true;
          window.gsap.to(this._material, {
            opacity: isVisible ? 0.48 : 0,
            duration: 0.6,
            onComplete: () => {
              if (!isVisible && this._points) this._points.visible = false;
            }
          });
        } else if (this._points) {
          this._points.visible = isVisible;
        }
      }
    });
  }

  /**
   * Dynamically update 3D text coordinates and re-morph if active
   * @param {string} newText 
   */
  updateText(newText) {
    if (!newText) return;
    this._currentText = newText;
    this._generateTextPositions();
    if (this._morphMode === 'text') {
      this.setMorphMode('text');
    }
  }

  /**
   * Trigger smooth GSAP morph transition between particle states
   * @param {'nebula' | 'text' | 'zeroG'} mode 
   */
  setMorphMode(mode) {
    if (!this._isSupported) return;
    this._morphMode = mode;

    if (mode === 'text') {
      if (this._points) this._points.visible = true;
      this._targetPositions = this._textPositions;
      this._updateColors(true);
      if (window.gsap && this._material) {
        window.gsap.to(this._material, { opacity: 0.88, size: 7.2, duration: 1.0 });
      }
    } else if (mode === 'zeroG') {
      this._targetPositions = this._zeroGPositions;
    } else {
      this._targetPositions = this._nebulaPositions;
      this._updateColors(false);
      const isVisible = this._stateModel.isBgParticlesVisible;
      if (this._points) this._points.visible = isVisible;
      if (window.gsap && this._material) {
        window.gsap.to(this._material, { opacity: isVisible ? 0.48 : 0, size: 5.2, duration: 1.0 });
      }
    }

    // Animate points towards target positions
    if (window.gsap) {
      const duration = mode === 'text' ? 1.8 : 2.2;
      const ease = mode === 'text' ? 'elastic.out(1, 0.45)' : 'power3.out';

      const animObj = { progress: 0 };
      const startSnapshots = new Float32Array(this._currentPositions);

      window.gsap.to(animObj, {
        progress: 1,
        duration: duration,
        ease: ease,
        onUpdate: () => {
          const p = animObj.progress;
          for (let i = 0; i < this._count * 3; i++) {
            this._currentPositions[i] = startSnapshots[i] + (this._targetPositions[i] - startSnapshots[i]) * p;
          }
          this._geometry.attributes.position.needsUpdate = true;
        }
      });
    }
  }

  /**
   * Render cycle called on RAF
   */
  render() {
    if (!this._isSupported || !this._renderer) return;

    const mouse = this._stateModel.mouse;
    const { width, height } = this._stateModel.viewport;
    const orbit = this._stateModel.orbit;

    // Normalised mouse coordinates (-1 to 1)
    const normX = (mouse.targetX / width) * 2 - 1;
    const normY = -(mouse.targetY / height) * 2 + 1;

    // Parallax & Orbit rotation
    orbit.rotateX = MathUtils.lerp(orbit.rotateX, orbit.targetRotateX + normY * 0.15, 0.05);
    orbit.rotateY = MathUtils.lerp(orbit.rotateY, orbit.targetRotateY + normX * 0.25, 0.05);

    if (this._points) {
      this._points.rotation.y = orbit.rotateY;
      this._points.rotation.x = orbit.rotateX;

      // Slow ambient cosmic rotation when in nebula mode
      if (this._morphMode === 'nebula') {
        this._points.rotation.z += 0.0008;
      }
    }

    this._renderer.render(this._scene, this._camera);
  }

  /**
   * Immediately render current frame to WebGL buffer
   */
  renderImmediate() {
    if (this._isSupported && this._renderer && this._scene && this._camera) {
      this._renderer.render(this._scene, this._camera);
    }
  }

  get canvas() {
    return this._canvas;
  }
}
