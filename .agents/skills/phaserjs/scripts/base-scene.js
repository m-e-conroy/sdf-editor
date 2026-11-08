import Phaser from 'phaser';

/**
 * Base Scene Template
 * Standard Phaser 3 Lifecycle
 */
export default class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
  }

  init(data) {
    // Initial configuration and passed data
    this.config = data;
  }

  preload() {
    // Load assets (Images, Spritesheets, Audio)
  }

  create() {
    // Initialize GameObjects, Physics, and Input
    const { width, height } = this.scale;
    
    this.add.text(width / 2, height / 2, 'Phaser 3 Ready', {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // Main logic loop (Input polling, manual physics)
  }
}
