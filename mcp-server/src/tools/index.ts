// ========================================================================
// SDF Studio 3D - 19 MCP Tools Implementation
// ========================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StudioHub } from '../hub/StudioHub.js';
import { SafeFileWriter } from '../fs/SafeFileWriter.js';
import {
  PRIMITIVE_SCHEMAS,
  PRIMITIVE_TYPES,
  METHODS,
  SceneRecipeSchema,
  Vec3Schema,
  HexColorSchema,
  CSGOpTypeSchema,
  BlendModeSchema
} from '../protocol/index.js';

export function registerTools(server: McpServer, hub: StudioHub, fileWriter: SafeFileWriter): void {
  async function handleRpc<T>(fn: () => Promise<T>) {
    try {
      const result = await fn();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }]
      };
    } catch (err: any) {
      process.stderr.write(`[MCP Tool Error] ${err.message}\n`);
      const errorPayload = {
        error: err.code || 'EXECUTION_ERROR',
        message: err.message,
        hint: err.hint
      };
      return {
        isError: true,
        content: [{ type: 'text' as const, text: JSON.stringify(errorPayload, null, 2) }]
      };
    }
  }

  // 1. sdf_get_scene
  server.tool(
    'sdf_get_scene',
    'Get full CSG scene tree, active selection, primitive count limits, and current revision.',
    {
      includeDimensions: z.boolean().optional().describe('Whether to include full dimension specs for each node')
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_GET_SCENE, args))
  );

  // 2. sdf_list_primitives
  server.tool(
    'sdf_list_primitives',
    'List all 22 available geometric primitives with their categories, parameter definitions, and defaults.',
    {},
    async () => ({
      content: [{ type: 'text', text: JSON.stringify({ primitives: PRIMITIVE_SCHEMAS }, null, 2) }]
    })
  );

  // 3. sdf_add_primitive
  server.tool(
    'sdf_add_primitive',
    'Add a new geometric primitive shape node to the scene.',
    {
      type: z.enum(PRIMITIVE_TYPES as any).describe('The primitive geometry type'),
      name: z.string().max(64).optional().describe('Human-readable node label'),
      dimensions: z.record(z.string(), z.any()).optional().describe('Specific primitive dimensions (e.g. radius, size, height)'),
      position: Vec3Schema.optional().describe('World position [x, y, z]'),
      rotationDeg: Vec3Schema.optional().describe('Euler rotation in degrees [x, y, z]'),
      scale: Vec3Schema.optional().describe('Scale factors [x, y, z]'),
      operation: CSGOpTypeSchema.optional().describe('CSG boolean operation against preceding node (union, difference, intersection)'),
      blend: z.object({ mode: BlendModeSchema, radius: z.number().nonnegative() }).optional(),
      material: z.object({ color: HexColorSchema.optional(), roughness: z.number().min(0).max(1).optional(), metalness: z.number().min(0).max(1).optional() }).optional(),
      parentId: z.string().optional().describe('ID of parent group to append under (defaults to root)'),
      index: z.number().int().nonnegative().optional().describe('Insert index within parent children'),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_ADD_PRIMITIVE, args))
  );

  // 4. sdf_create_group
  server.tool(
    'sdf_create_group',
    'Create a new CSG group node, optionally wrapping existing nodes to form sub-expressions like (A - B).',
    {
      name: z.string().max(64).default('Group'),
      parentId: z.string().optional(),
      index: z.number().int().nonnegative().optional(),
      wrapNodeIds: z.array(z.string()).optional().describe('Existing node IDs to wrap into this new group'),
      operation: CSGOpTypeSchema.optional(),
      blend: z.object({ mode: BlendModeSchema, radius: z.number().nonnegative() }).optional(),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_CREATE_GROUP, args))
  );

  // 5. sdf_update_node
  server.tool(
    'sdf_update_node',
    'Patch properties of an existing node (transform, dimensions, material, or CSG blend).',
    {
      nodeId: z.string().min(1),
      name: z.string().max(64).optional(),
      visible: z.boolean().optional(),
      position: Vec3Schema.optional(),
      rotationDeg: Vec3Schema.optional(),
      scale: Vec3Schema.optional(),
      dimensions: z.record(z.string(), z.any()).optional(),
      operation: CSGOpTypeSchema.optional(),
      blend: z.object({ mode: BlendModeSchema, radius: z.number().nonnegative() }).optional(),
      material: z.object({ color: HexColorSchema.optional(), roughness: z.number().min(0).max(1).optional(), metalness: z.number().min(0).max(1).optional() }).optional(),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_UPDATE_NODE, args))
  );

  // 6. sdf_delete_node
  server.tool(
    'sdf_delete_node',
    'Delete a node (and its entire subtree if it is a group).',
    {
      nodeId: z.string().min(1),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_DELETE_NODE, args))
  );

  // 7. sdf_duplicate_node
  server.tool(
    'sdf_duplicate_node',
    'Duplicate a node or group with an optional translation offset.',
    {
      nodeId: z.string().min(1),
      offset: Vec3Schema.optional(),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_DUPLICATE_NODE, args))
  );

  // 8. sdf_move_node
  server.tool(
    'sdf_move_node',
    'Reparent and/or reorder a node (reordering changes CSG evaluation order).',
    {
      nodeId: z.string().min(1),
      newParentId: z.string().optional(),
      index: z.number().int().nonnegative(),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_MOVE_NODE, args))
  );

  // 9. sdf_ungroup
  server.tool(
    'sdf_ungroup',
    'Dissolve a group, promoting its children into siblings while preserving world transforms.',
    {
      groupId: z.string().min(1),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_UNGROUP, args))
  );

  // 10. sdf_clear_scene
  server.tool(
    'sdf_clear_scene',
    'Clear the scene completely or reset it to default.',
    {
      mode: z.enum(['empty', 'default']).default('empty'),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_CLEAR_SCENE, args))
  );

  // 11. sdf_apply_scene_recipe
  server.tool(
    'sdf_apply_scene_recipe',
    'Apply a full declarative nested CSG recipe atomically in one single undo step.',
    {
      recipe: SceneRecipeSchema.describe('Declarative nested hierarchy of nodes and groups'),
      mode: z.enum(['replace', 'append']).optional(),
      dryRun: z.boolean().optional().describe('Validate recipe and calculate counts without mutating'),
      parentId: z.string().optional(),
      index: z.number().int().nonnegative().optional(),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_APPLY_RECIPE, args))
  );

  // 12. sdf_history
  server.tool(
    'sdf_history',
    'Undo or redo scene edits.',
    {
      action: z.enum(['undo', 'redo']),
      steps: z.number().int().positive().default(1),
      expectedRevision: z.number().int().nonnegative().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SCENE_HISTORY, args))
  );

  // 13. sdf_select_node
  server.tool(
    'sdf_select_node',
    'Select a node to direct the user viewport highlight, or pass null to deselect.',
    {
      nodeId: z.string().nullable()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.UI_SELECT_NODE, args))
  );

  // 14. sdf_set_camera
  server.tool(
    'sdf_set_camera',
    'Reposition the viewport camera or switch to an orthographic angle.',
    {
      view: z.enum(['front', 'right', 'top', 'perspective']).optional(),
      azimuthDeg: z.number().optional(),
      elevationDeg: z.number().optional(),
      distance: z.number().positive().optional(),
      target: Vec3Schema.optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.UI_SET_CAMERA, args))
  );

  // 15. sdf_take_snapshot
  server.tool(
    'sdf_take_snapshot',
    'Capture clean, gizmo-free renders from one or multiple angles (returns native MCP images).',
    {
      views: z
        .array(z.enum(['current', 'front', 'right', 'top', 'isometric', 'contact_sheet']))
        .default(['current']),
      width: z.number().int().min(64).max(1024).default(512),
      height: z.number().int().min(64).max(1024).default(512),
      format: z.enum(['png', 'jpeg', 'webp']).default('png'),
      showGrid: z.boolean().default(false),
      highlightNodeId: z.string().nullable().optional()
    },
    async (args) => {
      try {
        const result: any = await hub.callMethod(METHODS.SENSE_TAKE_SNAPSHOT, args);
        const content: any[] = [];
        for (const img of result.images || []) {
          const base64Data = img.dataUrl.replace(/^data:image\/\w+;base64,/, '');
          content.push({
            type: 'image',
            data: base64Data,
            mimeType: img.mimeType || 'image/png'
          });
        }
        return { content };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: 'text', text: JSON.stringify({ error: err.code, message: err.message }, null, 2) }]
        };
      }
    }
  );

  // 16. sdf_get_contact_sheet
  server.tool(
    'sdf_get_contact_sheet',
    'Capture a 2x2 multi-angle contact sheet (Front, Top, Right, Isometric) in one call.',
    {
      size: z.number().int().min(256).max(1024).default(512)
    },
    async (args) => {
      const result: any = await hub.callMethod(METHODS.SENSE_TAKE_SNAPSHOT, {
        views: ['contact_sheet'],
        width: args.size,
        height: args.size,
        format: 'png'
      });
      const img = result.images?.[0];
      if (!img) throw new Error('Failed to render contact sheet');
      const base64Data = img.dataUrl.replace(/^data:image\/\w+;base64,/, '');
      return {
        content: [{ type: 'image', data: base64Data, mimeType: img.mimeType || 'image/png' }]
      };
    }
  );

  // 17. sdf_get_bounds
  server.tool(
    'sdf_get_bounds',
    'Query the 3D bounding box (AABB) and optional volume estimate of the whole scene or a specific node.',
    {
      nodeId: z.string().optional(),
      tight: z.boolean().default(false).describe('Use sampled raymarching for tighter bounds on rotated/curved shapes'),
      includeVolume: z.boolean().default(false)
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SENSE_GET_BOUNDS, args))
  );

  // 18. sdf_sample_distance
  server.tool(
    'sdf_sample_distance',
    'Sample signed distance field values and nearest nodes at up to 256 3D query points.',
    {
      points: z.array(Vec3Schema).min(1).max(256),
      nodeId: z.string().optional()
    },
    async (args) => handleRpc(() => hub.callMethod(METHODS.SENSE_SAMPLE_DISTANCE, args))
  );

  // 19. sdf_export
  server.tool(
    'sdf_export',
    'Export the scene as a 3D mesh (.glb, .obj) or standalone GLSL shader (.glsl) and write to disk.',
    {
      format: z.enum(['glb', 'obj', 'glsl']),
      resolution: z.union([z.number().int(), z.enum(['32', '64', '128'])]).default(64),
      filename: z.string().optional(),
      overwrite: z.boolean().default(false)
    },
    async (args) => {
      try {
        const res: any = await hub.callMethod(METHODS.FILE_EXPORT_MESH, args, { timeoutMs: 120000 });
        const written = fileWriter.writeFile({
          filename: args.filename,
          defaultName: `model_${Date.now()}`,
          extension: `.${args.format}` as any,
          content: res.data || '',
          overwrite: args.overwrite
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  ok: true,
                  path: written.filepath,
                  filename: written.filename,
                  bytes: written.bytes
                },
                null,
                2
              )
            }
          ]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: 'text', text: JSON.stringify({ error: err.code || 'EXPORT_FAILED', message: err.message }, null, 2) }]
        };
      }
    }
  );
}
