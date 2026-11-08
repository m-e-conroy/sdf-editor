---
name: spatial-partitioning
description: Spatial optimization for collisions and rendering. Quadtrees, Octrees, Grids, BVH. Triggers: "quadtree", "octree", "spatial partitioning", "collision optimization", "bvh".
version: 1.0.0
---

# Spatial Partitioning Skill

> **Purpose**: Optimize large-scale spatial queries (collisions, culling, proximity).

## When to Use

- Too many entities for O(n²) collision checks.
- Frustum culling in complex 3D scenes.
- Finding "nearest neighbors" in simulations.
- Reducing draw calls by only rendering visible sectors.

## Instructions

Choose structure based on dimensionality and complexity:

### 1. Uniform Grids
- **Concept**: Divide world into fixed-size cells.
- **Best for**: 2D games with even entity distribution. Fast `O(1)` cell lookup.
- **Downside**: Memory waste in sparse environments.

### 2. Quadtrees (2D) / Octrees (3D)
- **Concept**: Recursive 4-way (or 8-way) division. Nodes split when entity limit reached.
- **Best for**: Sparse environments. Dynamically adapts to density.
- **Use Case**: View-frustum culling, broad-phase collision.

### 3. BVH (Bounding Volume Hierarchy)
- **Concept**: Tree of nested bounding boxes/spheres.
- **Best for**: Dynamic scenes with varying entity sizes.
- **Use Case**: Raycasting, Raytracing, Physics engines.

### 4. BSP (Binary Space Partitioning)
- **Concept**: Use arbitrary planes to split space.
- **Best for**: Static interior environments (level geometry).
- **Use Case**: Occlusion culling.

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
