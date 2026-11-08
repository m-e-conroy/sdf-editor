********************************
# Python Threads are Not Supported

In short: Python threads cause Blender to crash in hard to diagnose ways. For
example, crash can occur while rendering with Cycles, with Python drivers,
while background thread is used to download some file.

So far, no work has been done to make Blender's Python integration thread safe,
so until it's properly supported, it's best not make use of this.

Note that some modules in Python standard library may use threads as well.
 example is `multiprocessing.Queue <https://docs.python.org/3/library/multiprocessing.html#multiprocessing.Queue>`_
class.

Python threading with Blender only works properly when threads finish up
before script does, for example by using ``threading.Thread.join()``. In other
words, they can only be used while main Blender thread is blocked from
running.


## Alternative Approaches

For running Python code independently of Blender, it is recommended to use 
`multiprocessing <https://docs.python.org/3/library/multiprocessing.html>`_ module.


## Code Examples

Here is example of threading supported by Blender:

`python
import threading
import requests

urls = [
   "http://localhost:8000/file-1.blend",
   "http://localhost:8000/file-2.blend",
   "http://localhost:8000/file-3.blend",
]


def download(url: str) -> None:
   name = threading.current_thread().name
   print("{}: Starting".format(name))
   response = requests.get(url)
   print("{}: Request status code {}".format(name, response.status_code))


threads = [
   threading.Thread(
      name="thread-{}".format(index),
      target=download,
      args=(url,),
   )
   for index, url in enumerate(urls)
]

print("Starting threads...")
for t in threads:
   t.start()

# NOTE: While threads are running, no code (including the main thread)
# may use bpy or any Blender API - only standard Python or third-party modules.
print("Waiting for threads to finish...")
for t in threads:
   t.join()

# It's now safe to use bpy again since all threads have finished.
print("Threads all done, now Blender can continue")

`
This is example of **unsupported** case, using timer that runs many times
 second:

`python
from threading import Timer

def my_timer():
      t = Timer(0.1, my_timer)
      t.daemon = True
      t.start()
      print("Running...")

my_timer()

`
Use cases like one above, which leave thread running once script
finishes, may seem to work for while, but end up causing random crashes or
errors in Blender's own drawing code.
