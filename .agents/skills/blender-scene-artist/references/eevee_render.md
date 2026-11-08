# Eevee Render Settings

# Introduction
EEVEE is Blender’s realtime render engine focused on speed and interactivity while achieving goal of rendering PBR materials. EEVEE can be used interactively in 3D Viewport but also produce high quality final renders.
EEVEE in 3D Viewport – “Tiger” by Daniel Bystedt.
EEVEE materials are created using same shader nodes as Cycles, making it easy to render existing scenes. For Cycles users, this makes EEVEE work great for previewing materials in realtime.
EEVEE is based on rasterization and is not path tracer. Instead of computing each ray of light, rasterization determines what surface is visible from camera. It then estimates way light interacts with these surfaces and materials using numerous algorithms. While EEVEE is designed to use PBR principles, it is not perfect and Cycles will always provide more physically accurate renders. For these reasons, EEVEE has set of limitations .
EEVEE final render – “Temple” by Dominik Graf.

---

# Render Settings
- Sampling
- Light Paths
- Raytracing
- Volumes
- Curves
- Depth of Field
- Motion Blur
- Film
- Performance
- Grease Pencil

---

# Materials
See also
While EEVEE shares same material node system as Cycles, not all features are supported. See Shader nodes limitations .
## Thickness
Reference
**Panel :**Properties ‣ Material ‣ Thickness
Used to approximate inner geometry structure of object without heavy computation. This is currently used for Subsurface Scattering , Translucent BSDF , Refraction BSDF , and nodes containing these effects.
If no value is plugged into output node, default thickness based on smallest dimension of object is used. If value is connected it will be used as object space thickness (i.e. scaled by object transform). value of zero will disable thickness approximation and treat object as having only one interface.
This output is only used by EEVEE render engine.
Note
- thickness is used to skip inner part of object.
- Refraction will not refract objects inside thickness distance.
- Shadow casting object will not cast shadow within thickness distance.
Tip
- For large or compound meshes (e.g. vegetation), thickness should be set to thickness of individual parts (e.g. leaves, grass blades).
- Thickness can be baked to textures or custom attributes for more accurate result.
See also
Thickness Mode – controls how thickness value is used.
## Material Settings
Reference**Panel :**Properties ‣ Material ‣ Settings**Pass Index**Index number for*Material Index*render pass . This can be used to give mask to material which then can be read with ID Mask Node in Compositor.
Note
Volume Objects do not support pass index.
## Surface
**Backface Culling**Backface Culling hides back side of faces. This option should be turned on whenever it is possible, as it has impact on performance.**Camera**Use back face culling to hide back side of face.**Shadow**Use back face culling when casting shadows.**Light Probe Volume**Use back face culling when baking Light Probe Volumes . Additionally helps rejecting capture point inside object to avoid light leaking**Displacement**Controls how displacement output from shader node tree is used.**Bump Only :**Use Bump Mapping to simulated appearance of displacement. This only modifies shading normal of object. Vertex position is not affected.**Displacement Only :**This mode is not supported and falls back to*Displacement and Bump*.
**Displacement and Bump :**Combination of true displacement and bump mapping for finer details. Vertex position is modified.
Note
This type of displacement is not precomputed. It has performance impact multiplied by render sample count. However, evaluation is much faster than doing it using geometry nodes or displacement modifier.
Note
Displacing flat shaded geometry will split adjacent faces. This can be worked around by passing vertex normals as custom attribute.**Max Distance**maximum distance vertex can be displaced when using true displacement. Displacements over this threshold may cause visibility issues. These visibility issues can be observed when object is out of view at edge of screen with parts being displaced inside view. object would then disappear because of camera culling. This can also produce missing shadow updates where displaced geometry is.**Transparent shadows**Use transparent shadows for this material if it contains Transparent BSDF. Disabling will render faster but not give accurate shadows.**Render Method**Controls blending and compatibility with certain features.**Dithered :**Allows for grayscale hashed transparency, and compatible with render passes and raytracing. Also know as deferred rendering.
When using*Dithered*render method, materials are rendered in layers. Each layer can only transmit (e.g. refract) light emitted from previous layers. If no intersection with layers below exists, transmissive BSDFs will fallback to light probes.
**Raytraced Transmission**Use raytracing to determine transmitted color instead of using only light probes. This prevents surface from contributing to lighting of surfaces not using this setting.**Blended :**Allows colored transparency, but incompatible with render passes and raytracing. Also known as forward rendering.
Sorting Problem
When using*Blended*render method, order in which color blending happens is important as it can change final output color. EEVEE does not support per-fragment (pixel) sorting or per-triangle sorting. Only per-object sorting is available and is automatically done on all transparent surfaces based on object origin. Opaque surfaces (i.e. that have no transparency) will still have correct sorting regardless of render method.
Tip
Face order can be adjusted in edit mode by using sort element or using geometry node .
Note
Per-object sorting has performance cost and having thousands of objects in scene will greatly degrade performance.
**Transparency Overlap**If enabled, all transparent fragments will be rendered. If disabled, only front-most surface fragments will be rendered. This option can be disabled to fix sorting issues caused by blending order. Only available for*Blended*render method.
**Thickness**Determines what model to use to approximate object geometry.**Sphere :**Approximate object as sphere whose diameter is equal to thickness defined by node tree. This is more suited to objects with rounder edges (e.g. monkey head), and is perfectly suited to spheres.**Slab :**Approximate object as infinite slab of thickness defined by node tree. This is more suited to flat or thin objects (e.g. glass panels, grass blades).**From Shadow**Use shadow maps from shadow casting lights to refine thickness defined by material node tree. This takes minimum thickness between shadow map and material node tree value. This is useful for objects where pre-computation is difficult (e.g. complex meshes), impossible (e.g. procedural geometry with displacement) or impractical. However, this will have performance impact that scale with number of render samples.
## Volume**Intersection**Determines which inner part of mesh will produce volumetric effect.**Fast :**Each face is considered as medium interface. Gives correct results for manifold geometry that contains no inner part.**Accurate :**Faces are considered as medium interface only when they have different consecutive facing. Gives correct results as long as max ray depth is not exceeded. Has significant memory overhead compared to fast method.
- Materials
- Thickness
- Material Settings
- Surface
- Volume

---

# Light Settings (EEVEE)
Reference**Panel :**Properties ‣ Object Data and Shader Editor ‣ Sidebar ‣ Options
Besides lighting from background and materials with emission shaders, lights are another way to add light into scene. difference is that they are not directly visible in rendered image, and can be more easily managed as objects of their own type.
See Light settings for settings common to all renderers.
## Shadow
EEVEE uses technique called*Virtual Shadow Mapping*along with *Shadow Map Raytracing*. *Virtual Shadow Mapping*produces more accurate results than traditional shadow mapping by putting resolution only where it is needed. It also includes efficient caching mechanism. This technique offers better performance than ray tracing and is compatible with any Render Method .
Tip
- error message *Shadow buffer full*means that system cannot allocate enough shadow memory. Increasing Shadow Pool Size or Resolution Limit on some lights can fix issue. Otherwise, only workaround is to disable shadow casting on some lights.
- *Shadow Map Raytracing*can be tweaked in Render Settings .
- Turning on Jitter can reduce light leaking artifacts caused by large lights and *Shadow Map Raytracing*.
See also
Limitations .
**Jitter**Enable jittered soft shadows to increase shadow precision. Has high performance impact as shadow map cannot be cached and needs to be updated for each render sample.
Note
 effect isn’t visible by default in viewport. See render settings .**Overblur**Apply shadow tracing to each jittered sample to reduce under-sampling artifacts.
Note
Any value higher than zero will result in blurrier shadow and is not physically correct.**Filter**Blur shadow aliasing using PCF with circular kernel. effective world scale of filter depends on shadow map resolution at shadowed pixel position.
Note
Any value bigger than 1px will increase chances of light leaking artifacts.**Resolution Limit**Minimum size of shadow map pixel. Higher values use less memory at cost of shadow quality. Higher values also speed-up rendering of heavy scenes. Each shadow is scaled depending on shadowed pixel on screen. This can create sharp shadows but also requires lot of memory if shadowed pixel is close to camera. This property limits maximum amount of detail that shadow map can capture.
Note
Reducing shadow map resolution will increase chances of light leaking artifacts.**Absolute Resolution Limit**Limit resolution at 1 unit from light origin instead of relative to shadowed pixel. This makes Resolution Limit act as regular shadow map pixel size.
Hint
With this option enabled, following equation can be used to set*Resolution Limit*with desired resolution: \[resolution\_limit = 2 *\sqrt{2} / resolution\]
 \(2* \sqrt{2}\) refers to unit cube diagonal and \(resolution\) refers to desired resolution (e.g. 1024px).
Note
 setting Absolute Resolution Limit does not exist for Sun Light.
## Influence
These parameters modulate intensity of light depending on shader type. These are meant for artistic control, and any value other than 1.0 breaks PBR rules.**Diffuse**Diffuse reflection intensity multiplier.**Glossy**Glossy light intensity multiplier.**Transmission**Transmission light intensity multiplier.**Volume Scatter**Volume light intensity multiplier.
## Custom Distance
If enabled, uses Distance as custom attenuation distance instead of global Light Threshold. avoid long setup times, this distance is first computed automatically based on light threshold. distance is computed at light origin and using inverse square falloff.**Distance**Specifies where light influence will be set to 0.
Note
 setting Custom Distance does not exist for Sun Light.
See also
Global Light Threshold .
- Light Settings (EEVEE)
- Shadow
- Influence
- Custom Distance

---

# World Settings
 world environment can emit light, ranging from single solid color to arbitrary textures.
In EEVEE, world lighting contribution is stored into internal Light Probe . This makes lighting less precise than Cycles.
EEVEE considers world lighting contribution as indirect lighting whereas Cycles considers it as direct lighting.
## Mist Pass
Reference**Panel :**World ‣ Mist Pass
Note
 mist pass must be enabled in View Layer tab of Properties Editor before settings below are available in World tab.
Mist can greatly enhance illusion of depth in your rendering. To create mist, Blender generates render layer with depth map ranging between 0.0 and 1.0 that can be used in Compositor to generate mist effect.**Start**distance from camera at which mist starts to fade in.**Depth**distance from*Start*of mist, that it fades in over. Objects further from camera than *Start + Depth*are completely hidden by mist.
**Falloff**curve function that controls rate of change of mist’s strength further and further into distance.**Quadratic :**Uses same calculation as light falloff ( \(1\over{x^2}\) ) and provides smoothest transition from transparent (0.0) to opaque (1.0).**Linear :**Has steeper start than quadratic ( \(1\over{x}\) ).**Inverse Quadratic :**Has steepest start ( \(1\over{\sqrt{x}}\) ) and approaches 1.0 faster than other two functions.
Tip
 visualization can be activated in Camera ‣ Viewport Display panel.
Mist example ( blend-file ).
## Settings
Reference**Panel :**World ‣ Light Probe
### Light Probe**Resolution**resolution used to store light from world. This is equivalent to resolution for light probe spheres.
See also
Light Probe Sphere .
### Sun
EEVEE can separate light from intense light sources (e.g. sun from outdoor HDRI ) and replace them with sun light. This increases quality of lighting as internal light probes alone cannot reproduce this type of lighting with enough precision.**Threshold**If non-zero, maximum value for world contribution that will be recorded inside world light probe. excess contribution is converted to sun light. This reduces light bleeding caused by bright light sources. value of zero will disable this feature and all lighting will be stored inside internal light probes.**Angle**Angular diameter of extracted sun light as seen from Earth.**Use Shadow**
Enable shadow casting on extracted sun light.
See also
 shadow properties control extracted sun shadows. They are exactly same as for sun light object. Light Properties .
- World Settings
- Mist Pass
- Settings
- Light Probe
- Sun