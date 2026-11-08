---
name: threejs-cameras
description: Advanced skill for Three.js cameras and controls. Use this skill when the user asks about PerspectiveCamera, OrthographicCamera, OrbitControls, PointerLockControls, camera projection, frustum planes, or moving the camera. Triggers on "threejs camera", "OrbitControls", "orthographic vs perspective", "move the camera", and "camera lookAt".
---

# Three.js Cameras & Controls

Purpose: configure 3D viewing, camera projection (Perspective/Orthographic), and navigation controls.

## When to Use

Trigger:
- Change scene viewpoint.
- Configure navigation (orbit, first-person).
- Project coordinates or run raycasting (`Raycaster`).
- Adjust FOV, aspect ratio, or clipping planes.

## Instructions

1. **Camera Selection**:
   - `PerspectiveCamera`: Mimics human eye. Props: `fov`, `aspect`, `near`, `far`.
   - `OrthographicCamera`: Parallel projection (2D, isometric, UI). Props: `left`, `right`, `top`, `bottom`, `near`, `far`.
2. **Matrix Update**: Run `camera.updateProjectionMatrix()` after changing camera props (aspect, fov, bounds).
3. **Controls**: Standard: `OrbitControls`. Import from `three/addons/controls/OrbitControls.js`. Call `controls.update()` in render loop if `enableDamping = true`.
4. **Raycasting**: Mouse/touch interaction: Convert mouse coords to NDC (-1 to 1) and run `raycaster.setFromCamera(mouse, camera)`.
5. **Math Integration**: If orbital math is needed, combine with `game-math`.

## Output Format

1. **Viewing Plan**: Choice of camera and controls.
2. **Code**: Initialization, updates, resize listener.
3. **Raycaster**: Mouse interaction logic if needed.

## Examples

**Input:** "How do I let the user drag to rotate the camera around my object?"
**Expected Action:**
1. Recommend `OrbitControls`.
2. Show import.
3. Code: `new OrbitControls(camera, renderer.domElement)`.
4. Enable damping: `controls.enableDamping = true`. Update inside render loop.

## Resources

- [Three.js Camera Docs](https://threejs.org/docs/#api/en/cameras/Camera)
- [OrbitControls Documentation](https://threejs.org/docs/#examples/en/controls/OrbitControls)

## Related Skills

- **[threejs](../threejs/SKILL.md)** — Core camera instantiation and resize.
- **[game-math](../game-math/SKILL.md)** — 3D space transforms, trigonometry.
- **[geometry](../geometry/SKILL.md)** — Ray intersection math.
