# File Format Specification: `.sdf.json` Schema

> **Document Version:** 1.0.0  
> **Status:** Specification  
> **Target Path:** `projects/sdf-editor/docs/SDF_SCHEMA.md`  

---

## 1. Overview

The `.sdf.json` format is a lightweight, human-readable JSON schema defining an implicit Constructive Solid Geometry (CSG) scene. Unlike polygonal formats (`.obj`, `.fbx`) that store millions of vertex coordinates, an `.sdf.json` file stores the mathematical recipe and hierarchy required to evaluate the Signed Distance Field on any GPU or CPU.

---

## 2. JSON Schema Definition

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "SDFStudioScene",
  "type": "object",
  "required": ["version", "metadata", "rootNode"],
  "properties": {
    "version": { "type": "string", "enum": ["1.0.0"] },
    "metadata": {
      "type": "object",
      "required": ["name", "createdAt", "modifiedAt"],
      "properties": {
        "name": { "type": "string" },
        "author": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" },
        "modifiedAt": { "type": "string", "format": "date-time" },
        "generator": { "type": "string", "default": "SDF Studio 3D v1.0.0" }
      }
    },
    "environment": {
      "type": "object",
      "properties": {
        "backgroundColor": { "type": "string", "default": "#121212" },
        "ambientLight": { "type": "number", "default": 0.2 },
        "shadows": { "type": "boolean", "default": true },
        "ambientOcclusion": { "type": "boolean", "default": true },
        "matcapPreset": { "type": "string", "default": "clay" }
      }
    },
    "rootNode": { "$ref": "#/$defs/SDFNode" }
  },
  "$defs": {
    "SDFNode": {
      "type": "object",
      "required": ["id", "name", "kind", "transform", "visible"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "kind": { 
          "type": "string", 
          "enum": ["primitive", "group", "csg_op"] 
        },
        "visible": { "type": "boolean", "default": true },
        "transform": {
          "type": "object",
          "required": ["position", "rotation", "scale"],
          "properties": {
            "position": { 
              "type": "array", 
              "items": { "type": "number" }, 
              "minItems": 3, 
              "maxItems": 3 
            },
            "rotation": { 
              "type": "array", 
              "items": { "type": "number" }, 
              "minItems": 3, 
              "maxItems": 3 
            },
            "scale": { 
              "type": "array", 
              "items": { "type": "number" }, 
              "minItems": 3, 
              "maxItems": 3 
            }
          }
        },
        "primitive": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "sphere",
                "box",
                "cylinder",
                "torus",
                "capsule",
                "cone",
                "plane",
                "pipe",
                "hemisphere",
                "ellipsoid",
                "superellipsoid",
                "pyramid",
                "pentagonal_pyramid",
                "wedge",
                "frustum",
                "triangular_prism",
                "pentagonal_prism",
                "hexagonal_prism",
                "tetrahedron",
                "octahedron",
                "mandelbulb"
              ]
            },
            "dimensions": {
              "type": "object",
              "properties": {
                "radius": { "type": "number" },
                "size": { "type": "array", "items": { "type": "number" } },
                "height": { "type": "number" },
                "radiusMajor": { "type": "number" },
                "radiusMinor": { "type": "number" },
                "thickness": { "type": "number" },
                "radii": { "type": "array", "items": { "type": "number" } },
                "exponents": { "type": "array", "items": { "type": "number" } },
                "baseRadius": { "type": "number" },
                "topRadius": { "type": "number" },
                "bevelAngle": { "type": "number" },
                "fractalIterations": { "type": "integer" },
                "fractalPower": { "type": "number" }
              }
            }
          }
        },
        "csg": {
          "type": "object",
          "properties": {
            "operation": {
              "type": "string",
              "enum": ["union", "difference", "intersection"]
            },
            "blendMode": {
              "type": "string",
              "enum": ["hard", "smooth_polynomial", "smooth_exponential"]
            },
            "blendRadius": { "type": "number", "minimum": 0.0, "default": 0.0 }
          }
        },
        "modifiers": {
          "type": "object",
          "properties": {
            "roundRadius": { "type": "number", "default": 0.0 },
            "shellThickness": { "type": "number", "default": 0.0 },
            "elongation": { "type": "array", "items": { "type": "number" } },
            "twistFactor": { "type": "number", "default": 0.0 },
            "mirrorAxis": { "type": "string", "enum": ["none", "x", "y", "z"] }
          }
        },
        "material": {
          "type": "object",
          "properties": {
            "color": { "type": "string", "default": "#cccccc" },
            "roughness": { "type": "number", "minimum": 0.0, "maximum": 1.0, "default": 0.5 },
            "metalness": { "type": "number", "minimum": 0.0, "maximum": 1.0, "default": 0.0 },
            "emission": { "type": "string", "default": "#000000" }
          }
        },
        "children": {
          "type": "array",
          "items": { "$ref": "#/$defs/SDFNode" }
        }
      }
    }
  }
}
```

---

## 3. Example File: Coffee Mug with Hollow Interior and Handle

Below is an annotated example of a coffee mug modeled with a rounded cylinder, an inner cylinder subtracted via difference, and a torus handle fused via smooth union (`smin`):

```json
{
  "version": "1.0.0",
  "metadata": {
    "name": "Coffee Mug",
    "author": "SDF Studio Artist",
    "createdAt": "2026-11-05T16:50:00Z",
    "modifiedAt": "2026-11-05T16:50:00Z",
    "generator": "SDF Studio 3D v1.0.0"
  },
  "environment": {
    "backgroundColor": "#181818",
    "ambientLight": 0.25,
    "shadows": true,
    "ambientOcclusion": true,
    "matcapPreset": "clay"
  },
  "rootNode": {
    "id": "node_mug_root",
    "name": "Coffee Mug Root",
    "kind": "group",
    "visible": true,
    "transform": {
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    },
    "children": [
      {
        "id": "node_mug_body",
        "name": "Mug Outer Body",
        "kind": "primitive",
        "visible": true,
        "transform": {
          "position": [0, 0.6, 0],
          "rotation": [0, 0, 0],
          "scale": [1, 1, 1]
        },
        "primitive": {
          "type": "cylinder",
          "dimensions": { "radius": 0.5, "height": 0.6 }
        },
        "modifiers": { "roundRadius": 0.04 },
        "material": { "color": "#f0f0f0", "roughness": 0.2, "metalness": 0.0 },
        "children": [
          {
            "id": "node_mug_interior_cutout",
            "name": "Mug Cavity",
            "kind": "primitive",
            "visible": true,
            "transform": {
              "position": [0, 0.65, 0],
              "rotation": [0, 0, 0],
              "scale": [1, 1, 1]
            },
            "primitive": {
              "type": "cylinder",
              "dimensions": { "radius": 0.44, "height": 0.58 }
            },
            "csg": {
              "operation": "difference",
              "blendMode": "smooth_polynomial",
              "blendRadius": 0.04
            },
            "material": { "color": "#f0f0f0", "roughness": 0.2, "metalness": 0.0 }
          },
          {
            "id": "node_mug_handle",
            "name": "Mug Handle",
            "kind": "primitive",
            "visible": true,
            "transform": {
              "position": [0.55, 0.6, 0],
              "rotation": [0, 0, 1.5708],
              "scale": [1, 1, 1]
            },
            "primitive": {
              "type": "torus",
              "dimensions": { "radiusMajor": 0.3, "radiusMinor": 0.07 }
            },
            "csg": {
              "operation": "union",
              "blendMode": "smooth_polynomial",
              "blendRadius": 0.06
            },
            "material": { "color": "#f0f0f0", "roughness": 0.2, "metalness": 0.0 }
          }
        ]
      }
    ]
  }
}
```

