# Camera Reference

# Cameras

camera is object that provides means of rendering images from Blender. It defines which portion of scene is visible in rendered image.
Cameras are invisible in renders, so they do not have any material or texture settings. However, they do have *Object*and *Editing*setting panels available which are displayed when camera is active object.
See also
3D Viewport Camera Navigation for documentation about managing cameras in viewport.

## Properties

Reference
**Mode :** Object Mode
**Editor :** Properties ‣ Camera

### Lens

Type
camera lens options control way 3D objects are represented in 2D image.**Perspective** This matches how you view things in real world. Objects in distance will appear smaller than objects in foreground, and parallel lines (such as rails on railroad) will appear to converge as they get farther away.**Focal Length/Field of View** Focal Length controls amount of zoom, i.e. amount of scene which is visible all at once. Longer focal lengths result in smaller FOV (more zoom), while short focal lengths allow you to see more of scene at once (larger FOV , less zoom).

Perspective camera with 35 mm focal length.
Perspective camera with 210 mm focal length instead of 35 mm. **Lens Unit** focal length can be set either in terms of millimeters or actual Field of View as angle.
Hint
While camera is moving towards object*Focal Length*property can be decreased to produce *Dolly Zoom*camera effect, or vice versa.
This video demonstrates *Dolly Zoom*camera effect.
**Orthographic** With _Orthographic_ perspective objects always appear at their actual size, regardless of distance. This means that parallel lines appear parallel, and do not converge like they do with _Perspective_.
Render from same camera angle as previous examples, but with orthographic perspective.
**Orthographic Scale** This controls apparent size of objects projected on image.
Note that this is effectively only setting which applies to orthographic perspective. Since parallel lines do not converge in orthographic mode (no vanishing points), lens shift settings are equivalent to translating camera in 3D Viewport. **Panoramic** Cycles Only
This type covers variety of panoramic projections. See Cycles panoramic camera settings for more information.**Custom** Cycles Only
Custom cameras enable user-defined behavior through use of OSL code. See Cycles custom camera documentation for more information.**Shift** Allows for adjustment of*vanishing points*. *Vanishing points*refer to positions to which parallel lines converge. In these render examples, most obvious vanishing point is at end of railroad.
Horizontal lens shift of 0.330.
Rotation of camera object instead of lens shift.

Notice how horizontal lines remain perfectly horizontal when using lens shift, but do get skewed when rotating camera object.
Note
Using lens shift is equivalent to rendering image with larger FOV and cropping it off-center.
**Clip Start and End** interval in which objects are directly visible. Any objects outside this range still influence image indirectly, as further light bounces are not clipped.
Note
For viewport rendering, setting clipping distances to limited values is important to ensure sufficient rasterization precision. Ray tracing renders do not suffer from this issue so much, and as such more extreme values can safely be set.
Tip
When*Limits*in *Viewport Display*panel is enabled, clip bounds will be visible as two yellow connected dots on camera’s line of sight.
See also

- 3D Viewport clipping

### Depth of Field

Real-world cameras transmit light through lens that bends and focuses it onto sensor. Because of this, objects that are certain distance away are in focus, but objects in front and behind that are blurred.
Example of DOF bokeh effect.
area in focus is called *focal point*and can be set using either exact value, or by using distance between camera and chosen object:
**Focus Object** Choose object which will determine focal point. Linking object will deactivate distance parameter. **Focal Distance** Sets distance to focal point when no*Focus Object*is specified. This distance can be visualized in 3D Viewport by enabling *Limits*in camera’s Viewport Display panel.

Hint
Use eyedropper icon or hover mouse over *Focal Distance*property and press E to enable depth _Depth Picker_. Then LMB on point in 3D Viewport to sample distance from that point to camera.

#### Aperture

**F-Stop** F-Stop ratio that defines amount of blurring. Lower values give strong depth of field effect. **Blades** Total number of polygonal blades used to alter shape of blurred objects in render, and render preview. As with viewport, minimum amount of blades to enable bokeh effect is 3, resulting in triangular-shaped blur. **Rotation** Rotate polygonal blades along facing axis, and will rotate in clockwise, and counter-clockwise fashion. **Ratio** Change amount of distortion to simulate anamorphic bokeh effect. setting of 1.0 shows no distortion, where number below 1.0 will cause horizontal distortion, and higher number will cause vertical distortion.

### Camera

These settings adjusts properties that relate to physical camera body. Several Presets can be chosen to match real-world cameras. **Sensor Fit** Adjusts how camera’s sensor fits within outputs dimension adjusting angular field of view. **Auto :** Calculates square sensor size based on larger of Resolution dimensions. **Horizontal :** Manually adjust*Width*of sensor, *Height*is calculated based on aspect ratio of output’s Resolution .
**Vertical :** Manually adjust*Height*of sensor, *Width*is calculated based on aspect ratio of output’s Resolution .
**Size / Width, Height** This setting is alternative way to control field of view, as opposed to modifying focal length. It is useful to match camera in Blender to physical camera and lens combination, e.g. for motion tracking .

### Safe Areas

Safe areas are guides used to position elements to ensure that most important parts of content can be seen across all screens.
Different screens have varying amounts of Overscan (especially older TV sets). That means that not all content will be visible to all viewers, since parts of image surrounding edges are not shown. To work around this problem TV producers defined two areas where content is guaranteed to be shown: action safe and title safe.
Modern LCD/plasma screens with purely digital signals have no Overscan , yet safe areas are still considered best practice and may be legally required for broadcast.
In Blender, safe areas can be set from Camera and Sequencer views.
Red line: Action safe. Green line: Title safe.
Safe Areas can be customized by their outer margin, which is percentage scale of area between center and render size. Values are shared between Video Sequence editor and camera view. **Title Safe Margins X/Y** Also known as*Graphics Safe*. Place all important information (graphics or text) inside this area to ensure it can be seen by majority of viewers.
**Action Safe Margins X/Y** Make sure any significant action or characters in shot are inside this area. This zone also doubles as sort of “margin” for screen which can be used to keep elements from piling up against edges.
Tip
Each country sets legal standard for broadcasting. These include, among other things, specific values for safe areas. Blender defaults for safe areas follow EBU (European Union) standard. are using correct values when working for broadcast to avoid any trouble.

#### Center-Cut Safe Areas

Center-cuts are second set of safe areas to ensure content is seen correctly on screens with different aspect ratio. Old TV sets receiving `16:9 `or `21:9 `video will cut off sides. Position content inside center-cut areas to make sure most important elements of your composition can still be visible in these screens.
Blender defaults show `4:3 `(square) ratio inside `16:9 `(widescreen).
Cyan line: action center safe. Blue line: title center safe.

### Background Images

background picture in your camera can be helpful in many situations: modeling is obviously one, but it is also useful when painting (e.g. you can have reference pictures of faces when painting textures directly on your model…), or animation (when using video as background), etc.**Background Source** source of background image.**Image :** Use external image, image sequence, video file or generated texture.**Movie Clip :** Use one of Movie Clip data-blocks.**Active Clip** Display Movie Clip from scene’s Active Clip .**Render Undistorted** Display background image using undistorted proxies when available.**Proxy Render Size** Select between full (non-proxy) display or proxy size to draw background image.
See also
To build proxy, Movie Clip Editor Proxy settings have to be used. Otherwise proxy settings here have no effect.**Color Space** color space image or video file uses within Blender.**View as Render** Apply color management settings when displaying this image on screen.**Opacity** Controls transparency of background image.**Depth** Choose whether image is shown behind all objects, or in front of everything.**Frame Method** Controls how image is placed in camera view.**Stretch :** Forces image dimensions to match camera bounds (may alter aspect ratio).**Fit :** Scales image down to fit inside camera view without altering aspect ratio.**Crop :** Scales image up so that it fills entire camera view, but without altering aspect ratio (some of image will be cropped).**Offset X, Y** Positions background image using these offsets.
In orthographic views, this is measured in normal scene units. In camera view, this is measured relative to camera bounds (0.1 will offset it by 10% of view width/height).**Rotation** Rotates image around its center.**Scale** Scales image up or down from its center.**Flip**
**X** Swaps image around, such that left side is now on right, and right now on left.**Y** Swaps image around, such that top side is now on bottom, and bottom now on top.
Note
Movie Clips or images with view as render are only visible behind objects when film transparency is enabled or scene world is disabled in viewport.

### Viewport Display

Camera view displaying safe areas, sensor and name.**Size** Size of camera visualization in 3D Viewport. This setting has **no** effect on render output of camera. camera visualization can also be scaled using standard Scale S transform key.**Show**
**Limits** Shows orange line indicating*Clip Start*and *End*values, as well as yellow cross indicating _Focus Distance_. If *Focus Distance*gizmo is enabled in 3D Viewport’s gizmo settings , this cross can also be dragged with mouse to adjust distance.
**Mist**
**Sensor** Displays dotted frame in camera view.**Name**
**Passepartout** This option darkens area outside of camera’s field of view. opacity of passepartout can be adjusted using value slider.
Tip
If Passepartout is fully opaque, Blender will make optimizations to speed up rendering of areas inside camera view.

#### Composition Guides*Composition Guides*enable overlays onto camera display that can help when framing shot.

**Thirds** Adds lines dividing frame in thirds vertically and horizontally.**Center**
**Center** Adds lines dividing frame in half vertically and horizontally.**Diagonal** Adds lines connecting opposite corners.**Golden**
**Ratio** Divides width and height into Golden proportions (about 0.618 of size from all sides of frame).**Triangle** Displays diagonal line from lower left to upper right corners, then adds perpendicular lines that pass through top left and bottom right corners.**Triangle B**Same as , but with opposite corners.**Harmony**
**Triangle** Displays diagonal line from lower left to upper right corners, then lines from top left and bottom right corners to 0.618 lengths of opposite side.**Triangle B** Same as , but with opposite corners.**Color**
Sets display color and opacity (alpha) used for all composition guide overlays. Useful for adjusting visibility depending on brightness or contrast of underlying shot.

- Cameras
- Properties
- Lens
- Depth of Field
- Aperture
- Camera
- Safe Areas
- Center-Cut Safe Areas
- Background Images
- Viewport Display
- Composition Guides
