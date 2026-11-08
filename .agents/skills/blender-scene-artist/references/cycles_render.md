# Cycles Render Settings

# Introduction
Cycles is Blender’s physically-based path tracer for production rendering. It is designed to provide physically based results out-of--box, with artistic control and flexible shading nodes for production needs.
To use Cycles, select it as *Render Engine*in Render properties. For GPU accelerated rendering , enable compatible devices in Preferences ‣ System ‣ Cycles Render Devices .
See also
 Cycles website with more information and gallery.

---

# Sampling
Reference
**Panel :**Render ‣ Sampling
Sampling is process of tracing rays from camera into scene and bouncing them around until they reach light source such as Light object, emissive mesh, or world background. algorithm for this is known as integrator.**Viewport (Max) Samples**number of paths to trace per pixel in 3D Viewport (when using*Rendered*shading mode ). Setting this value to zero enables indefinite sampling.
**Render (Max) Samples**number of paths to trace per pixel in final render. higher number results in cleaner image at cost of longer render time.**Time Limit**Stops rendering if time exceeds limit, even if desired sample count hasn’t been reached yet. Setting this value to zero disables limit.
Note
 time limit does not include pre-render processing time, only render time.
## Adaptive Sampling
If*Noise Threshold*checkbox is enabled, Cycles will use adaptive sampling, cutting short sampling process in areas that have become less noisy than specified threshold value – in other words, not wasting time further refining areas that already look good enough. For example, hair on character may need many samples, but background may only need few.
**Noise Threshold**threshold to decide whether to continue sampling pixel. Typical values are in range from 0.1 to 0.001, with lower values meaning better quality but longer render times. Setting this to 0 makes Cycles guess automatic value based on total sample count.**Min Samples**minimum number of samples pixel receives before adaptive sampling is applied. When set to 0 (default), Cycles automatically picks value determined by*Noise Threshold*.
## Denoising
Denoising uses specialized algorithm to get less noisy image without requiring more samples.
See also
If you enable *Denoising Data*render pass , you can alternatively denoise in compositing step using Denoise Node .
**Denoise (Viewport)**Whether to perform denoising for 3D Viewport in*Rendered*shading mode.
**Denoise (Render)**Whether to perform denoising for final rendered image.**Denoiser**algorithm to use.**Automatic :**Uses GPU accelerated denoising if supported, for best performance. Prefers OpenImageDenoise over OptiX.**OpenImageDenoise :**Uses Intel’s Open Image Denoise , AI denoiser. Typically provides highest quality.**OptiX :**Uses NVIDIA’s OptiX AI denoiser. Supports GPU acceleration on some older NVIDIA GPUs where OpenImageDenoise does not.
Only available on NVIDIA GPUs when configured in Cycles Render Devices user preferences.**Passes**Controls which Render Passes denoiser should use as input. , more passes denoiser has access to, better result. It is recommended to use at least*Albedo*as *None*can blur out details, especially at lower sample counts.
**None :**Denoises image using color data.**Albedo :**Denoises image using color and albedo data.**Albedo + Normal :**Denoises image using color, albedo, and normal pass data.**Prefilter OpenImageDenoise**Controls whether prefiltering is applied to*Passes*before denoising. Visible only when using *OpenImageDenoise*.
**None :**Does not apply any prefiltering to input passes. This option retains most detail and is fastest, but assumes input passes are noise free which may require high sample count. If input passes aren’t noise free, then noise will remain in image after denoising.**Fast :**Assumes input passes are not noise free, yet does not apply prefiltering to input passes. This option is faster than*Accurate*but produces blurrier result.
**Accurate :**Prefilters input passes before denoising to reduce noise. This option usually produces more detailed results than*Fast*, but with increased processing time.
**Quality OpenImageDenoise**Overall denoising quality. Visible only when using*OpenImageDenoise*.
**High :**Produces highest quality at cost of time.**Balanced :**Balanced between performance and quality.**Fast :**Sacrifices quality for speed (ideal for viewport rendering).**Start Sample**Sample at which to start denoising in 3D Viewport.**Use GPU**Perform denoising on GPU. This is significantly faster than on CPU, but requires additional GPU memory. When large scenes need more GPU memory, this option can be disabled.
See GPU Rendering for details on supported GPUs.
## Path Guiding
Path guiding helps reduce noise in scenes where finding path to light source is difficult for regular path tracing, for example when room is lit through small door opening. Important light directions are learned over time, improving as more samples are taken.
Note
- Path guiding is only available when rendering on CPU.
- While path guiding helps render caustics in some scenes, it is not designed for complex caustics as they are harder to learn and guide.
See also
Portals Area Lights to guide path tracing manually.**Training Samples**maximum number of samples to use for training. value of 0 will keep training until end of render. Usually 128 to 256 training samples is enough for accurate guiding. Higher values can lead to minor increases in guiding quality but with increased render times.**Surface**Enable path guiding for diffuse and glossy components of surfaces.**Volume**Enable path guiding inside volumes.
## Lights**Light Tree**Use light tree to more effectively sample lights in scene, taking into account distance and estimated intensity. This can significantly reduce noise, at cost of somewhat longer render time per sample.
Certain lighting properties are not accounted for in light tree. This includes custom falloff, ray visibility, and complex shader node setups including textures. This can result in increase in noise in some scenes that make use of these features.**Light Threshold**Probabilistically terminates light samples when light contribution is below threshold. This avoids wasting time on lights that contribute little to image. Zero disables test.
## Advanced**Pattern**random sampling pattern used by integrator.**Automatic :**Use*Blue-Noise*(see below), but with tweak for viewport rendering to get better quality in first sample. This is useful for interactive changes (panning view, moving object…) where render is constantly restarting.
**Classic :**Use pre-computed tables of Owen-scrambled Sobol for random sampling.**Blue-Noise :**Use blue-noise pattern, which optimizes frequency distribution. If full number of samples is rendered, output typically appears smoother than*Classic*despite not reducing overall noise.
**Seed**Seed value for integrator to get different noise patterns.**Use Animated Seed**Changes seed for each frame. It is good idea to enable this when rendering animations because varying noise pattern is less noticeable.**Scrambling Distance**technique that reduces randomness between pixels in attempt to improve GPU rendering performance, at cost of potential artifacts. Not compatible with*Blue-Noise*sampling pattern.
**Automatic**Adapts scrambling distance based on sample count.**Viewport**Uses*Scrambling Distance*adjustment for viewport rendering. This will make rendering faster but may cause flickering.
**Multiplier**multiplier for scrambling distance. Values below one will reduce distance, having potential to improve GPU rendering performance but increase visibility of artifacts.**Min Light Bounces**Minimum number of light bounces for each path, after which integrator uses Russian Roulette to terminate paths that contribute less to image. Setting this higher gives less noise, but may also increase render time considerably. For low number of maximum bounces , it is strongly recommended to set this minimum to same value.**Min Transparent Bounces**Minimum number of transparent bounces (more specifically “passthroughs”). Setting this higher reduces noise in first bounces, but can also be less efficient for more complex geometry like hair and volumes.**Layer Samples**If any view layers have Sample Overrides configured, this option specifies how to use them.**Use :**Allow view layers to override scene-level sample count.**Bounded :**Allow overrides as long as they don’t exceed scene-level sample count.**Ignore :**Ignore overrides.**Sample Subset**Only render subset of samples. Multiple subset renders can be combined into full one by running following in Python Console :
`bpy.ops.cycles.merge_images(input_filepath1=r"1.exr", input_filepath2=r"2.exr", output_filepath=r"combined.exr") `
 typical use case is to distribute rendering of single frame over multiple machines. Say you want to render 2048 samples in total, but split this work over two machines because doing it on one would take too long:
- On both machines, set*(Max) Samples*to 2048, disable *Denoise*, and enable *Sample Subset*.
- On first machine, set *Offset*to 0 and *Length*to 1024.
- On second machine, set *Offset*to 1024 and *Length*to 1024.
- Run 1024-sample render on each machine, then combine results as described above to get equivalent of single 2048-sample render.
**Offset**0-based index of first sample in subset.**Length**number of samples in subset. While this overrides*(Max) Samples*in terms of samples that will get rendered, it’s still important to set *(Max) Samples*to total number of samples that will be rendered across all subsets – otherwise, subsets will have incompatible noise and combining them will give worse result.
- Sampling
- Adaptive Sampling
- Denoising
- Path Guiding
- Lights
- Advanced

---

# Light Paths
Reference
**Panel :**Render ‣ Light Paths
## Ray Types
Ray types can be divided into four categories:
- Camera: ray comes straight from camera.
- Reflection: ray is generated by reflection off surface.
- Transmission: ray is generated by transmission through surface.
- Shadow: ray is used for (transparent) shadows.
Reflection and transmission rays can further have these properties:
- Diffuse: ray is generated by diffuse reflection or transmission (translucency).
- Glossy: ray is generated by glossy specular reflection or transmission.
- Singular: ray is generated by perfectly sharp reflection or transmission.
 Light Path node can be used to find out type of ray shading is being computed for.
See also
 object ray visibility settings.
## Bounce Control
 maximum number of light bounces can be controlled manually. While ideally this should be infinite, in practice smaller number of bounces may be sufficient, or some light interactions may be intentionally left out for faster convergence. number of diffuse reflection, glossy reflection and transmission bounces can also be controlled individually.
Light paths are terminated probabilistically when specifying minimum number of light bounces lower than maximum. In that case, paths longer than minimum will be randomly stopped when they are expected to contribute less light to image. This will still converge to same image, but renders faster while possibly being noisier.
## Transparency
 Transparent BSDF shader is given special treatment. Rays pass straight through it, changing neither direction nor type as if there were no geometry at all.
Alpha pass output is also different for transparent BSDF . Other transmission BSDFs are considered opaque, because they change light direction. As such they cannot be used for alpha-over compositing, while this is possible with transparent BSDF.
Note that, while semantically ray passes through as if no geometry was hit, rendering performance is affected as each transparency step requires executing shader and tracing ray.
## Settings
### Max Bounces**Total**Maximum number of light bounces. For best quality, this should be set to maximum. However, in practice, it may be good to set it to lower values for faster rendering. value of 0 bounces results in direct lighting only.**Diffuse**Maximum number of diffuse bounces.**Glossy**Maximum number of glossy bounces.**Transmission**Maximum number of transmission bounces.**Volume**Maximum number of volume scattering bounces.**Transparent**Maximum number of transparency bounces.
Note, maximum number of transparent bounces is controlled separately from other bounces. It is also possible to use probabilistic termination of transparent bounces, which might help rendering many layers of transparency.
### Clamping**Direct Light**This option limits maximum intensity sample from rays which have not yet bounced can contribute to pixel. It reduces noise at cost of accuracy. Setting this option to 0.0 disables clamping altogether. Lower have greater affect (dimmer samples) on resulting image than higher values.
Note
This option provides way to limit Fireflies . However, note that as you clamp out such values, other bright lights/reflections will be dimmed as well.
Care must be taken when using this setting to find balance between mitigating fireflies and losing intentionally bright parts. It is often useful to clamp indirect bounces separately, as they tend to cause more fireflies than direct bounces. See*Clamp Indirect*setting.
**Indirect Light**same as*Direct Light*, but for rays which have bounced multiple times.
### Caustics
 common source of noise is Caustics .
See also
See Reducing Noise for examples of clamp settings in use.
**Filter Glossy**When using value higher than 0.0, this will blur glossy reflections after blurry bounces, to reduce noise at cost of accuracy. 1.0 is good starting value to tweak.
Some light paths have low probability of being found while contributing much light to pixel. As result these light paths will be found in some pixels and not in others, causing Fireflies . example of such difficult path might be small light that is causing small specular highlight on sharp glossy material, which is observed through rough glossy material. In fact in such case there practically occurs caustic.
With path tracing it is difficult to find specular highlight, but if you increase roughness on material, highlight gets bigger and softer, and so easier to find. Often this blurring will hardly be noticeable, because it is blurred by material anyway, but there are also cases where this will lead to loss of detail in lighting.**Caustics**
**Reflective**While in principle path tracing supports rendering of caustics with sufficient number of samples, in practice it may be inefficient to point that there is too much noise. This option can be unchecked, to disable reflective caustics.**Refractive**same as above, but for refractive caustics.
### Fast GI Approximation
Reference**Panel :**Render ‣ Light Paths ‣ Fast GI Approximation
Approximate diffuse indirect light with background tinted ambient occlusion. This provides fast alternative to full global illumination (GI), for interactive viewport rendering or final renders with reduced quality.**Method**Fast GI approximation method.**Replace :**Replace global illumination with ambient occlusion after specified number of bounces.**Add :**Add ambient occlusion to diffuse surfaces.**AO Factor**strength of ambient occlusion.**AO Distance**Distance from shading point to trace rays. shorter distance emphasizes nearby features, while longer distances make it also take objects farther away into account.
This option can also be overridden per object in Object Properties , which is useful when you have both small and large scale objects in same scene.**Viewport Bounces**Replace global illumination with ambient occlusion after specified number of bounces when rendering in 3D Viewport. This can reduce noise in interior scenes with little visual difference.**Render Bounces**Number of bounces when rendering final renders.
- Light Paths
- Ray Types
- Bounce Control
- Transparency
- Settings
- Max Bounces
- Clamping
- Caustics
- Fast GI Approximation

---

# Film
Reference**Panel :**Render ‣ Film**Exposure**This can be used to change brightness of image. Different than*Exposure*option found in Color management panel, this exposure option works *on data*while Color management exposure is on *view transform*.
## Pixel Filter
Due to limited resolution of images and computer screens, pixel filters are needed to avoid Aliasing . This is achieved by slightly blurring image to soften edges.
**Type**Pixel Filtering algorithm to use.**Box :**No filter.**Gaussian :**Smooth filter.**Blackman-Harris :**Default filter with better balance between smoothness and detail preservation.**Width**Lower values give more crisp renders, higher values are softer and reduce aliasing.
## Transparent
Render background transparent, for compositing image over another background after rendering.**Transparent Glass**Render transmissive surfaces as transparent, for compositing glass over another background.**Roughness Threshold**For transparent glass, keep surfaces with roughness above threshold opaque.
- Film
- Pixel Filter
- Transparent

---

# Performance
Reference**Panel :**Render ‣ Performance
Properties that affect render speeds or memory consumption. There are several presets available to help choose between different trade offs:**Default :**Balances memory saving and faster rendering settings.**Faster Render :**Uses settings to render faster at cost of higher memory consumption.**Lower Memory :**Uses settings to decrease memory considered at cost of slower renders.
## Threads**Threads Mode**Method to determine maximum number of CPU cores to use while rendering.**Auto-Detect :**Automatically chooses amount of threads to match number of logical processors on your computer.**Fixed :**Manually choose maximum number threads to use for rendering. This can be useful for example, if you want to use your computer while rendering, you can set property to thread count lower amount of logical processors on your computer.**Threads**maximum number of CPU cores to use simultaneously while rendering.
## Memory**Tile Size**Render high resolution images in tiles of this size, to reduce memory usage. Tiles are cached to disk while rendering to save memory.
Note
In some cases changing*Tile Size*can result in increased performance. For example when small object renders slowly compared to other objects, using small *Tiles Size*can lead to increase in performance.
## Acceleration Structure
**Use Spatial Splits**Spatial splits improve rendering performance in scenes with mix of large and small polygons. downsides are longer BVH build times and slightly increased memory usage.**Use Curves BVH**Use special type of BVH for rendering curves. bounding boxes are not axis aligned allowing spatially closer fit to curve geometry. Disabling this option will reduce memory, at cost of increasing curve render time.**BVH Time Steps**Split BVH primitives by this number of time steps to speed up render time at expense of memory.**Use Compact BVH**Use more compact BVH structure, which can reduce RAM usage but render slower.
## Final Render**Persistent Data**Keep render data in memory after rendering for faster re-renders and animation renders at cost of extra memory usage while performing other tasks in Blender.
When using multiple View Layers , only data from single view layer is preserved to keep memory usage within bounds; however, objects shared between view layers are preserved.
## Viewport**Pixel Size**Option to control resolution for viewport rendering. Allows you to speed up viewport rendering, which is especially useful for displays with high DPI.
## Compositor**Device**device used for compositing.**CPU :**Use CPU for compositing.**GPU :**Use GPU for compositing.**Precision GPU**precision of compositor intermediate result.**Auto :**Use full precision for final renders, half precision otherwise.**Full :**Use full precision for final renders and viewport.
### Denoise Nodes**Denoising Device**device to use to process Denoise nodes in compositor.**Auto :**Use same device used by compositor to process denoise node.**CPU :**Use CPU to process denoise node.**GPU :**Use GPU to process denoise node if available, otherwise fallback to CPU.**Preview Quality**quality used by Denoise nodes during viewport and interactive compositing of render if their quality is set to*Follow Scene*.
**High :**Produces highest quality output at cost of long processing times.**Balanced :**Balanced between performance and quality, typically processing in half time as*High*, while retaining most of quality.
**Fast :**Produces output quickly at noticeable cost of quality.**Final Quality**quality used by Denoise nodes during final render if their quality is set to*Follow Scene*.
**High :**Produces highest quality output at cost of long processing times.**Balanced :**Balanced between performance and quality, typically processing in half time as*High*, while retaining most of quality.
**Fast :**Produces output quickly at noticeable cost of quality.
- Performance
- Threads
- Memory
- Acceleration Structure
- Final Render
- Viewport
- Compositor
- Denoise Nodes

---

# GPU Rendering
GPU rendering makes it possible to use your graphics card for rendering, instead of CPU . This can speed up rendering because modern GPUs are designed to do lot of number crunching. On other hand, they also have some limitations in rendering complex scenes, due to more limited memory, and issues with interactivity when using same graphics card for display and rendering.
To enable GPU rendering:
- Select either*CUDA*, *OptiX*, *HIP*, *oneAPI*, or *Metal*in Cycles Render Devices user preference.
- Enable available devices for chosen backend.
- Configure each scene to use *GPU Compute*Device .
## Rendering Technologies
Blender supports different technologies to render on GPU depending on particular GPU manufacturer and operating system.
### CUDA – NVIDIA
CUDA is supported on Windows and Linux and requires NVIDIA graphics cards with compute capability 5.0 and higher. To make sure your GPU is supported, see list of NVIDIA graphics cards with compute capabilities and supported graphics cards.
### OptiX – NVIDIA
OptiX is supported on Windows and Linux and requires NVIDIA graphics cards with compute capability 5.0 and higher and driver version of at least 535. To make sure your GPU is supported, see list of NVIDIA graphics cards .
OptiX takes advantage of hardware ray-tracing acceleration in RTX graphics cards, for improved performance.
GPU acceleration for OpenImageDenoise is available for compute capability 7.0 and higher, which includes all NVIDIA RTX cards.
### HIP – AMD
HIP is supported on Windows and Linux and requires AMD graphics card with RDNA1 architecture or newer. Both discrete GPUs and APUs are supported.
Supported GPUs include:
- Radeon RX 5000 Series
- Radeon RX 6000 Series and Radeon Pro W6000 Series
- Radeon RX 7000 Series and Radeon Pro W7000 Series
- Radeon RX 9000 Series
Minimum driver versions:
- Windows: Radeon Software 24.9.1 or Radeon PRO Software 24.Q4
- Linux: Radeon Software 23.40 or ROCm HIP Runtime 6.0
Please refer to AMD’s website for more information about AMD graphics cards and their architectures.
Hardware ray-tracing support is available with most recent drivers. This can be enabled in preferences, and is supported on Radeon RX 6000 and newer.
GPU accelerated denoising is available on discrete Radeon RX 6000 and newer.
### oneAPI – Intel
oneAPI is computation library that is supported on Windows and Linux and requires Intel® Arc™ graphics card with Xe HPG architecture. Hardware acceleration for ray-tracing and denoising is supported.
Supported GPUs include:
- Intel® Arc™ -Series
- Intel® Arc™ B-Series
Minimum driver versions:
- Windows: Intel Graphics Driver XX.X.101.5518
- Linux: `intel-level-zero-gpu `package 1.3.27642, typically available through `intel-compute-runtime `package XX.XX.34666.3
Please refer to Intel’s website for more information about Intel graphics cards and their architectures.
GPU accelerated denoising is available on all supported GPUs.
### Metal – Apple (macOS)
Metal for GPU acceleration is supported on Apple computers with Apple Silicon . macOS 13.0 or newer is required to support all features.
GPU accelerated ray-tracing and denoising is available on Apple Silicon.
## Limitations
- Path Guiding is not supported on any GPU.
- Open Shading Language is only supported for OptiX, with some limitations listed in documentation.
## Frequently Asked Questions
### Why is Blender unresponsive during rendering?
On older GPU generations, graphics cards can only either render or draw user interface. This can make Blender unresponsive while it is rendering. Heavy scenes can also make Blender unresponsive on newer GPUs, when using lot of memory or executing expensive shaders, however this is less of problem.
 only complete solution for this is to use dedicated GPU for rendering, and another for display.
### Why does scene that renders on CPU not render on GPU?
There may be multiple causes, but most common one is that there is not enough memory on your graphics card. Typically, GPU can only use amount of memory that is on GPU (see Would multiple GPUs increase available memory? for more information). This is usually much smaller than amount of system memory CPU can access. With CUDA, OptiX, HIP and Metal devices, if GPU memory is full Blender will automatically try to use system memory. This has performance impact, but will usually still result in faster render than using CPU rendering.
### Can multiple GPUs be used for rendering?
Yes, go to Preferences ‣ System ‣ Compute Device Panel , and configure it as you desire.
### Would multiple GPUs increase available memory?
Typically, no, each GPU can only access its own memory.
 exception is NVIDIA GPUs connected with NVLink, where multiple GPUs can share memory at small performance cost. This can be enabled with Distributed Memory Across Devices in preferences.
### What renders faster?
This varies depending on hardware used. Different technologies also have different compute times depending on scene tested. For most up to date information on performance of different devices, browse Blender Open Data resource.
## Error Messages
In case of problems, install official graphics drivers from GPU manufacturers website, or through package manager on Linux. graphics drivers provided by computer manufacturer can sometimes be outdated or incomplete.
### Error: Out of memory
This usually means there is not enough memory to store scene for use by GPU.
Note
One way to reduce memory usage is by using smaller resolution textures. For example, 8k, 4k, 2k, and 1k image textures take up respectively 256MB, 64MB, 16MB and 4MB of memory.
### NVIDIA OpenGL driver lost connection with display driver
If GPU is used for both display and rendering, Windows has limit on time GPU can do render computations. If you have particularly heavy scene, Cycles can take up too much GPU time. Reducing Tile Size in Performance panel may alleviate issue, but only real solution is to use separate graphics cards for display and rendering.
Another solution can be to increase time-out, although this will make user interface less responsive when rendering heavy scenes. Learn More Here .
### Unsupported GNU version
On Linux, depending on your GCC version you might get this error. See NVIDIA CUDA Installation Guide for Linux for list of supported GCC versions. There are two possible solutions to this error:
**Use alternate compiler**If you have older GCC installed that is compatible with installed CUDA toolkit version, then you can use it instead of default compiler. This is done by setting `CYCLES_CUDA_EXTRA_CFLAGS `environment variable when starting Blender.
Launch Blender from command line as follows: CYCLES_CUDA_EXTRA_CFLAGS = "-ccbin gcc-x.x" blender
(Substitute name or path of compatible GCC compiler).**Remove compatibility checks**If above is unsuccessful, delete following line in `/usr/local/cuda/include/host_config.h `: #error -- unsupported GNU version! gcc x.x and up are not supported!
This will allow Cycles to successfully compile CUDA rendering kernel first time it attempts to use your GPU for rendering. Once kernel is built successfully, you can launch Blender as you normally would and CUDA kernel will still be used for rendering.
### CUDA Error: Kernel compilation failed
This error may happen if you have new NVIDIA graphics card that is not yet supported by Blender version and CUDA toolkit you have installed. In this case Blender may try to dynamically build kernel for your graphics card and fail.
In this case you can:
- Check if latest Blender version (official or experimental builds ) supports your graphics card.
- If you build Blender yourself, try to download and install newer CUDA developer toolkit.
Normally users do not need to install CUDA toolkit as Blender comes with precompiled kernels.
- GPU Rendering
- Rendering Technologies
- CUDA – NVIDIA
- OptiX – NVIDIA
- HIP – AMD
- oneAPI – Intel
- Metal – Apple (macOS)
- Limitations
- Frequently Asked Questions
- Why is Blender unresponsive during rendering?
- Why does scene that renders on CPU not render on GPU?
- Can multiple GPUs be used for rendering?
- Would multiple GPUs increase available memory?
- What renders faster?
- Error Messages
- Error: Out of memory
- NVIDIA OpenGL driver lost connection with display driver
- Unsupported GNU version
- CUDA Error: Kernel compilation failed

---

# Render Baking
Cycles shaders and lighting can be baked to image textures. This has few different purposes, most commonly:
- Baking textures like base color or normal maps for export to game engines.
- Baking ambient occlusion or procedural textures, as base for texture painting or further edits.
- Creating light maps to provide global illumination or speed up rendering in games.
## Setup
Baking requires mesh to have UV map, and either Color Attribute or Image Texture node with image to be baked to. Active Image Texture node or Color Attribute is used as baking target.
Use Render Bake in intensive light/shadow solutions, such as AO or soft shadows from area lights. If you bake AO for main objects, you will not have to enable it for full render, saving render time. Cycles uses render settings (samples, bounces, …) for baking. This way quality of baked textures should match result you get from rendered scene.
## Settings
Reference**Panel :**Render ‣ Bake**Bake**Executes bake operation using current settings.**Bake from Multires**Bakes*Normal*or *Displacement*map directly from mesh that has Multiresolution Modifier .
This method compares two resolution levels of modifier:
- *Viewport Levels*Used as *low-resolution*base mesh.
- *Render Levels*Used as *high-resolution*detailed mesh.
 resulting bake represents difference between these two levels, allowing detailed sculpted information to be captured as texture map.
**Bake Type**Determines what kind of surface information is extracted from Multiresolution modifier. See Bake Types for more information.**Normals :**Bakes surface normal direction differences between two levels.**Displacement :**Bakes height differences as grayscale displacement map.**Vector Displacement :**Bakes full 3D positional offsets as vector displacement map.**Bake Type**Type of pass to bake.**Combined :**Bakes all materials, textures, and lighting except specularity. passes that contribute to combined pass can be toggled individually to form final map.**Ambient Occlusion :**Bakes ambient occlusion as specified in World panels. Ignores all lights in scene.**Shadow :**Bakes shadows and lighting.**Position :**Bakes world-space position data into RGB channels. Each pixel encodes XYZ position of surface point in scene, relative to scene origin.**Normal :**Bakes normals to RGB image.**UV :**Mapped UV coordinates, used to represent where on mesh texture gets mapped too. This is represented through red and green channels of image, blue channel is encoded with constant value of 1 but does not hold any information.**Roughness :**Bakes roughness pass of material.**Emit :**Bakes Emission, or Glow color of material.**Environment :**Bakes environment (i.e. world surface shader defined for scene) onto selected object(s) as seen by rays cast from world origin.**Diffuse :**Bakes diffuse pass of material.**Glossy :**Bakes glossiness pass of material.**Transmission :**Bakes transmission pass of material.**View From**Source of reflection ray directions.**Above Surface :**Cast rays from above surface.**Active Camera :**Use active camera’s position to cast rays.
### Influence
Combined**Lighting**
**Direct**Add direct lighting contribution.**Indirect**Add indirect lighting contribution.**Contributions**
**Diffuse**Add diffuse contribution.**Glossy**Add glossy contribution.**Transmission**Add transmission contribution.**Emit**Add emission contribution.
Diffuse, Glossy, Transmission**Contributions**
**Direct**See above .**Indirect**See above .**Color**Colorize pass.
- If only*Color*is selected you get pass color, which is property of surface and independent of sampling refinement.
- If *Color*is not selected, you get direct and/or indirect contributions in gray-scale.
- If *Color*and either *Direct*or *Indirect*are selected, you get direct and/or indirect contributions colored.
Normal
**Space**Normals can be baked in different spaces:
For materials, same spaces can be chosen in image texture options next to existing*Normal Map*setting. For correct results, setting here should match setting used for baking.
**Object :**Normals in object coordinates, independent of object transformation, but dependent on deformation.**Tangent :**Normals in tangent space coordinates, independent of object transformation and deformation. This is default, and right choice in most cases, since then normal map can be used for animated objects too.**Swizzle R, G, B**Axis to bake into red, green and blue channel.
### Selected to Active
Bake shading on surface of selected objects to active object. rays are cast from low-poly object inwards towards high-poly object. If high-poly object is not entirely involved by low-poly object, you can tweak rays start point with*Max Ray Distance*or *Extrusion*(depending on whether or not you are using cage). For even more control you can use *Cage Object*.
Note
There is CPU fixed memory footprint for every object used to bake from. avoid crashes due to lack of memory, high-poly objects can be joined before baking process.
**Cage**Cast rays to active object from cage. cage is ballooned-out version of low-poly mesh created either automatically (by adjusting ray distance) or manually (by specifying object to use). When not using cage rays will conform to mesh normals. This produces glitches on edges, but it is preferable method when baking into planes to avoid need of adding extra loops around edges.**Cage Object**Object to use as cage instead of calculating cage from active object with*Cage Extrusion*.
**Cage Extrusion**Distance to use for inward ray cast when using*Selected to Active*and *Cage*. inward rays are cast from version of active object with disabled Edge Split Modifiers. Hard splits (e.g. when Edge Split Modifier is applied) should be avoided because they will lead to non-smooth normals around edges.
Note
When base mesh extruded does not give good results, you can create copy of base mesh and modify it to use as *Cage*. Both meshes need to have same Topology (number of faces and face order).
**Max Ray Distance**Distance to use for inward ray cast when using*Selected to Active*. Ray distance is only available when not using *Cage*.
### Output
**Target**Where to output baked map.**Image Textures :**Bake to image data-block associated with active and selected Image Texture node. If material does not contain active and selected image texture node, nothing will be baked for this material.**Clear Image**If selected, clears image before baking render.**Active Color Attribute :**Bake to Active Color Attributes layer on active mesh. Note, active object must be mesh as other object types do not have Color Attributes.
### Margin
When baking to images, by default margin is generated around UV “islands”. This is important to avoid discontinuities at UV seams, due to texture filtering and mip-mapping.**Type**Method to generate margin.**Extend :**Extend border pixels outwards.**Adjacent Faces :**Fill margin using pixels from adjacent faces across UV seams.**Size**
Size of margin in pixels.
- Render Baking
- Setup
- Settings
- Influence
- Selected to Active
- Output
- Margin