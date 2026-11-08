# Lighting Reference

# Light Objects
Reference
**Panel :**Properties ‣ Object Data and Shader Editor ‣ Sidebar ‣ Options
## Common Settings**Type**Defines type of light.**Temperature**Blackbody temperature in Kelvin, for natural light emission colors.**Color**Color tint of emitted light.**Exposure**Multiply light intensity by \(2^{exposure}\) . This makes it easy to control large range of intensities with single slider.**Normalize**By default, total power of light remains same when light size and shape changes. By disabling this option, more light will be emitted when making light bigger.
## Renderer Settings
- EEVEE specific settings
- Cycles specific settings
## Point Light
Point light.
 point light is omnidirectional point of light, that is, point radiating same amount of light in all directions. It’s visualized by plain, circled dot. Being point light source, direction of light hitting object’s surface is determined by line joining light and point on surface of object itself. It can be used as simple model of e.g. light bulb.
Light intensity/energy decays based on (among other variables) distance from point light to object. In other words, surfaces that are further away will be rendered darker.**Power**Power of light. Higher values increase intensity of light. Negative values can be set, but should be avoided for predictable and physically based result.**Radius**When larger than zero, light will be emitted from spherical surfaces with specified radius. Lights with larger size have softer shadows and specular highlights, and they will also appear dimmer because their power is distributed over larger area.**Soft Falloff**Apply falloff to avoid sharp edges when light geometry intersects with other objects.
## Spot Light
 spot light emits cone-shaped beam of light from tip of cone, in given direction.**Power**Power of light. Higher values increase intensity of light. Negative values can be set, but should be avoided for predictable and physically based result.**Radius**When larger than zero, light will be emitted from spherical surfaces with specified radius. Lights with larger size have softer shadows and specular highlights.**Soft Falloff**Apply falloff to avoid sharp edges when light geometry intersects with other objects.
### Beam Shape
Changing spot options also changes appearance of spotlight as displayed in 3D Viewport.**Angle**size of outer cone of spot light, which determines how wide light spreads. smaller angle produces narrow, focused beam, while larger angle results in wider, softer illumination area.
This value represents angle at top of light cone in degrees, and can range from**1.0°**(narrow beam) to**180.0°**( wide beam). Changing spot*Angle *option
Angle: 45°
Angle: 60°**Blend**
*Blend *slider controls inner cone of spot.*Blend *value can be between (0.0 to 1.0). value is proportional and represents that amount of space that inner cone should occupy inside outer cone*Size *.
 inner cone boundary line indicates point at which light from spot will start to blur/soften; before this point its light will mostly be full strength. larger value of*Blend *more blurred/soft edges of spotlight will be, and smaller inner cone’s circular area will be (as it starts to blur/soften earlier).
To make spot have sharper falloff rate and therefore less blurred/soft edges, decrease value of*Blend*. Setting *Blend*to 0.0 results in sharp spotlight edges, without any transition between light and shadow.
 falloff rate of spot light is ratio between *Blend*and *Size*values; larger circular gap between two, more gradual light fades between *Blend*and *Size*.
*Blend*and *Size*only control spot light cone’s aperture and softness (“radial” falloff); they do not control shadow’s softness as shown below.
Render showing soft edge spotlighted area and sharp/hard object shadow.
Notice in picture above that object’s shadow is sharp as result of ray tracing, whereas spotlight edges are soft. If you want other items to cast soft shadows within spot area, you will need to alter other shadow settings.
**Show Cone**Displays transparent cone in 3D Viewport to visualize which objects are contained in it.
## Area Light
 area light simulates light originating from surface (or surface-like) emitter. For example, TV screen, office neon lights, window, or cloudy sky are few types of area light. area light produces shadows with soft borders by sampling light along grid size of which is defined by user. This is in direct contrast to point-like artificial lights which produce sharp borders.**Power**Power of light. Higher values increase intensity of light. Negative values can be set, but should be avoided for predictable and physically based result.**Shape**Shape of light.**Rectangle :**shape of light can be represented as rectangle and changed with “X” and “Y” values.**Square :**shape of light can be represented as square and changed with*Size*property.
**Disk :**shape of light can be represented as disk and changed with*Size*property.
**Ellipse :**shape of light can be represented as ellipse and changed with X and Y values.
Tip
Choosing appropriate shape for your area light will enhance believability of your scene. For example, you may have indoor scene and would like to simulate light entering through window. You could place*Rectangular*area light in window (vertical) or from neon lights (horizontal) with proper ratio for *Size X*and *Size Y*. For simulation of light emitted by TV screen, vertical *Square*area light would be better in most cases.
**Size / Size X / Size Y**Dimensions for*Square*or *Rectangle*.
## Sun Light
 sun light provides light of constant intensity emitted in single direction from infinitely far away. It can be handy for uniform clear daylight open-space illumination. In 3D Viewport, sun light is represented by encircled black dot with rays emitting from it, plus dashed line indicating direction of light.
Note
This direction can be changed by rotating sun light, like any other object, but because light is emitted from location considered infinitely far away, location of sun light does not affect rendered result.
**Strength**Strength of lights. See more details at Power of Lights .**Angle**size of sun light according to its angular diameter as seen from earth.
## Power of Lights
When Normalize is enabled, power of sun lights is specified in Watts per square meter. power of point lights, spot lights, and area lights is specified in Watts.
But this is not electrical Watts that consumer light bulbs are rated at. It is Radiant Flux or Radiant Power which is also measured in Watts. It is energy radiated from light in form of visible light.
If you want to set power to real world values, you have to convert wattage of consumer bulbs or LED lights to radiant flux, but it is not straightforward process. wattage of bulbs means electrical power required to power them. LED lights have “Watt equivalent” which is neither electrical power they require nor amount of light they put out. Some consumer lights specify lumens or luminous flux which is radiant flux weighted with wavelengths perceived by human eye.
To save you from doing conversion, here is table of typical power values for point, spot, and area lights:
Real world light
Power
Suggested Light Type
Candle
0.05 W
Point
800 lm LED bulb
2.1 W
Point
1000 lm light bulb
2.9 W
Point
1500 lm PAR38 floodlight
4 W
Area, Disk
2500 lm fluorescent tube
4.5 W
Area, Rectangle
5000 lm car headlight
22 W
Spot, size 125 degrees
And table of typical Strength values for sun lights:
Sun type
Strength
Clear sky
1000 W/m 2
Cloudy sky
500 W/m 2
Overcast sky
200 W/m 2
Moonlight
0.001 W/m 2
These values will produce much brighter or dimmer lights than you would expect, because our eyes adapt while render engine does not. So to compensate, adjust*Exposure*in Render ‣ Film .
To get realistic results, remember to also set light size and color to realistic values. color of your lights will also influence how bright they appear to human visual system. If you leave power unchanged, green light will seem brightest, red darker and blue darkest. Thus you might want to manually compensate for these perceived differences.
- Light Objects
- Common Settings
- Renderer Settings
- Point Light
- Spot Light
- Beam Shape
- Area Light
- Sun Light
- Power of Lights

---

# World Environment
Lighting with HDR image.
 world defines environment that scene is in. surface shader sets background and environment lighting, either as fixed color, sky model or HDRI texture. With volume shaders entire scene can be covered in mist or other volumetric effects.
## Surface
Reference
**Panel :**World ‣ Surface
 surface shader defines light emission from environment into scene. world surface is rendered as if it is distant from scene, and as such there is no two-way interacting between objects in scene and environment, only light coming in. only shader accepted is Background node with color input and strength factor for intensity of light.
### Image Based Lighting
For image based lighting, use Environment Texture node rather than Image Texture node for correct mapping. This supports*Equirectangular*(also known as latitude/longitude) for environment maps, and *Mirror Ball*mapping for converting photos of mirror balls to environment maps.
## Volume
Reference
**Panel :**World ‣ Volume
 volume shader can be applied to entirely world, filling entire space.
Currently this is most useful for night time or other dark scenes, as world surface shader or sun lights will have no effect if volume shader is used. This is because world background is assumed to be infinitely far away, which is accurate enough for sun for example. However, for modeling effects such as fog or atmospheric scattering, it is not good assumption that volume fills entire space, as most of distance between sun and earth is empty space. For such effects it is be better to create volume object surrounding scene. size of this object will determine how much light is scattered or absorbed.
## Viewport Display
Reference**Panel :**World ‣ Viewport Display**Color**color to render 3D Viewport background when choosing World Background .
- World Environment
- Surface
- Image Based Lighting
- Volume
- Viewport Display

---

# Light Linking
With light linking, you can set up lights that only illuminate specific objects in scene. Shadow linking additionally gives control over which objects block light (cast shadows).
This adds more artistic control by breaking laws of physics. For example, you could have rim light that*only*illuminates character in scene (light linking) and is not blocked by any objects in scene (shadow linking).
## Setup
- Select light or emissive mesh object and go to Cycles Shading panel or EEVEE Shading panel .
- Create new light/shadow linking collection.
- Drag & drop objects or collections from Outliner onto list.
You can also use Link Data menu for this: select objects, add light to selection, press Ctrl - L , and choose Link Receivers/Blockers to Emitter .
Note
Emissive mesh objects only support light linking with Cycles.
Grease Pencil objects don’t support light linking at all.
Multiple light objects can use same linking collection. They can also use existing scene collection, but in general, it’s recommended to create dedicated linking collections so you can change these without affecting scene layout.
## Include & Exclude
Light receiver/blocker objects can be set to be either included or excluded. behavior is as follows:
- If only included objects are specified, light only affects those objects.
- If only excluded objects are specified, light affects all objects in scene except those specified.
- If both included and excluded objects are specified, light affects only included objects minus excluded objects. This can be used to for example set character collection to be included, and then exclude specific objects part of character.
## Performance
Sampling for light linking is most efficient with light tree enabled, where specialized acceleration structure is built for light linking.
When using shadow linking, renders can be slower and trace additional rays, as direct and indirect lighting take different paths.
- Light Linking
- Setup
- Include & Exclude
- Performance