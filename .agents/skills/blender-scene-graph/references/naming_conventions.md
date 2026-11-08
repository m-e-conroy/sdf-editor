# Blender Naming Conventions

Maintain a professional and searchable scene graph by following these naming standards.

## Object Prefixes

| Type | Prefix | Example |
| :--- | :--- | :--- |
| Mesh | `GEO_` | `GEO_Character_Body` |
| Light | `LGT_` | `LGT_Sun_Key` |
| Camera | `CAM_` | `CAM_Main_Shot_01` |
| Empty | `EMP_` | `EMP_Character_Root` |
| Curve | `CRV_` | `CRV_Path_Road` |
| Armature | `RIG_` | `RIG_Main_Skeleton` |
| Collection | `COL_` | `COL_Environment` |

## Collection Hierarchy

1. **MASTER_COLLECTION**
   - **LGT_COLLECTION**: All light sources.
   - **CAM_COLLECTION**: All cameras.
   - **ENV_COLLECTION**: Static environment geometry.
     - **VEG_SUBCOL**: Trees, grass, flowers.
     - **ARCH_SUBCOL**: Buildings, walls, floors.
   - **CHAR_COLLECTION**: Characters and animated assets.

## Tips for Success

- **CamelCase or snake_case**: Pick one and stick to it (e.g., `GEO_BrickWall` or `geo_brick_wall`).
- **Suffixes for Variants**: Use `_L` or `_R` for symmetry (e.g., `GEO_Hand_L`).
- **Low Poly vs High Poly**: Use `_LP` and `_HP` suffixes for bake-ready assets.
