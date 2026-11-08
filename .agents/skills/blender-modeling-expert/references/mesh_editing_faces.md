# Face Editing Operations

# Inset Faces
Reference
**Mode : **
Edit Mode
**Tool : **
Toolbar ‣ Inset Faces
**Menu : **
Face ‣ Inset Faces
**Shortcut : **
I
This tool creates border of faces around selected faces, then allows adjusting thickness of that border by moving mouse. As border becomes thicker, outermost selected faces become thinner (while inner ones stay same).
While insetting, it’s also possible to adjust depth of inset by holding Ctrl . like Extrude Faces Along Normals , this moves each selected vertex along its normal and can result in *all *faces changing their size.
Once inset looks good, press LMB or Return to confirm. Alternatively, press RMB or Esc to cancel.
Faces selected.
First inset using only Thickness.
Second inset using only Depth.
It’s also possible to inset multiple disjoint “patches” of faces in one go.
## Options
Inset operator options.
keyboard shortcuts listed below can be used while insetting and are also shown in status bar.
**Boundary B **
Also create border faces at boundary edges (, edges that are only part of one face instead of two).
**Offset Even **
Maintain even border width along edges. When disabled, border width will be even at corners instead.
Offset Even enabled (default).
Offset Even disabled.
**Offset Relative **
Scale Thickness and Depth offset of each border vertex by average length of its two neighboring border edges.
**Edge Rail **
Align new edges between border faces to existing edges between inset faces.
Edge Rail disabled.
Edge Rail enabled.
**Thickness **
thickness of newly created border faces.
**Depth Ctrl **
distance to raise or lower inset faces.
**Outset O **
Make newly created border grow outward instead of inward.
**Select Outer **
Switch selection to newly created border faces.
**Individual I **
Inset each face individually (instead of insetting each patch of faces as connected whole).
**Interpolate **
Interpolate mesh data for newly created border vertices: UVs, Color Attributes, vertex group weights, etc.
- Inset Faces
- Options

---

# Extrude Faces
Reference
**Mode : **
Edit Mode
**Menu : **
Face ‣ Extrude Faces , Mesh ‣ Extrude ‣ Extrude Faces
**Shortcut : **
E
This tool creates new faces around border of selected faces, then allows moving selected faces along axis using mouse. result is extrusion: square gets turned into box, disc into cylinder, and so on. This is used often in modeling and can serve to add limbs to characters, branches to trees, and so on.
Once faces are in place, press LMB or Return to confirm. Pressing RMB or Esc will cancel move and leave selected faces at their original location, but newly created faces will still be there.
By default, extrusion axis is average of face normals, but this Axis Locking can be changed by pressing axis key ( X , Y , or Z ):
-
Press once to use corresponding global axis.
-
Press twice to use average of faces’ local axes.
-
Press three times to disable axis locking (allows moving faces anywhere).
Selected face.
During extrude.
Using global Z axis.
After extruding, following options are available in Adjust Last Operation panel:
**Flip Normals **
Flip normals of newly created faces, as they might be pointing wrong way depending on extrusion direction. See Face Orientation overlay of 3D Viewport to check whether they are correct.
**Dissolve Orthogonal Edges **
When enabled, newly created faces will be merged with surrounding existing faces (potentially turning them into n-gons ) *if *they form flat surface together.
**Orientation **
Determines extrusion axis to use.
**Mirror Editing **
Enabling this option moves corresponding faces on other side of mesh *without *extruding them, making it not useful here.
**Proportional Editing **
Enabling this option moves surrounding unselected faces together with extruded ones, making it not useful here.

---

# Extrude Faces Along Normals
Reference
**Mode : **
Edit Mode
**Tool : **
Toolbar ‣ Extrude Along Normals
**Menu : **
Face ‣ Extrude Faces Along Normals , Mesh ‣ Extrude ‣ Extrude Faces Along Normals
This tool is similar to Extrude Faces , but instead of moving all vertices along same axis, it moves each vertex along its normal. This means outward extrusion on convex surface will make faces larger, for example.
Before extrusion
Regular extrusion
Extrusion along normals
After extruding, following options are available in Adjust Last Operation panel:
**Flip Normals **
Flip normals of newly created faces, as they might be pointing wrong way depending on extrusion direction. See Face Orientation overlay of 3D Viewport to check whether they are correct.
**Dissolve Orthogonal Edges **
When enabled, newly created faces will be merged with surrounding existing faces (potentially turning them into n-gons ) *if *they form flat surface together.
**Offset **
Distance to move vertices.
**Offset Even **
When disabled, each vertex is offset by same distance. When enabled, each *face *is offset by same distance.
This option can also be toggled while extruding by pressing S or holding Alt . (These shortcuts are shown in status bar.)
Before extrusion
Offset Even off (default)
Offset Even on
**Mirror Editing **
Enabling this option moves corresponding vertices on other side of mesh *without *extruding any faces, making it not useful here.
**Proportional Editing **
Enabling this option also moves surrounding unselected vertices along their normals, making it not useful for extrusion.
See also
Shrink/Fatten for moving vertices along their normal without extruding.

---

# Fill
Reference
**Mode : **
Edit Mode
**Menu : **
Face ‣ Fill
**Shortcut : **
Alt - F
Fills closed loop of selected edges with triangular faces. This also supports holes:
Before filling.
After filling.
See also
New Edge/Face from Vertices fills set of edges (or vertices) with single n-gon .

---

# Grid Fill
Reference
**Mode : **
Edit Mode
**Menu : **
Face ‣ Grid Fill
Generates grid of quads. Two types of input are supported:
-
If (roughly) rectangular loop of edges is selected – or two opposing sides of such loop – it generates grid inside those edges.
-
If (roughly) rectangular patch of faces is selected, it generates grid replacing those faces.
Input.
Grid Fill result.
operator gives best results if each pair of opposing sides has same number of vertices. However, this is not required.
## Options
**Span **
number of columns in grid. (number of rows is calculated automatically based on this.)
**Offset **
Determines which vertex is first corner of grid. By default, this is active vertex. Use this to rotate grid layout.
**Simple Blending **
Use simpler interpolation algorithm for generating grid geometry. This method is better suited for flat surfaces or cases where preserving curvature gives undesirable results.
Tip
Blender may give error such as “Loops are not connected by wire/boundary edges.” “loops” here can be confusing as it is Blender terminology for “chains,” not “closed loops.” As such, this error means “selected *edge chains *are not connected to each other; please create more edges to form closed loop.”
See also
Bridge Edge Loops
- Grid Fill
- Options

---

# Intersect (Boolean)
Reference
**Mode : **
Edit Mode
**Menu : **
Face ‣ Intersect (Boolean)
Performs Boolean operations between selected and unselected geometry.
Selecting sphere and performing Intersection, Union, and Difference with cube.
Tip
Hide geometry by pressing H to exclude it from operation, then Alt - H afterwards to unhide it again.
See also
Boolean Modifier can perform these same operations non-destructively between different mesh objects.
Adjust Last Operation panel offers following options:
**Boolean Operation **
**Intersect : **
Only keep volume that’s inside both selected and unselected geometry.
**Union : **
Remove interior faces between selected and unselected geometry.
**Difference : **
Cut selected geometry out of unselected geometry, then remove selected geometry.
**Solver **
Algorithm used to perform Boolean operation.
**Float : **
Uses simple solver which offers good performance but lacks support for overlapping geometry.
**Merge Threshold **
Tolerance for close faces to be considered touching. It may be useful to increase this when some intersections aren’t detected that should be and when extra geometry is being created because edges aren’t detected as overlapping.
Warning
threshold approaching size of faces may cause slow calculation. In general, keep this value small.
**Exact : **
Uses complex solver which offers best results and has full support for overlapping geometry, but is much slower.
**Swap **
When using *Difference *, cut unselected geometry out of selected geometry instead of other way around.
**Self Intersection **
Correctly handle self-intersection in participating geometry, at cost of performance.

---

# Solidify Faces
Reference
**Mode : **
Edit Mode
**Menu : **
Face ‣ Solidify Faces
Extrudes selected faces, turning them from infinitely thin surface into manifold mesh with volume.
thickness can be changed in Adjust Last Operation panel:
**Thickness **
Amount to offset newly created surface. Positive values move inward relative to face normals. Negative values move outward.
Mesh before solidifying.
Solidify with positive thickness.
Solidify with negative thickness.
See also
Solidify Modifier does this non-destructively and has many more options.

---

# Triangles to Quads
Reference
**Mode : **
Edit Mode
**Menu : **
Face ‣ Triangles to Quads
**Shortcut : **
Alt - J
Merges adjacent triangles in selection into quads. This is opposite of Triangulate Faces and can be run on complete mesh in one go.
operator uses angle thresholds to prevent creating malformed quads, meaning that some triangles may remain.
Before converting triangles to quads.
After converting.
## Options
**Max Face Angle **
maximum allowed angle between triangle normals (, coplanar triangles are considered to have angle of 0°, not 180°). Triangle pairs that exceed this limit will not be merged.
**Max Shape Angle **
maximum tolerance for non-rectangular quads. If this is set to 0°, only triangles that form quad with perfect 90° corners will be merged. If set to 40°, corners between 50° and 130° are allowed, and so on.
**Topology Influence **
How much to prefer creating new quads that match topology of existing quads.
Tip
For best results, set Topology Influence between 100-130% and Max Angle to 180°. Lower values may leave behind parallelograms and triangles, while higher values may cause errors.
**Compare UVs **
Don’t merge triangles that are disjoint in any UV map.
**Compare Color Attributes **
Don’t merge triangles that, for any Color Attribute , have different colors at their shared edge.
**Compare Seam **
Don’t dissolve edges that are marked as UV Seams .
**Compare Sharp **
Don’t dissolve edges that are marked as Sharp .
**Compare Materials **
Don’t merge triangles that have different materials.
**Deselect Joined **
Deselect triangles that were successfully merged into quads. Useful for identifying remaining triangles that still need to be converted.
- Triangles to Quads
- Options