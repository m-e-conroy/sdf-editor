# Cycles World & Light Settings

# World Settings
## Mist Pass
Reference
**Panel :**World ‣ Mist Pass
Note
 mist pass must be enabled in View Layer tab of Properties Editor before settings below are available in World tab.
Mist can greatly enhance illusion of depth in your rendering. To create mist, Blender generates render layer with depth map ranging between 0.0 and 1.0 that can be used in Compositor to generate mist effect.**Start**distance from camera at which mist starts to fade in.**Depth**distance from*Start*of mist, that it fades in over. Objects further from camera than *Start + Depth*are completely hidden by mist.
**Falloff**curve function that controls rate of change of mist’s strength further and further into distance.**Quadratic :**Uses same calculation as light falloff ( \(1\over{x^2}\) ) and provides smoothest transition from transparent (0.0) to opaque (1.0).**Linear :**Has steeper start than quadratic ( \(1\over{x}\) ).**Inverse Quadratic :**Has steepest start ( \(1\over{\sqrt{x}}\) ) and approaches 1.0 faster than other two functions.
Tip
 visualization can be activated in Camera ‣ Viewport Display panel.
Mist example ( blend-file ).
## Ray Visibility
Reference**Panel :**World ‣ Ray Visibility
As with other objects,*Ray Visibility*allows you to control which other shaders can “see” environment.
### Tricks
Sometimes it may be useful to have different background that is directly visible versus one that is indirectly lighting objects. simple solution to this is to add Mix node, with *Blend Factor*set to *Is Camera Ray*. first input color is then indirect color, and second directly visible color. This is useful when using high-res image for background and low-res image for actual lighting.
Similarly, adding *Is Camera*and *Is Glossy*rays will mean that high-res image will also be visible in reflections.
Nodes for trick above.
## Settings
Reference
**Panel :**World ‣ Settings
### Surface**Sampling**Controls sampling method for world material. Selecting Auto or Manual enables*Multiple Importance Sampling*while None disables it. *Multiple Importance Sampling*is method to sample background texture such that lighter parts are favored, creating importance map. It will produce less noise in render in trade of artifacts ( Fireflies ). Enable this when using image texture with small area lights (like sun), otherwise noise can take long time to converge.
Below is comparison between *Multiple Importance Sample*off and on. Both images are rendered for 25 seconds (Off: 1,500 samples, On: 1,000 samples).
Multiple Importance Sample off.
Multiple Importance Sample on.
**Map Resolution**Sets resolution of importance map. higher resolution will better detect small features in map and give more accurate sampling but conversely will take up more memory and render slightly slower. Higher values also may produce less noise when using high-res images.**Max Bounces**Maximal number of bounces background light will contribute to render.
See also
See Reducing Noise for more information on how to reduce noise.**Shadow Caustics**Mark World Shader as refractive caustic caster. This setting can be used in conjunction with Cast and Receive caustics object settings to selectively speed up refractive caustic rendering of select objects.
### Volume**Sampling Method**
**Distance :**For dense volumes lit from far away*Distance*sampling is more efficient in most cases. Usually this shouldn’t be used for World volumes.
**Equiangular :**If you have got light inside or near volume then*equiangular*sampling is better.
**Multiple Importance :**If you have combination of both, then multiple importance sampling will be better.**Interpolation**Interpolation method to use for volume.**Linear :**Simple interpolation which gives good results for thin volumes.**Cubic :**Smoothed high-quality interpolation needed for more dense volumes, but slower.**Step Size Biased**Distance between volume shader samples for world volume shaders. Only enabled when Render ‣ Volumes ‣ Biased is enabled. See Volume Render Settings for more information.
### Light Group**Light Group Cycles only**Select Light Group to add current*World Surface Shader*too.
**Add Light Group**If name input into*Light Group*field does not align with existing Light Group, then pressing this button will create *Light Group*with that name and assign this *World Shader*to it.
- World Settings
- Mist Pass
- Ray Visibility
- Tricks
- Settings
- Surface
- Volume
- Light Group

---

# Light Settings (Cycles)
Reference
**Panel :**Properties ‣ Object Data and Shader Editor ‣ Sidebar ‣ Options
## Light
Light settings for all renderers.
### Beam Shape**Spread Area Lights**How wide emitted light fans out controlling how diffused area light is. Larger values create soft shadows while smaller values create sharper light simulating gridded softbox .
Example of Spread at different angles.
## Settings**Max Bounces**Maximum number of times light from light is allowed to Bounce . Limited by scene-wide bounce settings .**Cast Shadow**By disabling this option, light from lights will not be blocked by objects in between. This can speed up rendering by not having to trace rays to light source.**Multiple Importance Sample**By default lights use only direct light sampling. For area lights and sharp glossy reflections, however, this can be noisy, and enabling this option will enable indirect light sampling to be used in addition to reduce noise.**Shadow Caustics**Mark light as refractive caustic caster. This setting can be used in conjunction with Cast and Receive caustics object settings to selectively speed up refractive caustic rendering of select objects.**Portals Area Lights**Area lights can also function as light portals to help sample environment light, and significantly reduce noise in interior scenes. Note that rendering with portals is usually slower, but as it converges more quickly, less samples are required.
Light portals work by enabling*Portal*option, and placing areas lights in windows, door openings, and any place where light will enter interior.
In outdoor scenes most rays do not bounce much and fly off into sky and therefore, light portals are not helpful for outdoor scenes.
White Room model by Jay Hardy.
## Nodes
In Cycles, lights can be fully defined using shader nodes. This allows creating complex, physically based light behavior that goes beyond basic light settings.
Note
 basic Light settings are applied on top of light output node.
Light shader nodes are edited in Shader Editor when editor is set to *Light*context and light object is selected.
### Emission Shader
Light objects use Emission shader to define their output.
 *Emission*shader controls:
- **Color**: spectral color of emitted light.
-**Strength**: intensity of emitted light.
 output of*Emission *shader must be connected to Light Output node.
### Using Shader Nodes
By default, lights use simple node setup consisting of*Emission *shader connected directly to*Light Output *.
More advanced setups can be created using additional shader and utility nodes, for example:
- Mixing multiple*Emission *shaders to create layered light colors.
- Using Texture nodes to vary light color or intensity across light surface.
- Driving light intensity or color using math nodes or animation.
This makes it possible to create effects such as patterned lights, animated flicker, or lights that change color based on time or other inputs.
### Light Output
 Light Output node defines final shader used by light object. Only shader nodes connected to this output affect light’s appearance in Cycles.
### Limitations
- Shader-based light definitions are only supported in**Cycles**. EEVEE uses simplified light models and ignores light shader node trees.
- Only*Emission *-based shading contributes to lighting. Other shader types (such as*BSDF *shaders) have no effect when used on lights.
Using shader nodes for lights provides fine-grained control and enables procedural lighting workflows that are not possible with standard light settings alone.
- Light Settings (Cycles)
- Light
- Beam Shape
- Settings
- Nodes
- Emission Shader
- Using Shader Nodes
- Light Output
- Limitations