// src/scenes/BootScene.js
import { UI_ASSETS } from '../ui/visuals.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    Object.values(UI_ASSETS).forEach(asset => {
      this.load.svg(asset.key, asset.path);
    });
  }

  create() {
    this.scene.start('Menu');
  }
}
