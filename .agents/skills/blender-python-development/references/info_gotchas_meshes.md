*********************
# Modes and Mesh Access

When working with mesh data you may run into problem where script fails to run as expected in Edit-Mode.
This is caused by Edit-Mode having its own data which is only written back to mesh when exiting Edit-Mode.

 common example is that exporters may access mesh through ``obj.data`` ( `bpy.types.Mesh`)
when user is in Edit-Mode, where mesh data is available but out of sync with edit mesh.

In this situation you can...

- Exit Edit-Mode before running tool.
- Explicitly update mesh by calling `bmesh.types.BMesh.to_mesh`.
- Modify script to support working on edit-mode data directly, see: `bmesh.from_edit_mesh`.
- Report context as incorrect and only allow script to run outside Edit-Mode.



## N-Gons and Tessellation

Since 2.63 n-gons are supported, this adds some complexity
since in some cases you need to access triangles still (some exporters for example).

There are now three ways to access faces:

- `bpy.types.MeshPolygon` --
 this is data structure which now stores faces in Object-Mode
 (access as ``mesh.polygons`` rather than ``mesh.faces``).
- `bpy.types.MeshLoopTriangle` --
 result of tessellating polygons into triangles
 (access as ``mesh.loop_triangles``).
- `bmesh.types.BMFace` --
 polygons as used in Edit-Mode.

For purpose of following documentation,
these will be referred to as polygons, loop triangles and BMesh-faces respectively.

Faces with five or more sides will be referred to as ``ngons``.


### Support Overview

.. list-table::
 :header-rows: 1
 :stub-columns: 1

 * - Usage
 - `bpy.types.MeshPolygon`
 - `bpy.types.MeshLoopTriangle`
 - `bmesh.types.BMFace`
 * - Import/Create
 - Poor *(inflexible)*
 - Unusable *(read-only)*.
 - Best
 * - Manipulate
 - Poor *(inflexible)*
 - Unusable *(read-only)*.
 - Best
 * - Export/Output
 - Good *(n-gon support)*
 - Good *(When n-gons cannot be used)*
 - Good *(n-gons, extra memory overhead)*

.. note::

 Using `bmesh` API is completely separate API from `bpy`,
 typically you would use one or other based on level of editing needed,
 not for different way to access faces.


### Creating

All three data types can be used for face creation:

- Polygons are most efficient way to create faces but data structure is ** rigid and inflexible,
 you must have all your vertices and faces ready and create them all at once.
 This is further complicated by fact that each polygon does not store its own vertices,
 rather they reference index and size in `bpy.types.Mesh.loops` which are fixed array too.
- BMesh-faces are most likely easiest way to create faces in new scripts,
 since faces can be added one by one and API has features intended for mesh manipulation.
 While `bmesh.types.BMesh` uses more memory it can be managed by only operating on one mesh at time.


### Editing

Editing is where three data types vary most.

- Polygons are limited for editing,
 changing materials and options like smooth works, but for anything else
 they are too inflexible and are only intended for storage.
- Loop-triangles should not be used for editing geometry because doing so will cause existing n-gons to be tessellated.
- BMesh-faces are by far best way to manipulate geometry.


### Exporting

All three data types can be used for exporting,
 choice mostly depends on whether target format supports n-gons or not.

- Polygons are most direct and efficient way to export providing they convert into output format easily enough.
- Loop-triangles work well for exporting to formats which don't support n-gons,
 in fact this is only place where their use is encouraged.
- BMesh-Faces can work for exporting too but may not be necessary if polygons can be used
 since using BMesh gives some overhead because it's not native storage format in Object-Mode.
