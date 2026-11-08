---
name: level-of-detail
description: Implement Level of Detail (LOD) techniques for 3D graphics and games to optimize performance. Covers discrete LODs, continuous LOD, hierarchical LOD (HLOD), screen-space vs distance-based calculation, and popping mitigation (cross-fading). Use this skill when the user asks about optimizing 3D rendering, implementing distance-based mesh swapping, reducing poly count at a distance, generating imposters/billboards, or solving LOD popping artifacts. Triggers on "level of detail", "LOD", "swap meshes based on distance", "optimize 3D meshes", "HLOD", "imposter rendering", and "distance culling".
---

# Level of Detail (LOD) for 3D Graphics

Guidance on LOD systems to reduce geometry/rendering workload for distant objects. High performance, high visual quality.

## When to Use

Use for:
- Performance bottlenecks in high-poly scenes.
- Swapping complex meshes for simpler variants at distance.
- High-scale rendering (forests, cities) with imposter systems.
- Resolving "popping" visual artifacts in LOD transitions.

## Instructions

1. **LOD Selection Metric**:
   - **Distance-based**: Euclidean distance from camera to object. Fast, simple.
   - **Screen-Space / Projected Area**: Pixel count or screen percentage occupied. Robust across FOVs and resolutions.
2. **LOD Implementation Type**:
   - **Discrete LOD**: Pre-authored meshes (LOD0, LOD1, LOD2) swapped at distance thresholds (e.g., using `THREE.LOD`).
   - **Continuous LOD (CLOD)**: Real-time vertex decimation/edge-collapsing (terrain).
   - **Hierarchical LOD (HLOD)**: Combine groups of static objects into single simplified proxy meshes to save draw calls.
   - **Imposters/Billboards**: 2D pre-rendered texture quad facing camera for furthest objects.
3. **Anti-Popping**:
   - **Cross-fading**: Screen-door dither or alpha-blend between both LODs during transition.
   - **Geomorphing**: Interpolate vertex positions between low and high resolutions.
4. **Hysteresis**: Buffer zone at threshold boundaries to prevent immediate flickering during slight camera motion.

## Output Format

1. **LOD Strategy**: Metric + LOD type selection.
2. **Math**: Metric equations using KaTeX.
3. **Code**: Concrete implementation (e.g., `THREE.LOD` configuration or custom check).
4. **Optimization Tips**: Hysteresis, draw-call minimization.

## Examples

**Input:** "How do I make my trees use lower poly models when they are far away to save performance?"

**Expected Action**:
1. Propose Discrete LOD.
2. Provide distance metric logic using `THREE.LOD`.
3. Show `lod.addLevel(...)` + update loop call.

**Input:** "How do I calculate screen-size based LOD?"

**Expected Action**:
1. Recommend Projected Sphere Area metric.
2. Provide formula: $\text{Area} = \pi \cdot r^2 \cdot \left(\frac{\text{screenHeight}}{\tan(\text{FOV} / 2) \cdot \text{distance}}\right)^2$
3. Show JavaScript implementation computing screen coverage percentage.

## Resources

- *Level of Detail for 3D Graphics* (Luebke et al.) — In `references/`.
- [Three.js LOD Documentation](https://threejs.org/docs/#api/en/objects/LOD)
- [Unreal Engine HLOD Overview](https://docs.unrealengine.com/5.0/en-US/hierarchical-level-of-detail-in-unreal-engine/)

## Related Skills

- **[threejs](../threejs/SKILL.md)** — `THREE.LOD` implementation.
- **[threejs-geometries](../threejs-geometries/SKILL.md)** — Authoring mesh resolutions.
- **[game-math](../game-math/SKILL.md)** — Selection metric math.
