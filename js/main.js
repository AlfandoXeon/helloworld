import { AppController } from './controllers/AppController.js';

/**
 * Main Entry Point
 */
window.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
