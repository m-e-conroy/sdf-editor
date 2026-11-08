# Key Shader Nodes Reference

# Principled BSDF
 *Principled*BSDF that combines multiple layers into single easy to use node. It can model wide variety of materials.
It is based on OpenPBR Surface shading model, and provides parameters compatible with similar PBR shaders found in other software, such as Disney and Standard Surface models. Image textures painted or baked from software like Substance Painter may be directly linked to corresponding input in this shader.
## Layers
 base layer is mix between metal, diffuse, subsurface, and transmission components. Most materials will use one of these components, though it is possible to smoothly mix between them.
 metal component is opaque and only reflect lights. Diffuse is fully opaque, while subsurface also involves light scattering below surface. Both diffuse and subsurface sit below specular layer. transmission component includes both specular reflection and refraction.
On top of all base layers there is optional glossy coat. And finally sheen layer sits on top of all other layers, to add fuzz or dust.
Light emission can also be added. Light emits from below coat and sheen layers, to model for example emissive displays with coat or dust.
## Inputs
**Base Color**Overall color of material used for diffuse, subsurface, metal and transmission.
Same base color for multiple materials types**Roughness**Specifies microfacet roughness of surface for specular reflection and transmission. value of 0.0 gives perfectly sharp reflection, while 1.0 gives diffuse reflection.
Roughness from 0.0 to 1.0**Metallic**Blends between dielectric and metallic material model. At 0.0 material consists of diffuse or transmissive base layer, with specular reflection layer on top. value of 1.0 gives fully specular reflection tinted with base color, without diffuse reflection or transmission.
Metallic from 0.0 to 1.0**IOR**Index of refraction ( IOR ) for specular reflection and transmission. For most materials, IOR is between 1.0 (vacuum and air) and 4.0 (germanium). default value of 1.5 is good approximation for glass.
IOR from 1.0 to 2.0**Alpha**Controls transparency of surface, with 1.0 fully opaque. Usually linked to Alpha output of Image Texture node.
Alpha from 0.0 to 1.0**Normal**Controls normals of base layers.
### Diffuse**Roughness Cycles Only**Surface roughness; 0.0 gives standard Lambertian reflection, higher values activate Oren-Nayar BSDF.
Roughness from 0.0 to 1.0
### Subsurface
Subsurface scattering is used to render materials such as skin, milk and wax. Light scatters below surface to create soft appearance.**Method**Rendering method to simulate Subsurface scattering .**Christensen-Burley :**approximation to physically-based volume scattering. This method is less accurate than*Random Walk*however, in some situations this method will resolve noise faster.
**Random Walk :**Cycles Only Provides accurate results for thin and curved objects. Random Walk uses true volumetric scattering inside mesh, which means that it works best for closed meshes. Overlapping faces and holes in mesh can cause problems.**Random Walk (Skin) :**Cycles Only Random walk method optimized for skin rendering. radius is automatically adjusted based on color texture, and subsurface entry direction uses mix of diffuse and specular transmission with custom IOR . This tends to retain greater surface detail and color and matches measured skin more closely.**Weight**Blend between diffuse surface and subsurface scattering. Typically should be zero or one (either fully diffuse or subsurface).
Weight from 0.0 to 1.0**Radius**Average distance that light scatters below surface. Higher radius gives softer appearance, as light bleeds into shadows and through object. scattering distance is specified separately for RGB channels, to render materials such as skin where red light scatters deeper. X, Y and Z values are mapped to R, G and B values, respectively.
Radius from white to red**Scale**Scale applied to radius.
Scale from 0 cm to 50 cm**IOR Cycles Only**Index of refraction ( IOR ) used for rays that enter subsurface component. This may be set to different value than global IOR to simulate different layers of skin.
IOR from 1.0 to 2.0**Anisotropy Cycles Only**Directionality of volume scattering within subsurface medium. Zero scatters uniformly in all directions, with higher values scattering more strongly forward. For example, skin has been measured to have anisotropy of 0.8.
Anisotropy from 0.0 to 1.0
### Specular
Controls for both metallic component and specular layer on top of diffuse and subsurface.**Distribution**Microfacet distribution to use.**GGX :**method that is faster than*Multiple-scattering GGX*but is less physically accurate.
**Multiscatter GGX :**Takes multiple scattering events between microfacets into account. This gives more energy conserving results, which would otherwise be visible as excessive darkening.**IOR Level**Adjustment to IOR to increase or decrease intensity of specular layer. 0.5 means no adjustment, 0 removes all reflections, 1 doubles them at normal incidence.
This input is designed for conveniently texturing IOR and amount of specular reflection.
IOR level from 0.0 to 1.0**Tint**Color tint for specular and metallic reflection.
For non-metallic tints provides artistic control over color specular reflections at normal incidence, while grazing reflections remain white. In reality non-metallic specular reflection is fully white.
For metallic materials tints edges to simulate complex IOR as found in materials such as gold or copper.
Tint from white to orange**Anisotropic Cycles Only**Amount of anisotropy for specular reflection. Higher values give elongated highlights along tangent direction; negative values give highlights shaped perpendicular to tangent direction.
Anisotropic from 0.0 to 1.0**Anisotropic Rotation Cycles Only**Rotates direction of anisotropy, with 1.0 going full circle.
Compared to*Glossy BSDF*node, direction of highlight elongation is rotated by 90°. Add 0.25 to value to correct.
Anisotropic rotation from 0.0 to 1.0
**Tangent**Controls tangent direction for anisotropy.
### Transmission
Transmission is used to render materials like glass and liquids, where surface both reflects light and transmits it into interior of object**Weight**Mix between fully opaque surface at zero and fully transmissive at one.
Weight from 0.0 to 1.0
### Coat
Coat on top of materials, to simulate for example clearcoat, lacquer or car paint.**Weight**Controls intensity of coat layer, both reflection and tinting. Typically should be zero or one for physically-based materials, but may be textured to vary amount of coating across surface.
Weight from 0.0 to 1.0**Roughness**Roughness of coat layer.
Roughness from 0.0 to 1.0**IOR**Index of refraction ( IOR ) of coat layer. Affects its reflectivity as well as falloff of coat tinting.
IOR from 1.0 to 2.0**Tint**Adds colored tint to coat layer by modeling absorption in layer. Saturation increases at shallower angles, as light travels farther through medium, depending on IOR.
Tint from white to blue**Normal**Controls normals of*Coat*layer, for example to add smooth coating on rough surface.
### Sheen
Sheen simulates small fibers on surface. For cloth this adds soft velvet like reflection near edges. It can also be used to simulate dust on arbitrary materials.
**Weight**Controls intensity of sheen layer.
Weight from 0.0 to 1.0**Roughness**Roughness of sheen reflection.
Roughness from 0.0 to 1.0**Tint**color of sheen reflection.
Tint from white to green.
### Emission
Light emission from surface.**Color**Color of light emission from surface.
Emission color variations**Strength**Strength of emitted light. value of 1.0 ensures that object in image has exact same color as*Emission Color*, i.e. make it ‘shadeless’.
Strength from 0.0 to 10.0
### Thin Film Cycles Only
Thin Film simulates effect of interference in thin film sitting on top of material. This causes specular reflection to be colored in way which strongly depends on view angle as well as film thickness and index of refraction ( IOR ) of film and material itself.
This effect is commonly seen on e.g. oil films, soap bubbles or glass coatings. While its influence is more obvious in specular highlights, it also affects transmission.
**Thickness**thickness of film in nanometers. value of 0 disables simulation. interference effect is strongest between roughly 100 and 1000 nanometers, since this is near wavelengths of visible light.
Thickness from 400 to 800 nanometers**IOR**Index of refraction ( IOR ) of thin film. common range for this value is between 1.0 (vacuum and air) and roughly 2.0, though some materials can reach higher values. default value of 1.33 is good approximation for water. Note that when value is set to 1.0 or to main IOR of material, thin film effect disappears since film optically blends into air or material.
IOR from 1.0 to 1.5
## Outputs**BSDF**Standard shader output.
- Principled BSDF
- Layers
- Inputs
- Diffuse
- Subsurface
- Specular
- Transmission
- Coat
- Sheen
- Emission
- Thin Film Cycles Only
- Outputs

---

# Glass BSDF*Glass*BSDF is used to add Glass-like shader mixing refraction and reflection at grazing angles. Like transparent shader, only pure white will make it transparent. glass shader tends to cause noise due to caustics. Since Cycles path tracing integrator is not good at rendering caustics, it helps to combine this with transparent shader for shadows; for more details see here .
## Inputs
**Color**Color of surface, or physically speaking, probability that light is transmitted for each wavelength.**Roughness**Influences sharpness of refraction; perfectly sharp at 0.0 and smoother with higher values.**IOR**Index of refraction ( IOR ) defining how much ray changes direction. At 1. 0 rays pass straight through like transparent; higher values give more refraction.**Normal**Normal used for shading.
### Thin Film Cycles Only
Thin Film simulates effect of interference in thin film sitting on top of material. This causes specular reflection to be colored in way which strongly depends on view angle as well as film thickness and index of refraction ( IOR ) of film and material itself.
This effect is commonly seen on e.g. oil films, soap bubbles or glass coatings. While its influence is more obvious in specular highlights, it also affects transmission.**Thickness**thickness of film in nanometers. value of 0 disables simulation. interference effect is strongest between roughly 100 and 1000 nanometers, since this is near wavelengths of visible light.**IOR**Index of refraction ( IOR ) of thin film. common range for this value is between 1.0 (vacuum and air) and roughly 2.0, though some materials can reach higher values. default value of 1.33 is good approximation for water. Note that when value is set to 1.0 or to main IOR of material, thin film effect disappears since film optically blends into air or material.
## Properties**Distribution**Microfacet distribution to use.**GGX :**GGX microfacet distribution.**Multiscatter GGX :**Takes multiple scattering events between microfacets into account. This gives more energy conserving results, which would otherwise be visible as excessive darkening.**Beckmann :**Cycles Only Beckmann microfacet distribution.
## Outputs**BSDF**Standard shader output.
## Examples
Sharp Glass example.
Sharp Glass behavior.
Rough Glass example.
Rough Glass behavior.
- Glass BSDF
- Inputs
- Thin Film Cycles Only
- Properties
- Outputs
- Examples

---

# Glossy BSDF*Glossy*BSDF node is used to add reflection with microfacet distribution, used for materials such as metal or mirrors.
## Inputs
**Color**Color of surface, or physically speaking, probability that light is reflected for each wavelength.**Roughness**Sharpness of reflection; perfectly sharp at 0.0 and smoother with higher values.**Anisotropy Cycles Only**Controls amount reflection stretches reflection along surface of material. value of 0.0 results in no anisotropic reflections. Higher values give elongated highlights orthogonal to tangent direction; negative values give highlights shaped along tangent direction.
This is phenomenon know as “Anisotropic Reflections” which is often seen in metallic materials.**Rotation**Rotation of anisotropic tangent direction. Value 0.0 equals 0° rotation, 0.25 equals 90° and 1.0 equals 360° = 0°. This can be used to texture tangent direction.
Anisotropic rotation on 0.
Anisotropic rotation on 0.25 (90°).**Normal**Normal used for shading; if nothing is connected default shading normal is used.**Tangent**Tangent used for shading; if nothing is connected default shading tangent is used.
## Properties**Distribution**Microfacet distribution to use.**GGX :**GGX microfacet distribution.**Multiscatter GGX :**Takes multiple scattering events between microfacets into account. This gives more energy conserving results, which would otherwise be visible as excessive darkening.**Beckmann :**Cycles Only Beckmann microfacet distribution.
## Outputs**BSDF**Standard shader output.
## Examples
Sharp Glossy example.
Sharp Glossy behavior.
Rough Glossy example.
Rough Glossy behavior.
Anisotropic shading with 0° rotation, 90° rotation and textured rotation of tangent direction. Example blend-file .
- Glossy BSDF
- Inputs
- Properties
- Outputs
- Examples

---

# Emission*Emission*node is used to add Lambertian emission shader. This can for example, be used for material and light surface outputs.
Light strength for point, spot and area lights is specified in Watts.
Sun lights are specified in Watts/m 2 , which require much smaller values like 1 W/m 2 . This can be confusing, but specifying strength in Watts would not have been convenient; real sun for example has strength 384.6×10 24 W. Emission shaders on meshes are also in Watts/m 2 .
## Inputs
**Color**Color of emitted light.**Strength**Strength of emitted light. For point and area lights, unit is Watts. For materials, value of 1.0 will ensure that object in image has exact same color as Color input, i.e. make it ‘shadeless’.
## Properties
This node has no properties.
## Outputs**Emission**Emission shader output can both be plugged into*Surface Input*as well as *Volume Input*of Material Output node.
## Examples
Emission shader, with strength at 1.0.
Emission shader, with strength at 3.0.
- Emission
- Inputs
- Properties
- Outputs
- Examples

---

# Metallic BSDF
 *Metallic*BSDF node is used to recreate appearance of metals.
## Inputs
### F82 Tint
**Base Color**Color of material when viewed straight on.**Edge Tint**Color of material when viewed at 82° angle.
### Physical Conductor**IOR**Refractive index per color channel. This is real part of complex refractive index, scientifically denoted as n.**Extinction**Extinction coefficients per color channel. This is imaginary part of complex refractive index, scientifically denoted as k.
### Common**Roughness**Sharpness of reflection; perfectly sharp at 0.0 and smoother with higher values.**Anisotropy Cycles Only**Amount of anisotropy. Higher values give elongated highlights along tangent direction; negative values give highlights shaped perpendicular to tangent direction.**Rotation Cycles Only**Rotates direction of anisotropy, with 1.0 going full circle.
Compared to*Glossy BSDF*node, direction of highlight elongation is rotated by 90°. Add 0.25 to value to correct.
**Normal**Normal used for shading; if nothing is connected default shading normal is used.**Tangent**Tangent used for shading; if nothing is connected default shading tangent is used.
## Properties**Distribution**Microfacet distribution to use.**GGX :**GGX microfacet distribution.**Multiscatter GGX :**Takes multiple scattering events between microfacets into account. This gives more energy conserving results, which would otherwise be visible as excessive darkening.**Beckmann :**Cycles Only Beckmann microfacet distribution.**Fresnel Type**Models for describing metal’s appearance, by specifying apparent color or physical IOR.**F82 Tint :**Uses Adobe F82-Tint formula for metallic fresnel. This allows for artist friendly control of color near edge of material to simulate complex IOR.**Physical Conductor :**Accepts Complex IOR measurements from real world metals to replicate more accurate rendering of metals than*F82 Tint*Fresnel type.
Complex IOR values can be found from sources like Physically Based database for CG artists and Refractive Index nk database .
## Outputs
**BSDF**Standard shader output.
## Examples
### F82 Tint
Material
Titanium (Default)
Aluminum
Copper
Gold
Base Color
0.617, 0.576, 0.540
0.911, 0.912, 0.917
0.972, 0.694, 0.486
1.000, 0.735, 0.353
Edge Tint
0.695, 0.726, 0.770
0.848, 0.877, 0.916
0.961, 0.969, 0.942
0.993, 1.000, 1.000
### Physical Conductor
Material
Titanium (Default)
Aluminum
Copper
Gold
IOR
2.757, 2.512, 2.231
1.333, 0.945, 0.582
0.235, 0.729, 1.369
0.000, 0.470, 1.439
Extinction
3.867, 3.404, 3.009
7.434, 6.340, 5.181
5.666, 2.562, 2.227
182.6, 2.189, 1.660
- Metallic BSDF
- Inputs
- F82 Tint
- Physical Conductor
- Common
- Properties
- Outputs
- Examples
- F82 Tint
- Physical Conductor

---

# Subsurface Scattering*Subsurface Scattering*node is used to add simple subsurface multiple scattering, for materials such as skin, wax, marble, milk and others. For these materials, rather than light being reflect directly off surface, it will penetrate surface and bounce around internally before getting absorbed or leaving surface at nearby point.
How far color scatters on average can be configured per RGB color channel. For example, for skin, red colors scatter further, which gives distinctive red-colored shadows, and soft appearance.
## Inputs
**Color**Color of surface, or physically speaking, probability that light is reflected for each wavelength.**Scale**Global scale factor for scattering radius.**Radius**Average distance that light scatters below surface. Higher radius gives softer appearance, as light bleeds into shadows and through object. scattering distance is specified separately for RGB channels, to render materials such as skin where red light scatters deeper. X, Y and Z values are mapped to R, G and B values, respectively.**IOR Cycles Only**Index of refraction for*Subsurface Scattering*.
**Anisotropy Cycles Only**Directionality of subsurface scattering. Higher anisotropy scatters deeper into object.**Roughness Cycles Only**Roughness of glossy surface surrounding subsurface volume.**Normal**Normal used for shading; if nothing is connected default shading normal is used.
## Properties**Subsurface Method**Rendering method to simulate subsurface scattering.
Note
EEVEE does not support*Random Walk*methods.
**Christensen-Burley :**approximation to physically-based volume scattering. This method is less accurate than*Random Walk*however, in some situations this method will resolve noise faster.
**Random Walk (Fixed Radius) :**Provides accurate results for thin and curved objects. Random Walk uses true volumetric scattering inside mesh, which means that it works best for closed meshes. Overlapping faces and holes in mesh can cause problems.**Random Walk :**Behaves similarly to*Random Walk (Fixed Radius)*but modulates *Radius*based on *Color*, *Anisotropy*, and *IOR*. This method thereby attempts to retain greater surface detail and color than *Random Walk (Fixed Radius)*.
## Outputs
**BSSRDF**BSSRDF shader output.
## Examples
Random walk subsurface scattering.
- Subsurface Scattering
- Inputs
- Properties
- Outputs
- Examples

---

# Principled Volume*Principled Volume*shader combines all volume shading components into single easy to use node. Volumes like smoke and fire can be rendered with single shader node, which includes scattering, absorption and blackbody emission.
## Inputs
**Color**Volume scattering color.**Color Attribute**Volume grid for coloring volume. Use “color” for smoke simulations.**Density**Density of volume.**Density Attribute**Volume grid to define density, typically “density”.**Anisotropy**Backward or forward scattering direction.**Absorption Color**Volume shadow color tint.**Emission Strength**Amount of light to emit.**Emission Color**Emission color tint.**Blackbody Intensity**Blackbody emission for fire. Set to 1 for physically accurate intensity.**Blackbody Tint**Color tint for blackbody emission.**Temperature**Temperature in kelvin for blackbody emission, higher values emit more.**Temperature Attribute**Volume grid to define temperature, typically “temperature”.
## Properties
This node has no properties.
## Outputs**Volume**Volume Shader output must be plugged into*Volume Input*of Material or World Output node.
## Examples
- Principled Volume
- Inputs
- Properties
- Outputs
- Examples