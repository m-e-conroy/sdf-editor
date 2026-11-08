# 
# Best Practice

When writing your own scripts Python is great for new developers to pick up and become productive,
but you can also pick up bad practices or at least write scripts that are not easy for others to understand.
For your own work this is of course fine,
but if you want to collaborate with others or have your work included with Blender there are practices we encourage.


## Style Conventions

For Blender Python development we have chosen to follow Python suggested style guide to avoid mixing styles
among our own scripts and make it easier to use Python scripts from other projects.
Using our style guide for your own scripts makes it easier if you eventually want to contribute them to Blender.

This style guide is known as `pep8 <https://www.python.org/dev/peps/pep-0008/>`__
and here is brief listing of pep8 criteria:

- Camel caps for class names: MyClass
- All lower case underscore separated module names: my_module
- Indentation of 4 spaces (no tabs)
- Spaces around operators: ``1 + 1``, not ``1+1``
- Only use explicit imports (no wildcard importing ``*``)
- Don't use multiple statements on single line: ``if val: body``, separate onto two lines instead.

As well as pep8 we have additional conventions used for Blender Python scripts:

- Use single quotes for enums, and double quotes for strings.

 Both are of course strings, but in our internal API enums are unique items from limited set, e.g:

`python
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.filepath = "//render_out"

`
- pep8 also defines that lines should not exceed 79 characters,
 we have decided that this is too restrictive so it is optional per script.


## User Interface Layout

Some notes to keep in mind when writing UI layouts:

UI code is simple. Layout declarations are there to easily create decent layout.
 general rule here is: If you need more code for layout declaration,
than for actual properties, then you are doing it wrong.


.. rubric:: Example layouts:

``layout()``
 basic layout is simple top-to-bottom layout.

`python
layout.prop()
layout.prop()

`
``layout.row()``
 Use ``row()``, when you want more than one property in single line.

`python
row = layout.row()
row.prop()
row.prop()

`
``layout.column()``
 Use ``column()``, when you want your properties in column.

`python
col = layout.column()
col.prop()
col.prop()

`
``layout.split()``
 This can be used to create more complex layouts.
 For example, you can split layout and create two ``column()`` layouts next to each other.
 Do not use split, when you want two properties in row. Use ``row()`` instead.

`python
split = layout.split()

col = split.column()
col.prop()
col.prop()

col = split.column()
col.prop()
col.prop()


`
.. rubric:: Declaration names:

Try to only use these variable names for layout declarations:

 for ``row()`` layout
 for ``column()`` layout
 for ``split()`` layout
 for ``column_flow()`` layout
 for sub layout ( column inside column for example)


## Script Efficiency

### List Manipulation (General Python Tips)

#### Searching for List Items

In Python there are some handy list functions that save you having to search through list.
Even though you are not looping on list data **Python is**,
so you need to be aware of functions that will slow down your script by searching whole list.

`python
my_list.count(list_item)
my_list.index(list_item)
my_list.remove(list_item)
if list_item in my_list: ...


`
#### Modifying Lists

In Python you can add and remove from list, this is slower when list length is modified,
especially at start of list, since all data after index of
modification needs to be moved up or down one place.

 fastest way to add onto end of list is to use
``my_list.append(list_item)`` or ``my_list.extend(some_list)`` and
to remove item is ``my_list.pop()`` or ``del my_list[-1]``.

To use index you can use ``my_list.insert(index, list_item)`` or ``list.pop(index)``
for list removal, but these are slower.

Sometimes it's faster (but less memory efficient) to rebuild list.
For example if you want to remove all triangular polygons in list.
Rather than:

`python
polygons = mesh.polygons[:]  # Make a list copy of the meshes polygons.
p_idx = len(polygons)        # Loop backwards
while p_idx:                 # While the value is not 0.
    p_idx -= 1

    if len(polygons[p_idx].vertices) == 3:
        polygons.pop(p_idx)  # Remove the triangle.


`
It's faster to build new list with list comprehension:

`python
polygons = [p for p in mesh.polygons if len(p.vertices) != 3]


`
#### Adding List Items

If you have list that you want to add onto another list, rather than:

`python
for l in some_list:
    my_list.append(l)

`
Use:

`python
my_list.extend([a, b, c...])


`
Note that insert can be used when needed,
but it is slower than append especially when inserting at start of long list.
This example shows suboptimal way of making reversed list:

`python
reverse_list = []
for list_item in some_list:
    reverse_list.insert(0, list_item)


`
Python provides more convenient ways to reverse list using slice method,
but you may want to time this before relying on it too much:

`python
some_reversed_list = some_list[::-1]


`
#### Removing List Items

Use ``my_list.pop(index)`` rather than ``my_list.remove(list_item)``.
This requires you to have index of list item but is faster since ``remove()`` will search list.
Here is example of how to remove items in one loop,
removing last items first, which is faster (as explained above):

`python
list_index = len(my_list)

while list_index:
    list_index -= 1
    if my_list[list_index].some_test_attribute == 1:
        my_list.pop(list_index)


`
This example shows fast way of removing items,
for use in cases where you can alter list order without breaking script's functionality.
This works by swapping two list items, so item you remove is always last:

`python
pop_index = 5

# Swap so the pop_index is last.
my_list[-1], my_list[pop_index] = my_list[pop_index], my_list[-1]

# Remove last item (pop_index).
my_list.pop()


`
When removing many items in large list this can provide good speed-up.


#### Avoid Copying Lists

When passing list or dictionary to function,
it is faster to have function modify list rather than returning
 new list so Python doesn't have to duplicate list in memory.

Functions that modify list in-place are more efficient than functions that create new lists.
This is slower so only use for functions when it makes sense not to modify list in place:

>>> my_list = some_list_func(my_list)


This is faster since there is no re-assignment and no list duplication:

>>> some_list_func(vec)


Also note that, passing sliced list makes copy of list in Python memory:

>>> foobar(my_list[:])

If my_list was large array containing 10,000's of items, copy could use lot of extra memory.


### Writing Strings to File (Python General)

Here are three ways of joining multiple strings into one string for writing.
This also applies to any area of your code that involves lot of string joining:

String concatenation
 This is slowest option, do **not** use this if you can avoid it, especially when writing data in loop.

 >>> file.write(str1 + " " + str2 + " " + str3 + "\n")

String formatting
 Use this when you are writing string data from floats and ints.

 >>> file.write("%s %s %s\n" % (str1, str2, str3))

String joining
 Use this to join list of strings ( list may be temporary). In following example, strings are joined with
 space " " in between, other examples are "" or ", ".

 >>> file.write(" ".join((str1, str2, str3, "\n")))


Join is fastest on many strings, string formatting is fast too (better for converting data types).
String concatenation is slowest.


### Parsing Strings (Import/Exporting)

Since many file formats are ASCII,
 way you parse/export strings can make large difference in how fast your script runs.

There are few ways to parse strings when importing them into Blender.


#### Parsing Numbers

Use ``float(string)`` rather than ``eval(string)``, if you know value will be int then ``int(string)``,
``float()`` will work for int too but it is faster to read ints with ``int()``.


#### Checking String Start/End

If you are checking start of string for keyword, rather than:

>>> if line[0:5] == "vert ": ...

Use:

>>> if line.startswith("vert "):

Using ``startswith()`` is slightly faster (around 5%) and also avoids possible error
with slice length not matching string length.

``my_string.endswith("foo_bar")`` can be used for line endings too.

If you are unsure whether text is upper or lower case, use ``lower()`` or ``upper()`` string function:

>>> if line.lower().startswith("vert ")


### Error Handling

 **try** statement is useful to save time writing error checking code.
However, **try** is significantly slower than **if** since exception has to be set each time,
so avoid using **try** in areas of your code that execute in loop and runs many times.

There are cases where using **try** is faster than checking whether condition will raise error,
so it is worth experimenting.


### Value Comparison

Python has two ways to compare values ``a == b`` and ``a is b``,
 difference is that ``==`` may run object's comparison function ``__eq__()`` whereas ``is`` compares identity,
that is, that both variables reference same item in memory.

In cases where you know you are checking for same value which is referenced from multiple places, ``is`` is faster.


### Time Your Code

While developing script it is good to time it to be aware of any changes in performance, this can be done :

`python
import time
time_start = time.time()

# Do something...

print("My Script Finished: %.4f sec" % (time.time() - time_start))

`