# Mesh Primitives & Structure

# Mesh Primitives
Reference
**Mode : **
Object Mode, Edit Mode
**Menu : **
Add ‣ Mesh
**Shortcut : **
Shift - 
Meshes are most common object type used in 3D scenes. Blender provides variety of built-in mesh primitives that serve as starting points for modeling. These primitives can be added in both Object Mode and Edit Mode, where they appear at location of 3D Cursor.
Blender’s standard mesh primitives.
Tip
Planar meshes like *Plane *, *Circle *, and *Grid *can become three-dimensional by moving vertices out of their original plane.
Note
Additional primitives can be enabled through add-on extensions. See Get Extensions for more information.
## Common Options
These options can be specified in Adjust Last Operation panel, which appears when object is created. Options included in more than one primitive are:
**Generate UVs **
Generates default UV unwrapping of new geometry. This will be defined in first UV layer (which will get added if needed).
**Align to View, Location, Rotation **
See Common Object Options .
## Plane
standard plane is single quad face composed of four vertices, four edges, and one face. It lies flat and has no thickness, making it purely two-dimensional object.
Planes are commonly used to represent surfaces such as floors, walls, tabletops, or mirrors. They are also frequently used as emitter objects, camera backgrounds, or for projection mapping.
**Size **
Sets width and height of plane (full extent from edge to edge).
See also
Mesh Plane allows importing image as textured plane. plane’s dimensions are automatically scaled to match image’s aspect ratio.
Tip
Planes are useful as starting point for modeling panels, ceilings, cloth simulations, or sculpting surfaces. Apply modifiers like *Subdivision Surface *or *Displace *to turn flat plane into complex geometry.
## Cube
Adds standard cube mesh composed of six quad faces, eight vertices, and twelve edges. This is one of most basic and frequently used primitives in modeling, serving as starting point for creating boxes, crates, buildings, or sculpting bases.
**Size **
Sets total width, height, and depth of cube (i.e., full diameter along each axis). size of 2 creates cube that spans from -1 to +1 on all axes.
Tip
cube is ideal for hard-surface modeling and is commonly used as base for applying modifiers such as *Subdivision Surface *, *Boolean *, or *Bevel *.
## Circle
Adds flat, 2D ring of vertices forming polygonal approximation of circle. This primitive is useful as starting point for cylindrical objects, holes, pipe ends, or extrusion-based modeling workflows.
**Vertices **
Number of vertices used to define perimeter of circle. Higher values result in smoother shape.
**Fill Type **
Sets how center of circle is filled:
**Triangle Fan : **
Fills circle with triangular faces sharing central vertex.
**N-gon : **
Fills center with single N-gon face.
**Nothing : **
Leaves circle unfilled; only perimeter vertices are created.
**Radius **
Distance from center to outer edge of circle.
## UV Sphere
UV sphere is composed of quad faces arranged in horizontal rings and vertical segments, with triangle fans at poles. This structure mirrors how textures are typically mapped in 2D (hence name “UV” sphere), making it well-suited for texturing.
It resembles lines of latitude and longitude on globe, which also makes it useful for planetary models or spherical shapes with pole-to-pole UV seams.
**Segments **
Number of vertical segments (longitudinal divisions). These are like meridians on globe, running from north to south pole.
**Rings **
Number of horizontal segments (latitudinal divisions). These are like parallels on globe, stacked from top to bottom.
Note
Rings correspond to face loops, not edge loops, so actual number of visible edge loops is one less.
**Radius **
Distance from center to outer surface of sphere.
Tip
For clean shading, enable *Smooth Shading *and apply *Subdivision Surface *modifier.
## Icosphere
icosphere is sphere built from equilateral triangles and has more uniform distribution of vertices compared to UV sphere. This makes it ideal for sculpting, simulations, or applications where topological regularity is important.
It is created by recursively subdividing faces of icosahedron, polyhedron with 20 triangular faces.
**Subdivisions **
Number of recursive subdivision steps. Each step splits every triangle into four new triangles, increasing mesh resolution exponentially.
-
Subdivision Level 1 creates base icosahedron.
-
Higher levels smooth surface and increase vertex count.
Warning
Subdividing icosphere quickly increases vertex count. For example, 10 subdivisions generate over 5 million triangles and may crash Blender.
**Radius **
Distance from center to outer surface of sphere.
Tip
Icospheres are often used in simulations, particle emitters, and sculpting workflows where uniformity and triangle-only topology are beneficial.
## Cylinder
Creates cylindrical mesh composed of two circular ends and vertical faces. This shape is commonly used to model objects like handles, rods, pillars, and barrels.
**Vertices **
Number of vertices used to define circular ends. Higher values result in smoother circular profile.
**Radius **
Radius of cylinder’s circular ends, measured from center to perimeter.
**Depth **
Height of cylinder along Z axis.
**Cap Fill Type **
Determines how top and bottom of cylinder are filled:
**Nothing : **
No end caps are added. Only side faces are created, forming tube. Useful for modeling pipes or hollow containers.
**N-gon : **
Each end is filled with single N-gon face.
**Triangle Fan : **
Each end is filled with triangular faces sharing central vertex.
## Cone
Creates cone- or pyramid-shaped mesh. Useful for modeling objects like spikes, traffic cones, or wizard hats. You can also create frustums (truncated cones) or simple pyramids by adjusting top radius.
**Vertices **
Number of vertices used to define circular base (or polygon base in case of pyramid). Higher values produce smoother curves.
**Radius 1 **
Radius of base of cone (bottom circle).
**Radius 2 **
Radius of tip (top circle). value of 0 creates standard cone with pointed tip. Non-zero values result in frustum shape.
**Depth **
Height of cone along Z axis.
**Cap Fill Type **
Determines how base of cone is filled:
**Nothing : **
No bottom cap is added. Only side faces are created. Useful for creating open containers or hollow cones.
**N-gon : **
Fills base with single N-gon face.
**Triangle Fan : **
Fills base with triangular faces sharing central vertex.
Tip
To create pyramid, set *Vertices *to 4 and use *N-gon *or *Triangle Fan *as cap type. Adjust *Radius 2 *to 0 to keep top pointed.
## Torus
doughnut-shaped primitive created by rotating circle around axis. This shape is commonly used for rings, pipes, and stylized details.
**Operator Presets **
Saved torus settings that can be reused. These are stored as Python scripts in presets directory.
**Major Segments **
Number of segments that make up main circular ring of torus. Think of this as number of steps in spin operation around central axis.
**Minor Segments **
Number of segments making up circular cross-section of torus. Each segment is rotated around main ring.
**Dimensions Mode **
Selects method used to define shape and size of torus:
**Major/Minor : **
Define torus using radius of main ring and radius of cross-sectional circle.
**Exterior/Interior : **
Define torus using total outer radius and radius of central hole.
**Major Radius Major/Minor **
Distance from center of torus to center of cross section.
**Minor Radius Major/Minor **
Radius of cross-sectional circle (thickness of ring).
**Exterior Radius Exterior/Interior **
Total radius from center of torus to its outer edge.
**Interior Radius Exterior/Interior **
Radius of hole at center of torus.
## Grid
regular grid composed of quadrilateral faces, useful as base for landscapes, cloth, or organic surfaces. You can increase number of subdivisions to create more detailed mesh suitable for sculpting or simulation.
**X Subdivisions **
Number of face spans along X axis.
**Y Subdivisions **
Number of face spans along Y axis.
**Size **
Sets width and height of plane (full extent from edge to edge).
## Monkey
Adds stylized monkey head mesh named “Suzanne”. Suzanne is gift from old NaN to community and remains in Blender as playful “Easter egg” and is widely recognized as Blender’s mascot.
This primitive is commonly used for testing materials, lighting setups, and modifiers such as Subdivision Surface .
It serves similar purpose to well-known test models like Utah Teapot or Stanford Bunny .
**Size **
Controls overall scale of mesh.
- Mesh Primitives
- Common Options
- Plane
- Cube
- Circle
- UV Sphere
- Icosphere
- Cylinder
- Cone
- Torus
- Grid
- Monkey

---

# Mesh Structure
With meshes, everything is built from three basic elements: *vertices *, *edges *and *faces *.
Example of mesh structure.
## Vertices
most elementary part of mesh is vertex (vertices plural) single point or position in 3D space. Vertices are represented in 3D Viewport in Edit Mode as small dots. vertices of object are stored as array of coordinates.
Tip
Do not mistake object origin for vertex. It may look similar, but it is bigger and cannot be selected.
vertex is labeled as “”; object’s origin dot is labeled as “B”.
## Edges
edge always connects two vertices by straight line. edges are “wires” you see when you look at mesh in wireframe view. They are usually invisible on rendered image. They are used to construct faces.
## Faces
Faces are used to build actual surface of object. They are what you see when you render mesh. If this area does not contain face, it will be transparent or nonexistent in rendered image.
face is defined as area between either three (triangles), four (quadrangles) or more (n-gons) vertices, with edge on every side. faces are often abbreviated to *tris, quads & n-gons *.
Triangles are always flat and therefore easy to calculate. On other hand, quadrangles “deform well” and are therefore preferred for animation and subdivision modeling.
See also
-
Why should triangles be avoided for character animation?
-
When should N-gons be used, and when shouldn’t they?
## Normals
In geometry, normal is direction or line perpendicular to something, typically triangle or surface but can also be relative to line, tangent line for point on curve, or tangent plane for point on surface.
Normals help to determine shading of mesh among other things.
visualization of face normals of torus.
In figure above, each blue line represents normal for face on torus. lines are each perpendicular to face on which they lie. visualization can be activated, in Edit Mode, in Mesh Display Viewport Overlays panel .
### Shading
Surface normals play fundamental role in determining how light interacts with 3D objects and thus greatly influence shading of those objects. Normals can be shaded smooth or flat.
When mesh uses flat shading, faces are rendered and displayed faces uniformly. This is usually desirable for objects with flat surfaces such as cube or pyramid.
When mesh uses smooth shading, normals are interpolated across vertices of polygonal mesh, smooth transitions between adjacent polygons can be achieved, resulting in more realistic appearance.
By default face normals have flat shading however, this can be adjusted either for whole object or per face.
To adjust shading of whole object, use:
-
Shade Smooth – To mark whole object as smooth.
-
Shade Auto Smooth – To mark portions of object as smooth.
To revert to flat shading, use Shade Flat .
shading of objects can also be adjusted per face, edge, or vertex.
### Custom Split Normals
Custom split normals are way to tweak/fake shading by pointing normals towards other directions than default, auto-computed ones. It is mostly used in game development, where it helps counterbalance some issues generated by low-poly objects (most common examples are low-poly trees, bushes, grass, etc. and ‘rounded’ corners).
Blender supports custom normals on ‘smooth fan’ base, defined as set of neighbor face corners sharing same vertex and ‘linked’ by smooth edges. This means you can have normals per face corners, per set of neighbor face corners, or per vertex.
Custom split normal data is stored as `custom_normal `Attribute on face corner Domain .
Tip
computation of custom split normals can be disabled to improve performance. This option can be found in Simplify Rendering Settings .
#### Free Normals
Free normals are type of custom normal stored directly as direction vectors in object space. Unlike traditional custom normals, which are defined relative to surrounding geometry (known as tangent or corner fan space), free normals are independent of mesh topology and do not rely on smooth groups or edge connectivity.
Because they are simple vectors, free normals are:
-
Efficient: Fast to evaluate, significantly improving viewport performance compared to tangent space normals.
-
Lightweight: Require less memory, especially beneficial for dense or heavily instanced meshes.
-
Static: They do not automatically update when mesh is deformed (e.g. through modifiers or animations), so they are best suited for static geometry or cases where performance is critical.
Free normals can be assigned using Set Mesh Normal Node in Free mode, and stored on vertex, face, or face corner domain depending on desired granularity.
#### Editing Custom Split Normals
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals
**Shortcut : **
Alt - N
There are number of tools for editing custom split normals. custom normal mesh edit tools can affect all normals (default), or only selected ones. To select custom normal associated with particular vertex and face:
-
Make element selection mode both Vertex and Face (use Shift - LMB to enable second one).
-
Select one or more vertices, then select face. This can be repeated to select more vertices and different face and so on. It is easiest to see effect of these tools if you turn on Edit Mode Overlays option *Display vertex-per-face normals as lines *.
See also
Editing Normals .
### Importing Custom Split Normals
Some tools, particularly those used in CAD , tend to generate irregular geometry when tessellating their objects into meshes (thin and long triangles, etc.). Auto-computed normals on such geometry often gives bad artifacts, so it is important to be able to import and use normals as generated by CAD tool itself.
Note
Currently, only FBX Importer and Alembic Importer are capable of importing custom normals.
## Topology
### Loops
Edge and face loops.
*Edge *and *face *loops are sets of faces or edges that form continuous “loops” as shown in Fig. Edge and face loops. .
In image above, loops that do not end in poles are cyclic (1 and 3). They start and end at same vertex and divide model into two partitions. Loops can be quick and powerful tool to work with specific, continuous regions of mesh and are prerequisite for organic character animation. For detailed description of how to work with loops in Blender, see: Select Edge Loops .
Note
Note that loops (2 and 4) do not go around whole model. Loops stop at so-called poles because there is no unique way to continue loop from pole. Poles are vertices that are connected to either three, five, or more edges. Accordingly, vertices connected to exactly one, two or four edges are not poles.
Edge Loops
Loops (1 and 2) in Fig. Edge and face loops. are edge loops. They connect vertices so that each one on loop has exactly two neighbors that are not on loop and placed on both sides of loop (except start and end vertex in case of poles).
Edge loops are important concept especially in organic (subsurface) modeling and character animation. When used correctly, they allow you to build models with relatively few vertices that look natural when used as subdivision surfaces and deform well in animation.
Take Fig. Edge and face loops. in organic modeling as example: edge loops follow natural contours and deformation lines of skin and underlying muscles. loops are denser in areas that deform more when character moves, for example at shoulders or knees.
Further details on working with edge loops can be found in Select Edge Loops .
Face Loops
These are logical extension of edge loops in that they consist of faces between two edge loops, as shown in loops (3 and 4) in Fig. Edge and face loops. . Note that for non-circular loops (4) faces containing poles are not included in face loop.
Further details on working with face loops can be found in Face Loop Selection .
### Poles
See N-poles & E-poles .
### Non-Manifold
See Non-manifold .
- Mesh Structure
- Vertices
- Edges
- Faces
- Normals
- Shading
- Custom Split Normals
- Free Normals
- Editing Custom Split Normals
- Importing Custom Split Normals
- Topology
- Loops
- Poles
- Non-Manifold