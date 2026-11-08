---
name: spatial-partitioning
description: Spatial optimization for collisions and rendering. Quadtrees, Octrees, Grids, BVH. Triggers: "quadtree", "octree", "spatial partitioning", "collision optimization", "bvh".
version: 1.0.0
---

# Spatial Partitioning Skill

> **Purpose**: Optimize large-scale spatial queries (collisions, frustum culling, proximity).

## When to Use

- Exceeding O(n²) performance limits in collision/query loops.
- Camera frustum culling in heavy 3D scenes.
- Efficient "nearest neighbors" checks in entity simulations.
- Draw call reduction via visibility partition checks.

## Instructions

Select partitioning system based on dimension and dynamics:

### 1. Uniform Grids
- **Concept**: Divide environment into a 2D/3D array of fixed-size cells.
- **Usage**: High density, uniform distribution. Fast `O(1)` cell lookups.
- **Downside**: High memory overhead in sparse environments.

### 2. Quadtrees (2D) / Octrees (3D)
- **Concept**: Recursive 4-way/8-way spatial subdivision. Nodes split when entity limit exceeded.
- **Usage**: Sparse, variable density environments.
- **Application**: View-frustum culling, broad-phase dynamic collisions.

### 3. BVH (Bounding Volume Hierarchy)
- **Concept**: Nested hierarchy of bounding volumes (boxes/spheres) wrapping geometry.
- **Usage**: Highly dynamic environments with varied entity sizes.
- **Application**: Raycasting, Raytracing, narrow-phase physics.

### 4. BSP (Binary Space Partitioning)
- **Concept**: Split space recursively along arbitrary hyperplanes.
- **Usage**: Static interior environments (level architecture).
- **Application**: Visibility culling.

## Output Format

Propose Spatial Optimization:

```markdown
### Spatial Partitioning: {System}

**1. Chosen Structure**
- (Grid, Quadtree, BVH, etc.)

**2. Query Type**
- (Range search, Raycast, Frustum cull)

**3. Node Limits**
- (Max entities per node, Max depth)

**4. Performance Gain**
- (Estimated complexity reduction: O(n²) -> O(n log n))
```

## Related Skills

- **[geometry](../geometry/SKILL.md)**: Ray/Box/Sphere intersection tests.
- **[threejs](../threejs/SKILL.md)**: Frustum culling and scene graph optimization.
- **[physics](../physics/SKILL.md)**: Broad-phase collision detection.
