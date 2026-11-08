# Retopology

# Remeshing
Blender offers several tools for regenerating mesh so that it has (approximately) same shape but fewer faces, more faces, or better topology.
Remeshing to clean up messy geometry.
## Remeshing
Reference
**Mode : **
Object Mode, Sculpt Mode
**Panel : **
Properties ‣ Data ‣ Remesh
Remeshing automatically rebuilds mesh with uniform topology. You can run it with high resolution to make simple mesh denser, making it more suitable for sculpting . Alternatively, you can run it with low resolution to simplify and clean up overly dense or messy geometry, such as from sculpt or 3D scan.
Note
-
Remeshing only works on original mesh data – it ignores modifiers , shape keys and so on.
-
Remeshing is not possible on objects with Multiresolution Modifier .
*Remesh *panel lets you choose between two different modes:
### Voxel
Voxel remesher works by placing mesh in virtual 3D grid, seeing which points of grid are closest to mesh’s outer surface, and generating new mesh with vertices at those points. This means resulting mesh has uniform topology and has no inner (self-intersecting) geometry.
It’s useful for following cases:
-
Changing resolution of, or cleaning up, mesh that you want to sculpt. Notably, by setting up resolution before sculpting, you can leave Dyntopo disabled and avoid its performance impact.
-
Cleaning up mesh for 3D printing.
-
Generating simplified standin mesh for use with physics simulation.
However, because topology is simple grid, Voxel remesher should *not *be used for following:
-
Creating topology for mesh that will be deformed (e.g. character that will be animated). Such topology has to follow flow of geometry, and no perfect automatic tools exist for this right now; it has to be done manually. See Retopology .
-
Generating mesh for applying Subdivision Surface Modifier or Multiresolution Modifier . It’s better to use Quad mode for this.
-
Reducing face count of mesh that otherwise has no problems with its geometry. It’s better to use Decimate Geometry for this.
Voxel remesh has following settings:
**Voxel Size **
size of each voxel (3D grid cell). Use low value to get detailed but dense mesh, or high value for light but coarse one.
**Adaptivity **
Reduces final face count by simplifying geometry where detail is not needed. value greater than zero disables *Fix Poles *and can introduce triangulation.
**Fix Poles **
Tries to reduce number of Poles at cost of some performance, to produce better topological flow.
**Preserve **
**Volume **
Try to preserve original volume of mesh. Enabling this could make operator slower depending on complexity of mesh.
**Attributes **
Transfer attributes to new mesh: paint mask , any face sets , color attributes , and so on.
See also
Remesh Modifier can perform this operation non-destructively and offers more remeshing methods.
### Quad
Quad remesher uses Quadriflow algorithm, which can produce better results but is also slower. It’s not replacement for Voxel remesher, however, because it doesn’t clean up intersecting geometry.
It’s useful for following cases:
-
Generating mesh for applying Subdivision Surface Modifier or Multiresolution Modifier .
However, it’s not recommended for following:
-
Cleaning up mesh for sculpting or 3D printing. Voxel remesher is more suited for this.
-
Creating final topology for mesh that will be deformed (e.g. character that will be animated). Such topology has to follow flow of geometry, and no perfect automatic tools exist for this right now; it has to be done manually. See Retopology .
-
Reducing face count of mesh that otherwise has no problems with its geometry. It’s better to use Decimate Geometry for this.
**Quadriflow Remesh **
Opens pop-up to set parameters for remesh operation.
**Use Mesh Symmetry **
Generates symmetrical mesh using Mesh Symmetry options.
**Preserve Sharp **
Try to preserve sharp features of mesh. Enabling this could make operator slower depending on complexity of mesh.
**Preserve Mesh Boundary **
Try to preserve original volume of mesh. Enabling this could make operator slower depending on complexity of mesh.
**Preserve Attributes **
Transfer attributes to new mesh: paint mask , any face sets , color attributes , and so on.
**Smooth Normals **
Apply Shade Smooth to new mesh.
**Mode **
How to specify amount of detail for new mesh.
**Ratio : **
Specify target number of faces relative to current mesh.
**Edge Length : **
Specify target edge length in new mesh.
**Faces : **
Specify target number of faces in new mesh.
**Seed **
Random Seed to use with solver; different seeds will cause remesher to generate different quad layouts on mesh.
## Retopology
automatic remesh tools don’t result in topology that lends itself to deformation. Therefore, if you have sculpted character and want to simplify it for animation, you’ll typically have to do this manually in process known as retopologizing.
To do this, you typically create new mesh that overlaps original one, then adjust it until it fully covers original mesh and matches its shape.
-
Retopology overlay of 3D Viewport is useful here, as it lets you see original mesh through retopologized one and vice versa – without getting distracted by geometry on other side as would be case with X-Ray .
-
You can use Poly Build tool to quickly add, change, and remove faces.
-
Use Snapping to align new vertices to original mesh.
- Remeshing
- Remeshing
- Voxel
- Quad
- Retopology