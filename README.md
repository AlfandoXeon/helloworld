# Hello, World! - The Genesis of Code

An award-winning kinetic typography and WebGL showcase honoring computer science's most timeless invocation: "Hello, World!". Built with pure Vanilla JavaScript (Object-Oriented Programming and Model-View-Controller architecture), GSAP, and Three.js.

The project runs completely static without requiring Node.js, npm packages, or build compilation steps.

---

## Table of Contents

- Overview
- Key Features
- Controls and Shortcuts
- Terminal Commands
- Architecture and Directory Structure
- Getting Started
- GitHub Pages Deployment
- Technology Stack
- Historical Context
- License

---

## Overview

First printed in 1972 in Brian Kernighan's internal Bell Labs tutorial for the B programming language, and popularized in the 1978 book "The C Programming Language" by Kernighan and Dennis Ritchie, "Hello, World!" marks every programmer's first spark of creation.

This showcase transforms that foundational phrase into an interactive, digital art piece. It combines modern kinetic typography, procedural WebGL particle simulations, interactive sound synthesis, dynamic themes, and a high-resolution wallpaper exporter.

---

## Key Features

### 1. Kinetic Typography with Elastic Physics
- Responsive typography rendered with the Syne typeface and Space Grotesk accents.
- Individual character bending, 3D rotations, and elastic snapping powered by GreenSock Animation Platform (GSAP).
- Radiant neon glow effects and custom punctuation styling.

### 2. Three.js 3D WebGL Particle Engine
- Volumetric point cloud morphing dynamically between a cosmic orbital nebula, 3D text glyphs, and zero-gravity celestial fields.
- Interactive mouse parallax and drag-orbit controls with smooth damping.
- Preserved WebGL drawing buffer for crystal-clear frame compositing.
- Particle visibility toggle to soften or hide background points behind typography.

### 3. Color Studio and Theme Customizer
- Eight curated luxury color palettes:
  - Obsidian Eclipse (Amber and Deep Space)
  - Cyber Neon (Magenta and Cyan)
  - Ethereal Pearl (Sky Blue and Indigo)
  - Matrix Protocol (Digital Emerald)
  - Crimson Void (Ruby and Blood Orange)
  - Amethyst Royal (Neon Purple and Violet)
  - Solaris Gold (Radiant Amber and Warm Gold)
  - Nordic Glaciers (Arctic Frost and Ice Cyan)
- Interactive HTML5 Color Wheel and hexadecimal input supporting arbitrary custom accent colors.
- Dynamic synchronization across CSS custom properties, kinetic text glow, cursor dot, and Three.js WebGL shaders.

### 4. Live Custom Text Engine
- Allows users to replace "Hello, World!" with any custom word or phrase up to 24 characters.
- Dynamically updates both 2D kinetic typography and 3D WebGL particle letter coordinate targets with entrance choreography.

### 5. Procedural Web Audio API Synthesizer
- Zero external MP3 or WAV audio assets.
- Real-time synthetic sound generation using Web Audio API oscillators, biquad filters, and gain nodes.
- Harmonic chord progressions for letter interactions, resonant drones, mechanical camera shutter snaps, and cyber terminal keystroke clicks.

### 6. Zero-G Gravitational Physics
- Simulates sudden microgravity loss, dispersing typography characters randomly into deep 3D space.
- Elastic restitution restoration when gravity is re-engaged.

### 7. Interactive Cyber Terminal (CLI)
- Quake-style dropdown terminal modal accessible via the backquote or tilde key (`~`).
- Built-in command interpreter supporting text modification, theme switching, particle toggles, historical documentation, and help listings.

### 8. High-Resolution Wallpaper Exporter (4K PNG)
- One-click export button generating pristine, uncompressed PNG wallpapers at 2x Retina scale (up to 3840x2160 on Full HD displays).
- Clean capturing: automatically masks out navigation docks, modals, cursors, and browser overlays.
- Accurately captures WebGL particle layers, 2D constellation lines, cyber grid backgrounds, and glowing kinetic typography.
- Intelligent filename generator based on the active custom text and theme slug.

---

## Controls and Shortcuts

| Key | Action | Description |
|---|---|---|
| M | Audio Toggle | Toggle procedural ambient drone and interaction sound effects |
| T | Color Studio | Open Color Studio palette modal and custom color picker |
| E | Edit Text | Open modal to customize the displayed text phrase |
| 3 | 3D Morph | Toggle between 2D kinetic typography and 3D WebGL particle morphing |
| P | Particles | Toggle background 3D particles on or off |
| G | Zero-G | Engage or release zero-gravity typography dispersion |
| S | Export PNG | Capture and download high-resolution wallpaper |
| ~ / ` | Terminal | Open or close the interactive cyber terminal console |
| Esc | Close Modal | Close active modal, terminal, or color palette overlay |
| Mouse Move | Parallax | Tilt camera perspective and rotate magnetic UI elements |
| Mouse Drag | Orbit | Orbit the 3D particle camera around the scene |

---

## Terminal Commands

Open the cyber terminal at any time by pressing `~` (tilde) or clicking the CLI button in the HUD dock:

| Command | Usage | Description |
|---|---|---|
| help | `help` | Display list of available terminal commands |
| text | `text <words>` | Update display text (e.g., `text HELLO WORLD`) |
| theme | `theme <name>` | Switch palette (`obsidian`, `cyber`, `ethereal`, `matrix`) |
| 3d / morph | `3d` or `morph` | Toggle 3D WebGL particle text mode |
| particles / bg | `particles` or `bg` | Toggle background 3D sphere particles |
| export / save | `export` or `save` | Download high-resolution PNG snapshot |
| gravity | `gravity` | Toggle zero-gravity physical dispersion |
| audio | `audio` | Toggle audio synthesizer mute state |
| about | `about` | Display historical origins of "Hello, World!" |
| clear | `clear` | Clear terminal console log history |
| exit | `exit` | Close the terminal window |

---

## Architecture and Directory Structure

The application strictly adheres to Vanilla JavaScript Object-Oriented Programming (OOP) and Model-View-Controller (MVC) principles, orchestrated via a central decoupled EventEmitter:

```
helloWorld/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages deployment workflow
├── css/
│   ├── components.css            # Preloader, cursor, HUD dock, terminal styles
│   ├── design-tokens.css         # CSS custom properties and theme definitions
│   ├── main.css                  # Core reset and foundation styles
│   └── typography.css            # Kinetic typography and clamp font sizing
├── js/
│   ├── controllers/
│   │   ├── AppController.js      # Master lifecycle orchestrator and loop manager
│   │   ├── AudioController.js    # Bridges user interactions to sound synthesis
│   │   └── InteractionController.js # Magnetic mouse physics and keyboard listener
│   ├── core/
│   │   ├── DomUtils.js           # Safe DOM querying and element construction
│   │   ├── EventEmitter.js       # Pub/Sub event bus enabling decoupled MVC
│   │   └── MathUtils.js          # Linear interpolation and mathematical utilities
│   ├── models/
│   │   ├── AudioModel.js         # Procedural Web Audio API sound synthesizer
│   │   ├── StateModel.js         # Global application state and physics stores
│   │   └── ThemeModel.js         # Color palettes, custom colors, and CSS sync
│   ├── views/
│   │   ├── CanvasBackgroundView.js # 2D constellation dust particle network
│   │   ├── CursorView.js         # Fluid magnetic custom cursor with trailing ring
│   │   ├── CustomTextView.js     # Custom text input modal view
│   │   ├── ExportView.js         # High-resolution PNG wallpaper renderer
│   │   ├── HeroView.js           # Kinetic typography presentation and letter bending
│   │   ├── HudView.js            # Bottom floating glassmorphism control dock
│   │   ├── PreloaderView.js      # Cinematic shutter boot sequence
│   │   ├── TerminalView.js       # Interactive CLI terminal console
│   │   ├── ThemePaletteView.js   # Color Studio modal and custom color picker
│   │   └── ThreeSceneView.js     # 3D WebGL particle text and nebula manager
│   └── main.js                   # Application bootstrap entry point
├── .gitignore                    # Git ignore rules
├── index.html                    # Semantic HTML5 entry file
├── README.md                     # Documentation
└── start_server.bat              # Local development server launcher
```

---

## Getting Started

### Prerequisites
No build tools, package managers, or compilers are required. All external libraries are loaded asynchronously via trusted CDNs.

### Local Execution

#### Option 1: Python Simple HTTP Server
If Python is installed on your computer:
```bash
python -m http.server 8000
```
Then open your browser and navigate to `http://localhost:8000`.

#### Option 2: Windows Batch Script
Double-click `start_server.bat` in the project root directory.

#### Option 3: VS Code Live Server
Open the project folder in Visual Studio Code, right-click `index.html`, and select "Open with Live Server".

---

## GitHub Pages Deployment

This repository includes a ready-to-use GitHub Actions workflow configured in `.github/workflows/deploy.yml`.

### Enabling GitHub Pages on Your Repository

1. Push this codebase to your GitHub repository on the `main` branch:
   ```bash
   git add .
   git commit -m "Initialize Hello World kinetic showcase"
   git push origin main
   ```
2. Navigate to your repository on GitHub.
3. Click on **Settings** > **Pages** in the left sidebar.
4. Under **Build and deployment** > **Source**, select **GitHub Actions**.
5. The deployment workflow will trigger automatically upon push and publish your site to:
   `https://<your-username>.github.io/<repository-name>/`

---

## Technology Stack

- **Markup & Layout**: Semantic HTML5, Tailwind CSS (via CDN)
- **Typography**: Google Fonts (Syne, JetBrains Mono, Space Grotesk)
- **Animation Engine**: GSAP (GreenSock Animation Platform 3.12.5 via CDN)
- **3D Graphics**: Three.js (r128 WebGL Renderer via CDN)
- **Iconography**: Lucide Icons (via CDN)
- **Screen Capture**: html2canvas (1.4.1 via CDN) with preserved WebGL drawing buffers
- **Audio**: Web Audio API (native browser standard, procedural audio synthesis)
- **Architecture**: Vanilla JavaScript (ES Modules, OOP, MVC, Pub/Sub Event Bus)

---

## Historical Context

```
================================================================================
"The only way to learn a new programming language is by writing programs in it.
 The first program to write is the same for all languages:
 Print the words: hello, world"
                                - Brian Kernighan & Dennis Ritchie (1978)
================================================================================
```

---

## License

This project is open-source and available under the [MIT License](LICENSE). Feel free to explore, learn from, and adapt the code for your own creative work.
