# Generate Modifiers Reference

# Introduction
Modifiers are automatic operations that affect object’s geometry in non-destructive way. With modifiers, you can perform many effects automatically that would otherwise be too tedious to do manually (such as subdivision surfaces) and without affecting base geometry of your object.
They work by changing how object is displayed and rendered, but not geometry which you can edit directly. You can add several modifiers to single object to form Modifier Stack and *Apply *modifier if you wish to make its changes permanent.
They can be added to active object using Add Modifier operator, “Add Modifier” button at top of Modifiers tab in Properties Editor , or using Shift - in same tab. New modifiers are always added at bottom of stack (i.e. will be applied last).
There are many built-in modifiers but Blender also allows users to make their own modifiers through Geometry Nodes .
## Categories
There are four categories of built-in modifiers:
**Edit **
Similar to *Deform *modifiers (see below), however, they usually do not directly affect geometry of object, but some other data, such as vertex groups.
**Generate **
Constructive/destructive modifiers that will affect whole Topology of mesh. They can change general appearance of object, or add new geometry to it…
**Deform **
Unlike *Generate *ones above, these modifiers only change shape of object, without altering its topology.
**Simulate **
Represent physics simulations . In most cases, they are automatically added to modifiers stack whenever *Particle System *or *Physics *simulation is enabled. Their only role is to define position in modifier stack from taken base data for simulation they represent. As such, they typically have no properties, and are controlled by settings exposed in separate sections of Properties Editor .
You will also notice category called “Hair”, this category comes from bundled Asset Library distributed with Blender. See Hair Nodes for more information.
Users can make their own categories by making geometry node groups assets and assigning them to Asset Catalog . This catalog name will be category name. If user creates catalog with same name as one of built-in categories node group will be added to bottom of corresponding menu.
Node Groups that are non-assets or that do not belong to category will be available in “Unassigned” sub-menu.
Note
Geometry Node Groups must have Modifier property enabled for node group to show up in Add Modifier menu.
## Interface
Each modifier’s interface shares same basic components, see Fig. Panel layout (Subdivision Surface as example). .
Panel layout (Subdivision Surface as example).
At top is panel header. icons each represent different settings for modifier (left to right):
**/ Expand **
Collapse modifier to show only header and not its options.
**Type **
icon as quick visual reference of modifier’s type.
**Name **
Every modifier has unique name per object. Two modifiers on one object must have unique names, but two modifiers on different objects can have same name. default name is based on modifier type.
**On Cage Meshes **
Depends on previous setting, if enabled, modified geometry can also be edited directly, instead of original one.
Warning
While it shows edited items in their final, modified positions, you are still editing original data.
In situations where positions diverge it can lead to confusing behavior, so you may wish to disable it in those cases.
It’s also worth noting that some features don’t use cage positions including:
-
Snap targets, such as snapping to vertex.
-
transform gizmo uses original positions.
**Apply On Spline Curves Surfaces Text **
Apply whole modifier stack up to and including that one on curve or surface control points, instead of their tessellated geometry.
Note
By default, curves, texts and surfaces are always converted to mesh-like geometry before that modifier stack is evaluated on them.
**Edit Mode **
Display modified geometry in Edit Mode, as well as original geometry which you can edit.
**/ Realtime **
**/ Render **
Note
*Square *, *Triangle *and *Surface *icons may not be available, depending on type of object and modifier.
**Extras **
**Apply Ctrl - **
Makes modifier “real”: converts object’s geometry to match applied modifier’s results, and deletes modifier.
When applying modifier to object that shares Object Data between multiple objects, object must first be made Single User which can be performed by confirming pop-up message.
Warning
Applying modifier not first in stack will ignore stack order (it will be applied as if it was first one), and may produce undesired results.
**Apply as Shape Key **
Stores result of that modifier in new relative shape key and then deletes modifier from modifier stack. This is only available with modifiers that do not affect topology (typically, *Deform *modifiers only).
Note
Even though it should work with any geometry type that supports shape keys, currently it will only work with meshes.
**Save as Shape Key **
Stores result of that modifier in new relative shape key and keeps modifier in modifier stack. This is only available with modifiers that do not affect topology (typically, *Deform *modifiers only).
**Duplicate Shift - D **
Creates duplicate of modifier below current one in stack.
**Copy to Selected **
Copies modifier from Active object to all selected objects.
**Move to First/Last **
Moves modifier to first or last position in modifier stack.
**Pin to Last **
Keeps modifier at end of modifier stack. When modifier is pinned, pin icon will be displayed on right side of panel’s header.
**Move to Nodes **
Converts existing Geometry Nodes Modifier node tree to group node to be reused in other node trees. See Move to Nodes Operator for more information.
This operator is only available for Geometry Nodes Modifier.
**Delete X , Delete **
Delete modifier.
**(Move) **
Move modifier up/down in stack , changing evaluation order of modifiers.
modifier is not movable if Pin to Last is enabled.
Below this header, all of options unique to each modifier will be displayed.
Tip
Use Alt to affect all selected objects at once when performing operators such as add, apply, remove, and move to index.
See Multi-Object Editing for more information.
### The Modifier Stack
Modifiers are series of non-destructive operations which can be applied on top of object’s geometry. You can be apply them in almost any order. This kind of functionality is often referred to as “modifier stack” and is also found in several other 3D applications.
In modifier stack, order in which modifiers are applied has effect on result. Therefore modifiers can be re-arranged by clicking (grip icon) in top right, and moving selected modifier up or down. For example, image below shows Subdivision Surface and Mirror modifiers that have switched places. Modifier Stack example.
Mirror modifier is last item in stack and result looks like two surfaces.
Subdivision Surface modifier is last item in stack and result is single merged surface.
Modifiers are calculated from top to bottom in stack. In this example, desired result (on right) is achieved by first mirroring object, and then calculating subdivision surface.
#### Active Modifier
modifier in stack can be selected to mark in as Active , active modifier displays outline around modifier’s panel. To set active modifier, select area of modifier’s panel background, modifier’s icon, or, select modifier in Outliner .
active modifier is used by Geometry Node Editor to determine which node group is being modified.
## Example
In this example simple subdivided cube has been transformed into rather complex object using stack of modifiers.
Download example file .
- Introduction
- Categories
- Interface
- Modifier Stack
- Active Modifier
- Example

---

# Subdivision Surface Modifier
*Subdivision Surface *modifier (often shortened as slang to “Subdiv” or “Subsurf”) is used to split faces of mesh into smaller faces, giving it smooth appearance. It enables you to create complex smooth surfaces while modeling simple, low-vertex meshes. It avoids need to save and maintain huge amounts of data, and gives smooth “organic” look to object.
As with any modifier, order of execution (position in modifier stack ) has important bearing on results.
Keep in mind that this is different operation than its companion, Smooth Shading . You can see difference between two in grid image below.
Subdivision levels 0 to 3, without and with Smooth Shading.
Tip
*Subdivision Surface *modifier does not allow you to edit new subdivided geometry without applying it, but Multiresolution modifier does (in Sculpt Mode).
Note
This modifier uses OpenSubdiv library as backend.
## Options
Subdivision Surface modifier.
**Catmull-Clark **
Subdivides and smooths surfaces to create more pleasant looking mesh. According to its Wikipedia page , “arbitrary-looking formula was chosen by Catmull and Clark based on aesthetic appearance of resulting surfaces rather than on mathematical derivation.”
**Simple **
Only subdivides surfaces, this often does not provide any smoothing unless surface is non-coplanar (same as Subdivide operator, in Edit Mode). To work around this behavior for non-coplanar geometry, triangulate to ensure all geometry is coplanar.
Simple mode can be used, for example, to increase base mesh resolution when using displacement maps.
**Levels Viewport, Render **
number of subdivision levels shown in 3D Viewport or final render.
Warning
Higher levels of subdivisions results in more vertices, which means higher memory consumption (both system RAM, and video memory for display). This can cause Blender to hang or crash if not enough memory is available.
Tip
right combination of these settings will allow you to keep fast and lightweight approximation of your model when interacting with it in 3D Viewport, but use higher quality version when rendering.
Be careful not to set *Viewport *subdivisions higher than *Render *subdivisions, this would mean that quality in 3D Viewport will be higher than rendered.
**Optimal Display **
When rendering wireframe of this object, wires of new subdivided edges will be skipped (only displays edges of original geometry).
### Advanced
**Use Limit Surface **
Places vertices at surface that would be produced with infinite levels of subdivision (smoothest possible shape).
**Quality **
When *Use Limit Surface *is enabled this property controls how precisely vertices are positioned on limit surface (relatively to their theoretical position of infinitely subdivided mesh). It can be lowered to get better performance.
Using higher values does not necessarily mean real improvement in quality, ideal results might be reached well before maximum *Quality *value.
Note
This value can affect accuracy of Edge Creases ; using higher *Quality *value will allow for wider range of crease values to work accurately.
**UV Smooth **
Controls how subdivision smoothing is applied to UVs.
**None : **
UVs remain unchanged.
**Keep Corners : **
UV islands are smoothed, but their boundary remain unchanged.
**Keep Corners, Junctions : **
UVs are smoothed, corners on discontinuous boundary and junctions of three or more regions are kept sharp.
**Keep Corners, Junctions, Concave : **
UVs are smoothed, corners on discontinuous boundary, junctions of three or more regions and darts and concave corners are kept sharp.
**Keep Boundaries : **
UVs are smoothed, boundaries are kept sharp.
**All : **
UVs and their boundaries are smoothed.
**Boundary Smooth **
Controls how open boundaries (and corners) are smoothed.
**All : **
Smooth boundaries, including corners.
**Keep Corners : **
Smooth boundaries, but corners are kept sharp.
**Use Creases **
Use Weighted Edge Creases values stored in edges to control how smooth they are made.
**Use Custom Normals **
Interpolates existing Custom Split Normals of resulting mesh. Otherwise, new faces will have overall normal orientation of that original face.
## Adaptive Subdivision
Cycles Only
**Adaptive Subdivision **
Subdivide objects based on their distance to camera, automatically adding more or less detail. Particularly useful for fine displacement detail.
**Adaptive Space **
**Pixel : **
Subdivide polygons to reach specified pixel size on screen.
**Object : **
Subdivide to reach specified edge length in object space. This is required to use adaptive subdivision for instanced meshes.
**Pixel Size **
Target polygon pixel size for adaptive subdivision.
**Edge Length **
Target object space edge length.
### Limitations
-
Multi-view renders can have some inconsistencies between views.
-
Instancing does not work well with Pixel space subdivision. Subdivision will be based on original object position relative to camera, and it is recommended to use Object space instead.
## Keyboard Shortcuts
To quickly add *Subdivision Surface *modifier to one or more objects, select object(s) and press Ctrl - 1 . That will add Subdivision Surface modifier with *Viewport *subdivisions set to 1. You can use other numbers too, such as Ctrl - 2 , Ctrl - 3 , etc, to add modifier with that number of subdivisions. Adding *Subdivision Surface *modifier in this fashion will not modify *Render *subdivisions.
If object already has *Subdivision Surface *modifier, doing this will change its subdivision level instead of adding another modifier.
## Control
Catmull-Clark subdivision rounds off edges, and often this is not what you want. There are several solutions that allow you to control subdivision.
### Weighted Edge Creases
Weighted edge creases for subdivision surfaces allows you to change way *Subdivision Surface *modifier subdivides geometry to give edges smooth or sharp appearance.
subdivided cube with creased edges.
crease weight of selected edges can be changed in *Transform *panel, Sidebar of 3D Viewport. scale-like dedicated tool Shift - E can also be used to adjust crease weight. higher value makes edge “stronger” and more resistant to smoothing effect of subdivision surfaces.
### Edge Loops
Subdivision Level 2 cube, same with extra Edge Loop, and same with six extra Edge Loops.
*Subdivision Surface *modifier demonstrates why good, clean topology is so important. As you can see in figure, it has drastic effect on default cube. Until you add in additional loops (with e.g. Loop Cut and Slide ), shape is almost unrecognizable as cube.
mesh with deliberate topology has good placement of edge loops, which allow placement of more loops (or their removal) to control sharpness/smoothness of resultant mesh.
## Known Limitations
### Non-Contiguous Normals
Abrupt normal changes will prevent portions of mesh from producing smooth subdivision. Instead, these portions with non-contiguous normals will be subdivided using “Simple” subdivision method.
Comparison of good normals and bad normals.
Side view of image on left.
quick way to fix this is to Recalculate Normals . If this does not work you may have to manually flip normals .
- Subdivision Surface Modifier
- Options
- Advanced
- Adaptive Subdivision
- Limitations
- Keyboard Shortcuts
- Control
- Weighted Edge Creases
- Edge Loops
- Known Limitations
- Non-Contiguous Normals

---

# Mirror Modifier
*Mirror *modifier mirrors mesh along its local X, Y and/or Z axes, across Object Origin . It can also use another object as mirror center, then use that object’s local axes instead of its own.
## Options
Mirror modifier.
**Axis **
X, Y, Z axis along which to mirror, i.e. axis perpendicular to mirror plane of symmetry.
To understand how axis applies to mirror direction, if you were to mirror on X axis, positive X values of original mesh would become negative X values on mirrored side.
You can select more than one of these axes. And will then get more mirrored copies. With one axis you get single mirror, with two axes four mirrors, and with all three axes eight mirrors.
**Bisect **
If mesh is already on both sides of mirror plane, it is cut by that plane, and only one side (“positive” one by default) is kept to perform mirror process.
**Flip **
When *Bisect *is enabled on axis, you can use this setting to switch side kept and mirrored (i.e. when it is enabled, “negative” side will be kept, instead of “positive” one).
**Mirror Object **
Object Selector to select object (usually empty), which position and rotation will be used to define mirror planes (instead of using ones from modified object).
You can animate it to move mirror axis.
**Clipping **
Prevents vertices from moving through mirror plane(s) when you transform them in Edit Mode.
If it is enabled but vertices are beyond mirror plane and outside of *Merge Distance *, vertices will not be merged. But as soon as vertices are within *Merge Distance *they are snapped together and cannot be moved beyond mirror plane.
Note
Vertices on mirror plane will be unable to move away from mirror plane as long as *Clipping *is enabled. You must disable it to be able to move vertices along mirror axis again.
**Merge **
Where vertex is in same place (within *Merge Distance *) as its mirror it will be merged with mirrored vertex.
**Merge Distance **
maximum distance between vertex and its mirror copy at which they are merged together (being snapped on mirror plane). Needs *Merge *to be enabled.
**Bisect Distance **
Distance from bisect plane within which vertices are removed.
### Data
**Flip UV **
With this option you can mirror UV texture coordinates across middle of image.
E.g. if you have vertex with UV coordinates of (0.3, 0.9), its mirror copy will have UV coordinates of (0.7, 0.1).
**UV Offsets **
Amount to shift mirrored UVs on U/V axes.
It’s useful for baking (as overlapping UVs can cause artifacts to appear in baked map), so UVs can be moved outside image and not used for baking, but still be used for display.
**Vertex Groups **
Try to mirror existing vertex groups, with following specific prerequisites:
-
vertex groups you want to mirror must be named following usual left/right pattern (i.e. with suffixes like “.R”, “.right”, “.L”, etc.).
-
mirror side vertex group must already exist (it will not be created automatically). It must also be completely empty (no vertices assigned to it).
**Flip UDIM **
Mirror texture coordinates around each tile center.
## Hints
Many modeling tasks involve creating objects that are symmetrical. This modifier offers simple and efficient way to do this, with real-time update of mirror as you edit it. Once your modeling is completed you can either click *Apply *to make real version of your mesh, or leave it as-is for future editing.
### Accurately Positioning the Mirror Plane
To apply *Mirror *modifier, it is common to have to move object’s origin onto edge or face to be axis for mirroring. This can be tricky when attempted visually.
good technique to achieve exact position is to select edge, then snap *Cursor to Selection *. This will position 3D Cursor in center of edge. Finally, use Set Origin menu, and select *Origin to 3D Cursor *. This will move object’s origin (and thus, mirror plane) to where 3D cursor is located, and mirroring will be exact.
alternative is to use empty as *Mirror Object *that you move to correct position.
- Mirror Modifier
- Options
- Data
- Hints
- Accurately Positioning Mirror Plane

---

# Array Modifier
*Array *modifier creates multiple copies of input geometry and arranges them in linear, circular, or custom pattern. It offers flexible options for count, spacing, and randomization, allowing for both precise and organic duplication of geometry.
## Options
**Shape **
method used for arranging duplicates.
**Line : **
Arranges copies along straight line.
**Circle : **
Arranges copies around circle.
**Curve : **
Arranges copies along curve input.
**Transform : **
Uses transform offset or object transform to position each copy.
**Offset Method Line **
Determines how copies are spaced along line.
**Relative : **
Offsets each copy relative to bounding box size of geometry.
**Offset : **
Offsets copies by fixed world-space distance.
**Endpoint : **
Distributes copies evenly between start and end points.
**Offset Line Relative **
amount to move each copy relative to its bounding box size when using *Relative *mode.
**Count Method Circle Curve **
Determines how number of duplicates is defined.
**Count : **
Sets fixed number of copies.
**Distance : **
Sets copies based on distance between them.
**Count Circle Curve Count **
number of copies to generate.
**Angular Distance Circle Distance **
angular distance between copies when using *Circle *shape.
**Central Axis Circle **
axis used as up direction for circular arrangements.
**Circle Segment Circle **
Determines whether copies form full circle or partial arc.
**Full : **
Copies are evenly spaced around full 360° circle.
**Arc : **
Copies fan out along circular arc.
**Radius Circle **
radius of circle along which copies are distributed.
**Sweep Angle Circle Arc **
total angle (in radians or degrees) spanned by arc when *Circle Segment *is set to *Arc *.
**Per Curve Curve **
Specify number of copies for each curve separately.
**Curve Object Curve **
Reference curve object for array.
**Transform Reference Transform **
Defines how transform is applied for *Transform *shape.
**Input : **
Uses transform specified directly in node inputs.
**Object : **
Uses transform of specified object as reference.
**Translation Inputs Line Offset Endpoint **
positional offset applied to each copy.
**Rotation Inputs Line **
rotation offset applied per copy.
**Scale Inputs Line **
scale factor applied per copy.
**Transform Object Transform Object **
object whose transform is used when *Transform Reference *is set to *Object *.
**Relative Space Transform Object **
Determines whether transform is applied in object or world space.
**Realize Instances **
Converts generated instances into real geometry. This must be enabled for certain operations such as merging or boolean operations.
### Align Rotation Circle Curve
**Forward Axis **
Axis that defines facing direction of each instance along circle.
**Up Axis **
Axis used as vertical reference for instance orientation.
### Randomize
**Offset **
Maximum random translation offset for each axis, defining variation in instance position.
**Rotation **
Maximum random rotation for each axis, defining how much each instance can be rotated.
**Scale Axes **
Determines how scaling randomization is applied.
**Uniform : **
Applies single random scale factor uniformly to all axes.
**Axes : **
Applies independent random scale factors per axis.
**Scale **
Maximum random scaling factor applied to each instance.
**Flipping **
Randomly mirrors instances along one or more axes.
**Exclude First / Last **
Excludes first (original) or last copy from randomization effects.
**Seed **
Initializes random number generator. Changing seed produces different random arrangement while preserving other settings.
### Merge
Merges overlapping points or vertices by distance. Requires *Realize Instances *to be enabled.
**Distance **
distance threshold within which points are merged.
- Array Modifier
- Options
- Align Rotation Circle Curve
- Randomize
- Merge

---

# Bevel Modifier
Bevel modifier.
*Bevel *modifier bevels edges of mesh it is applied to, with some control of how and where bevel is applied to mesh.
It is non-destructive alternative to Bevel Operation in Edit Mode. Side views of cube.
Not beveled.
Beveled.
## Options
**Affect **
**Vertices : **
Only areas near vertices are beveled, edges remain unchanged.
**Edges : **
Bevel edges, creating intersections at vertices.
Three cubes with 0.1, 0.3 and 0.5 bevel widths, with *Vertices *option selected.
**Width Type **
Defines how *Width *will be interpreted to determine amount of bevel.
**Offset : **
distance from new edge to original.
**Width : **
distance between two new edges formed by bevel (or edges on either side of bevel if there is more than one segment).
**Depth : **
Value is perpendicular distance from new bevel face to original edge.
**Percent : **
percentage of length of adjacent edge length that new edges slide along.
**Absolute : **
exact distance along edges adjacent to beveled edge. difference from **Offset **is visible when unbeveled edges attached to beveled edges meet at angle besides right angle.
**Width **
size of bevel effect. See *Width Method *below.
Three Cubes with 0.1, 0.3 and 0.5 bevel widths.
**Segments **
number of edge loops added along bevel’s face.
**Limit Method **
Used to control where bevel is applied to mesh.
**None : **
No limit, all edges will be beveled.
**Angle : **
Only bevels edges whose angle of adjacent face normals plus defined *Angle *is less than 180 degrees. Intended to allow you to bevel only sharp edges of object without affecting its smooth surfaces.
**Weight : **
Use attribute to determine width of bevel. When bevel weight is 0.0, no bevel is applied.
Any attribute on input mesh can be chosen. By default `bevel_weight_edge `and `bevel_weight_vert `attributes adjusted in edit mode are used. For convenience, modifier lists attributes from original mesh in dropdown, but attributes created by previous modifiers can also be used. Attributes with non-matching domains or types will be automatically interpolated to correct type.
**Vertex Group : **
Use weights from vertex group to determine width of bevel. When vertex weight is 0.0, no bevel is applied. edge is only beveled if both of its vertices are in vertex group. See here about adjusting vertex group weights.
**Invert **
Inverts influence of selected vertex group, meaning that group now represents vertices that will not be deformed by modifier.
setting reverses weight values of group.
### Profile
#### Superellipse
Creates bevel with uniform concave or convex curve.
**Shape **
shape of bevel, from concave to convex. It has no effect if *Segments *is less than 2.
#### Custom Profile
custom profile widget.
This widget allows creation of user-defined profile with more complexity than with single profile parameter. modal tool allows toggling custom profile, but shape of profile is only editable in options panel after operation is confirmed.
profile starts at bottom right of widget and ends at top left, as if it were between two edges meeting at right angle. Control points are created in widget and then path is sampled with number of segments from Bevel modifier.
**Miter Shape **
shape of miter patterns, from concave to convex. It has no effect if *Segments *is less than 2.
Note
*Miter Shape *slider stays active when miters are enabled because it still controls shape of miter profiles.
**Presets **
*Support Loops *and *Steps *presets are built dynamically depending on number of segments in bevel. If number of segments is changed, preset will have to be re-applied.
**Sampling **
Samples will first be added to each control point, then if there are enough samples, they will be divided evenly between edges. *Sample Straight Edges *option toggles whether samples are added to edges with sharp control points on either side. If there aren’t enough samples to give each edge same number of samples, they will be added to most curved edges, so it is recommended to use at least as many segments as there are control points.
### Geometry
**Miter Inner/Outer **
*miter *is formed when two beveled edges meet at angle. On side where angle is greater than 180 degrees, if any, it is called *outer miter *. If it is less than 180 degrees, then it is called *inner miter *. outer and inner miters can each be set to one of these patterns:
**Sharp : **
Edges meet at sharp point, with no extra vertices introduced on edges.
**Patch : **
Edges meet at sharp point but in addition, two extra vertices are introduced near point so that edges and faces at vertex may be less pinched together than what occurs in *Sharp *case. This pattern does makes no sense for inner miters, so it behaves like *Arc *for them.
**Arc : **
Two vertices are introduced near meeting point, and curved arc joins them together.
*Spread *slider controls how far new vertices are from meeting point.
*Profile *curve widget controls shape of arc. Diagrams of miter patterns.
Sharp outer miter.
Patch outer miter.
Arc outer miter.
Sharp inner miter.
Arc inner miter.
**Spread **
value used to spread extra vertices apart for non-sharp miters. This option is available when Miter Inner is set to Arc.
**Intersections **
When more than two beveled edges meet at vertex, mesh is created as way to complete intersection between generated geometry. This option controls method used to create that mesh.
**Grid Fill : **
default method for building intersections, useful when smooth continuation of bevel profile is desired. Without *Custom Profile *enabled, curve of profile continues through intersection, but with custom profile it creates smooth grid within boundary of intersection.
**Cutoff : **
Creates cutoff face at end of each beveled edge coming into vertex. This is most useful for custom profiles when new intersection is too complex for smooth grid fill.
With three way intersection, when inner corners of cutoff profiles faces meet at same location, no center face is created.
direction of cutoff faces depends on original vertex’s normal. Intersection method options.
Grid fill intersection method.
Three way cutoff intersection where inner vertices are merged.
Cutoff intersection method with center face.
**Clamp Overlap **
Limits width of each beveled edge so that edges cannot cause overlapping intersections with other geometry.
**Loop Slide **
If there are unbeveled edges along with beveled edges into vertex, bevel tries to slide along those edges when possible. Turning option off can lead to more even bevel widths.
### Shading
**Harden Normals **
When enabled, per-vertex face normals of bevel faces are adjusted to match surrounding faces, and normals of surrounding faces are not affected. This will keep surrounding faces flat (if they were before), with bevel faces shading smoothly into them. For this effect to work, mesh must have custom split normals attribute. As convenience, `custom_normal `attribute will be created if one does not already exist.
**Mark **
**Seam **
If seam edge crosses non-seam one and you bevel all of them, this option will maintain expected propagation of seams.
**Sharp **
Similar to Mark Seams, but for sharp edges.
**Material Index **
index of material slot to use for bevel. When set to -1, material of nearest original face will be used.
**Face Strength **
Set *Face Strength *on faces involved in bevel, according to mode specified here. This can be used in conjunction with following Weighted Normals modifier (with *Face Influence *option checked).
**None : **
Do not set face strength.
**New : **
Set face strength of new faces along edges to *Medium *, and face strength of new faces at vertices to *Weak *.
**Affected : **
In addition to those set for *New *case, also set faces adjacent to new faces to have strength *Strong *.
**All : **
In addition to those set for *Affected *case, also set all rest of faces of model to have strength *Strong *.
- Bevel Modifier
- Options
- Profile
- Superellipse
- Custom Profile
- Geometry
- Shading

---

# Boolean Modifier
*Boolean *modifier combines multiple meshes using Boolean operation.
Applying modifier to sphere and creating Intersection, Union, and Difference with cube. cube is hidden for better view.
Warning
Only Manifold meshes are guaranteed to give proper results. Non-manifold ones (especially meshes with holes) will usually work well, but might give odd glitches and artifacts. However, Manifold Solver will not work at all on non-manifold meshes.
Tip
If you have marked your objects to show edges (in Properties ‣ Object ‣ Viewport Display , enable *Wireframe *), you will see edge creation process while you are moving your objects around. You can also enable X-Ray to see inside objects.
See also
Intersect (Boolean) for performing one-off Boolean operations inside mesh in Edit Mode.
## Options
Boolean modifier.
**Operation **
**Intersect : **
Only keep volume that’s inside modified mesh and all of source meshes.
**Union : **
Add source meshes to modified mesh while removing any interior faces.
**Difference : **
Cut source meshes out of modified mesh.
**Operand Type **
**Object : **
source is single mesh object.
**Collection : **
source is collection of any number of mesh objects. If *Solver *is *Float *, *Intersect *operation is not allowed.
**Object **
source mesh object.
**Collection **
source collection. May be empty if *Solver *is *Exact *, in which case modifier removes modified mesh’s interior (self-intersecting) geometry.
**Solver **
Algorithm used to perform Boolean operation.
**Float : **
Uses simple solver which offers good performance but lacks support for overlapping geometry.
**Exact : **
Uses complex solver which offers best results and has full support for overlapping geometry, but is much slower.
**Manifold : **
Uses solver usually fastest but only works on Manifold meshes (plus special case of Difference with plane).
### Solver Options
**Materials Exact Solver **
Method for setting materials on new faces.
**Index Based : **
Map first material of source mesh to first material of modified mesh, second to second, and so on. If source face has higher material index than number of material slots on modified mesh, modified mesh’s first material is used.
**Transfer : **
Use same materials as on source mesh, adding new material slots to modified mesh as necessary. For empty slots, fall back to using same material index as source mesh.
**Self Intersection Exact Solver **
Correctly handle self-intersection in participating meshes, at cost of performance.
**Hole Tolerant Exact Solver **
Optimizes Boolean output for Non-manifold geometry at cost of increased computational time. Because of performance impact, this option should only be enabled when *Exact *solver demonstrates errors with non-manifold geometry.
**Overlap Threshold Float Solver **
Maximum distance between two faces to consider them as overlapping. This helps solve limitation of this solver. If result is still not as expected, try using *Exact *solver.
- Boolean Modifier
- Options
- Solver Options

---

# Solidify Modifier
*Solidify *modifier takes surface of any mesh and adds depth, thickness to it.
## Options
Solidify modifier in simple mode.
Solidify modifier in complex mode.
**Mode **
**Simple : **
This is default solidify algorithm, which extrudes geometry. This algorithm does not work on geometry where edges have more than two adjacent faces.
Important
If normals of adjacent faces don’t point into same general direction, simple mode will not be able to solidify boundary between those. This happens if normals are not recalculated or for example on one-sided surfaces like Möbius strip.
**Complex : **
This is solidify algorithm which can handle every geometric situation to guarantee manifold output geometry. This algorithm is able to solidify shapes like Möbius strips, Klein bottles, architectural wall layouts and many more which *Simple Mode *isn’t able to do. If special cases are not present it is recommended to choose *Simple *because extra logic makes this algorithm much slower.
Note
There are no options for crease in Modifier tab because crease is handled in dynamic way. modifier will transfer creases of original mesh in smart way to output mesh to work with Subdivision Surface modifier.
**Thickness Mode Complex Mode **
Choose kind of thickness handling (thickness solver).
Different thickness options on non-manifold mesh.
**Fixed : **
This is similar to *Simple Mode *without *Even Thickness *. new vertices are always in fixed distance to old ones.
**Even : **
This is similar to *Simple Mode *with *Even Thickness *and *High Quality Normals *. It adjusts for sharp corners, but may not always work when more than three faces come together.
**Constraints : **
This is more advanced model to try to always get optimal thickness everywhere. For up to three faces it is always guaranteed to find optimal solution.
**Boundary Complex Mode **
Choose kind of boundary that suits model most.
Different boundary options with matCap.
**None : **
No boundary fix is applied. Results are stable.
**Round : **
Adjusts boundary for opening to face inwards (like hole in egg).
**Flat : **
Adjusts boundary of planar opening to be flat (like cut sphere).
**Thickness **
depth to be solidified.
Important
modifier thickness is calculated using local vertex coordinates. If object has non-uniform scale, thickness will vary on different sides of object.
To fix this, either Apply or Clear scale.
**Offset **
value between (-1 to 1) to locate solidified output inside or outside original mesh. inside and outside is determined by face normals. Set to 0.0, solidified output will be centered on original mesh.
**Even Thickness Simple Mode **
Maintain thickness by adjusting for sharp corners. Sometimes improves quality but also increases computation time.
**Merge Threshold Complex Mode **
Distance within which degenerated geometry is merged.
**Rim – Fill **
Creates edge loops and faces between inner and outer surfaces on face edges (slow, disable when not needed).
**Only Rim **
-
*Simple Mode *: Only leaves extruded surface and generated perpendicular rim.
-
*Complex Mode *: Only leaves generated perpendicular rim.
**Vertex Group **
weights of selected vertex group are multiplied onto *Thickness *, so vertices with lower weights will be less thick. vertices which are not part of vertex group will be used as if their weight was zero.
**Invert **
Reverses vertex group weights, so that used weight is one minus actual weight.
**Factor **
How much vertex weights are taken into account.
-
On 0.0 , vertices with zero weight will have no thickness at all.
-
On 0.5 , vertices with zero weight will be half as thick as those with full weight.
-
On 1.0 , weights are ignored and *Thickness *value is used for every vertex.
**Flat Faces Complex Mode **
Use minimal vertex weight assigned to vertices of face to make that new faces stay parallel to their original ones. This is slow, so disable it when it is not needed.
Note
If final thickness of vertex is zero, it will still be solidified. Therefore creating duplicate geometry, which sometimes needs extra care.
### Normals
**Flip Normals **
Reverse normals of all geometry (both inner and outer surfaces).
**High Quality Normals Simple Mode **
Normals are calculated to produce more even thickness. Sometimes improves quality but also increases computation time.
### Materials
**Material Offset **
Choose different material slot index to use for new geometry. This is applied as offset from original material of face from which it was solidified.
-
value of 0 means it will use same material.
-
value of 1 means it will use material immediately below original material.
-
value of -2 means material two positions above original material will be used.
These are clamped to top-most and bottom-most material slots.
**Rim **
Similarly, you can give another material to rim faces.
### Edge Data
**Inner Simple Mode **
Set crease to inner edges.
**Outer Simple Mode **
Set crease to outer edges.
**Rim Simple Mode **
Set crease to rim.
**Bevel Convex **
Edge bevel weight to be added to outside edges.
Edges which will get creases marked.
### Thickness Clamp
**Clamp **
value between (0 to 2) to clamp offsets to avoid self-intersection. amount is determined by length of shortest adjacent edge.
Clamp Offset.
**Angle Clamp **
If enabled clamping will also consider angles in geometry, not only lengths.
### Output Vertex Groups
**Shell **
Vertex group that generated shell geometry will be weighted to. This allows you to use other modifiers to only affect shell geometry by using that modifier’s vertex group influence control.
**Rim **
Same as *Shell Vertex Group *, but for generated rim geometry.
## Known Limitations
### Even Thickness
Solidify thickness is approximation. While *Even Thickness *and *High Quality Normals *should yield good results, final wall thickness is not guaranteed and may vary depending on mesh topology. Especially for vertices with more than three adjacent faces.
 maintain precise wall thickness in every case, we would need to add/remove faces on offset shell, something this modifier does not do since this would add lot of complexity. best option to preserve wall thickness is complex mode with constraints thickness mode, but it is also not guaranteed to work perfect in every case.
- Solidify Modifier
- Options
- Normals
- Materials
- Edge Data
- Thickness Clamp
- Output Vertex Groups
- Known Limitations
- Even Thickness

---

# Screw Modifier
*Screw *modifier is similar to Screw tool in Toolbar, in that it takes profile object, mesh or curve, to create helix-like shape.
Properly aligning profile object is important.
profile should be properly aligned to cardinal direction of object rather than to screw axis.
## Options
Screw modifier.
**Angle **
Degrees for single helix revolution.
**Screw **
height of one helix iteration.
**Iterations **
Number of revolutions.
**Axis **
axis along which helix will be built.
**Axis Object **
name of object to define axis direction.
**Object Screw **
Use distance from *Axis Object *to define height of one helix iteration.
**Steps Viewport **
Number of steps used for single revolution displayed in 3D Viewport.
**Render **
As above, but used during render time. Increase to improve quality.
**Merge **
Merge vertices that lie on axis of rotation. Use this to close off end points with triangle fan.
**Merge Distance **
Vertices under this distance to axis are merged.
**Stretch UVs **
Stretch UV coordinates from (0.0 to 1.0) when UVs are present.
### Normals
**Smooth Shading **
Output faces with smooth shading rather than flat shading. smooth/flat shading of input geometry is not preserved.
**Calculate Order **
Order of edges is calculated to avoid problems with normals and shading. Only needed for meshes, not curves.
**Flip **
Flip normals direction.
- Screw Modifier
- Options
- Normals

---

# Skin Modifier
*Skin *modifier uses vertices and edges to create skinned surface, using per-vertex radius to better define shape. output is mostly quads, although some triangles will appear around intersections.
It is quick way to generate base meshes for sculpting and/or smooth organic shapes with arbitrary topology.
Note
Faces in original geometry are ignored.
## Options
Skin modifier.
**Branch Smoothing **
branch point is vertex with three or more connected edges. These areas tend to produce more complicated topology, some of which may overlap. This setting relaxes surface around these points, with side effect of shrinking it.
**Symmetry **
These checkboxes are used to keep output topology symmetrical in their respective axes. In other words, using it avoids merging triangles across axis unless triangles form symmetric quad.
Note
They do not add geometry flipped across axis. For that, Mirror modifier should be used, typically placed above Skin one.
**Smooth Shading **
Output faces with smooth shading rather than flat shading. smooth/flat shading of input geometry is not preserved.
**Create Armature **
Create armature on top of object. Each edge becomes bone.
Note
If root vertex has more than one adjacent edge, extra bone will be created to serve as root.
This tool does following:
-
new armature object is added with bones matching input mesh. active selection is switched to new armature.
-
Weight groups are added to input mesh. Skin modifier propagates these weights to output as well.
-
Armature modifier is added directly below Skin one. Note that Armature modifier is being applied after Skin one because it should only deform output, whereas if it were above, it might change resulting topology.
**Add Skin Data **
This modifier uses custom set of data in mesh, generated automatically when you add modifier first time.
However, you may remove that data, or loose it some way or other. That operator will generate it again.
**Mark/Clear Loose **
By default, branch vertex (vertex with three or more connected edges) will generate extra edge loops along adjacent edges keep output tight. Branches can be made loose by clicking *Mark Loose *, which will allow output to stretch between all adjacent vertices. This can be disabled again by clicking *Clear Loose *.
**Mark Root **
Marking vertex as root causes that vertex to be used for calculating rotations for connected limbs. Root vertices also affect armature output, they will be used as origin for root bones.
Each set of connected vertices should have one root node (one is selected by default if you do not assign any manually). *Mark Root *enforces one-root per set rule, so it is not necessary to manually unmark roots.
**Equalize Radii **
Makes skin radii of selected vertices equal on each axis.
## Skin Mesh Data
That modifier needs set of specific data in original mesh to work properly. This data allows you to define root vertices of each tree, which ones are loose, and size (radius) of skin at each vertex. radii of input vertices can be individually scaled in Edit Mode with Skin Resize .
## Examples
Simple creature, made with only Skin and Subdivision Surface modifiers.
## External Links
-
Skin Modifier Development at Blender Nation – early demonstration of Skin Modifier by Nicholas Bishop (March 2011).
-
Ji, Zhongping; Liu, Ligang; Wang, Yigang (2010). B-Mesh: Fast Modeling System for Base Meshes of 3D Articulated Shapes, Computer Graphics Forum 29(7), pp. 2169-2178. – work this modifier is based on ( DOI 10.1111/j.1467-8659.2010.01805.x ).
-
Related thread on Blender artists .
- Skin Modifier
- Options
- Skin Mesh Data
- Examples
- External Links

---

# Remesh Modifier
*Remesh *modifier is tool for generating new mesh topology. output follows surface curvature of input, but its topology contains only quads.
## Options
Remesh modifier.
**Mode **
There are three basic modes available in *Remesh *modifier. output topology is almost identical between three modes, what changes is smoothing.
**Blocks **
There is no smoothing at all.
**Smooth **
Output smooth surface.
**Sharp **
Similar to *Smooth *, but preserves sharp edges and corners.
**Sharpness **
Higher values produce edges more similar to input, while lower values filter out noise.
**Voxel **
Uses OpenVDB to generate new manifold mesh from current geometry while trying to preserve mesh’s original volume.
**Adaptivity **
Reduces final face count by simplifying geometry where detail is not needed. This introduce triangulation to faces that do not need as much detail.
**Smooth Shading **
Outputs faces with Smooth Shading instead of flat shading.
**Octree Depth **
Sets resolution of output. Low values will generate larger faces relative to input, higher values will generate denser output.
**Scale **
result can be tweaked further by this, lower values effectively decrease output resolution.
**Remove Disconnected **
Filter out small disconnected pieces of output.
Thin parts of input mesh can become loose, and generate small isolated bits of mesh. This option will remove those.
**Threshold **
Use this to control how small disconnected component must be to be removed.
**Smooth Shading **
Output faces with smooth shading rather than flat shading. smooth/flat shading of input faces is not preserved.
Note
input mesh should have some thickness to it. If input is completely flat, add Solidify Modifier above *Remesh *one.
## Examples
Unmodified mesh.
Blocks mode with Octree Depth 3.
Smooth mode with Octree Depth 3.
Sharp mode with Octree Depth 2.
Sharp mode with Octree Depth 3.
Sharp mode with Octree Depth 4.
Remesh Modifier applied to text to improve its topology.
Animated Example
- Remesh Modifier
- Options
- Examples

---

# Decimate Modifier
*Decimate *modifier allows you to reduce vertex/face count of mesh with minimal shape changes.
This is not usually used on meshes which have been created by modeling carefully and economically (where all vertices and faces are necessary to correctly define shape). But if mesh is result of complex modeling, sculpting and/or applied Subdivision Surface / Multiresolution modifiers, *Decimate *one can be used to reduce polygon count for performance increase, or remove unnecessary vertices and edges.
Unlike majority of existing modifiers, this one does not allow you to visualize your changes in Edit Mode.
modifier displays number of remaining faces as result of *Decimate *modifier.
## Options
### Collapse
Decimate modifier in Collapse mode.
Merges vertices together progressively, taking shape of mesh into account.
**Ratio **
ratio of faces to keep after decimation.
-
On 1.0: mesh is unchanged.
-
On 0.5: edges have been collapsed such that half number of faces remain (see note below).
-
On 0.0: all faces have been removed.
Note
Although *Ratio *is directly proportional to number of remaining faces, triangles are used when calculating ratio.
This means that if your mesh contains quads or other polygons, number of remaining faces will be larger than expected, because those will remain unchanged if their edges are not collapsed.
This is only true if *Triangulate *option is disabled.
**Symmetry **
Maintains symmetry on single axis.
**Triangulate **
Keeps any resulting triangulated geometry from decimation process.
**Vertex Group **
vertex group that controls what parts of mesh are decimated.
**Factor **
amount of influence *Vertex Group *has on decimation.
### Un-Subdivide
Decimate modifier in Un-Subdivide mode.
It can be thought of as reverse of subdivide. It attempts to remove edges that were result of subdivide operation. It is intended for meshes with mainly grid-based topology (without giving uneven geometry). If additional editing has been done after subdivide operation, results may be unexpected.
**Iterations **
number of times to perform un-subdivide operation. Two iterations is same as one subdivide operation, so you will usually want to use even numbers.
### Planar
Decimate modifier in Planar mode.
It reduces details on forms comprised of mainly flat surfaces.
**Angle Limit **
Dissolve geometry which form angles (between surfaces) higher than this setting.
**Delimit **
Prevent dissolving geometry in certain places.
**Normal **
Does not dissolve edges on borders of areas where face normals are reversed.
**Material **
Does not dissolve edges on borders of where different materials are assigned.
**Seam **
Does not dissolve edges marked as UV Seams .
**Sharp **
Does not dissolve edges marked as Sharp .
**UVs **
Does not dissolve edges that are part of UV map.
**All Boundaries **
When enabled, all vertices along boundaries of faces are dissolved. This can give better results when using high *Angle Limit *.
- Decimate Modifier
- Options
- Collapse
- Un-Subdivide
- Planar

---

# Wireframe Modifier
*Wireframe *modifier transforms mesh into wireframe by iterating over its faces, collecting all edges and turning those edges into four-sided polygons. Be aware of fact that your mesh needs to have faces to be wireframed. You can define thickness, material and several other parameters of generated wireframe dynamically via given modifier options.
## Options
Wireframe modifier.
**Thickness **
depth or size of wireframes.
**Offset **
value between (-1 to 1) to change whether wireframes are generated inside or outside of original mesh. Set to zero, *Offset *will center wireframes around original edges.
**Boundary **
Creates wireframes on mesh island boundaries.
**Replace Original **
If this option is enabled, original mesh is replaced by generated wireframe. If not, wireframe is generated on top of it.
**Thickness **
**Even **
Maintain thickness by adjusting for sharp corners. Sometimes improves quality but also increases computation time.
**Relative **
Determines edge thickness by length of edge. Longer edges will be thicker.
**Crease Edges **
This option is intended for usage with Subdivision modifier. Enable this option to crease edges on their junctions and prevent large curved intersections.
**Crease Weight **
Define how much crease (0 to 1, nothing to full) junctions should receive.
**Material Offset **
Uses chosen material index as material for wireframe; this is applied as offset from first material.
Warning
Wireframe thickness is approximation. While *Even Thickness *should yield good results in many cases, skinny faces can cause ugly spikes. In this case you can either reduce extreme angles in geometry or disable *Even Thickness *option.
### Vertex Group
weights of selected vertex group are multiplied onto *Thickness *, so vertices with lower weights will be less thick. vertices which are not part of vertex group will be used as if their weight was zero.
**Invert **
Reverses vertex group weights, so that used weight is one minus actual weight.
**Factor **
How much vertex weights are taken into account.
-
On 0.0 , vertices with zero weight will have no thickness at all.
-
On 0.5 , vertices with zero weight will be half as thick as those with full weight.
-
On 1.0 , weights are ignored and *Thickness *value is used for every vertex.
Note
If final thickness of vertex is zero, it will still generate wireframe. Therefore creating duplicate geometry, which sometimes needs extra care.
## Examples
Wireframes on displaced plane.
In this example, wireframes carry second (dark) material while displaced plane uses its original one.
Vertex group weighting.
weights of vertex group gradually change from 0 to 1.
Wireframe and Subdivision Surface modifier.
Cube with enabled *Crease Edges *option. *Crease Weight *is set to 0, 0.5 and 1.
- Wireframe Modifier
- Options
- Vertex Group
- Examples

---

# Multiresolution Modifier
*Multiresolution *modifier (often shortened to “Multires”) gives you ability to subdivide mesh similarly to Subdivision Surface modifier, but also allows you to edit new subdivision levels in Sculpt Mode .
Note
*Multiresolution *is only modifier that cannot be repositioned in stack after any modifier that will change geometry or other object data (i.e. all *Generate *, some *Modify *and some *Simulate *modifiers cannot come before *Multiresolution *).
Deform modifiers will be applied onto Multires subdivision levels instead of base mesh, if they come after Multires.
Tip
This is especially useful for re-projecting details from another sculpt with Shrinkwrap modifier . For best result set wrap method to *Project *, snap mode to *Above Surface *and enable *Negative *.
## Options
Multiresolution modifier.
**Levels Viewport **
Set level of subdivisions to show in viewport.
**Sculpt **
Set level of subdivisions to use specifically in Sculpt Mode. While in Sculpt mode use Alt - 1 to decrease level or Alt - 2 to increase.
**Render **
Set level of subdivisions to show when rendering.
**Sculpt Base Mesh **
Deform unsubdivided base mesh instead of higher levels. Meanwhile set level will be previewed. This allows you to make much broader changes in visual context to higher sculpted details without creating surface noise and artifacts.
**Optimal Display **
Only display edges of original geometry. So when rendering wireframe of this object, wires of subdivided edges will be skipped.
### Subdivision
**Subdivide **
Creates smooth level of subdivision (using default Catmull-Clark algorithm).
**Simple **
Creates level of subdivision with unsmoothed base mesh edges (using simple interpolation by subdividing edges without any smoothing).
**Linear **
Creates completely unsmoothed level of subdivision (using linear interpolation of current sculpted displacement).
**Unsubdivide **
Rebuild lower subdivision level of current base mesh.
**Delete Higher **
Deletes all subdivision levels that are higher than current one.
### Shape
**Reshape **
Copy shape of another object onto multires levels by copying its vertex coordinates.
To use it, first select different mesh object with matching topology and vertex indices, then Shift select object you wish to copy vertex coordinates to, and click *Reshape *.
**Apply Base **
Modifies original unsubdivided mesh to match form of subdivided mesh. This operation applies heuristic to base mesh vertices that assumes that Subdivision Surface modifier will be added to mesh.
**Conform Base **
Modifies original unsubdivided mesh to match form of subdivided mesh. resulting positions of base mesh vertices will match their subdivided positions.
### Generate
**Rebuild Subdivisions **
Rebuilds all possible subdivisions levels to generate lower resolution base mesh. This is used to create optimized multiresolution version of preexisting sculpt. This option is only available when no subdivision level have been created through modifier.
**Save External **
Saves displacements to external `.btx `file.
### Advanced
**Quality **
How precisely vertices are positioned (relatively to their theoretical position), can be lowered to get better performance when working on high-poly meshes.
**UV Smooth **
How to handle UVs during subdivision.
**None : **
UVs remain unchanged.
**Keep Corners : **
UV islands are smoothed, but their boundary remain unchanged.
**Keep Corners, Junctions : **
UVs are smoothed, corners on discontinuous boundary and junctions of three or more regions are kept sharp.
**Keep Corners, Junctions, Concave : **
UVs are smoothed, corners on discontinuous boundary, junctions of three or more regions and darts and concave corners are kept sharp.
**Keep Boundaries : **
UVs are smoothed, boundaries are kept sharp.
**All : **
UVs and their boundaries are smoothed.
**Boundary Smooth **
Controls how open boundaries (and corners) are smoothed.
**All : **
Smooth boundaries, including corners.
**Keep Corners : **
Smooth boundaries, but corners are kept sharp.
**Use Creases **
Use Weighted Edge Creases values stored in edges to control how smooth they are made.
**Use Custom Normals **
Interpolates existing Custom Split Normals of resulting mesh.
## Usage
### Baking
Baking converts high-resolution geometry details, such as sculpted displacement or surface normals, into 2D texture maps. These maps can then be applied to lower-resolution mesh to reproduce appearance of fine surface detail without performance cost of dense geometry.
This process is essential for workflows where high-resolution sculpting data is transferred to low-resolution meshes for rendering or game engines.
To generate normal or displacement map, use Bake from Multires option in Render panel. This feature compares two resolution levels of Multiresolution modifier:
-
**Viewport Levels: **Used as *low-resolution *base mesh.
-
**Render Levels: **Used as *high-resolution *detail mesh.
difference between these two levels is baked into texture map.
#### Bake Types
*Bake Type *determines what kind of surface information is extracted from Multiresolution modifier.
-
**Normals: **Bakes surface normal direction differences between base and detailed levels. resulting normal map encodes lighting information that reproduces fine sculpted detail in shading without modifying actual geometry. Ideal for use with normal-mapped materials in Cycles, Eevee, and real-time engines.
-
**Displacement: **Bakes height differences between base and high-resolution mesh as grayscale image. Lighter areas represent raised regions and darker areas represent recessed areas. This map can be used for *true *displacement in render engines or for parallax/height-based shading.
-
**Vector Displacement: **Bakes 3D displacement vectors representing full spatial offset from base to detailed surface. Unlike regular displacement, this method can capture overhangs and non-vertical displacements, providing more accurate representation of complex sculpted details.
resulting texture encodes XYZ displacement in RGB color channels.
Important
To ensure correct bake:
-
Set **Viewport Levels **of Multiresolution modifier to **0 **, so base mesh is truly low-resolution.
-
Set **Render Levels **to highest sculpt level that contains desired detail.
-
object must have proper **UV unwrapping **and selected **Image Texture **node in Shader Editor to receive baked map.
If Viewport Level is higher than 0, part of sculpted displacement will already be applied, resulting in incorrect bakes.
Tip
-
Use 16-bit or 32-bit image formats (e.g., OpenEXR or TIFF) for displacement or vector displacement maps to preserve precision.
-
Always verify that image’s color space is set to *Non-Color *in Image Editor or Shader Editor.
See also
For more details on general baking settings and workflow, see Render Baking .
- Multiresolution Modifier
- Options
- Subdivision
- Shape
- Generate
- Advanced
- Usage
- Baking
- Bake Types