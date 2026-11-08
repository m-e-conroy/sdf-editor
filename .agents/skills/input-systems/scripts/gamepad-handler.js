/**
 * Gamepad API Handler
 * Supports connection events, deadzones, and button mapping.
 */

export class GamepadHandler {
  constructor() {
    this.gamepads = {};
    this.deadzone = 0.1;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      this.gamepads[e.gamepad.index] = e.gamepad;
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
      delete this.gamepads[e.gamepad.index];
    });
  }

  update() {
    // Gamepad objects are snapshots, must refresh every frame
    const active = navigator.getGamepads();
    for (const gp of active) {
      if (gp) this.gamepads[gp.index] = gp;
    }
  }

  getAxis(index, axisIndex) {
    const gp = this.gamepads[index];
    if (!gp) return 0;
    const val = gp.axes[axisIndex];
    return Math.abs(val) > this.deadzone ? val : 0;
  }

  isButtonPressed(index, buttonIndex) {
    const gp = this.gamepads[index];
    if (!gp) return false;
    return gp.buttons[buttonIndex].pressed;
  }
}
