# Materials Reference

# Introduction

Materials control appearance of meshes, curves, volumes and other objects. They define substance that object is made of, its color and texture, and how light interacts with it.
Physically based materials can be created using Principled BSDF , Principled Hair , and Principled Volume shaders. With these uber shaders, wide variety of materials including plastic, glass, metal, cloth, skin, hair, smoke and fire can be created.
flexible shading nodes system is used to set up textures and create entirely different types of materials like toon shading.

## Setting up Materials

Materials can be created in either Material properties , or in Shader Editor . These provide different view of same shader nodes and material settings.
default Shading workspace has Shader Editor and 3D Viewport that can be set to Material Preview or Rendered shading, to interactively preview how material interacts with objects and lights in scene.
Materials are data-blocks that can be assigned to one or more objects, and different materials can be assigned to different parts of meshes.
Image textures can be created from scratch in Texture Paint Mode , or by loading in existing images with Image Texture node . variety of procedural texture nodes is also available.

## Components

Materials consist of three shaders, defining appearance of surface, volume inside object, and displacement of surface.

### Surface Shader

surface shader controls textures and light interaction at surface of mesh.

### Volume Shader

volume shader defines interior of mesh. material can have volume shader for cases like smoke and fire, or it can be combined with surface shader for materials like cloudy glass.

### Displacement

shape of surface and volume inside it may be altered by displacement . This way, textures can then be used to make mesh surface more detailed.
Depending on settings, displacement may be virtual, only modifying surface normals to give impression of displacement, which is known as bump mapping, or combination of real and virtual displacement.

## Physically Based Shading

material system is built with physically-based rendering in mind, separating how material looks and which rendering algorithm is used to render it. This makes it easier to achieve realistic results and balanced lighting, though there are few things to keep in mind.
In order for materials to work well with global illumination, they should be energy conserving. That means they cannot reflect more light than comes in. This property is not strictly enforced, but if colors are in range 0.0 to 1.0, and BSDF s are only mixed together with Mix Shader node, this will automatically be true.
It is however, possible to break this, with color values higher than 1.0 or using Add Shader node, but one must be careful when doing this to keep materials behaving predictably under various lighting conditions.

- Introduction
- Setting up Materials
- Components
- Surface Shader
- Volume Shader
- Displacement
- Physically Based Shading

---

# Assignment

Reference
**Panel :**Material ‣ Material Slots
Materials are data-blocks that can be created and then assigned to one or more objects. object can also have multiple materials assigned in different material slots, which correspond to different parts of object. If smooth transition between materials is desired, then mixing shader nodes with Mix shader is better solution.

## Material Slots

Material slots link materials to objects and meshes. By default objects only have single material slot, which assigns material to entire object. If different parts of mesh need different materials, multiple material slots can be created.
Material slots panel.

### Slot List

object’s material slots and active material displayed in List View .**(Add Material Slot)**Add new material slot on object.**(Remove Material Slot)**Remove material slot from object.**(Material Specials)**
**Copy Material**Copy material shader nodes and settings to clipboard.**Paste Material**Paste material shader nodes and settings from clipboard.**Copy Material to Selected**Copy same material assignment from active to other selected objects.**Remove Unused Slots**Removes all material slots not assigned to object.**Remove All Materials**Clears all material slots from active object. material data-blocks remain available in blend file but are no longer assigned.

### Data-Block

**Material**
Material Data-Block Menu for selected material slot. Here new materials can be created, or existing materials can to material slot.**Link**Specifies whether material is to be linked to object or to object data.
Link selector has two choices, Data and Object. These two menu choices determine whether material is linked to object or to data (e.g. mesh or curve). Data menu item determines that this material will be linked to mesh’s data-block which is linked to object’s data-block. Object menu item determines that material will be linked to object’s data-block directly.
This has consequences of course. For example, different objects may share same mesh data-block. Since this data-block defines shape of object any change in Edit Mode will be reflected on all of those objects. Moreover, anything linked to that mesh data-block will be shared by every object that shares that mesh. So, if material is linked to mesh, every object will share it.
On other hand, if material is linked directly to object data-block, objects can have different materials and still share same mesh.
Short explanation: If connected to object, you can have several instances of same Object Data using different materials. If linked to mesh data, you cannot. See Data System for more information.

### Edit Mode

To assign materials to different parts of mesh, enter Edit Mode on mesh. Additional buttons will then appear in material slots panel.
Material slots panel in Edit Mode.**Assign**Assign active material slot and material to selected faces in mesh, strokes in Grease Pencil, and similar for other object types.**Select**Select faces assigned to active material slot.**Deselect**Deselect faces assigned to active material slot.

## Reusing Existing Materials

Blender is built to allow you to reuse*anything*, including material settings, between many objects. Instead of creating duplicate materials, you can reuse existing material. There are several ways to do this using Material’s data-block menu:
_Single Object_– With object selected, click sphere located to left of Material name. pop-up appears showing all materials available in current blend-file. To use one, click on it.
Tip
Searching for Materials
search field at bottom of material list allows you to search names in list. For example, by entering “wood” all existent materials are filtered so that only materials containing “wood” are displayed in list.
_Multiple Objects_– In 3D Viewport, with Ctrl - L you can quickly link all selected objects to material (and other aspects) of active object . useful if you need to set large number of objects to same material; select all of them, then object that has desired material, and Ctrl - L links them to that “parent”.

## Deleting Material

To delete material, select material and click X in Available Materials List entry.
Although material will seem to disappear immediately, Delete action can depend on how material is used elsewhere.
If material is linked to object and there are other objects which use this material, then material will be removed from that object (but remain on all its other objects).
If “Fake User” button has been lit in Available Materials list, then material will be retained when file is saved, even if it has no users.
Only if it has 0 “real” users, and no “Fake” user, will material be permanently deleted. Note that it will still remain in Materials list until blend-file is saved, but will have disappeared when file is reloaded.

## Multiple Materials

Normally, different colors or patterns on object are achieved by adding textures to your materials. However, in some applications you can obtain multiple colors on object by assigning different materials to individual faces of object.
To apply several materials to different faces of same object, you use Material Slots options in Materials header panel.
workflow for applying second material to some faces of object covered by base material is as follows:

- In Object Mode, create base material.
- Go into Edit Mode and Face Select ( new list will appear below Active Material list with _Assign_, _Select_, *Deselect*buttons).
- Select faces to be colored with second material.
- In Object Material Slots list, create new slot or select existing material.
- Click *Assign*button, and material will appear on selected object faces.
- Assignment
- Material Slots
- Slot List
- Data-Block
- Edit Mode
- Reusing Existing Materials
- Deleting Material
- Multiple Materials

---

# Settings

Reference
**Panel :**Material ‣ Settings

## Renderer Settings

While shading nodes control appearance, these settings control quality and algorithms that each renderer uses to render material.

- EEVEE specific settings
- Cycles specific settings

## Pass Index

**Pass Index**
Index number for*Material Index*render pass . This can be used to give mask to material and then be read with ID Mask Node in Compositor.

Note
Volume Objects are not supported.

## Viewport Display

These settings control 3D Viewport display in solid shading. They provide faster alternative to full shader nodes, which may be too heavy or distracting for tasks like modeling, layout or sculpting.
**Color**Diffuse or metal surface color.**Metallic**Blends between non-metallic and metallic material model. value of 1.0 gives fully specular reflection tinted with base color, without diffuse reflection or transmission. At 0.0 material consists of diffuse or transmissive base layer, with specular reflection layer on top.**Roughness**
Specifies microfacet roughness of surface for metal and specular reflection.

- Settings
- Renderer Settings
- Pass Index
- Viewport Display
