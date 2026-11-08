# 
# Tips and Tricks

Here are various suggestions that you might find useful when writing scripts.
Some of these are Python features that you may not have thought to use with Blender,
others are Blender-specific.



## Use Terminal

When writing Python scripts, it's useful to have terminal open,
this is not built-in Python console but terminal application which is used to start Blender.

 three main use cases for terminal are:

- You can see output of ``print()`` as your script runs, which is useful to view debug info.
- error traceback is printed in full to terminal which won't always generate report message in
 Blender's user interface (depending on how script is executed).
- If script runs for too long or you accidentally enter infinite loop,
 `Ctrl-C` in terminal (`Ctrl-Break` on Windows) will quit script early.

.. seealso::

 `blender_manual:command_line-launch-index`.


## Interface Tricks

### Access Operator Commands

You may have noticed that tooltip for menu items and buttons includes ``bpy.ops.[...]`` command
to run that button, handy (hidden) feature is that you can press `Ctrl-C` over
any menu item or button to copy this command into clipboard.


### Access Data Path

To find path from `ID` data-block to its setting isn't always so simple since it may be nested away.
To get this quickly open context menu of setting and select *Copy Data Path*,
if this can't be generated, only property name is copied.

.. note::

 This uses same method for creating animation path used by
 `bpy.types.FCurve.data_path` and
 `bpy.types.DriverTarget.data_path` drivers.



## Show All Operators

While Blender logs operators in Info editor,
this only reports operators with ``REGISTER`` option enabled so as not to flood *Info* view
with calls to ``bpy.ops.view3d.smoothview`` and ``bpy.ops.view3d.zoom``.
Yet for testing it can be useful to see **every** operator called in terminal,
do this by enabling debug option either by passing ``--debug-wm`` argument when starting Blender
or by setting `bpy.app.debug_wm` to ``True`` while Blender is running.


## Use External Editor

Blender's text editor is fine for small changes and writing tests but it's not full featured,
for larger projects you'll probably want to use standalone editor or Python IDE.
Editing text file externally and having same text open in Blender does work
but isn't that optimal so here are two ways you can use external file from Blender.
Using following examples you'll still need text data-block in Blender to execute,
but reference external file rather than including it directly.


### Executing External Scripts

This is equivalent to running script directly, referencing script's path from two line code block.

`python
filename = "/full/path/to/myscript.py"
exec(compile(open(filename).read(), filename, 'exec'))


`
You might want to reference script relative to blend-file.

`python
import bpy
import os

filename = os.path.join(os.path.dirname(bpy.data.filepath), "myscript.py")
exec(compile(open(filename).read(), filename, 'exec'))


`
### Executing Modules

This example shows loading script in as module and executing module function.

`python
import myscript
import importlib

importlib.reload(myscript)
myscript.main()


`
Notice that script is reloaded every time, this forces use of modified version,
otherwise cached one in ``sys.modules`` would be used until Blender was restarted.

 important difference between this and executing script directly is it
has to call function in module, in this case ``main()`` but it can be any function,
 advantage with this is you can pass arguments to function from this
small script which is often useful for testing different settings quickly.

 other issue with this is script has to be in Python's module search path.
While this is not best practice -- for testing purposes you can extend search path,
this following example adds current blend-file's directory to search path
and then loads script as module.

`python
import sys
import os
import bpy

blend_dir = os.path.dirname(bpy.data.filepath)
if blend_dir not in sys.path:
   sys.path.append(blend_dir)

import myscript
import importlib
importlib.reload(myscript)
myscript.main()


`
## Use Blender without its User Interface

While developing your own scripts Blender's interface can get in way,
manually reloading, running scripts, opening file import, etc. adds overhead.
For scripts that are not interactive it can end up being more efficient not to use
Blender's interface at all and instead execute script on command line.

`python
blender --background --python myscript.py


`
You might want to run this with blend-file so script has some data to operate on.

`python
blender myscene.blend --background --python myscript.py

`
.. note::

 Depending on your setup you might have to enter full path to Blender executable.


Once script is running properly in background mode, you'll want to check output of script,
this depends completely on task at hand, however, here are some suggestions:

- Render output to image, use image viewer and keep writing over same image each time.
- Save new blend-file, or export file using one of Blender's exporters.
- If results can be displayed as text then print them or write them to file.


While this can take little time to setup, it can be well worth effort
to reduce time it takes to test changes. You can even have
Blender running script every few seconds with viewer updating results,
so no need to leave your text editor to see changes.


## Use External Tools

When there are no readily available Python modules to perform specific tasks it's
worth keeping in mind you may be able to have Python execute external command
on your data and read result back in.

Using external programs adds extra dependency and may limit who can use script
but to quickly setup your own custom pipeline or writing one-off scripts this can be handy.

Examples include:

- Run Gimp in batch mode to execute custom scripts for advanced image processing.
- Write out 3D models to use external mesh manipulation tools and read back in results.
- Convert files into recognizable formats before reading.


## Bundled Python & Extensions

 Blender releases distributed from blender.org include complete Python installation on all platforms,
this has disadvantage that any extensions you have installed on your system's Python environment
will not be found by Blender.

There are two ways to work around this:

- Remove Blender Python subdirectory, Blender will then fall back on system's Python and use that instead.

 Depending on your platform,
 you may need to explicitly reference location of your Python installation using
 ``PYTHONPATH`` environment variable, e.g:

`python
PYTHONPATH=/usr/lib/python3.7 ./blender --python-use-system-env

`
 .. warning::

 Python (major, minor) version must match one that Blender comes with.
 Therefore you can't use Python 3.6 with Blender built to use Python 3.7.

- Copy or link extensions into Blender's Python subdirectory so Blender can access them,
 you can also copy entire Python installation into Blender's subdirectory,
 replacing one Blender comes with.
 This works as long as Python versions match and paths are created in same relative locations.
 Doing this has advantage that you can redistribute this bundle to others with Blender
 including any extensions you rely on.


## Insert Python Interpreter into your Script

In middle of script you may want to inspect variables,
run functions and inspect flow.

`python
import code
code.interact(local=locals())


`
If you want to access both global and local variables run this:

`python
import code
namespace = globals().copy()
namespace.update(locals())
code.interact(local=namespace)


`
 next example is equivalent single line version of script above which is easier to paste into your code:

`python
__import__('code').interact(local=dict(globals(), **locals()))


`
``code.interact`` can be added at any line in script
and will pause script to launch interactive interpreter in terminal,
when you're done you can quit interpreter and script will continue execution.


If you have **IPython** installed you can use its ``embed()`` function which uses current namespace.
 IPython prompt has auto-complete and some useful features that standard Python eval-loop doesn't have.

`python
import IPython
IPython.embed()


`
Admittedly this highlights lack of any Python debugging support built into Blender,
but its still handy thing to know.


## Advanced

### Blender as Module

From Python perspective it's nicer to have everything as extension
which lets Python script combine many components.

Advantages include:

- You can use external editors or IDEs with Blender's Python API and execute scripts within IDE
 (step over code, inspect variables as script runs).
- Editors or IDEs can auto-complete Blender modules and variables.
- Existing scripts can import Blender APIs without having to be run inside of Blender.

This is marked advanced because to run Blender as Python module requires special build option.
For instructions on building see
`Building Blender as a Python module <https://developer.blender.org/docs/handbook/building_blender/python_module/>`__.


### Python Safety (Build Option)

Since it's possible to access data which has been removed (see `Gotchas <info_gotcha>`),
it can be hard to track down cause of crashes.
To raise Python exceptions on accessing freed data (rather than crashing),
enable CMake build option ``WITH_PYTHON_SAFETY``.
This enables data tracking which makes data access about two times slower
which is why option isn't enabled in release builds.
