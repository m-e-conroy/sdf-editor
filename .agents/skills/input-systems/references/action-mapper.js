/**
 * Action Mapping System
 * Decouples physical inputs (keys, buttons) from game actions (jump, fire).
 */

class InputManager {
  constructor() {
    this.bindings = new Map(); // Action -> Array of physical keys
    this.activeActions = new Set();
    this.setupListeners();
  }

  bind(action, ...keys) {
    this.bindings.set(action, keys);
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => this.handleKey(e.code, true));
    window.addEventListener('keyup', (e) => this.handleKey(e.code, false));
  }

  handleKey(code, isPressed) {
    for (const [action, keys] of this.bindings.entries()) {
      if (keys.includes(code)) {
        if (isPressed) this.activeActions.add(action);
        else this.activeActions.delete(action);
      }
    }
  }

  isActionPressed(action) {
    return this.activeActions.has(action);
  }
}

// Example:
/*
const input = new InputManager();
input.bind('jump', 'Space', 'ArrowUp', 'KeyW');
input.bind('fire', 'ControlLeft', 'Enter');

// In game loop:
if (input.isActionPressed('jump')) {
  player.jump();
}
*/

export { InputManager };
