# Deform Modifiers Reference

# Simple Deform Modifier
*Simple Deform *modifier allows application of simple deformation to object. Meshes, lattices, curves, surfaces and texts are supported objects. deformation is either rotation (Twist, Bend) or scaling (Taper, Stretch). amount of deformation is specified by Deform Angle (rotation) or Deform Factor (scaling).
Simple Deform modifier.
deformation is calculated in *local *coordinate space. Be aware that local axes of object can differ from global ones. In figure above, global Z axis points up and local Z axis points at 45°. deformation is applied along Deform axis, which can be set by selection from list (X, Y or Z). By using *Limits *field, influence of modifier can be restricted to subset of Deform axis. All distances are measured from origin of object. vertices that are furthest away from origin on Deform axis represent upper and lower limits. origin of object and orientation of local axes can be defined by external Deform object (most of time, empty).
## Options
**Mode **
Defines kind of deformation which will be applied. figure below shows four modes, applied to text object. origin of object is at left of text.
Twist around X axis (180°).
Bend around Z axis (180°).
Taper along X axis (factor = 2).
Stretch along X axis (factor = 0.3).
**Twist **
Rotates mesh around specified *Axis *. Each vertex along Deform axis is rotated around object’s origin. If origin is inside object, this results in twisted appearance. Below origin, there is negative rotation and above origin, rotation is positive or clockwise. Vertices in same plane as origin are not rotated.
total amount of rotation is specified by angle and rotation at each vertex is thus weighted by distance of vertex to origin of object. Vertices that are furthest away from object origin have max rotation, positive or negative.
**Bend **
Bends mesh over specified *Axis *. Bend mode is more complex and less intuitive. picture below shows same plane but with different Deform and Bending axes.
Deform axis X or Y ().
Deform axis Z (b).
Deform axis X. Local axis Y points down (c).
Deform axis X. Local axis Y points up (d).
Using mesh plane and setting Deform axis to X or Y will not result in any deformation (Fig ). You expect that bending should be something like Figure (c) or (d). In 3D world however, selecting X axis introduces ambiguity because bending along X axis could result in Figure (c) or (d). following pairs describe selected deform axis vs. desired bending axis: X and Z, Y and Z, Z and X.
In Fig (), because of Deform axis X, Bending is along Z. All vertices however have same Z coordinate equal to local origin. So, no deformation occurs. In Fig (d) local axes are rotated around Deform axis X, so that Bending axis Z points to left. So, all vertices are bend for their Z coordinate. further away from local origin, more bending.
This explains also unexpected result of Fig (b). Deform axis is set here to Z (pointing up). So, according to pairs above, Bending axis defaults to X. All vertices of plane are bent in their X coordinate. further away, more rotation occurs. Negative X coordinates are rotated counterclockwise.
**Taper **
Linearly scales along specified *Axis *. scaling factor is weighted by distance from origin of object in deform axis. No scaling occurs in plane of origin of object. maximum scaling occurs at vertices that are furthest away from local origin. This can be positive or negative scaling, depending on location of origin. If local origin is within object, deformed object appears tapered.
**Stretch **
Stretches object along specified *Axis *. If local origin is within object, deformed mesh looks stretched like pulling rubber from both sides. With positive factor, mesh gets longer in deformed axis, wider at borders and thinner at origin than original mesh. If factor is negative, then mesh is squashed in deformed axis, thicker at origin and thinner at borders.
**Angle (Twist & Bend)/Factor (Taper & Stretch) **
total amount of deformation. Can be negative to reverse deformation.
**Axis, Origin **
name of object that defines origin and axis of deformation (usually empty). This object can be:
-
Rotated to control axis (its local *Axis *is now used as deformation one).
-
Moved to control origin of deformation.
-
Scaled to change deformation factor.
### Restrictions
**Limits **
You can set lower and upper limits of deformation. upper limit cannot be lower than lower one. These limits are mapped on Deform axis.
**Lock (Twist, Taper and Stretch modes only) **
These controls whether coordinates along two other axes are allowed to change or not. E.g. if you *Stretch *your object along its Z axis, can squash along X axis only, by locking Y one.
**Vertex Group **
name of vertex group that indicates whether and how much each vertex is influenced by deformation. amount of influence is determined by weight in Weight Paint map.
- Simple Deform Modifier
- Options
- Restrictions

---

# Lattice Modifier
*Lattice *modifier deforms base object according to shape of Lattice object. Objects to be deformed can be meshes, curves, surfaces, text, lattices and even particles.
Tip
*Lattice *modifier can quickly be added to selected objects by parenting them using *Lattice Deform *option.
## Options
Lattice modifier.
**Object **
Lattice object with which to deform base object.
**Vertex Group **
optional vertex group name which lets you limit modifier’s effect to part of base mesh.
**Invert **
Inverts influence of selected vertex group, meaning that group now represents vertices that will not be deformed by modifier.
setting reverses weight values of group.
**Strength **
factor to control blending between original and deformed vertex positions.
## Hints
Why would you use lattice to deform mesh instead of deforming mesh itself in Edit Mode? There are couple of reasons for that:
-
If your object has large number of vertices, it would be difficult to edit portions of it quickly in Edit Mode. Using lattice will allow you to deform large portions efficiently.
-
smooth deformation you get from *Lattice *modifier can be hard to achieve manually.
-
Multiple objects can use same lattice, thus allowing you to edit multiple objects at once.
-
Like all modifiers, it is non-destructive. Meaning all changes happen on top of original geometry, which you can still go back to and edit without affecting deformation.
-
lattice does not affect texture coordinates of mesh’s surface.
Note
When using lattice to deform particles, order in modifier stack matters. You need to place *Lattice *modifier after *Particle System *one.
- Lattice Modifier
- Options
- Hints

---

# Shrinkwrap Modifier
*Shrinkwrap *modifier allows object to “shrink” to surface of another object. It moves each vertex of object being modified to closest position on surface of given mesh (using one of four methods available).
It can be applied to meshes, lattices, curves, surfaces and texts.
See also
Shrinkwrap Constraint .
## Options
Shrinkwrap modifier in Nearest Surface Point mode.
**Wrap Method **
This selector specifies method to be used to determine nearest point on target’s surface for each vertex of modified object. Some options will add some extra, specific controls to panel. See Wrap Methods for explanation of each method.
**Snap Mode **
Most modes support additional setting to control how vertex is moved to target point selected by methods described above. Some of choices only differ if *Offset *is not zero.
**On Surface **
vertex is always moved. offset is applied along projection line connecting original vertex and selected target point towards original position.
**Outside Surface **
Like *On Surface *, but offset is always applied towards outside of target.
**Above Surface **
Like *On Surface *, but offset is applied along smooth normal of target.
**Inside **
vertex is not moved if it is already inside target. Offset shrinks allowed volume towards inside along projection line.
**Outside **
vertex is not moved if it is already outside target. Offset expands exclusion volume towards outside along projection line.
Note
*Inside *and *Outside *options can be used for crude collision detection. inside vs outside determination is done based on target normal and is not always stable near 90 degree and sharper angles in target mesh.
**Target **
Shrink target, mesh to shrink to/wrap around.
**Offset **
distance that must be kept from calculated target position.
**Vertex Group **
vertex group to control whether and how much each vertex is displaced to its target position. If vertex is not member of this group, it is not displaced (same as weight 0).
## Wrap Methods
### Nearest Surface Point
This will select nearest point over surface of shrunk target.
### Project
Project mode.
This will project vertices along chosen axis until they touch shrink target. Vertices that never touch shrink target are left in their original position.
**Limit **
This is distance limit between original vertex and surface. If distance is larger than this limit vertex would not be projected onto surface.
**Subdivision Levels **
This applies (temporary) *Catmull-Clark *subdivision to modified object’s geometry, before computing wrap.
**Axis **
Along which local axis of modified object projection is done. These options can be combined with each other, yielding “median axis” of projection. If none are selected, normal direction is used.
**Negative/Positive **
This allows you to select allowed direction(s) of shrink along selected axis. If both options are enabled, both ways are evaluated and closest hit is selected.
**Face Cull **
Allows you to prevent any projection over “front side” (respectively “back side”) of target’s faces. “side” of face is determined by its normal (front being side “from where” normal “originates”).
**Invert Cull **
If *Cull Faces *is enabled, and *Negative *direction along axis is allowed, this option can be used to invert *Front *or *Back *cull choice for *Negative *direction. This is useful when projecting in both directions.
**Auxiliary Target **
additional object to project over.
### Nearest Vertex
Nearest Vertex mode.
This will snap vertices to nearest vertex of shrunk target. It adds no extra options.
This method doesn’t support *Snap Mode *setting.
### Target Normal Project
Target Normal Project mode.
This mode is similar to *Nearest Surface Point *, but produces much smoother projection in return for being significantly slower.
Instead of finding closest point, it searches for nearest point that has its interpolated smooth normal pointing towards or away from original vertex position. Non-manifold boundary edges are specially handled as infinitely thin cylinders that emit normals in all perpendicular directions; ignores flat shading.
- Shrinkwrap Modifier
- Options
- Wrap Methods
- Nearest Surface Point
- Project
- Nearest Vertex
- Target Normal Project

---

# Curve Modifier
*Curve *modifier provides simple but efficient method of deforming mesh along curve object.
It works on (global) dominant axis, X, Y, or Z. This means that when you move your mesh in dominant direction (by default, X axis), mesh will traverse along curve, as if it was train following and deforming along rails. Moving mesh perpendicularly to this axis, object will move closer or further away from curve.
When you move object beyond curve’s ends, object will continue to deform based on direction vector at those ends.
Note
This modifier works in global space, in other words, actual position of geometry relative to curve is determinant to get correct result.
Typically, you’ll want your object’s origin to be at center of your geometry (not offset far away from it, you can e.g. Set Origin to Geometry ).
And then you’ll want to start with your object’s origin at same location as your curve object’s origin (you may use snap tools for that…).
If curve is 3D, *Tilt *value of its control points will be used to twist deformed object. And *Radius *property controls size of object as well. Those options are in *Shape *panel, under Path/Curve-Deform .
## Options
Curve modifier.
**Curve Object **
name of curve object that will affect deformed object.
**Deformation Axis **
This is axis that curve deforms along.
X/Y/Z/-X/-Y/-Z
**Vertex Group **
If set, restrict effect to only vertices in that vertex group.
**Invert **
Inverts influence of selected vertex group, meaning that group now represents vertices that will not be deformed by modifier.
setting reverses weight values of group.
## Example
Edit curve.
Monkey on curve.
Monkey deformations.
- Curve Modifier
- Options
- Example

---

# Displace Modifier
*Displace *modifier displaces vertices in mesh based on intensity of texture. Either procedural or image textures can be used.
displacement can be along particular local axis, along vertex normal, or separate RGB components of texture can be used to displace vertices in local X, Y and Z directions simultaneously (sometimes referred to as *Vector Displacement *).
## Options
Displace modifier.
**Texture **
name of texture from which displacement for each vertex is derived. If this field is empty, modifier defaults to 1.0 (white).
**Coordinates **
texture coordinate system to use when retrieving values from texture for each vertex.
See common masking options for complete reference.
**Direction **
direction along which to displace vertices. Can be one of following:
**X, Y, Z **
Displace along axis.
**Normal **
Displace along vertex normal.
**Custom Normal **
Displace along (averaged) custom normals , instead of vertex normals.
**RGB to XYZ **
Displace along local XYZ axes individually using RGB components of texture (Red values displaced along X axis, Green along Y, Blue along Z).
**Space **
With direction set to X, Y, Z, or XYZ modifier can either displace along local or global axes.
**Strength **
strength of displacement. After offsetting by *Midlevel *value, displacement will be multiplied by *Strength *value to give final vertex offset.
\(vertex\_offset = displacement × Strength\)
negative strength can be used to invert effect of modifier.
**Midlevel **
texture value which will be treated as no displacement by modifier. Texture values below this threshold will result in negative displacement along selected direction, while texture values above it will result in positive displacement.
\(displacement = texture\_value - Midlevel\)
Recall that color/luminosity values are typically between (0.0 to 1.0) in Blender, and not between (0 to 255).
**Vertex Group **
name of vertex group used to control influence of modifier. If left empty, modifier affects all vertices equally.
**Invert **
Inverts influence of selected vertex group, meaning that group now represents vertices that will not be deformed by modifier.
setting reverses weight values of group.
## Example
Three different objects created with Displace modifier. Sample blend-file .
slime animation created with Displace modifier. Sample blend-file .
- Displace Modifier
- Options
- Example

---

# Cast Modifier
*Cast *modifier shifts shape of mesh, curve, surface or lattice, towards any of few predefined shapes (sphere, cylinder, cuboid).
It is equivalent to To Sphere tool in Edit Mode, and what other programs call “Spherify” or “Spherize”, but, as written above, it is not limited to casting to sphere.
Tip
Smooth Modifier is good companion to *Cast *, since cast shape sometimes needs smoothing to look nicer or even to fix shading artifacts.
Note
For performance reasons, this modifier only works with local coordinates. If modified object looks wrong, you may need to apply its transformations , especially when casting to cylinder.
## Options
Cast modifier.
**Shape **
Menu to choose target shape of projection: *Sphere *, *Cylinder *or *Cuboid *.
**Axis **
**Factor **
factor to control blending between original and cast vertex positions.
It is linear interpolation: 0.0 gives original coordinates (i.e. modifier has no effect), 1.0 casts to target shape.
Values below 0.0 or above 1.0 exaggerate deformation, sometimes in interesting ways.
**Radius **
If nonzero, this radius defines sphere of influence. Vertices outside it are not affected by modifier.
**Size **
Alternative size for projected shape. If zero, it is defined by initial shape and control object, if any.
**Size from Radius **
If activated, calculate *Size *from *Radius *, for smoother results.
**Vertex Group **
If set, restrict effect to only vertices in that vertex group. This allows selective, real-time casting, by painting vertex weights.
**Invert **
Inverts influence of selected vertex group, meaning that group now represents vertices that will not be deformed by modifier.
setting reverses weight values of group.
**Object **
name of object to control effect. location of this object’s origin defines center of projection. Also, its size and rotation transform projected vertices.
Hint
Animating (keyframing) this control object also animates modified object’s casting deformation.
## Example
Top: Suzanne without modifiers. Middle: Suzanne with each type of Cast Modifier (Sphere, Cylinder and Cuboid). Bottom: Same as above, but now only X axis is enabled. Sample blend-file .
- Cast Modifier
- Options
- Example

---

# Smooth Modifier
*Smooth *modifier smooths mesh by flattening angles between adjacent faces in it, like Smooth tool in Edit Mode. It smooths without subdividing mesh, number of vertices remains same.
This modifier is not limited to smoothing, though. Its control factor can be configured outside (0.0 to 1.0) range (including negative values), which can result in interesting deformations.
## Options
Smooth modifier.
**Axis **
Enable/disable modifier in X, Y and/or Z axes directions.
**Factor **
Controls smoothing amount. Higher values will increase effect.
Values outside expected range (above 1.0 or below 0.0) will distort mesh.
**Repeat **
number of smoothing iterations, equivalent to executing *Smooth *tool multiple times.
**Vertex Group **
If set, restrict effect to only vertices in that vertex group. This allows for selective, real-time smoothing, by painting vertex weights.
**Invert **
Inverts influence of selected vertex group, meaning that group now represents vertices that will not be deformed by modifier.
setting reverses weight values of group.
## Algorithm
calculation done by *Smooth *modifier is simple and logical one, and can be thought of as geometric equivalent of blurring images.
Each new vertex position is moved towards average position of all its neighbor vertices (topologically speaking, i.e. vertices directly connected to it by edge).
## Example
Mesh before smoothing.
Mesh after one smoothing iteration.
Mesh after ten smoothing iterations.
- Smooth Modifier
- Options
- Algorithm
- Example

---

# Wave Modifier
*Wave *modifier adds ripple-like motion to object’s geometry.
This modifier is available for meshes, lattices, curves, surfaces and texts.
Circular wave front.
Linear wave front.
Motion enabled for X, Normals enabled for Y.
## Options
Wave modifier.
**Motion **
wave effect deforms vertices/control points in Z direction, originating from given starting point and propagating along object with circular wave fronts (if both X and Y are enabled), or with rectilinear wave fronts (if only one axis is enabled), then parallel to axis corresponding to X or Y button activated.
**Cyclic **
Repeats waves cyclically, rather than single pulse.
**Along Normals **
For meshes only. Displaces mesh along surface normals (instead of object’s Z axis).
**X/Y/Z **
Restrict displacement along normals to selected local axes.
**Falloff **
Controls how fast waves fade out as they travel away from coordinates above (or those of *Start Position Object *).
**Height **
height or amplitude of ripple.
**Width **
Half of width between tops of two subsequent ripples (if *Cyclic *is enabled). This has indirect effect on ripple amplitude. If pulses are too near to each other, wave may not reach zero Z position, so in this case Blender lowers whole wave so that minimum is zero and, consequently, maximum is lower than expected amplitude. See Technical Details and Hints for more information.
**Narrowness **
actual width of each pulse: higher value narrower pulse. actual width of area in which single pulse is apparent is given by `4 / Narrowness `. , if *Narrowness *is 1 *pulse *is 4 units wide, and if *Narrowness *is 4 *pulse *is 1 unit wide.
**Vertex Group **
name of vertex group used to control influence of modifier. If left empty, modifier affects all vertices equally.
**Invert **
Inverts influence of selected vertex group, meaning that group now represents vertices that will not be deformed by modifier.
setting reverses weight values of group.
Important
All values described above are in local object space, i.e. they must be multiplied with corresponding *Scale *values of object to get real dimensions.
### Start Position
**Object **
Use another object as reference for starting position of wave. Note that you then can animate this object’s position, to change wave’s origin across time.
**Start Position X/Y **
Coordinates of center of waves, in object’s local space.
### Time
Settings to control animation.
**Offset **
Time offset in frames. frame at which wave begins (if *Speed *is positive), or ends (if *Speed *is negative). Use negative frame number to prime and pre-start waves.
**Life **
Duration of animation in frames. When set to zero, loops animation forever.
**Damping **
additional number of frames in which wave slowly damps from *Height *value to zero after *Life *is reached. dampening occurs for all ripples and begins in first frame after *Life *is over. Ripples disappear over *Damping *frames.
**Speed **
speed per frame, of ripple.
### Texture
You can finely control which vertices are affected by wave, and to what extent, using texture.
See common masking options for complete reference.
## Technical Details and Hints
relationship of above values is described here:
Wave front characteristics.
To obtain nice wave effect similar to sea waves and close to sinusoidal wave, make distance between following ripples and ripple width equal. , *Narrowness *value must be equal to `2 / Width `. E.g. for *Width *to be 1, set *Narrow *to 2.
- Wave Modifier
- Options
- Start Position
- Time
- Texture
- Technical Details and Hints