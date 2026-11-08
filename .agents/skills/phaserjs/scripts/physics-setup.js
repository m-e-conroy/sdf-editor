/**
 * Phaser 3 Physics Configuration Template
 * Includes Arcade and Matter setup
 */

export const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false // Set to true to see hitboxes
    },
    // Alternative: Matter.js for realistic physics
    /*
    matter: {
      gravity: { y: 1 },
      debug: true
    }
    */
  },
  scene: []
};

/**
 * Common Arcade Physics Helpers
 */
export function setupPlayerPhysics(player) {
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
}
