# 
# Quickstart

This `API (Application Programming Interface)` is stable
but some areas are still being extended and improved.

.. rubric:: Blender Python API features:

- Edit any data user interface can (Scenes, Meshes, Particles etc.).
- Modify user preferences, keymaps and themes.
- Run tools with own settings.
- Create user interface elements such as menus, headers and panels.
- Create new tools.
- Create interactive tools.
- Create new rendering engines that integrate with Blender.
- Subscribe to changes to data and its properties.
- Define new settings in existing Blender data.
- Draw in 3D Viewport using Python.


.. rubric:: (Still) missing features:

- Create new space types.
- Assign custom properties to every type.


## Before Starting

This document is intended to familiarize you with Blender Python API
but not to fully cover each topic.

 quick list of helpful things to know before starting:

- Enable `Developer Extra <blender_manual:bpy.types.PreferencesView.show_developer_ui>`
 and `Python Tooltips <blender_manual:bpy.types.PreferencesView.show_tooltips_python>`.
- `Python Console <blender_manual:bpy.types.SpaceConsole>`
 is great for testing one-liners; it has autocompletion so you can inspect API quickly.
- Button tooltips show Python attributes and operator names (when enabled see above).
- context menu of buttons directly links to this API documentation (when enabled see above).
- Many python examples can be found in text editor's template menu.
- To examine further scripts distributed with Blender, see:

 - ``scripts/startup/bl_ui`` for user interface.
 - ``scripts/startup/bl_operators`` for operators.

 Exact location depends on platform, see:
 `directory layout docs <blender_manual:blender-directory-layout>`.


### Running Scripts

 two most common ways to execute Python scripts are using built-in
text editor or entering commands in Python console.
Both *Text Editor* and *Python Console* are space types you can select from header.
Rather than manually configuring your spaces for Python development,
you can use *Scripting* workspace accessible from Topbar tabs.

From text editor you can open ``.py`` files or paste them from clipboard, then test using *Run Script*.
 Python Console is typically used for typing in snippets and for testing to get immediate feedback,
but can also have entire scripts pasted into it.
Scripts can also run from command line with Blender but to learn scripting in Blender this isn't essential.


## Key Concepts

### Data Access

#### Accessing Data-Blocks

You can access Blender's data with Python API in same way as animation system or user interface;
this implies that any setting that can be changed via button can also be changed with Python.
Accessing data from currently loaded blend-file is done with module `bpy.data`.
It gives access to library data, for example:

 >>> bpy.data.objects
 <bpy_collection[3], BlendDataObjects>

 >>> bpy.data.scenes
 <bpy_collection[1], BlendDataScenes>

 >>> bpy.data.materials
 <bpy_collection[1], BlendDataMaterials>


#### Accessing Collections

You will notice that index as well as string can be used to access members of collection.
Unlike Python dictionaries, both methods are available;
however, index of member may change while running Blender.

 >>> list(bpy.data.objects)
 [bpy.data.objects["Cube"], bpy.data.objects["Plane"]]

 >>> bpy.data.objects['Cube']
 bpy.data.objects["Cube"]

 >>> bpy.data.objects[0]
 bpy.data.objects["Cube"]


#### Accessing Attributes

Once you have data-block, such as material, object, collection, etc.,
its attributes can be accessed much like you would change setting using graphical interface.
In fact, tooltip for each button also displays Python attribute
which can help in finding what settings to change in script.

 >>> bpy.data.objects[0].name
 'Camera'

 >>> bpy.data.scenes["Scene"]
 bpy.data.scenes['Scene']

 >>> bpy.data.materials.new("MyMaterial")
 bpy.data.materials['MyMaterial']


For testing what data to access it's useful to use Python Console, which is its own space type.
This supports auto-complete, giving you fast way to explore data in your file.

Example of data path that can be quickly found via console:

 >>> bpy.data.scenes[0].render.resolution_percentage
 100
 >>> bpy.data.scenes[0].objects["Torus"].data.vertices[0].co.x
 1.0


#### Data Creation/Removal

When you are familiar with other Python APIs you may be surprised that
new data-blocks in bpy API cannot be created by calling class:

 >>> bpy.types.Mesh()
 Traceback (most recent call last):
 File "<blender_console>", line 1, in <module>
 TypeError: bpy_struct.__new__(type): expected single argument


This is intentional part of API design.
 Blender Python API can't create Blender data that exists outside main Blender database
(accessed through `bpy.data`), because this data is managed by Blender (save, load, undo, append, etc).

Data is added and removed via methods on collections in `bpy.data`, e.g:

 >>> mesh = bpy.data.meshes.new(name="MyMesh")
 >>> print(mesh)
 <bpy_struct, Mesh("MyMesh.001")>

 >>> bpy.data.meshes.remove(mesh)



#### Custom Properties

Python can access properties on any data-block that has ID
(data that can be linked in and accessed from `bpy.data`).
When assigning property, you can pick your own names,
these will be created when needed or overwritten if they already exist.

This data is saved with blend-file and copied with objects, for example:

`python
bpy.context.object["MyOwnProperty"] = 42

if "SomeProp" in bpy.context.object:
    print("Property found")

# Use the get function like a Python dictionary
# which can have a fallback value.
value = bpy.data.scenes["Scene"].get("test_prop", "fallback value")

# Dictionaries can be assigned as long as they only use basic types.
collection = bpy.data.collections.new("MyTestCollection")
collection["MySettings"] = {"foo": 10, "bar": "spam", "baz": {}}

del collection["MySettings"]


`
Note that these properties can only be assigned basic Python types:

- int, float, string
- array of ints or floats
- dictionary (only string keys are supported, values must be basic types too)

These properties are valid outside of Python. They can be animated by curves or used in driver paths.

For list of types that support custom properties see:
`types supporting custom properties <bpy_types-custom_properties>`.


### Context

While it's useful to be able to access data directly by name or as list,
it's more common to operate on user's selection.
 context is always available from ``bpy.context`` and can be used to get active object, scene,
tool settings along with many other attributes.

Some common use cases are:

 >>> bpy.context.object
 >>> bpy.context.selected_objects
 >>> bpy.context.visible_bones

Note that context is read-only, which means that these values cannot be modified directly.
But they can be changed by running API functions or by using data API.

So ``bpy.context.active_object = obj`` will raise error.
But ``bpy.context.view_layer.objects.active = obj`` works as expected.

 context attributes change depending on where they are accessed.
 3D Viewport has different context members than Python Console,
so take care when accessing context attributes that user state is known.

See `bpy.context` API reference.


### Operators (Tools)

Operators are tools accessed by user from buttons, menu items or key shortcuts.
From user perspective they are tool but Python can run these with its own settings
through `bpy.ops` module.

Examples:

 >>> bpy.ops.mesh.flip_normals()
 {'FINISHED'}
 >>> bpy.ops.mesh.hide(unselected=False)
 {'FINISHED'}
 >>> bpy.ops.object.transform_apply()
 {'FINISHED'}

.. tip::

 `Operator Cheat Sheet <blender_manual:bpy.ops.wm.operator_cheat_sheet>`
 gives list of all operators and their default values in Python syntax, along with generated docs.
 This is good way to get overview of all Blender's operators.


#### Operator Poll()

Many operators have "poll" function which checks if cursor
is in valid area or if object is in correct mode (Edit Mode, Weight Paint Mode, etc).
When operator's poll function fails within Python, exception is raised.

For example, calling ``bpy.ops.view3d.render_border()`` from console raises following error:

`python
RuntimeError: Operator bpy.ops.view3d.render_border.poll() failed, context is incorrect

`
In this case context must be 3D Viewport with active camera.

To avoid using try-except clauses wherever operators are called, you can call operators
own ``poll()`` function to check if it can run operator in current context.

`python
if bpy.ops.view3d.render_border.poll():
    bpy.ops.view3d.render_border()


`
## Integration

Python scripts can integrate with Blender in following ways:

- By defining render engine.
- By defining operators.
- By defining menus, headers and panels.
- By inserting new buttons into existing menus, headers and panels.

In Python, this is done by defining class, which is subclass of existing type.


### Example Operator

.. literalinclude:: __/__/__/scripts/templates_py/Operator/simple.py

Once this script runs, ``SimpleOperator`` is registered with Blender
and can be called from Operator Search or added to toolbar.

To run script:

#. Start Blender and switch to Scripting workspace.
#. Click *New* button in text editor to create new text data-block.
#. Copy code from above and paste it into text editor.
#. Click on *Run Script* button.
#. Move your cursor into 3D Viewport,
 open `Operator Search menu <blender_manual:bpy.ops.wm.search_menu>`,
 and type "Simple".
#. Click on "Simple Operator" item found in search.

.. seealso::

 class members with ``bl_`` prefix are documented in API reference `bpy.types.Operator`.

.. note::

 output from ``main`` function is sent to terminal;
 see this, `use the terminal <use_the_terminal>`.


### Example Panel

Panels are registered as class, like operator.
Notice extra ``bl_`` variables used to set context they display in.

.. literalinclude:: __/__/__/scripts/templates_py/UI/panel_simple.py

To run script:

#. Start Blender and switch to Scripting workspace.
#. Click *New* button in text editor to create new text data-block.
#. Copy code from above and paste it into text editor.
#. Click on *Run Script* button.

To view results:

#. Select default cube.
#. Click on Object properties icon in buttons panel (far right; appears as tiny cube).
#. Scroll down to see panel named "Hello World Panel".
#. Changing object name also updates *Hello World Panel's* name: field.

Note row distribution and label and properties that are defined through code.

.. seealso:: `bpy.types.Panel`


## Types

Blender defines number of Python types but also uses Python native types.
Blender's Python API can be split up into three categories.


### Native Types

In simple cases returning number or string as custom type would be cumbersome,
so these are accessed as normal Python types.

- Blender float, int, boolean -> float, int, boolean
- Blender enumerator -> string

 >>> C.object.rotation_mode = 'AXIS_ANGLE'

- Blender enumerator (multiple) -> set of strings

`python
# Setting multiple snap targets.
bpy.context.scene.tool_settings.snap_elements_base = {'VERTEX', 'EDGE'}

# Passing as an operator argument for report types.
self.report({'WARNING', 'INFO'}, "Some message!")


`
### Internal Types

`bpy.types.bpy_struct` is used for Blender data-blocks and collections.
Also for data that contains its own attributes: collections, meshes, bones, scenes, etc.

There are two main types that wrap Blender's data, one for data-blocks
(known internally as ``bpy_struct``), another for properties.

 >>> bpy.context.object
 bpy.data.objects['Cube']

 >>> C.scene.objects
 bpy.data.scenes['Scene'].objects

Note that these types reference Blender's data so modifying them is visible immediately.


### Mathutils Types

Accessible from `mathutils` are vectors, quaternions, Euler angles, matrix and color types.
Some attributes such as `bpy.types.Object.location`,
`bpy.types.PoseBone.rotation_euler` and `bpy.types.View3DCursor.location`
can be accessed as special math types which can be used together and manipulated in various useful ways.

Example of matrix, vector multiplication:

`python
bpy.context.object.matrix_world @ bpy.context.object.data.vertices[0].co

`
.. note::

 mathutils types keep reference to Blender's internal data so changes can
 be applied back.

 Example:

`python
# Modifies the Z axis in place.
bpy.context.object.location.z += 2.0

# Location variable holds a reference to the object too.
location = bpy.context.object.location
location *= 2.0

# Copying the value drops the reference so the value can be passed to
# functions and modified without unwanted side effects.
location = bpy.context.object.location.copy()


`
## Animation

There are two ways to add keyframes through Python.

 first is through key properties directly, which is like inserting keyframe from button as user.
You can also manually create curves and keyframe data, then set path to property.
Here are examples of both methods. Both insert keyframe on active object's Z axis.

Simple example:

`python
obj = bpy.context.object
obj.location[2] = 0.0
obj.keyframe_insert(data_path="location", frame=10.0, index=2)
obj.location[2] = 1.0
obj.keyframe_insert(data_path="location", frame=20.0, index=2)

`
Using low-level functions:

`python
obj = bpy.context.object

# Create the action, with a slot for the object, a layer, and a keyframe strip:
action = bpy.data.actions.new(name="MyAction")
slot = action.slots.new(obj.id_type, obj.name)
strip = action.layers.new("MyLayer").strips.new(type='KEYFRAME')

# Create a channelbag to hold the F-Curves for the slot:
channelbag = strip.channelbag(slot, ensure=True)

# Create the F-Curve with two keyframes:
fcu_z = channelbag.fcurves.new(data_path="location", index=2)
fcu_z.keyframe_points.add(2)
fcu_z.keyframe_points[0].co = 10.0, 0.0
fcu_z.keyframe_points[1].co = 20.0, 1.0

# Assign the action and the slot to the object:
adt = obj.animation_data_create()
adt.action = action
adt.action_slot = slot

`