---
name: react-three-fiber
description: React bridge for Three.js. Declarative 3D scenes, hooks (useFrame, useThree), and performance optimization. Triggers: "react three fiber", "r3f", "react 3d", "canvas three", "useframe".
version: 1.0.0
---

# React Three Fiber (R3F) Skill

> **Purpose**: Build declarative, reactive 3D scenes in browser using React and Three.js.

## When to Use

- Build 3D web applications/games in React.
- Implement interactive 3D UI components.
- Manage 3D state using React hooks and context.
- Optimize WebGL rendering inside React lifecycle.

## Instructions

### 1. The Canvas
- **Setup**: Use `<Canvas>` as entry point.
- **DPR**: Set `dpr={[1, 2]}` for hi-res screens.
- **Flat**: Use `flat` for sRGB color mapping when needed.

### 2. Hooks & State
- **`useFrame`**: Frame-loop animations. Mutate refs directly; avoid updating React state here.
- **`useThree`**: Access renderer, camera, and scene references.
- **`useLoader`**: Load assets (GLTF, textures) integrated with React Suspense.

### 3. Component Architecture
- **Declarative**: Use JSX elements for Three.js entities (e.g., `<mesh>`, `<boxGeometry>`).
- **Events**: Attach pointer/click events directly to meshes (`onClick`, `onPointerOver`).
- **Refs**: Use `useRef` for imperative animation/mutation inside WebGL loop.

### 4. Performance Optimization
- **Re-use**: Share geometries and materials across meshes.
- **Instancing**: Use `<instancedMesh>` for high counts of identical meshes.
- **Demand Rendering**: Use `frameloop="demand"` for static scenes to conserve GPU.

## Output Format

Propose R3F Architecture:

```markdown
### R3F Implementation: {Component}

**1. Scene Setup**
- (Canvas config, lighting, camera)

**2. Component Logic**
- (Mesh structure, refs, and useFrame mutations)

**3. Asset & State Management**
- (Loaders, Suspense, and reactive props)

**4. Performance Checklist**
- (Instancing, disposal, or demand rendering)
```

## Related Skills

- **[threejs](../threejs/SKILL.md)**: Core 3D concepts.
- **[react](../react/SKILL.md)**: Component patterns.
- **[game-math](../game-math/SKILL.md)**: Transformations.
