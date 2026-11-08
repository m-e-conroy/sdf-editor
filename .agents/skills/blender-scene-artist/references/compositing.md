# Compositing Overview

# Introduction
Compositing Nodes allow you to assemble and enhance image (or movie). Using composition nodes, you can glue two pieces of footage together and colorize whole sequence all at once. You can enhance colors of single image or entire movie clip in static manner or in dynamic way that changes over time (as clip progresses). In this way, you use composition nodes to both assemble video clips together and enhance them.
Note
Term: Image
 term *Image*may refer to single picture, picture in numbered sequence of images, or frame of movie clip. Compositor processes one image at time, no matter what kind of input you provide.
To process your image, you use nodes to import image into Blender, change it, optionally merge it with other images, and finally, save it.
 example of composition.
 example of color correction.
## Getting Started
To begin compositing, open *Compositor*and create new node tree by clicking New button in header. This adds compositing node tree data block to scene, which can then be reused across different scenes or linked/appended from other blend-files.
Important
To make render engine use compositing node tree (or disable compositing), Compositing Pipeline option must be enabled in output’s *Post Processing*properties.
Once node tree is created, you will see your first basic setup. From here you can add and connect many types of Compositing Nodes in node graph layout to build effects ranging from simple color corrections to complex composites.
Note
General concepts and controls for working with nodes are described in Nodes reference.
## Examples
You can do about anything with images using nodes.
Raw footage from foreground actor in front of blue screen, or rendered object doing something, can be layered on top of background. Composite both together, and you have composited footage.
You can change mood of image:
- To make image ‘feel’ colder, blue tinge is added.
- To convey flashback or memory, image may be softened.
- To convey hatred and frustration, add red tinge or enhance red.
- startling event may be sharpened and contrast-enhanced.
- To convey happy feeling add yellow (equal parts red and green, no blue).
- Dust and airborne dirt are often added as cloud texture over image to give little more realism.
## Saving your Composite Image
 *Render*button renders single frame or image. Save your image using Save Image . image will be saved using image format settings on Render panel.
To save sequence of images, for example, if you input movie clip or used Time node with each frame in its own file, use *Animation*button and its settings. If you might want to later overlay them, use image format that supports Alpha channel (such as `PNG `). If you might want to later arrange them front to back or create depth of field effect, use format that supports Z-depth channel (such as `EXR `).
To save composition as movie clip (all frames in single file), use `AVI `or `QuickTime `format, and use *Animation*button and its settings.
- Introduction
- Getting Started
- Examples
- Saving your Composite Image

---

# Compositor System
## Data
### Dimensionality
Compositing nodes operate on data that is either image or dimensionless single value. For instance, Levels node outputs single value, while Render Layers node outputs image. Node inputs that expect single value assume default value if image is given and ignore image completely, for instance, Transform node expects single values for its inputs and will assume default values if images were given to those inputs. default values are those that are considered identity and thus have no effect on output, so for Transform node , *X*, *Y*, and *Angle*inputs will have default value of zero, while *Scale*input will have default value of one. On other hand, if node inputs that expect image are given single value, single value will be assumed to cover whole compositing space. For instance, Filter node expect its *Factor*input to be image, but if single value is given, it will be assumed to be same for all pixels.
### Type
Three types of data exist, all of which are stored in half precision formats:
**Float**signed floating-point number. Integer data is also stored as floats because no integer type exist.**Vector**4D vector. While it is 4D, it can have different interpretations depending on node that uses it. It can be treated as 2D vector with last two components ignored, for instance,*Vector*input of Displace node is treated as 2D vector. It can be treated as 3D vector with last component ignored, for instance, *Vector*input of Seperate XYZ node is treated as 3D vector. It can be treated as two consecutive 2D vectors. For instance *Velocity Pass*as expected by Vector Blur node is assumed to have *2D Previous Velocity*in X and Y components of vector and *2D Next Velocity*in Z and W components of vector.
**Color**4D vector storing Red, Green, Blue, and Alpha of color. color is free form and does not conform to specific color space or alpha storage model, instead, appropriate nodes will have settings to control representation of their output and nodes exist to convert between different representations.
#### Implicit Conversion
In case node input is given data of type other than its own type, following implicit conversions are performed:
Source
Target
Conversion
Float
Vector
f => Vector(f, f, f, 0)
Float
Color
f => Color(f, f, f, 1)
Vector
Float
(x, y, z, w) => Average(x, y, z)
Vector
Color
(x, y, z, w) => Color(x, y, z, 1)
Color
Float
(r, g, b, ) => Luminance(r, g, b)
Color
Vector
(r, g, b, ) => Vector(r, g, b, 0)
 following example demonstrates implicit conversion between color type and float type, since Math Node expect float inputs.
 example that demonstrates implicit conversion between color type and float type, since*Math*node expects float inputs.
## Compositing Space
### Image Domain
 compositor is designed in such way as to allow compositing in infinite compositing space. Consequently, images are not only represented by their size, but also by their transformation in that space, much like 3D objects have transformations. identity transformation represents image that is centered in space. rectangular area occupied by image in that space as defined by its transformation and size is called *Domain*of image. figure below demonstrates domains of two example images.
 domains of two example images are illustrated on compositing space. One of images is centered in space and other is scaled down and translated such that it lies in upper right quadrant of space. Notice that both images have similar sizes in pixels, yet their apparent sizes are different.
Images can be transformed using nodes like Transform , Translate , and Rotate nodes.
### Operation Domain
Compositor Nodes operate on specific rectangular area of compositing space called *Operation Domain*. nodes only consider area of input images that overlap operation domain and ignores rest of images. If input image doesn’t completely overlap operation domain, rest of operation domain for that input will be assumed to be zero value, zero vector, or transparent zero color depending on type.
For instance, figure below illustrates case where operation domain of node is large blue area and domain of input image is small red area. In that case, input image doesn’t completely overlap operation domain, so rest of blue area for that input image is assumed to be zero.
 example case where operation domain of node is shown in blue and domain of input image is shown in red. Since input image doesn’t completely cover operation domain of node, rest of blue area for that input image is assumed to be zero.
 previous illustration is representation of real world example where one uses Alpha Over node to overlay small logo on image, as shown in figure below. In that case, operation domain covers entirety of viewport — as will later be demonstrated, but logo covers only small area of it, so rest of area is assumed to be zero transparent color, which is convenient for use case.
 real world example where Alpha Over node is used to over small logo on image. logo only covers small area of operation domain, which is whole viewport in this case, so rest of area is assumed to be zero transparent color.
#### Interpolation
If input image to node is not perfectly aligned with operation domain of node or have different size in pixels, node would typically need to do process called Interpolation, where input image is read at exact positions of pixels of operation domain. This can be done using different interpolation methods, including Nearest-Neighbor, Bilinear, and Bicubic interpolations. Those interpolation methods are demonstrated in following Wikipedia gallery . Transformation nodes like Transform and Rotate nodes include interpolation option to set how they prefer their output image to be read and interpolated.
#### Determining Operation Domain
 question remains on how nodes determine their operation domain. Different node types can have different mechanisms for determining their operation domain. But , three classes of nodes exist when it comes to mechanism of determining operation domain, each of which is presented in one of following sections. Input Nodes
 operation domain of input nodes like Image node is domain with identity transformation and same size as their outputs, so for *Image*node, operation domain will be domain whose size is size of image and whose transformation is identity one. Output Nodes
 operation domain of output nodes like Viewer node is domain with identity transformation and same size as final compositor output. For viewport compositing , that size would be viewport size, and for final render compositing, that size would be scene render size. Other Nodes
Unless stated otherwise in their respective documentation pages, all other nodes use following mechanism. One of inputs of nodes is designated as *Domain Input*of node, and operation domain of node is identical to domain of that designated input. For many nodes, domain input can be intuitively identified as main input of node, for instance, domain input for Filter node is *Image*input. But there are some caveats to note, which requires deeper understanding of mechanism.
Each input in node has so called *Domain Priority*property, operation domain of node is domain of non single value input with highest domain priority. So for instance, Filter node has two inputs, domain priority of *Image*input is higher than that of *Factor*input, and there are four possible configurations:
- Both *Image*and factor inputs are connected to images. In this case, *Image*input is domain input because it has highest priority and is connected to image.
- *Image*input is connected to image, but *Factor*input isn’t. In this case, *Image*input is domain input because it is only input connected to image regardless of its priority.
- *Image*input is not connected to image but *Factor*input is. In this case, *Factor*input is domain input because it is only input connected to image regardless of its priority.
- Neither *Image*nor *Factor*inputs are connected to images, in this case, there isn’t domain input because node is evaluated on single values.
#### Considerations
 aforementioned mechanism for determining operation domain has number of consequences that needs to be considered as they might be undesirable, each of which is presented in one of following sections. Clipping
 output of nodes will be intuitively clipped to operation domain, or rather, domain of domain input. For instance, if *Foreground*input is bigger than *Background*input in Alpha Over node , output will be clipped to *Background*input because it is domain input, as shown in following figure.
 *Foreground*input is bigger than *Background*input in *Alpha Over*node, so output is intuitively clipped to *Background*input because it is domain input.
 Alpha Over node currently does not support changing domain priority for its inputs, so as workaround, one can use Mix node to achieved desired behavior, noting that first *Image*input in *Mix*node has highest domain priority, as shown in following figure.
Working around clipping behavior of *Alpha Over*node using Mix node, noting that first *Image*input in *Mix*node has highest domain priority
## Output
 compositor only supports single active output target, that is, only one of Group Output nodes or Viewer nodes in node tree will be considered active and rest will be ignored. In particular, compositor searches *Active Node Tree Context*and falls back to *Root Node Tree Context*if no active output was found in active node tree context. active node tree context is node tree of expanded node group, that is, when user selects node group node and edits its underlying tree, while root node tree context is top level node tree without any expanded node groups.
 compositor searches for active *Group Output*node, if none was found, it searches for active *Viewer*node. If none was found, compositor doesn’t run altogether. Consequently, note that adding *Viewer*node will have no effect on viewport render if there is *Group Output*node, since priority is given to *Group Output*nodes.
- Compositor System
- Data
- Dimensionality
- Type
- Implicit Conversion
- Compositing Space
- Image Domain
- Operation Domain
- Interpolation
- Determining Operation Domain
- Input Nodes
- Output Nodes
- Other Nodes
- Considerations
- Clipping
- Output