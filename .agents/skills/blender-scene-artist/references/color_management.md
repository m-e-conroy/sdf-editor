# Color Management

# Displays and Views
## Overview
To display image, it must be converted from scene linear to display color space. This involves both technical and artistic choices.
 technical choice of display color space depends on target display device and its capabilities. sRGB works for all computer displays, but different choices may be made for digital cinema, HD TVs, and computers with wide gamut or HDR support.
Because display devices cannot display full spectrum of colors and only have limited brightness, colors must be fitted to gamut of device. Blender includes choice of views , each resulting in different look.
Further artistic choices can be made with color management settings like exposure and white balance, and color grading in compositor. .
Conversion from linear to display device space.
## Displays
 color space of display that images and video are being created for.
Regular compute displays support sRGB, and most images and videos are stored in this color space. However moderns displays often support wider gamut and high dynamic range content.
**Standard Dynamic Range (SDR)**
**sRGB :**Basic display supported everywhere.**Display P3 :**Wide gamut for Apple devices and other modern displays.**Rec.1886 :**Used by many older TVs.**Rec.2020 :**Even wider gamut than P3 supported by some displays.**High Dynamic Range (HDR)**
**Rec.2100 PQ :**For HDR displays with Rec.2020 wide gamut, up to 10000 nits.**Rec.2100 HLG :**For HDR TVs with Rec.2020 wide gamut, up to 1000 nits.
### Wide Gamut
Select “Display P3” or “Rec.2020” display to view wide gamut colors.
This should be used in conjunction with “ACEScg” or “Linear Rec.2020” working space for materials, lights, rendering and compositing.
Requirements:
- P3 or Rec.2020 capable monitor.
- macOS: Any Apple Silicon device.
- Linux: Use Wayland, and set Vulkan backend in Blender system preferences.
- Windows: Enable “Automatically manage color for apps” in Windows display settings, and set Vulkan backend in Blender system preferences.
### High Dynamic Range
Select “Rec.2100 PQ” or “Rec.21000 HLG” display to view high dynamic range (HDR) colors.
With standard dynamic range (SDR), views must significantly lower bright colors to fit within range. With high dynamic range it is possible to go beyond and more accurately display scene. HDR displays have limits too, and there are separate views for 500, 1000, 2000 and 4000 nits to target displays with different maximum luminance.
In Blender, HDR content automatically scales up and down along with display brightness. Seeing full range often requires lowering display brightness, to make enough headroom above SDR white.
Requirements:
- HDR capable monitor.
- macOS: Any Apple Silicon device.
- Linux: Use Wayland, and set Vulkan backend in Blender system preferences.
- Windows: Enable “Use HDR” in Windows display settings, and set Vulkan backend in Blender system preferences.
### Display Emulation**Automatic :**Display images consistent with most other applications, to preview images and video for export. best effort is made to emulate chosen display on actual display device.**Off :**Directly output image as produced by OpenColorIO. This is not correct in general, but may be used when system configuration and actual display device is known to match chosen display.
Emulation is not supported with older OpenColorIO configurations .
## Views
These are different ways to view image on same display.**Standard :**Does no extra conversion besides conversion for display. Often used for non-photorealistic results or video editing where specific look is already baked into input video.**ACES 1.3 :**ACES view transforms, widely used standard in film and TV production. Suitable for photorealistic results.**ACES 2.0 :**Version 2.0 of ACES view transform, with more neutral look. It features less aggressive tone scale with reduced mid-tone contrast and gentler highlight rolloff, and improve gamut mapping.**Khronos PBR Neutral :**tone mapping transform designed specifically for PBR color accuracy, to get sRGB colors in output render that match as faithfully as possible input sRGB base color in materials, under gray-scale lighting. This is aimed toward product photography use cases, where scene is well-exposed and HDR color values are mostly restricted to small specular highlights.**AgX :**tone mapping transform that improves on*Filmic*, giving more photorealistic results. AgX offers 16.5 stops of dynamic range and desaturates highly exposed colors to mimic film’s natural response to light.
**Filmic :**tone mapping transform designed to handle high dynamic range colors. Filmic is deprecated and is superseded by AgX which improves handling of saturated colors.**Filmic Log :**Converts to Filmic log color space. This can be used for export to color grading applications, or to inspect image by flattening out dark and light areas.**False Color :**Shows heat map of image intensities, to visualize dynamic range, and help properly expose image.
Below is table that represents how normalized linear color data is represented with False Color.
Luminance Value
Color
Low Clip
Black
0.0001% to 0.05%
Blue
0.05% to 0.5%
Blue-Cyan
0.5% to 5%
Cyan
5% to 16%
Green-Cyan
16% to 22%
Gray
22% to 35%
Green-Yellow
35% to 55%
Yellow
55% to 80%
Orange
80% to 97%
Red
High Clip
White**Raw :**Intended for inspecting image but not for final export. Raw gives image without any color space conversion.
### Look
Choose artistic effect from set of measured film response data which roughly emulates look of certain film types. Applied before color space conversion.
### Exposure
Used to control image brightness (in stops) applied before color space conversion. It is calculated as follows: \(output\_value = render\_value × 2^{(exposure)}\)
### Gamma
Extra gamma correction applied after color space conversion. Note that default display transforms already perform appropriate conversion, so this mainly acts as additional effect for artistic tweaks.
### Curves
Adjust RGB Curves to control image colors before color space conversion. Read more about using Curve Widget .
### White Balance
Adjusts colors so that given white point (expressed in color temperature and tint) ends up as white on display.
As alternative to manually specifying values, there’s also color picker. When color is selected, temperature and tint are set such that this color ends up being balanced to white. This only works if color is close enough to blackbody emitter.
White balancing can also be accomplished as part of compositing pipeline by using Color Balance Node**Temperature**blackbody temperature of primary illuminant. By default D65 white point is used.**Tint**amount of green/magenta shift of blackbody curve.
Blackbody temperature curve.
## Images
### Display
By default, only renders are displayed and saved with render*View*applied. These images are “Render Result” and “Viewer” image data-blocks, and files saved directly to disk with Render Animation operator. However, when loading render saved to intermediate OpenEXR file, Blender cannot detect automatically that this is render (it could be e.g. image texture or displacement map). We need to specify that this is render and that we want transformations applied, with following settings.
**View as Render**Display image data-block (not only renders) with view, exposure, gamma, RGB curves applied. Useful for viewing rendered frames in linear OpenEXR files same as when rendering them directly.
### Output
For file saving equivalent option exists.**Save as Render**Option in image save operator to apply view, exposure, gamma, RGB curves. This is useful for saving linear OpenEXR to e.g. PNG or JPEG files in display space.
Wide gamut images can be written in following file formats: PNG, JPEG, WebP, AVIF, TIFF and JPEG 2000.
HDR images can be written as AVIF or PNG files. They are written with 203 nits diffuse white to match convention in most browsers and image viewers.
## Video
### Output
Videos can be rendered with both wide gamut and HDR color spaces. They use scene display by default, but can also be assigned different color space by overriding color management settings in output properties.
Saving HDR videos has few additional requirements:
- Set color management display to Rec.2100 PQ or HLG
- Set codec to H.265 or AV1
- Set bit depth to 10 or 12
Video players and devices have different levels of support for HDR video. Bit depth 10 with PQ encoding is good default choice to maximize compatibility.
HDR videos are written with 100 nits diffuse white, to match convention in most video players and browsers.
- Displays and Views
- Overview
- Displays
- Wide Gamut
- High Dynamic Range
- Display Emulation
- Views
- Look
- Exposure
- Gamma
- Curves
- White Balance
- Images
- Display
- Output
- Video
- Output

---

# Color Spaces
## Linear Workflow
Different Color Spaces are needed for rendering, display and storage of images.
Rendering and compositing is best done in*scene linear*color space, which corresponds more closely to nature, and makes computations more physically accurate. Blender primarily works with scene linear colors for materials, lighting, geometry and compositing.
However, these values do not directly correspond to human perception or way display devices work. Image files are also often stored in different color spaces for more efficient compression.
For correct linear workflow, it is important to assign correct color spaces for images and displays. Blender will then perform conversion to and from scene linear colors.
 example of linear workflow.
## Working Space
Reference
**Editor :**Properties**Panel :**Render Properties ‣ Color Management ‣ Working Space**File**Color space used for all scene linear colors in this file, and for shader, compositing and geometry nodes processing. default is Linear Rec.709, while Linear Rec.2020 and ACEScg are available for working with wider gamut of colors and compatibility with ACES workflows.
 working space affects colors of all data-blocks in file, and has significant effect on rendering and compositing results. working space should be chosen at start of project and used for all blend files.
Blender can convert between different working spaces, however this is only approximation and manual fix-ups are typically needed. When linking and appending data-blocks, colors are automatically converted to match current file.**Sequencer**color space that Sequencer operates in. By default, Sequencer operates in sRGB space, but it can also be set to work in Linear space like Compositing nodes, or another color space. Different color spaces will give different results for color correction, crossfades, and other operations.
 default supported color spaces are described in Built-in Color Spaces .
## Images and Video
When working with image and video files, Blender will automatically try to guess right color space. If this is not correct, color space of image file can be configured in image settings.
 common situation where manual changes are needed is when working with or baking normal maps and displacement maps. Such maps do not store colors, data encoded as colors. Those images should be marked as*Non-Color Data*.
For intermediate image files in production, it is recommended to use *OpenEXR*files. These are always stored in scene linear color spaces, with high precision to avoid data loss. That makes them suitable to store renders that can later be composited, color graded and converted to different output formats.
## Built-in Color Spaces
Blender’s OCIO configuration file is equipped by default to read/write files in these color spaces
### Display
Color spaces for displays and image files.
**sRGB :**Standard RGB display space using Rec. 709 chromaticities and D65 white point.**Rec.2020 :**BT.2020 2.4 Exponent EOTF Display.**Rec.1886 :**BT.1886 2.4 Exponent EOTF Display, commonly used for TVs.**Display P3 :**Apple’s Display P3 with sRGB compound (piece-wise) encoding transfer function, common on Mac devices.**Rec.2100 PQ :**For high dynamic range images and video with Rec.2020 wide gamut, up to 10000 nits.**Rec.2100 HLG :**For high dynamic range images and video with Rec.2020 wide gamut, up to 1000 nits.
### Linear
Color spaces commonly used for OpenEXR files.**Working Space :**linear working space of current blend file, that is used by default in compositing, shader and geometry nodes.**Linear Rec.709 :**Linear BT.709 chromaticities with illuminant D65 white point.**Linear Rec.2020 :**Linear BT.2020 with illuminant D65 white point.**ACEScg :**ACES color space that is designed to be used for rendering and compositing. It uses AP1 color primaries, D60 white point, and linear transfer function. standard working space in ACES workflows.**ACES2065-1 :**ACES color space using AP0 color primaries, D60 white point and linear transfer function. This color space is meant to store and transfer data, preserving most information possible. Commonly used for delivery and archival in ACES workflows.**Linear FilmLight E-Gamut :**Linear E-Gamut with illuminant D65 white point.**Linear DCI-P3 D65 :**Linear DCI-P3 with illuminant D65 white point.**Linear CIE-XYZ E :**1931 CIE XYZ standard with assumed illuminant E white point.**Linear CIE-XYZ D65 :**1931 CIE XYZ with adapted illuminant D65 white point.
### Other**Non-Color :**Generic data that is not color, will not apply any color transform (e.g. normal maps or displacement maps).**Working Space :**Uses File color space defined in scene’s color management settings.
### Log**ACEScc :**ACES color correction space, using AP1 primaries.**ACEScct :**ACES color correction space with toe, using AP1 primaries.**AgX Log :**Intermediate log color space of AgX view transform.**Filmic Log :**Intermediate log color space of Filmic view transform.
### Utilities
Color spaces corresponding to view transforms. These color spaces can be used for background images that should not be affected by view transform, while everything else in scene is affected.**ACES 1.3 sRGB :**ACES 1.3 view transform**ACES 2.0 sRGB :**ACES 2.0 view transform**AgX Base sRGB :**AgX view transform**Filmic sRGB :**Filmic view transform**Khronos PBR Neutral sRGB :**Khronos PBR Neutral view transform
- Color Spaces
- Linear Workflow
- Working Space
- Images and Video
- Built-in Color Spaces
- Display
- Linear
- Other
- Log
- Utilities

---

# OpenColorIO
Blender comes with standard OpenColorIO configuration that contains number of useful display devices and view transforms.
However, OpenColorIO is also designed to give consistent user experience across multiple applications , and for this, single shared configuration file can be used. Blender will use standard `OCIO `environment variable to read OpenColorIO configuration other than default Blender one. More information about how to set up such workflow can be found on OpenColorIO website .
There is also `BLENDER_OCIO `environment variable to change configuration for Blender only. It is recommended to use `OCIO `when possible for compatibility with other software and pipelines that may not be aware of `BLENDER_OCIO `. However sometimes there are incompatibilities in configuration files that make it difficult to share them across applications.
## ACES
 standard Blender configuration includes essential support for ACES workflows with ACEScg working space, ACES 2.0 view transform and OpenEXR images saved in ACES2065-1 and ACEScg color spaces.
This covers most needs for working in ACES pipeline. However for more complete support, official ACES configurations can be manually installed and set through `OCIO `environment variable.
## Roles**`scene_linear `**Color space used for rendering, compositing, and storing all float precision images in memory.**`data `**Color space for non-color data.**`aces_interchange `**ACES2065-1 color space. Used to derive chromaticities of*scene_linear*color space, for effects such as blackbody emission.
**`cie_xyz_d65_interchange `**Intermediate display linear color space, to connected view transforms to display color spaces.**`color_picking `**Defines distribution of colors in color pickers. It is expected to be approximately perceptually linear, have same gamut as*scene_linear*color space, map 0..1 values to 0..1 values in scene linear color space for predictable editing of materials’ albedo.
**`default_sequencer `**Default color space for Sequencer,*scene_linear*if not specified.
**`default_byte `**Default color space for byte precision images and files,*texture_paint*if not specified.
**`default_float `**Default color space for float precision images and files,*scene_linear*if not specified.
## Writing Configurations for Blender
OpenColorIO configurations do not strictly specify all information needed for Blender to work optimally. These guidelines help ensure configuration works well:
- Use OpenColorIO v2 `display_colorspaces `and `view_transforms `with `cie_xyz_d65_interchange `intermediate display linear space. This is used to emulate chosen display on actual display. In older configs without this, display emulation will be disabled and wide gamut and HDR display will not work well. Saving colorspace metadata for images and video also depends on this.
- For every display, include view transform without tone mapping. Blender will look for view transform named `Standard `or `Un-tone-mapped `or config wide `default_view_transform `. If not found, first view transform of display will be used. This is more important for OpenColorIO v1 configs without `display_colorspaces `, to determine color space of image after applying view transform.
- Include interop ID from Color Interop Forum for every color space and display color space that you can. This helps save image and video with correct colorspace information. Add interop ID as alias of colorspace. For OpenColor 2.5 configs, additionally set native `interop_id `attribute where possible.
- `icc_profile_name `interchange attribute is supported, to embed ICC profiles when saving images.
- Mark HDR displays by setting `encoding: hdr-video `on corresponding colorspace.
- For HDR view transforms, use `HDR 500 nits `, `HDR 1000 nits `, `HDR 2000 nits `or `HDR 4000 nits `as part of name to automatically determine maximum luminance for mastering display metadata.
- OpenColorIO
- ACES
- Roles
- Writing Configurations for Blender