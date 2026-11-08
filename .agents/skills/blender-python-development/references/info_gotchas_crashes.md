********************************
# Troubleshooting Errors & Crashes


## Help! My script crashes Blender

`TL;DR (Too long; didn't read.)` Do not keep direct references to Blender data (of any kind)
when modifying container of that data, and/or when some undo/redo may happen
(e.g. during modal operators execution...).
Instead, use indices (or other data always stored by value in Python, like string keys...),
that allow you to get access to desired data.

Ideally it would be impossible to crash Blender from Python,
however, there are some problems with API where it can be made to crash.
Strictly speaking this is bug in API but fixing it would mean adding memory verification
on every access since most crashes are caused by Python objects referencing Blender's memory directly,
whenever memory is freed or re-allocated, further Python access to it can crash script.
But fixing this would make scripts run slow,
or writing different kind of API which doesn't reference memory directly.

Here are some general hints to avoid running into these problems:

- Be aware of memory limits,
 especially when working with large lists since Blender can crash by running out of memory.
- Many hard to fix crashes end up being because of referencing freed data,
 when removing data be sure not to hold any references to it.
- Re-allocation can lead to same issues
 (e.g. if you add lot of items to some Collection,
 this can lead to re-allocating underlying container's memory,
 invalidating all previous references to existing items).
- Modules or classes that remain active while Blender is used,
 should not hold references to data user may remove, instead,
 fetch data from context each time script is activated.
- Crashes may not happen every time, they may happen more on some configurations or operating systems.
- Be careful with recursive patterns, those are efficient at hiding issues described here.
- See last subsection about `Unfortunate Corner Cases`_ for some known breaking exceptions.

.. note::

 To find line of your script that crashes you can use ``faulthandler`` module.
 See `Faulthandler docs <https://docs.python.org/dev/library/faulthandler.html>`__.

 While crash may be in Blender's C/C++ code,
 this can help lot to track down area of script that causes crash.

.. note::

 Some container modifications are safe, because they will never re-allocate existing data
 (e.g. linked lists containers will never re-allocate existing items when adding or removing others).

 But knowing which cases are safe and which aren't implies deep understanding of Blender's internals.
 That's why, unless you are willing to dive into RNA C implementation, it's simpler to
 always assume that data references will become invalid when modifying their containers,
 in any possible way.


.. rubric:: Do not:

`python
class TestItems(bpy.types.PropertyGroup):
    name: bpy.props.StringProperty()

bpy.utils.register_class(TestItems)
bpy.types.Scene.test_items = bpy.props.CollectionProperty(type=TestItems)

first_item = bpy.context.scene.test_items.add()
for i in range(100):
    bpy.context.scene.test_items.add()

# This is likely to crash, as internal code may re-allocate
# the whole container (the collection) memory at some point.
first_item.name = "foobar"


`
.. rubric:: Do:

`python
class TestItems(bpy.types.PropertyGroup):
    name: bpy.props.StringProperty()

bpy.utils.register_class(TestItems)
bpy.types.Scene.test_items = bpy.props.CollectionProperty(type=TestItems)

first_item = bpy.context.scene.test_items.add()
for i in range(100):
    bpy.context.scene.test_items.add()

# This is safe, we are getting again desired data *after*
# all modifications to its container are done.
first_item = bpy.context.scene.test_items[0]
first_item.name = "foobar"


`
### Undo/Redo

For safety, assume that undo and redo always invalidates all `bpy.types.ID`
instances (Object, Scene, Mesh, Light, etc.), as well obviously as all of their sub-data.

This example shows how you can tell undo changes memory locations:

 >>> hash(bpy.context.object)
 -9223372036849950810
 >>> hash(bpy.context.object)
 -9223372036849950810

Delete active object, then undo:

 >>> hash(bpy.context.object)
 -9223372036849951740

As suggested above, not holding references to data when Blender is used
interactively by user is only way to make sure that script doesn't become unstable.


.. note::

 Modern undo/redo system does not systematically invalidate all pointers anymore.
 Some data (in fact, most data, in typical cases), which were detected as unchanged for 
 particular history step, may remain unchanged and hence their pointers may remain valid.

 Be aware that if you want to take advantage of this behavior for some reason, there is no
 guarantee of any kind that it will be safe and consistent. Use it at your own risk.


#### Modifying Blender Data & Undo

In general, when Blender data is modified, there should always be undo step created for it.
Otherwise, there will be issues, ranging from invalid/broken undo stack, to crashes on undo/redo.

This is especially true when modifying Blender data `in operators <operator_modifying_blender_data_undo>`.


#### Undo & Library Data

One of advantages with Blender's library linking system is that undo
can skip checking changes in library data since it is assumed to be static.
Tools in Blender are not allowed to modify library data.
But Python does not enforce this restriction.

This can be useful in some cases, using script to adjust material values for example.
But it's also possible to use script to make library data point to newly created local data,
which is not supported since call to undo will remove local data
but leave library referencing it and likely crash.

So it's best to consider modifying library data advanced usage of API
and only to use it when you know what you're doing.


### Abusing RNA property callbacks

Python-defined RNA properties can have custom callbacks. Trying to perform complex operations
from there, like calling operator, may work, but is not officially recommended nor supported.

Main reason is that those callbacks should be fast, but additionally, it may for example
create issues with undo/redo system (most operators store history step, and editing RNA
property does so as well), trigger infinite update loops, and so on.


### Edit-Mode / Memory Access

Switching mode ``bpy.ops.object.mode_set(mode='EDIT')`` or ``bpy.ops.object.mode_set(mode='OBJECT')``
will re-allocate objects data,
any references to meshes vertices/polygons/UVs, armatures bones,
curves points, etc. cannot be accessed after switching mode.

Only reference to data itself can be re-accessed, following example will crash.

`python
mesh = bpy.context.active_object.data
polygons = mesh.polygons
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.object.mode_set(mode='OBJECT')

# This will crash!
print(polygons)


`
So after switching mode you need to re-access any object data variables,
 following example shows how to avoid crash above.

`python
mesh = bpy.context.active_object.data
polygons = mesh.polygons
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.object.mode_set(mode='OBJECT')

# Polygons have been re-allocated.
polygons = mesh.polygons
print(polygons)


`
These kinds of problems can happen for any functions which re-allocate
 object data but are most common when switching mode.


### Array Re-Allocation

When adding new points to curve or vertices/edges/polygons to mesh,
internally array which stores this data is re-allocated.

`python
bpy.ops.curve.primitive_bezier_curve_add()
point = bpy.context.object.data.splines[0].bezier_points[0]
bpy.context.object.data.splines[0].bezier_points.add()

# This will crash!
point.co = 1.0, 2.0, 3.0

`
This can be avoided by re-assigning point variables after adding new one or by storing
indices to points rather than points themselves.

 best way is to sidestep problem altogether by adding all points to curve at once.
This means you don't have to worry about array re-allocation and it's faster too
since re-allocating entire array for every added point is inefficient.


### Removing Data

**Any** data that you remove shouldn't be modified or accessed afterwards,
this includes: F-Curves, drivers, render layers, timeline markers, modifiers, constraints
along with objects, scenes, collections, bones, etc.

 ``remove()`` API calls will invalidate data they free to prevent common mistakes.
 following example shows how this precaution works:

`python
mesh = bpy.data.meshes.new(name="MyMesh")
# Normally the script would use the mesh here.
bpy.data.meshes.remove(mesh)
print(mesh.name)  # <- Give an exception rather than crashing:

# ReferenceError: StructRNA of type Mesh has been removed


`
But take care because this is limited to scripts accessing variable which is removed,
 next example will still crash:

`python
mesh = bpy.data.meshes.new(name="MyMesh")
vertices = mesh.vertices
bpy.data.meshes.remove(mesh)
print(vertices)  # <- This may crash.


`
### Unfortunate Corner Cases

Besides all expected cases listed above, there are few others that should not be
 issue but, due to internal implementation details, currently are:


#### Collection Objects

Changing: ``Object.hide_viewport``, ``Object.hide_select`` or ``Object.hide_render``
will trigger rebuild of Collection caches, thus breaking any current iteration over ``Collection.all_objects``.

 .. rubric:: Do not:

`python
# `all_objects` is an iterator. Using it directly while performing operations on its members that will update
# the memory accessed by the `all_objects` iterator will lead to invalid memory accesses and crashes.
for object in bpy.data.collections["Collection"].all_objects:
     object.hide_viewport = True


`
 .. rubric:: Do:

`python
# `all_objects[:]` is an independent list generated from the iterator. As long as no objects are deleted,
# its content will remain valid even if the data accessed by the `all_objects` iterator is modified.
for object in bpy.data.collections["Collection"].all_objects[:]:
     object.hide_viewport = True


`
#### Data-Blocks Renaming During Iteration

Data-blocks accessed from ``bpy.data`` are sorted when their name is set.
Any loop that iterates over data such as ``bpy.data.objects`` for example,
and sets objects ``name`` must get all items from iterator first (typically by converting to list or tuple)
to avoid missing some objects and iterating over others multiple times.


## sys.exit

Some Python modules will call ``sys.exit()`` themselves when error occurs,
while not common behavior this is something to watch out for because it may seem
as if Blender is crashing since ``sys.exit()`` will close Blender immediately.

For example, ``argparse`` module will print error and exit if arguments are invalid.

 dirty way of troubleshooting this is to set ``sys.exit = None`` and see what line of Python code is quitting,
you could of course replace ``sys.exit`` with your own function but manipulating Python in this way is bad practice.
