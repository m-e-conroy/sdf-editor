# Phaser 3 Scene Lifecycle

Understanding the order of execution is critical for proper asset management and initialization.

## 1. `init(data)`
- Called first when a scene is started.
- Used to receive data from other scenes.
- Best for variable initialization.

## 2. `preload()`
- Use to load external assets (images, sounds, JSON).
- The scene won't transition to `create` until everything in `preload` is finished.
- **Tip**: Use `this.load.on('progress')` for loading bars.

## 3. `create()`
- Assets are now ready in the cache.
- Instantiate sprites, groups, physics bodies, and input handlers.
- This is where the game world is "built".

## 4. `update(time, delta)`
- Runs every frame (approx 60fps).
- `time`: Current game time in ms.
- `delta`: Time since last frame in ms. Use this for frame-rate independent movement.

## 5. `shutdown()` / `destroy()`
- Always clean up event listeners (`this.input.off(...)`) and custom objects to prevent memory leaks.
