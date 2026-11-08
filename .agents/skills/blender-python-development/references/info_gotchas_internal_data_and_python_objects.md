************************************
# Internal Data & Their Python Objects

 Python objects wrapping Blender internal data have some limitations and constraints,
compared to 'pure Python' data. most common things to keep in mind are documented here.



## Life-Time of Python Objects Wrapping Blender Data

Typically, Python objects representing (wrapping) Blender data have limited life-time.
They are created on-demand, and deleted as soon as they are not used in Python anymore.

This means that storing python-only data in these objects should not be done for anything that
requires some form of persistence.

There are some exceptions to this rule. For example, IDs do store their Python instance, once created,
and re-use it instead of re-creating new Python object every time they are accessed from Python.
And modal operators will keep their instance as long as operator is running.
However, this is done for performance purposes and is considered internal implementation detail.
Relying on this behavior from Python code side for any purpose is not recommended.

Furthermore, Blender may free its internal data, in which case it will try to invalidate known
Python object wrapping it. But this is not always possible, which can lead to invalid memory access and
is another good reason to never store these in Python code in any persistent way.
See also `troubleshooting crashes <troubleshooting_crashes>` documentation.


## Data Names

### Naming Limitations

 common mistake is to assume newly created data is given requested name.
This can cause bugs when you add data (normally imported) then reference it later by name:

`python
bpy.data.meshes.new(name=meshid)

# Normally some code, function calls, etc.
bpy.data.meshes[meshid]


`
Or with name assignment:

`python
obj.name = objname

# Normally some code, function calls, etc.
obj = bpy.data.meshes[objname]


`
Data names may not match assigned values if they exceed maximum length, are already used or empty string.


It's better practice not to reference objects by names at all,
once created you can store data in list, dictionary, on class, etc;
there is rarely reason to have to keep searching for same data by name.

If you do need to use name references, it's best to use dictionary to maintain
 mapping between names of imported assets and newly created data,
this way you don't run this risk of referencing existing data from blend-file, or worse modifying it.

`python
# Typically declared in the main body of the function.
mesh_name_mapping = {}

mesh = bpy.data.meshes.new(name=meshid)
mesh_name_mapping[meshid] = mesh

# Normally some code, or function calls, etc.

# Use own dictionary rather than `bpy.data`.
mesh = mesh_name_mapping[meshid]


`
### Library Collisions

Blender keeps data names unique (`bpy.types.ID.name`) so you can't name two objects,
meshes, scenes, etc., same by accident.
However, when linking in library data from another blend-file naming collisions can occur,
so it's best to avoid referencing data by name at all.

This can be tricky at times and not even Blender handles this correctly in some cases
(when selecting modifier object for example, you can't select between multiple objects with same name),
but it's still good to try avoiding these problems in this area.
If you need to select between local and library data, there is feature in ``bpy.data`` members to allow for this.

`python
# Typical name lookup, could be local or library.
obj = bpy.data.objects["my_obj"]

# Library object name lookup using a pair,
# where the second argument is the library path matching bpy.types.Library.filepath.
obj = bpy.data.objects["my_obj", "//my_lib.blend"]

# Local object name look up using a pair,
# where the second argument excludes library data from being returned.
obj = bpy.data.objects["my_obj", None]

# Both the examples above also work for `get`.
obj = bpy.data.objects.get(("my_obj", None))


`
## Stale Data

### No updates after setting values

Sometimes you want to modify values from Python and immediately access updated values, e.g:
After changing object's `bpy.types.Object.location`
you may want to access its transformation right after from `bpy.types.Object.matrix_world`,
but this doesn't work as you might expect. There are similar issues with changes to UI, that
are covered in next section.

Consider calculations that might contribute to object's final transformation, this includes:

- Animation function curves.
- Drivers and their Python expressions.
- Constraints
- Parent objects and all of their F-Curves, constraints, etc.

To avoid expensive recalculations every time property is modified,
Blender defers evaluation until results are needed.
However, while script runs you may want to access updated values.
In this case you need to call `bpy.types.ViewLayer.update` after modifying values, for example:

`python
bpy.context.object.location = 1, 2, 3
bpy.context.view_layer.update()


`
Now all dependent data (child objects, modifiers, drivers, etc.)
have been recalculated and are available to script within active view layer.


### No updates after changing UI context

Similar to previous issue, some changes to UI may also not have immediate effect. For example, setting
`bpy.types.Window.workspace` doesn't seem to cause observable effect in immediately following code
(`bpy.types.Window.workspace` is still same), but UI will in fact reflect change. Some of 
properties that behave that way are:

- `bpy.types.Window.workspace`
- `bpy.types.Window.screen`
- `bpy.types.Window.scene`
- `bpy.types.Area.type`
- `bpy.types.Area.ui_type`

Such changes impact UI, and with that context (`bpy.context`) drastically. This can break
Blender's context management. So Blender delays this change until after operators have run and before UI is
redrawn, making sure that context can be changed safely.

If you rely on executing code with updated context this can be worked around by executing code in delayed
fashion as well. Possible options include:

 - `Modal Operator <modal_operator>`.
 - `bpy.app.handlers`.
 - `bpy.app.timers`.

It's also possible to depend on drawing callbacks although these should be avoided as failure to draw 
hidden panel, region, cursor, etc. could cause your script to be unreliable.


## Can I redraw during script execution?

 official answer to this is no, or... *"You don't want to do that"*.
To give some background on topic:

While script executes, Blender waits for it to finish and is effectively locked until it's done;
while in this state Blender won't redraw or respond to user input.
Normally this is not such problem because scripts distributed with Blender
tend not to run for extended period of time,
nevertheless scripts *can* take long time to complete and it would be nice to see progress in viewport.

Tools that lock Blender in loop redraw are highly discouraged
since they conflict with Blender's ability to run multiple operators
at once and update different parts of interface as tool runs.

So solution here is to write **modal** operator, which is operator that defines ``modal()`` function,
See modal operator template in text editor.
Modal operators execute on user input or setup their own timers to run frequently,
they can handle events or pass through to be handled by keymap or other modal operators.
Examples of modal operators are Transform, Painting, Fly Navigation and File Select.

Writing modal operators takes more effort than simple ``for`` loop
that contains draw calls but is more flexible and integrates better with Blender's design.


.. rubric:: Ok, Ok! I still want to draw from Python

If you insist -- yes it's possible, but scripts that use this hack will not be considered
for inclusion in Blender and any issue with using it will not be considered bug,
there is also no guaranteed compatibility in future releases.

`python
bpy.ops.wm.redraw_timer(type='DRAW_WIN_SWAP', iterations=1)

`