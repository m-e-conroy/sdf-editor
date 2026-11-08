***************
# Using Operators


Blender's operators are tools for users to access, that can be accessed with Python too which is useful.
Still operators have limitations that can make them cumbersome to script.

 main limits are:

- Can't pass data such as objects, meshes or materials to operate on (operators use context instead).
- return value from calling operator is success (if it finished or was canceled),
 in some cases it would be more logical from API perspective to return result of operation.
- Operators' poll function can fail where API function would raise exception giving details on exactly why.


## Why does operator's poll fail?

When calling operator it gives error like this:

 >>> bpy.ops.action.clean(threshold=0.001)
 RuntimeError: Operator bpy.ops.action.clean.poll() failed, context is incorrect

Which raises question as to what correct context might be?

Typically operators check for active area type, selection or active object they can operate on,
but some operators are more strict when they run.
In most cases you can figure out what context operator needs
by examining how it's used in Blender and thinking about what it does.

If you're still stuck, unfortunately, only way to eventually know what is causing error is
to read source code for poll function and see what it is checking.
For Python operators it's not so hard to find source
since it's included with Blender and source file and line is included in operator reference docs.
Downloading and searching C code isn't so simple,
especially if you're not familiar with C language but by searching operator name or description
 be able to find poll function with no knowledge of C.

.. note::

 Blender does have functionality for poll functions to describe why they fail,
 but it's currently not used much, if you're interested to help improve API
 feel free to add calls to `bpy.types.Operator.poll_message_set` (``CTX_wm_operator_poll_msg_set`` in C)
 where it's not obvious why poll fails, e.g:

 >>> bpy.ops.object.vertex_group_add()
 RuntimeError: Operator bpy.ops.object.vertex_group_add.poll() No active editable object

 In some cases using `bpy.types.Context.temp_override` to enable temporary logging or using 
 ``context`` category when `logging <blender_manual:command-line-args-logging-options>` can help.


## operator still doesn't work!

Certain operators in Blender are only intended for use in specific context,
some operators for example are only called from properties editor where they check current material,
modifier or constraint.

Examples of this are:

- `bpy.ops.texture.slot_move`
- `bpy.ops.constraint.limitdistance_reset`
- `bpy.ops.object.modifier_copy`
- `bpy.ops.buttons.file_browse`

Another possibility is that you are first person to attempt to use this operator
in script and some modifications need to be made to operator to run in different context.
If operator should logically be able to run but fails when accessed from script
it should be reported to bug tracker.
