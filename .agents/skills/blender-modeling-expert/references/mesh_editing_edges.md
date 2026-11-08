# Edge Editing Operations

# Loop Cut and Slide
Reference
**Mode : **
Edit Mode
**Menu : **
Edge ‣ Loop Cut and Slide
**Shortcut : **
Ctrl - R
*Loop Cut and Slide *splits loop of faces into two or more parallel loops. new edges are created in middle by default, but you can also slide them closer to side.
## Usage
tool is interactive and has two steps:
-
Choose face loop to cut
After activating tool, move cursor over edge through which cut should pass (, edge that’s perpendicular to cutting direction). Blender shows yellow line previewing cut that will be made. Click LMB to confirm and move to next step, or RMB to abort.
-
Slide new edge loop(s)
You can now move mouse to change position of new edge loop. Click LMB to create cut at chosen location, or RMB to create it at center.
Mesh before inserting edge loop.
Choosing face loop.
Sliding new edge loop.
See also
Edge Slide tool for sliding existing edge loops.
## Options
These options are available while tool is in use, and later in Adjust Last Operation panel.
**Number of Cuts Wheel **
During first step, you can change number of cuts to create by scrolling Wheel , typing number, or pressing PageUp / PageDown .
Preview of multiple edge loops.
Result of using multiple cuts.
**Smoothness **
How much to offset newly created edges along their normals to maintain surface curvature. You can change this in first step using Alt - Wheel , but because smoothness isn’t previewed at that stage, it’s typically better to change it afterwards in *Adjust Last Operation *panel.
Added edge loop without smoothing.
Same edge loop, but with smoothing value.
**Falloff **
Falloff type for *Smoothness *. Changes shape of profile.
**Factor **
Position of edge loop relative to surrounding ones.
**Even E **
Makes new edge loop have even distance to existing adjacent one (instead of distance that’s proportional to length of each perpendicular edge it crosses). You can press E during second step to toggle it.
**Flipped F **
Keep *Even *distance to other adjacent edge. You can press F during second step to toggle it.
Cut with *Even *disabled.
Cut with *Even *enabled. red dot shows side to which even distance is kept.
Cut with *Even *and *Flipped *enabled.
**Clamp C **
When unchecked, new edge loop can go outside face loop’s boundary edges. You can press C or hold Alt during second step to toggle it.
**Mirror Editing **
When checked, sliding newly created edges will also slide any existing edges on other side of mesh. Mesh Symmetry needs to be enabled for this to work.
**Correct UVs **
When unchecked, faces in UV map will be split uniformly even if cut was placed off-center on 3D mesh.
- Loop Cut and Slide
- Usage
- Options

---

# Bevel
Reference
**Mode : **
Edit Mode
**Menu : **
Vertex ‣ Bevel Vertices , Edge ‣ Bevel Edges
**Shortcut : **
Shift - Ctrl - B (Bevel Vertices), Ctrl - B (Bevel Edges)
*Bevel *tool smooths out corners and edges. This helps make objects look more realistic – after all, nothing in real life is infinitely sharp.
Cubes without and with bevel.
See also
Bevel Modifier does this non-destructively.
## Usage
Select one or more vertices, edges, or faces, then press either Ctrl - B to smooth both edges and corners or Shift - Ctrl - B to smooth only corners. Move mouse to increase bevel radius and roll Wheel to set density of new geometry. Finally, press LMB / Return to confirm or RMB / Esc to cancel.
Before beveling.
Increased bevel width.
Increased bevel segments.
## Options
While tool is active, current settings are shown at top of 3D Viewport. Use keyboard shortcuts (also shown in status bar ) to select setting, then move mouse or type number to change it. When moving mouse, hold Shift to change value more slowly for better precision, or Ctrl to snap to coarse increments.
After confirming with LMB , settings can still be changed in Adjust Last Operation panel.
**Affect V **
**Vertices **
Bevel selected vertices, leaving edges unchanged.
**Edges **
Bevel selected edges, as well as vertices where three or more edges meet.
**Width Type M **
meaning of *Width *setting. In examples below, *Width *is set to 50% for “Percent” *Width Type *and to 1.0 for other types.
Before beveling
Offset
Width
Depth
Percent
Absolute
**Width **
size/radius of bevel. precise meaning depends on *Width Type *.
Note
When multiple edges are beveled at same time, it is sometimes impossible to make width match above definition on all edges simultaneously. Bevel tries to compromise in such cases. Sometimes turning off *Loop Slide *(see below) can make it easier for Bevel to make widths as specified.
**Segments S **
density of new geometry. Higher values will give smoother result.
While tool is active, this setting can be changed with Wheel even if it is not selected.
**Profile Shape P **
number between 0 and 1 that controls shape of profile (side view of each beveled edge).
If *Miter Outer *or *Miter Inner *is set to *Arc *, this also controls shape of miters.
**Material Index **
0-based index of material slot to assign to newly created faces. If set to -1, new faces inherit materials of their neighbors.
**Harden Normals H **
When enabled, assigns custom split normals to newly created faces to make them appear smoothly shaded without affecting rest of mesh.
**Clamp Overlap C **
Prevents beveled edges from overshooting past end of their neighboring faces.
**Loop Slide **
Whether new inner edges should be perpendicular to beveled edge or match direction of existing inner edges.
Before beveling.
Loop Slide off.
Loop Slide on.
**Mark **
**Seams U **
When beveling three or more edges that share vertex, and two of those edges are marked as UV Seams , new edges between them will also be marked as Seams.
**Sharp K **
Same as *Mark Seams *, but for Sharp edges.
Before beveling.
Mark Seams off.
Mark Seams on.
**Miter Outer O **
When beveling three or more edges connected to same vertex, and two of those edges form corner of more than 180° on side where there are faces, *Outer Miter *determines if any extra geometry is created in that corner to avoid pinching.
Sharp outer miter (no extra geometry).
Patch outer miter.
Arc outer miter.
**(Miter) Inner I **
When beveling two or more edges connected to same vertex, and there are edges that form corner of less than 180° on side where there are faces, *Inner Miter *determines if any extra geometry is created in those corners.
Sharp inner miter (no extra geometry).
Arc inner miter.
**Spread **
size of *Inner Miter *when set to *Arc *. This also affects *Outer Miter *.
**Intersection Type N **
type of geometry to generate at points where three or more beveled edges meet.
**Grid Fill : **
Fill space between edges with geometry that smoothly connects them.
**Cutoff : **
Cap off each edge with flat face.
Grid fill.
Cutoff.
Cutoff with center face.
**Face Strength **
Whether to apply *Face Strength *to faces involved in bevel. This can be used in conjunction with Weight Normals Modifier (with *Face Influence *option checked).
**None : **
Do not set face strength.
**New : **
Set face strength of new faces along edges to *Medium *, and face strength of new faces at vertices to *Weak *.
**Affected : **
In addition to those set for *New *case, also set faces adjacent to new faces to have strength *Strong *.
**All : **
In addition to those set for *Affected *option, also set all rest of faces of model to have strength *Strong *.
**Profile Type Z **
Determines flow of edges that are generated along each beveled edge.
**Superellipse **
Use autogenerated profile based on *Profile Shape *setting.
**Custom **
custom profile widget.
Use custom profile as defined in Curve Widget in Adjust Last Operation panel. curve is side view of bevel between two faces that meet at right angle; darkened area represents inside of mesh.
**Presets **
*Support Loops *and *Steps *presets are built dynamically depending on number of bevel *Segments *. If number of segments is changed, preset will have to be re-applied.
**Sample Straight Edges **
Whether to sample profile in middle of perfectly straight curve segments (lines between two control points with *Vector *handle type ). This is disabled by default, as it’s normally enough to sample profile at control points themselves.
**Sample Even Lengths **
By default, each profile segment (piece between two control points) receives same number of sample points. By enabling this option, sample points are instead distributed evenly along whole length of profile.
- Bevel
- Usage
- Options

---

# Bridge Edge Loops
Reference
**Mode : **
Edit Mode
**Menu : **
Edge ‣ Bridge Edge Loops
Deletes any selected faces, then creates new faces between two or more selected edge loops.
Note
In Blender terminology, *edge loop *is any chain of connected edges – it doesn’t have to be closed loop. See Select Edge Loops .
## Options
**Connect Loops **
**Open Loop **
last edge loop is not connected back to first.
**Closed Loop **
last edge loop is connected back to first.
**Loop Pairs **
first edge loop is connected to second, third to fourth, and so on.
**Merge **
Instead of creating faces, merges all edge loops (or each pair of edge loops if *Loop Pairs *is selected) into single edge loop.
**Merge Factor **
When set to 0, loops are merged into first loop. When set to 1, they’re merged into last. Other values result in interpolation.
**Twist **
Offsets choice of target vertex which each source vertex is connected to. This makes generated tube twist along its axis.
**Number of Cuts **
number of intermediate edge loops to create between each pair of existing edge loops.
**Interpolation **
How to calculate new edge loops when *Number of Cuts *is greater than zero.
**Linear **
Create new edge loops in straight line.
**Blend Path **
Create new edge loops along Bézier spline, disregarding any neighboring surfaces.
**Blend Surface **
Create new edge loop vertices along Bézier splines, taking into account normals of neighboring surfaces.
Before bridging
Linear
Blend Path
Blend Surface
**Smoothness **
Smoothness factor for *Blend Path *and *Blend Surface *interpolations. value of 1 uses full Bézier splines, while value of 0 is same as using *Linear *.
**Profile Factor **
Strength factor for *Profile Shape *. negative value will shrink each tube segment in middle, while positive value will inflate it.
**Profile Shape **
How to vary thickness of each tube segment from one original edge loop to next. See Proportional Editing page for description of each option.
## Examples
Bridging two edge loops with same number of vertices:
Input.
Bridge result.
Bridging edge loops with different numbers of vertices:
Input.
Bridge result.
Cutting holes in surfaces and connecting them:
Input.
Bridge result.
Connecting series of loops in one go:
Input.
Bridge result.
Using *Blend Surface *interpolation to connect textured surfaces:
Input.
Bridge result.
See also
Grid Fill
- Bridge Edge Loops
- Options
- Examples

---

# Subdivide
Reference
**Mode : **
Edit Mode
**Menu : **
Edge ‣ Subdivide
Subdividing adds resolution to mesh by dividing faces or edges into smaller units.
This process follows few rules depending on situation:
-
When only one edge of triangle or quad is selected, that face is turned into quad or N-gon respectively. If *Create N-Gons *option is disabled, face is split into triangles instead.
-
When two edges of face are selected:
-
If face is triangle, new edge is created between two new vertices, subdividing triangle into triangle and quad.
-
If face is quad and edges are neighbors, face is split according to *Quad Corner Type *setting (see below).
-
If face is quad and edges are opposite, quad is subdivided in two quads by edge linking two new vertices.
-
When three edges of face are selected:
-
If face is triangle, this means whole face is selected and it is subdivided into four smaller triangles.
-
If face is quad, first two opposite edges are subdivided as described above. Then, “middle” edge is subdivided, affecting its new “sub-quad” as described above for only one edge.
-
When all four edges of quad are selected, face is subdivided into four smaller quads.
-
When one or more edges of N-gon are selected, individual edges will be subdivided but face will stay unsubdivided.
## Options
These options are available in Adjust Last Operation panel after running operator:
**Number of Cuts **
number of cuts per edge to make. By default this is 1, cutting edges in half. value of 2 will cut them into thirds, and so on.
**Smoothness **
Displaces subdivisions to maintain approximate curvature. effect is similar to way Subdivision Surface Modifier might deform mesh.
Mesh before subdividing.
Subdivided with no smoothing.
Subdivided with Smoothness set to 1.
**Create N-Gons **
When unchecked, forces subdivision to create triangles or quads instead of n-gons (see examples below).
**Quad Corner Type **
Controls subdivision for quads with two selected, neighboring edges.
**Inner Vertices **
selected edges are subdivided, then edge is created between two new vertices, creating small triangle. This edge is also subdivided, and “inner vertex” thus created is linked by another edge to one opposite to original selected edges. This results in triangle and two quads.
**Path **
selected edges are subdivided, then new edges are created between new vertices as well as existing outer vertices. This results in two triangles and quad.
**Straight Cut **
selected edges are subdivided, then edge is created between two new vertices, creating small triangle and N-gon. If *Create N-Gons *is unchecked, this option works like *Inner Vertices *instead.
**Fan **
quad is subdivided into fan of quad and two triangles, common vertex being one opposite to selected edges.
Inner Vertices corner type.
Path corner type.
Straight Cut corner type.
Fan corner type.
**Fractal **
Displaces vertices in random directions after mesh is subdivided.
Plane before subdivision.
Regular subdivision.
Same mesh with fractal added.
**Along Normal **
Causes vertices to move along their normals, instead of random directions.
Along Normal set to 1.
**Random Seed **
Changes random seed of *Fractal *noise function, producing different result for each seed value.
Same mesh with different seed value.
See also
Randomize randomly displaces vertices without subdividing first.
## Examples
Below are some examples illustrating edge subdivision in various scenarios.
sample mesh.
### One Edge
One edge.
*Create N-Gons *unchecked.
### Two Tri Edges
Two tri edges.
*Create N-Gons *unchecked.
### Two Opposite Quad Edges
Two quad edges.
*Create N-Gons *unchecked.
### Two Adjacent Quad Edges
Inner Vertices corner type.
*Create N-Gons *unchecked.
Path corner type.
*Create N-Gons *unchecked.
Straight Cut corner type.
*Create N-Gons *unchecked.
Fan cut type.
*Create N-Gons *unchecked.
### Three Quad Edges
Three edges.
*Create N-Gons *unchecked.
### Full Triangle
Full triangle.
*Create N-Gons *unchecked.
### Full Quad
Full quad.
*Create N-Gons *unchecked.
### Multiple Cuts
Triangle with two cuts.
Quad with two cuts.
- Subdivide
- Options
- Examples
- One Edge
- Two Tri Edges
- Two Opposite Quad Edges
- Two Adjacent Quad Edges
- Three Quad Edges
- Full Triangle
- Full Quad
- Multiple Cuts

---

# Edge Slide
Reference
**Mode : **
Edit Mode
**Menu : **
Edge ‣ Edge Slide
**Shortcut : **
G twice
Moves selected edges across their neighboring faces.
Hint
Use Select Edge Loops to quickly select chain of edges that goes around mesh.
## Usage
Select one or more edges, press G twice, move mouse, and click LMB to confirm (or RMB to cancel).
By default, vertices on selected edges all move by same *percentage *towards their neighbor:
Selected edges.
Repositioned edges.
In *Even *mode, vertices instead keep same *distance *from their neighbor. red dot indicates which side they look at (i.e. which neighbor they pick):
Even Mode enabled.
Even Mode with Flip enabled.
## Options
While tool is active, *Factor *is shown at top of 3D Viewport and shortcuts are shown in status bar . After confirming with LMB , options can still be changed in Adjust Last Operation panel.
**Factor **
Direction and amount to slide. Values of -1 and 1 move each selected edge fully towards one of its neighbors.
**Even E **
By default, each vertex is moved by same percentage along length of its edge. Use *Even *to instead move all vertices so they’re at same absolute distance from neighboring vertex. (*Factor *input is still relative number, however.)
**Flipped F **
Use other neighboring vertex when *Even *is active.
**Clamp Alt or C **
Prevents edges from moving outside their neighboring faces.
**Mirror Editing **
Also slide matching edges on other side of mesh. Mesh Symmetry needs to be enabled for this to work.
**Correct UVs **
Corrects UV coordinates of moved vertices to avoid texture distortion.
See also
Slide Vertices
- Edge Slide
- Usage
- Options

---

# Screw
Reference
**Mode : **
Edit Mode
**Menu : **
Edge ‣ Screw
*Screw *operator extrudes geometry along helix. You can use it to create screws, springs, sea shells and so on.
While it’s similar to Screw Modifier , there are some important differences:
Screw operator
Screw modifier
Works in world space.
Works in object space.
Extrudes only selected geometry.
Extrudes all geometry.
centerpoint can be specified manually.
centerpoint is always object’s origin.
One revolution is always 360°.
angle can be chosen freely.
height offset of each revolution is calculated automatically based on geometry.
height offset must be specified manually.
Each revolution can also have radial offset away from/towards central axis (again determined by geometry).
radius stays constant.
As described above, Screw operator automatically determines height offset and radial offset to apply after each revolution. It does this by looking for endpoints of open profile – series of connected edges that don’t form closed loop. geometry is extruded so that profile’s top vertex in one revolution will coincide with bottom vertex in next.
most common use case is extruding such open profile. You’re not limited to this, however. As long as there is one open profile in selection – even single loose edge – you can also extrude closed profiles and even geometry with faces.
You can see some examples below.
Wood Screw.
Spring.
## Usage
First, make you have open profile in your mesh. If you want to extrude anything else (such as one or more circles), create open profile next to it.
Once that’s done, enter *Edit Mode *and select geometry you want to extrude, making to include exactly one open profile. If you have fewer or more, operator will fail with error “You have to select string of connected vertices too.”
Make 3D Cursor is at centerpoint around which you want geometry to turn. Also make that vertical axis on your screen matches direction of axis around which it should turn. most common example is turning around global Z axis: for that, you’d place 3D Cursor at world origin and switch to orthographic side view.
Now you’re ready to run operator: open *Edge *menu (by clicking it in 3D Viewport’s header or pressing Ctrl - E ) and click *Screw *.
You can change number of steps and turns in Adjust Last Operation panel.
If you only created open profile to guide extrusion (not because you wanted its geometry), you can select its extruded faces by hovering over one and pressing L , then delete them by pressing X or Delete .
## Options
Screw panel (in Edit Mode).
**Steps **
number of extrusions to be done for each 360° turn.
**Turns **
number of turns to create.
**Center X, Y, Z **
world space coordinates of centerpoint around which to spin geometry. Initially this is location of 3D Cursor.
**Axis X, Y, Z **
direction vector around which to spin geometry. Initially this is screen-space vertical axis (so global Z axis when in side view or global Y axis when in top view). By inverting *Axis *, you can flip between going clockwise and counterclockwise.
Tip
You can use Align View to Active menu item to align viewport, and thereby *Axis *, to certain item in scene.
Notice that *Axis *only determines how geometry spins “horizontally” around centerpoint. It doesn’t determine how geometry moves “vertically.” Instead, geometry always moves by distance and direction given by endpoints of open profile, and goes downward in object’s local space.
## Examples
### Creating a Spring
First, let’s create circle to serve as spring’s cross section:
-
Open Blender and delete default Cube.
-
Add circle by pressing Shift - and selecting Mesh ‣ Circle .
-
Set *Location X *property of this new object to -3 and its *Rotation X *property to 90°.
-
Enter *Edit Mode *by pressing Tab .
-
Switch to *Front Orthographic *view by pressing Numpad1 .
Extrusion profile created.
-
Deselect all vertices by clicking on empty space or pressing Alt - .
-
Click Ctrl - RMB twice to create two vertices connected by edge.
-
Select both vertices and press S X 0 Return to ensure they have same X coordinate. (This is necessary to keep spring’s radius constant.)
Guide profile created.
Now, we’re ready to create spring:
-
Select both circle and line by pressing .
-
Click Edge ‣ Screw .
-
Adjust *Steps *and *Turns *to your liking.
-
Try changing *Axis Z *to -1 and see that this makes spring turn other way.
Counterclockwise direction.
Flipped to Clockwise direction.
You can get some interesting results by making *Axis *diagonal (e.g. keeping *Axis Z *at -1 and setting *Axis X *to 1). Notice that each individual spring loop is inclined by 45°, but that after each loop, we still go down vertically (in direction of guide line).
### Creating a Screw Spindle
Screw operator is perfectly suited for creating helices without any gaps between turns.
-
Open Blender and enter *Edit Mode *for default cube.
-
Delete all vertices by pressing X or Delete .
-
Switch to *Front Orthographic *view by pressing Numpad1 .
-
Click Ctrl - RMB three times to create profile like one below.
-
Select two vertices closest to global Z axis and press S X 0 Return to ensure they have same X coordinate.
-
Select all three vertices and click Edge ‣ Screw .
-
Adjust *Steps *and *Turns *to your liking.
Profile for screw spindle.
Result after running Screw operator.
You can also create more interesting shapes, like this spiral “staircase”: Ramp.
Profile.
Generated mesh.
### Creating a Screw Tip
Until now, we’ve always made that first and last vertex of profile have same X coordinate, thereby keeping radius of helix constant. However, nothing stops you from using different X coordinates and having helix shrink/expand along its height.
Profile.
Generated.
- Screw
- Usage
- Options
- Examples
- Creating Spring
- Creating Screw Spindle
- Creating Screw Tip