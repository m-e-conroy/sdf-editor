# Core Mesh Editing Operations

# Extrude
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Extrude
**Shortcut : **
Alt - E
available operators in this menu depend on current selection. Many of them are also available in Vertex , Edge , and Face menus.
## Extrude Faces
Available when at least one face is selected.
See Extrude Faces .
## Extrude Faces Along Normals
Available when at least one face is selected.
See Extrude Faces Along Normals .
## Extrude Individual Faces
Available when at least one face is selected.
See Extrude Individual Faces .
## Extrude Manifold
Available when at least one face is selected.
See Extrude Manifold .
## Extrude Edges
Available when at least one edge is selected.
See Extrude Edges .
## Extrude Vertices
Available when at least one vertex is selected.
See Extrude Vertices .
## Extrude Repeat
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Extrude ‣ Extrude Repeat
Repeatedly extrudes selection along current viewing direction, away from current viewpoint. Works best when using top or side view or custom viewing direction with orthographic projection .
**Steps **
Number of extrusions.
**Offset X, Y, Z **
Distance between each extrusion.
**Scale Offset **
Multiplication factor for *Offset *.
## Spin
See Spin .
- Extrude
- Extrude Faces
- Extrude Faces Along Normals
- Extrude Individual Faces
- Extrude Manifold
- Extrude Edges
- Extrude Vertices
- Extrude Repeat
- Spin

---

# Merge
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Merge , Context Menu ‣ Merge
**Shortcut : **
M
Merges selected vertices together. menu has following options:
**At Center **
Merge all selected vertices into one vertex placed at their geometric center (i.e. average of their positions, not their bounding box center).
**At Cursor **
Merge all selected vertices into one vertex placed at 3D Cursor .
**Collapse **
Merge each island of connected vertices into one vertex placed at average position.
**At First **
Merge all selected vertices into one that was selected first. Only available in *Vertex *selection mode.
**At Last **
Merge all selected vertices into one that was selected last. Only available in *Vertex *selection mode.
**By Distance **
Merge each cluster of vertices that are closer to each other than certain distance.
Note
*At First *and *At Last *depend on selection order easily lost (e.g. by changing selection mode). They should typically be run right after making selection.
See also
Weld Modifier merges vertices by distance non-destructively.
## Options
After merging, following options are available in Adjust Last Operation panel:
**Type **
type of merge to perform.
**UVs **
Corrects UV coordinates to avoid texture distortion.
*Merge By Distance *instead has following options:
**Merge Distance **
Vertices closer than this distance will be merged.
**Centroid Merge **
Place each new vertex at average position of vertices that were merged together. When disabled, position of original vertex closest to this average is used.
**Unselected **
Allow merging selected vertices with unselected ones.
**Sharp Edges **
If mesh uses smooth shading and has custom split normals , this option will add edge marks where needed so that sharp edges will remain sharp after merging.
- Merge
- Options

---

# Deleting & Dissolving
## Delete
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Delete
**Shortcut : **
X or Delete
Deletes selected mesh elements. following menu items are available:
**Vertices **
Deletes selected vertices, as well as any edges and faces they are part of.
**Edges **
Deletes selected edges, as well as any faces they are part of. Orphaned vertices are deleted too.
**Faces **
Deletes selected faces. Orphaned vertices and edges are deleted too.
**Only Edges & Faces **
Deletes selected edges and faces, as well as any unselected faces that contain selected edge. Orphaned vertices are left behind.
**Only Faces **
Deletes selected faces. Orphaned vertices and edges are left behind.
## Dissolve
*Dissolving *is different from deleting in that keeps surface closed rather than leaving hole.
### Dissolve Vertices
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Delete ‣ Dissolve Vertices
**Shortcut : **
X , Delete , or Ctrl - X
Deletes each selected vertex and joins its surrounding faces into one. (This often results in n-gons .)
If vertex is part of wire – , chain of edges that are not part of any face – its surrounding edges are merged instead.
Adjust Last Operation panel offers following options:
**Face Split **
Split surrounding faces where possible so that only triangle in their corner is merged instead of whole face. This reduces size of final “hole-filling” faces and can make them less uneven.
**Tear Boundaries **
Delete faces at mesh boundary instead of merging them. These faces are always split, even if *Face Split *is disabled.
Original mesh
Face Split: Off
Tear Boundaries: Off
Face Split: On
Tear Boundaries: Off
Face Split: On/Off
Tear Boundaries: On
### Dissolve Edges
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Delete ‣ Dissolve Edges
**Shortcut : **
X , Delete , or Ctrl - X
Deletes each selected edge and joins its surrounding faces into one. This is only done for edges that have exactly two neighboring faces.
Adjust Last Operation panel offers following options:
**Dissolve Vertices **
Also dissolve vertices of selected edges, not edges themselves.
**Angle Threshold **
If *Dissolve Vertices *is enabled, this option allows preserving vertices at corners, only dissolving ones in flattish areas. Faces are considered to form corner if angle between their *normals *exceeds Angle Threshold – , coplanar faces are considered to have angle of 0°, not 180°.
**Face Split **
Split surrounding faces where possible so that only triangle in their corner is merged instead of whole face. This reduces size of final “hole-filling” faces and can make them less uneven.
### Dissolve Faces
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Delete ‣ Dissolve Faces
**Shortcut : **
X , Delete , Ctrl - X , or F
Merges each patch of connected faces into single face.
Note
F shortcut is normally used for creating faces, but when run on selection of existing faces, it dissolves them instead. See Dissolve Existing Faces .
Before dissolving.
After dissolving.
## Limited Dissolve
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Delete ‣ Limited Dissolve
**Shortcut : **
X or Delete
Simplifies selected geometry by dissolving vertices and edges in flattish areas.
Original mesh.
Result of Limited Dissolve.
**Max Angle **
maximum allowed angle between faces for surface to be considered flat (and thus eligible for dissolving). Specifically, angle is measured between face normals, meaning that coplanar faces are considered to have angle of 0°, not 180°.
**All Boundaries **
After dissolving edges using *Max Angle *, dissolve all vertices at boundary corners – specifically, vertices that only have two neighboring edges.
**Delimit **
Prevent merging faces that are discontinuous in some way. It’s possible to activate multiple of these options by clicking them with Shift - LMB .
**Normal : **
Don’t merge faces that have opposite orientations .
**Material : **
Don’t merge faces that have different materials.
**Seam : **
Don’t dissolve edges that are marked as UV Seams .
**Sharp : **
Don’t dissolve edges that are marked as Sharp .
**UVs : **
Don’t merge faces that are disconnected in any UV map.
## Collapse Edges & Faces
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Delete ‣ Collapse Edges & Faces
**Shortcut : **
X or Delete
Collapses each patch of connected edges and faces into single vertex. This is useful for collapsing edge rings, for example.
Selected edge rings.
Edge rings collapsed.
Unlike *Dissolve *operators, this operator doesn’t create n-gons and can add new vertices instead of only removing existing ones. In addition, new vertices automatically receive interpolated UV coordinates, color attributes, etc. This makes it particularly useful for manually removing detail.
## Edge Loops
Reference
**Mode : **
Edit Mode (Vertex or Edge select modes)
**Menu : **
Mesh ‣ Delete ‣ Edge Loops
**Shortcut : **
X or Delete
Dissolves selected edge loops. This is same as Dissolve Edges , except that it selects surrounding faces afterwards.
Selected edge loop.
Edge loop dissolved.
Note
In Blender terminology, *edge loop *is any chain of connected edges – it doesn’t have to be closed loop. See Select Edge Loops .
See also
-
Vertex merging
-
Triangles to Quads
-
Un-Subdivide
- Deleting & Dissolving
- Delete
- Dissolve
- Dissolve Vertices
- Dissolve Edges
- Dissolve Faces
- Limited Dissolve
- Collapse Edges & Faces
- Edge Loops

---

# Knife Topology Tool
Reference
**Mode : **
Edit Mode
**Tool : **
Toolbar ‣ Knife
**Menu : **
Mesh ‣ Knife Topology Tool
**Shortcut : **
K
Knife tool allows to interactively “cut through” faces, subdividing them and creating chain of new edges along way.
## Usage
First, select tool in Toolbar or press K . cursor will change into scalpel to indicate it’s active.
Click LMB at place where you want to start cutting. This can be anywhere: on existing vertex, edge, or face, or even outside of mesh.
Move your mouse to next location. You’ll see yellow line indicating new edges that will be created, and aqua dots indicating new vertices. Click LMB to confirm and start on next cutting segment.
Once you’re done, press Spacebar or Return to apply cuts. Alternatively, press Esc to cancel.
Hint
By using Multi-Object Editing , you can cut multiple objects at same time.
Mesh before knife cut.
Knife cut active.
After applying knife cut.
## Tool Settings
These settings are only available when using tool from Toolbar (not when pressing K ). They can be found in *Tool *tab of Properties Editor editor and of Sidebar.
**Occlude Geometry **
Only cut geometry visible on screen. By disabling this, you can cut all way through mesh, including faces that are on backside or behind others.
**Only Selected **
Only cut through selected geometry. You can press Shift - K instead of K to start cutting with this option enabled.
**X-Ray **
Show cutting path even if it’s occluded by geometry.
**Measurements **
measurements to show along cutting path: distances, angles, or both.
Only distances.
Only angles.
Both distances and angles.
**Angle Snapping **
Whether to constrain cutting lines to multiples of *Snap Increment *angle.
**None : **
No snapping.
**Screen : **
Snap in screen space (viewing plane).
**Relative : **
Snap in plane on geometry, relative to adjacent edge or cutting line.
Relative snapping at 90°. Blender highlights reference edge in red and shows snapping direction in white.
Doing few more cuts and applying.
**Snap Increment **
angle to use for *Angle Snapping *.
## Controls
These keyboard shortcuts are shown in status bar while cutting. They’re available both when using tool from Toolbar and when pressing K .
**Cut LMB **
You can either click to add new cutting line, or drag to create cutting lines as you move mouse over edges.
**Close Loop - Double-click LMB **
Adds cutting point at cursor (like when single-clicking) and then connects it to first point in current path, closing loop.
**Stop RMB **
Completes current cutting path and begins new one. cursor will snap to previously defined cuts.
After defining horizontal cut, press RMB and define vertical one.
Result after applying.
**Confirm Spacebar or Return **
Confirms cut, turning cutting paths into edges.
**Cancel Esc **
Cancels cut.
**Undo Ctrl - Z **
Undoes previous cutting line (or, if you dragged mouse before, all cutting lines created during that drag).
**Midpoint Snap Shift **
Hold to snap cursor to center of edges.
**Ignore Snap Ctrl **
Hold to temporarily stop cursor from snapping to existing vertices, edges, and cutting lines.
**Cut Through C **
Also cut through occluded faces, instead of only visible ones. This is linked to (and opposite of) *Occlude Geometry *setting above.
**Axis X , Y , or Z **
Constrains current cutting line to global axis. Press second time to use object’s local axis, and third time to disable constraint again.
**Measure S **
Cycles between measurements to show: distances, angles, or both.
**X-Ray V **
**Angle Constraint **
Constrains cutting lines to multiples of *Snap Increment *angle. This angle can be specified in Tool Settings before cutting (see above) or typed while cutting with *Angle Constraint *active.
By default, snapping is done in *Screen *plane. Press second time to snap in planes on geometry, *Relative *to automatically chosen edge or cutting line. You can press R to select different reference line.
Press third time to disable snapping again.
## Known Limitations
### Duplicate Vertices
If cut creates duplicate vertices, this is often caused by clipping range being too large. Try increasing Clip Start to avoid this problem. Also see Depth Troubleshooting for details.
- Knife Topology Tool
- Usage
- Tool Settings
- Controls
- Known Limitations
- Duplicate Vertices

---

# Bisect
Reference
**Mode : **
Edit Mode
**Tool : **
Toolbar ‣ Knife ‣ Bisect
**Menu : **
Mesh ‣ Bisect
Bisect tool cuts selected geometry in two using infinitely large plane.
## Usage
Orient view so that cutting plane will appear as line (for example, Top view when cutting mesh into left and right halves). Then activate tool and drag cutting line using LMB . While dragging, following shortcuts are available (also shown in status bar ):
**Move Spacebar **
Changes location of line.
**Snap Ctrl **
Constrains rotation of line to 15 degree intervals.
**Flip F **
Changes which side of plane is seen as “outer” side. This is later used with *Fill *and *Clear Inner/Outer *options.
## Options
After dragging line, yellow arrow shows direction towards “outer” side, and following options are available in Adjust Last Operation panel:
**Plane Point, Plane Normal **
plane can be numerically adjusted for precise values.
**Fill **
Create new faces along cutting plane to cover up any holes left by *Clear Inner/Outer *. Materials, UV coordinates, and Color Attributes are assigned based on surrounding geometry.
**Clear Inner/Outer **
Delete any geometry on “inner”/”outer” side of cutting plane. Note that this also affects geometry that was not originally selected.
**Axis Threshold **
Any vertices closer to cutting plane than this threshold will be reused. For rest of mesh, new vertices and edges are created.
## Examples
Example of common use of bisect.
Example of bisect with *Fill *option enabled.
- Bisect
- Usage
- Options
- Examples

---

# Editing Normals
*Normals *menu can be accessed as popover by pressing Alt - N .
Most of operators in this menu work with custom split normals , which are normal vectors that belong to face corners (not vertices). Selecting these corners can be done in multiple ways:
-
If selection mode is set to *Vertex *or *Edge *, selecting vertex or edge also selects nearest corners of faces it’s part of.
-
If selection mode is *Face *, selecting face also selects its corners.
-
If both *Vertex *and *Face *modes are enabled, selecting vertex and then adding face will select matching face corner.
-
Similar to above, if both *Edge *and *Face *modes are enabled, selecting edge and then adding face will select two matching face corners.
See also
-
3D Viewport overlay for visualizing normals.
-
Geometry Data panel of mesh properties for clearing custom normals.
-
Mesh Data Transfer ( operator or modifier ) for copying normals from another mesh.
-
Normal Edit Modifier and Weighted Normal Modifier for calculating or changing normals based on certain criteria.
## Flip
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Flip
Changes orientation of selected faces, turning their “front side” into their “back side” and vice versa. This does not affect custom split normals.
3D Viewport’s Face Orientation overlay is useful for quickly spotting faces that are oriented wrong way.
## Recalculate
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Recalculate Outside and Mesh ‣ Normals ‣ Recalculate Inside
**Shortcut : **
Shift - N and Shift - Ctrl - N
Flips orientation of selected faces where necessary, making them all point outward (or inward). mesh does not need to be closed volume for this.
As with Flip , this operation does not affect custom split normals.
## Set from Faces
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Set from Faces
Sets custom split normals of each selected vertex to average normal of its surrounding selected faces.
**Keep Sharp Edges **
When checked, face corners that are part of Sharp edge will keep their original custom normal.
## Rotate
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Rotate
**Shortcut : **
R followed by N
Tool for rotating custom split normals of selected face corners by moving mouse. Click LMB to confirm or RMB to cancel.
## Point to Target
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Point to Target
**Shortcut : **
Alt - L
Makes custom split normals of selected face corners point at certain target. After clicking menu item or pressing keyboard shortcut, choose target by pressing one of following keys (also shown in status bar ):
-
M for mouse cursor.
-
L for Pivot Point .
-
O for object origin .
-
Ctrl - LMB for 3D Cursor . This also changes location of Cursor.
-
Ctrl - RMB for certain vertex, edge, or face. Make not to click space where there’s no geometry, as doing so will extrude selection instead.
In addition, following options are available:
**Invert I **
Make normals point away from target instead.
**Align **
All normals will point in same direction: from average position of selected vertices to target.
**Spherize S **
Interpolate between each normal’s original and new orientation. interpolation value can be set in Adjust Last Operation panel after confirming operator.
**Reset R **
Reset custom normals to what they were when operation started.
After configuring normals, press LMB or Return to confirm. above options can then still be changed in Adjust Last Operation panel.
## Merge
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Merge
Applies smooth shading to selected faces and clears Sharp mark for selected edges. Then, at each selected vertex, sets custom normals that are part of smooth-shaded face to their average orientation. (Custom normals that are part of flat-shaded face are left unchanged.)
To average custom normals regardless of face selection, use Average operator.
## Split
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Split
Applies flat shading to selected faces and marks selected edges as Sharp . Then, at each selected vertex, sets each custom normal that’s part of flat-shaded face to normal of that face. (Custom normals that are part of smooth-shaded face are set to average of normals of those faces.)
## Average
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Average
For each selected vertex, divides connected face corners into groups based on Sharp edges, then sets custom normals of face corners in each group to certain average. Adjust Last Operation panel has following options:
**Type **
**Custom Normal : **
Set custom normals of face corners in each group to their average.
**Face Area : **
Set custom normals of face corners in each group to weighted average of their face normals. weights are determined by face area: larger faces have more influence on final normal.
**Corner Angle : **
Like *Face Area *, except weights are determined by face corner angles.
**Weight **
If *Type *is set to *Face Area *or *Corner Angle *, *Weight *influences which face normals averaged normal leans towards. If it’s 50, simple weighted average is used. If it’s 100, averaged normal is based solely on faces with largest area (or corners with largest angle). If it’s 1, normal is based solely on faces with smallest area (or corners with smallest angle).
**Threshold **
Tolerance value for treating face areas (or corner angles) as equal.
Averaging custom normals for two vertices. top vertex has two groups of faces separated by Sharp edges, so two separate averages are calculated. bottom vertex has no Sharp edges, so only one average is calculated.
See also
Weighted Normal Modifier does this non-destructively.
## Copy Vector
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Copy Vector
Copies single normal vector to internal clipboard:
-
If face is selected, its normal is copied.
-
If vertex is selected, its normal is copied, but only if all its custom split normals are same.
-
If face corner is selected, its custom split normal is copied.
## Paste Vector
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Paste Vector
Pastes previously copied normal vector onto selected face corners. Adjust Last Operation panel has following option:
**Absolute Coordinates **
When enabled, sets custom split normals of selected face corners to pasted normal. When disabled, adds pasted normal as offset.
## Smooth Vectors
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Smooth Vectors
Smooths out custom normals of each selected vertex by averaging with normals at neighboring vertices. Adjust Last Operation panel has following option:
**Factor **
Smoothing strength. Specifically, this is interpolation value between original normals and averaged ones.
## Reset Vectors
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Reset Vectors
Resets custom normals of selected face corners to their default.
## Select by Face Strength
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Select by Face Strength
Selects faces that have specific *Strength *(Weak, Medium, or Strong) and deselects others.
This property is used by Weighted Normal Modifier if its *Face Influence *setting is enabled.
## Set Face Strength
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Normals ‣ Set Face Strength
Sets *Strength *of selected faces to Weak, Medium, or Strong. By default, all faces have strength of Medium.
This property is used by Weighted Normal Modifier if its *Face Influence *setting is enabled.
- Editing Normals
- Flip
- Recalculate
- Set from Faces
- Rotate
- Point to Target
- Merge
- Split
- Average
- Copy Vector
- Paste Vector
- Smooth Vectors
- Reset Vectors
- Select by Face Strength
- Set Face Strength

---

# Duplicate
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Duplicate
**Shortcut : **
Shift - D
Creates copy of selection. After clicking menu item or pressing keyboard shortcut, move mouse to move copy to desired location and press LMB or Return to confirm. Alternatively, press RMB or Esc to leave copy at same location as original. (copy will still be selected, so it can still be easily moved out of way afterwards.)

---

# Split
*Split *menu can be accessed as popover by pressing Alt - M .
These operators are about splitting meshes by disconnecting faces from each other. For splitting faces into smaller ones, see Knife Topology Tool or Connect Vertex Path operator.
## Split Selection
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Split ‣ Selection
**Shortcut : **
Y
Cuts mesh along border of selected faces. faces can then be moved elsewhere.
This operator can also disconnect “wires” (edges that are not part of face) from their surroundings. However, using it on edges that *are *part of face will duplicate them.
Disconnecting inner faces from their surroundings.
See also
Separate operator disconnects selection and moves it into new mesh object.
## Split Faces by Edges
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Split ‣ Faces by Edges
Cuts mesh along selected edges. vertices can then be pulled apart to create hole.
Splitting by selected edges.
See also
Rip Vertices also cuts neighboring unselected edges.
## Split Faces & Edges by Vertices
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Split ‣ Faces & Edges by Vertices
Cuts mesh along *all *neighboring edges of each selected vertex. (This is different from *Rip Vertices *which only cuts two edges per vertex.)
vertices can then be pulled apart to create hole.
Splitting by selected vertices.
- Split
- Split Selection
- Split Faces by Edges
- Split Faces & Edges by Vertices

---

# Separate
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Separate
**Shortcut : **
P
Splits mesh into to two or more new, separate mesh objects.
Suzanne dissected neatly.
## Options
**Selection **
Disconnects selected geometry from its surroundings and moves it into new object.
**By Material **
Splits mesh into object per material slot , each containing faces using that material slot. This is done for whole mesh regardless of selection.
**By Loose Parts **
Creates object for every independent (disconnected) piece of original mesh. This is done for whole mesh regardless of selection.
See also
-
Split Selection for disconnecting geometry without moving it into new object.
-
Join for merging multiple objects into one.
- Separate
- Options

---

# Clean Up
These operators can automatically clean up certain types of messy geometry.
## Delete Loose
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Delete Loose
Deletes selected vertices, edges, and optionally faces that aren’t connected to anything.
## Decimate Geometry
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Decimate Geometry
Reduces face count of selected geometry while minimizing shape changes.
**Ratio **
target triangle count ratio. For example, enter 0.4 to keep collapsing edges until triangle count is 40% of original.
**Vertex Group **
Use active vertex group when choosing which edges to collapse. higher vertex weights for edge, more likely it is to be chosen, even taking priority over “better” (shorter) candidates.
**Weight **
Factor by which to multiply vertex weights.
**Invert **
Inverts vertex weights, making edges with *lower *weights get collapsed first.
**Symmetry **
Maintain symmetry on either *X *, *Y *, or *Z *axis.
See also
Decimate Modifier in *Collapse *mode performs same operation non-destructively.
## Degenerate Dissolve
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Degenerate Dissolve
Collapses any selected edges that are shorter than certain length. This also results in removal of small faces.
If two vertices are near to each other but are not connected by edge, they will not be merged; see Merge By Distance for alternative.
**Merge Distance **
Edges shorter than this length will be collapsed.
## Limited Dissolve
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Limited Dissolve
See Limited Dissolve .
## Make Planar Faces
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Make Planar Faces
Flattens selected faces.
**Factor **
flattening strength for each iteration. Note that even value of 1 may not be enough to get faces perfectly flat – increase *Iterations *in that case.
**Iterations **
Number of times to repeat operation.
## Split Non-Planar Faces
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Split Non-Planar Faces
Splits any selected faces that are bent beyond given limit.
**Max Angle **
Faces that are bent by more than this angle will be split.
Hint
You can use Rotate Edge if you’d rather have certain newly created edges point in different direction.
Original mesh.
Result of Split Non-Planar Faces.
## Split Concave Faces
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Split Concave Faces
Splits any selected concave faces so that only convex ones remain.
Original mesh.
Result of Split Concave Faces.
## Merge by Distance
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Merge by Distance
Merges selected vertices that are closer to each other than certain distance.
**Merge Distance **
Vertices closer than this distance will be merged.
**Unselected **
Allow merging selected vertices with unselected ones.
**Sharp Edges **
If mesh uses smooth shading and has custom split normals , this option will add edge marks where needed so that sharp edges will remain sharp after merging.
See also
Weld Modifier performs this operation non-destructively.
## Fill Holes
Reference
**Mode : **
Edit Mode
**Menu : **
Mesh ‣ Clean up ‣ Fill Holes
Fills each hole in selected geometry with face.
**Sides **
maximum number of sides: if hole has more edges than this number, it will not be filled. Set to 0 to fill all holes.
See also
For filling large hole that has many edges, Face Fill or Grid Fill may be better option.
- Clean Up
- Delete Loose
- Decimate Geometry
- Degenerate Dissolve
- Limited Dissolve
- Make Planar Faces
- Split Non-Planar Faces
- Split Concave Faces
- Merge by Distance
- Fill Holes