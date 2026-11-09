// ========================================================================
// SDF Studio 3D - Method Request/Response Schemas & Scene Recipe Spec
// ========================================================================

import { z } from 'zod';
import { PrimitiveTypeSchema } from './primitives';

// --- Shared Data Types ---

export const Vec3Schema = z.tuple([z.number(), z.number(), z.number()]);
export type Vec3 = z.infer<typeof Vec3Schema>;

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex color (e.g. #e2e8f0)');

export const CSGOpTypeSchema = z.enum(['union', 'difference', 'intersection']);
export type CSGOpType = z.infer<typeof CSGOpTypeSchema>;

export const BlendModeSchema = z.enum(['hard', 'smooth_polynomial']);
export type BlendMode = z.infer<typeof BlendModeSchema>;

export const BlendConfigSchema = z.object({
  mode: BlendModeSchema,
  radius: z.number().nonnegative()
});
export type BlendConfig = z.infer<typeof BlendConfigSchema>;

export const MaterialConfigSchema = z.object({
  color: HexColorSchema.default('#e2e8f0'),
  roughness: z.number().min(0).max(1).default(0.35),
  metalness: z.number().min(0).max(1).default(0.1)
});
export type MaterialConfig = z.infer<typeof MaterialConfigSchema>;

export const ModifiersSchema = z.object({
  roundRadius: z.number().nonnegative().optional(),
  shellThickness: z.number().nonnegative().optional(),
  twistFactor: z.number().optional(),
  bendFactor: z.number().optional(),
  mirrorAxes: z.tuple([z.boolean(), z.boolean(), z.boolean()]).optional(),
  radialRepeat: z.number().int().min(1).max(24).optional(),
  linearCount: z.number().int().min(1).max(16).optional(),
  linearSpacing: z.number().positive().optional()
});
export type ModifiersConfig = z.infer<typeof ModifiersSchema>;

// --- Scene Recipe Specification ---

export interface SceneRecipeNode {
  ref?: string;
  name?: string;
  type: z.infer<typeof PrimitiveTypeSchema> | 'group';
  dimensions?: Record<string, any>;
  position?: Vec3;
  rotationDeg?: Vec3;
  scale?: Vec3;
  operation?: CSGOpType;
  blend?: BlendConfig;
  material?: Partial<MaterialConfig>;
  modifiers?: ModifiersConfig;
  children?: SceneRecipeNode[];
}

export const SceneRecipeNodeSchema: z.ZodType<SceneRecipeNode> = z.lazy(() =>
  z.object({
    ref: z.string().max(64).optional(),
    name: z.string().max(64).optional(),
    type: z.union([PrimitiveTypeSchema, z.literal('group')]),
    dimensions: z.record(z.string(), z.any()).optional(),
    position: Vec3Schema.optional(),
    rotationDeg: Vec3Schema.optional(),
    scale: Vec3Schema.optional(),
    operation: CSGOpTypeSchema.optional(),
    blend: BlendConfigSchema.optional(),
    material: MaterialConfigSchema.partial().optional(),
    modifiers: ModifiersSchema.optional(),
    children: z.array(SceneRecipeNodeSchema).optional()
  })
);

export const SceneRecipeSchema = z.object({
  mode: z.enum(['replace', 'append']).default('replace'),
  dryRun: z.boolean().default(false),
  parentId: z.string().optional(),
  index: z.number().int().nonnegative().optional(),
  nodes: z.array(SceneRecipeNodeSchema).min(1)
});

export type SceneRecipe = z.infer<typeof SceneRecipeSchema>;

// --- 19 RPC Method Schemas ---

// 1. scene.getScene
export const GetSceneParamsSchema = z.object({
  includeDimensions: z.boolean().optional()
});
export const GetSceneResultSchema = z.object({
  scene: z.any(),
  revision: z.number().int().nonnegative(),
  selection: z.string().nullable(),
  counts: z.object({
    leaves: z.number().int().nonnegative(),
    instructions: z.number().int().nonnegative(),
    groups: z.number().int().nonnegative(),
    depth: z.number().int().nonnegative()
  })
});

// 2. scene.listPrimitives
export const ListPrimitivesParamsSchema = z.object({});
export const ListPrimitivesResultSchema = z.object({
  primitives: z.record(z.string(), z.any())
});

// 3. scene.addPrimitive
export const AddPrimitiveParamsSchema = z.object({
  type: PrimitiveTypeSchema,
  name: z.string().max(64).optional(),
  dimensions: z.record(z.string(), z.any()).optional(),
  position: Vec3Schema.optional(),
  rotationDeg: Vec3Schema.optional(),
  scale: Vec3Schema.optional(),
  operation: CSGOpTypeSchema.optional(),
  blend: BlendConfigSchema.optional(),
  material: MaterialConfigSchema.partial().optional(),
  modifiers: ModifiersSchema.optional(),
  parentId: z.string().optional(),
  index: z.number().int().nonnegative().optional(),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const AddPrimitiveResultSchema = z.object({
  nodeId: z.string(),
  revision: z.number().int().nonnegative()
});

// 4. scene.createGroup
export const CreateGroupParamsSchema = z.object({
  name: z.string().max(64).default('Group'),
  parentId: z.string().optional(),
  index: z.number().int().nonnegative().optional(),
  wrapNodeIds: z.array(z.string()).optional(),
  operation: CSGOpTypeSchema.optional(),
  blend: BlendConfigSchema.optional(),
  modifiers: ModifiersSchema.optional(),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const CreateGroupResultSchema = z.object({
  groupId: z.string(),
  revision: z.number().int().nonnegative()
});

// 5. scene.updateNode
export const UpdateNodeParamsSchema = z.object({
  nodeId: z.string().min(1),
  name: z.string().max(64).optional(),
  visible: z.boolean().optional(),
  position: Vec3Schema.optional(),
  rotationDeg: Vec3Schema.optional(),
  scale: Vec3Schema.optional(),
  dimensions: z.record(z.string(), z.any()).optional(),
  operation: CSGOpTypeSchema.optional(),
  blend: BlendConfigSchema.optional(),
  material: MaterialConfigSchema.partial().optional(),
  modifiers: ModifiersSchema.optional(),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const UpdateNodeResultSchema = z.object({
  nodeId: z.string(),
  revision: z.number().int().nonnegative()
});

// 6. scene.deleteNode
export const DeleteNodeParamsSchema = z.object({
  nodeId: z.string().min(1),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const DeleteNodeResultSchema = z.object({
  deletedId: z.string(),
  revision: z.number().int().nonnegative()
});

// 7. scene.duplicateNode
export const DuplicateNodeParamsSchema = z.object({
  nodeId: z.string().min(1),
  offset: Vec3Schema.optional(),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const DuplicateNodeResultSchema = z.object({
  newNodeId: z.string(),
  revision: z.number().int().nonnegative()
});

// 8. scene.moveNode
export const MoveNodeParamsSchema = z.object({
  nodeId: z.string().min(1),
  newParentId: z.string().optional(),
  index: z.number().int().nonnegative(),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const MoveNodeResultSchema = z.object({
  nodeId: z.string(),
  newParentId: z.string().optional(),
  index: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative()
});

// 9. scene.ungroup
export const UngroupParamsSchema = z.object({
  groupId: z.string().min(1),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const UngroupResultSchema = z.object({
  dissolvedGroupId: z.string(),
  releasedNodeIds: z.array(z.string()),
  revision: z.number().int().nonnegative()
});

// 10. scene.clearScene
export const ClearSceneParamsSchema = z.object({
  mode: z.enum(['empty', 'default']).default('empty'),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const ClearSceneResultSchema = z.object({
  revision: z.number().int().nonnegative()
});

// 11. scene.applyRecipe
export const ApplyRecipeParamsSchema = z.object({
  recipe: SceneRecipeSchema,
  mode: z.enum(['replace', 'append']).optional(),
  dryRun: z.boolean().optional(),
  parentId: z.string().optional(),
  index: z.number().int().nonnegative().optional(),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const ApplyRecipeResultSchema = z.object({
  revision: z.number().int().nonnegative(),
  refs: z.record(z.string(), z.string()),
  counts: z.object({
    leaves: z.number().int().nonnegative(),
    instructions: z.number().int().nonnegative(),
    depth: z.number().int().nonnegative()
  }),
  warnings: z.array(z.string())
});

// 12. scene.history
export const HistoryParamsSchema = z.object({
  action: z.enum(['undo', 'redo']),
  steps: z.number().int().positive().default(1),
  expectedRevision: z.number().int().nonnegative().optional()
});
export const HistoryResultSchema = z.object({
  revision: z.number().int().nonnegative(),
  canUndo: z.boolean(),
  canRedo: z.boolean()
});

// 13. ui.selectNode
export const SelectNodeParamsSchema = z.object({
  nodeId: z.string().nullable()
});
export const SelectNodeResultSchema = z.object({
  selectedNodeId: z.string().nullable()
});

// 14. ui.setCamera
export const SetCameraParamsSchema = z.object({
  view: z.enum(['front', 'right', 'top', 'perspective']).optional(),
  azimuthDeg: z.number().optional(),
  elevationDeg: z.number().optional(),
  distance: z.number().positive().optional(),
  target: Vec3Schema.optional()
});
export const SetCameraResultSchema = z.object({
  camera: z.object({
    position: Vec3Schema,
    target: Vec3Schema,
    distance: z.number().optional()
  })
});

// 15. sense.takeSnapshot
export const TakeSnapshotParamsSchema = z.object({
  views: z
    .array(z.enum(['current', 'front', 'right', 'top', 'isometric', 'contact_sheet']))
    .default(['current']),
  width: z.number().int().min(64).max(1024).default(512),
  height: z.number().int().min(64).max(1024).default(512),
  format: z.enum(['png', 'jpeg', 'webp']).default('png'),
  showGrid: z.boolean().default(false),
  highlightNodeId: z.string().nullable().optional()
});
export const TakeSnapshotResultSchema = z.object({
  images: z.array(
    z.object({
      view: z.string(),
      dataUrl: z.string().min(1),
      width: z.number().int(),
      height: z.number().int(),
      mimeType: z.string()
    })
  )
});

// 16. sense.getBounds
export const GetBoundsParamsSchema = z.object({
  nodeId: z.string().optional(),
  tight: z.boolean().default(false),
  includeVolume: z.boolean().default(false)
});
export const GetBoundsResultSchema = z.object({
  min: Vec3Schema,
  max: Vec3Schema,
  size: Vec3Schema,
  center: Vec3Schema,
  volumeEstimate: z.number().optional()
});

// 17. sense.sampleDistance
export const SampleDistanceParamsSchema = z.object({
  points: z.array(Vec3Schema).min(1).max(256),
  nodeId: z.string().optional()
});
export const SampleDistanceResultSchema = z.object({
  samples: z.array(
    z.object({
      point: Vec3Schema,
      distance: z.number(),
      nearestNodeId: z.string().optional()
    })
  )
});

// 18. file.project
export const ProjectParamsSchema = z.object({
  action: z.enum(['save', 'load']),
  filename: z.string().optional(),
  projectData: z.any().optional()
});
export const ProjectResultSchema = z.object({
  success: z.boolean(),
  filename: z.string().optional(),
  projectData: z.any().optional(),
  revision: z.number().int().nonnegative().optional()
});

// 19. file.exportMesh
export const ExportMeshParamsSchema = z.object({
  format: z.enum(['glb', 'obj', 'glsl']),
  resolution: z.union([z.number().int(), z.enum(['32', '64', '128'])]).default(64),
  filename: z.string().optional(),
  overwrite: z.boolean().default(false)
});
export const ExportMeshResultSchema = z.object({
  filename: z.string(),
  bytes: z.number().int().nonnegative().optional(),
  format: z.string(),
  data: z.string().optional()
});

// --- Method Name Map & Registry ---

export const METHODS = {
  SCENE_GET_SCENE: 'scene.getScene',
  SCENE_LIST_PRIMITIVES: 'scene.listPrimitives',
  SCENE_ADD_PRIMITIVE: 'scene.addPrimitive',
  SCENE_CREATE_GROUP: 'scene.createGroup',
  SCENE_UPDATE_NODE: 'scene.updateNode',
  SCENE_DELETE_NODE: 'scene.deleteNode',
  SCENE_DUPLICATE_NODE: 'scene.duplicateNode',
  SCENE_MOVE_NODE: 'scene.moveNode',
  SCENE_UNGROUP: 'scene.ungroup',
  SCENE_CLEAR_SCENE: 'scene.clearScene',
  SCENE_APPLY_RECIPE: 'scene.applyRecipe',
  SCENE_HISTORY: 'scene.history',
  UI_SELECT_NODE: 'ui.selectNode',
  UI_SET_CAMERA: 'ui.setCamera',
  SENSE_TAKE_SNAPSHOT: 'sense.takeSnapshot',
  SENSE_GET_BOUNDS: 'sense.getBounds',
  SENSE_SAMPLE_DISTANCE: 'sense.sampleDistance',
  FILE_PROJECT: 'file.project',
  FILE_EXPORT_MESH: 'file.exportMesh'
} as const;

export const METHOD_SCHEMAS = {
  [METHODS.SCENE_GET_SCENE]: { params: GetSceneParamsSchema, result: GetSceneResultSchema },
  [METHODS.SCENE_LIST_PRIMITIVES]: { params: ListPrimitivesParamsSchema, result: ListPrimitivesResultSchema },
  [METHODS.SCENE_ADD_PRIMITIVE]: { params: AddPrimitiveParamsSchema, result: AddPrimitiveResultSchema },
  [METHODS.SCENE_CREATE_GROUP]: { params: CreateGroupParamsSchema, result: CreateGroupResultSchema },
  [METHODS.SCENE_UPDATE_NODE]: { params: UpdateNodeParamsSchema, result: UpdateNodeResultSchema },
  [METHODS.SCENE_DELETE_NODE]: { params: DeleteNodeParamsSchema, result: DeleteNodeResultSchema },
  [METHODS.SCENE_DUPLICATE_NODE]: { params: DuplicateNodeParamsSchema, result: DuplicateNodeResultSchema },
  [METHODS.SCENE_MOVE_NODE]: { params: MoveNodeParamsSchema, result: MoveNodeResultSchema },
  [METHODS.SCENE_UNGROUP]: { params: UngroupParamsSchema, result: UngroupResultSchema },
  [METHODS.SCENE_CLEAR_SCENE]: { params: ClearSceneParamsSchema, result: ClearSceneResultSchema },
  [METHODS.SCENE_APPLY_RECIPE]: { params: ApplyRecipeParamsSchema, result: ApplyRecipeResultSchema },
  [METHODS.SCENE_HISTORY]: { params: HistoryParamsSchema, result: HistoryResultSchema },
  [METHODS.UI_SELECT_NODE]: { params: SelectNodeParamsSchema, result: SelectNodeResultSchema },
  [METHODS.UI_SET_CAMERA]: { params: SetCameraParamsSchema, result: SetCameraResultSchema },
  [METHODS.SENSE_TAKE_SNAPSHOT]: { params: TakeSnapshotParamsSchema, result: TakeSnapshotResultSchema },
  [METHODS.SENSE_GET_BOUNDS]: { params: GetBoundsParamsSchema, result: GetBoundsResultSchema },
  [METHODS.SENSE_SAMPLE_DISTANCE]: { params: SampleDistanceParamsSchema, result: SampleDistanceResultSchema },
  [METHODS.FILE_PROJECT]: { params: ProjectParamsSchema, result: ProjectResultSchema },
  [METHODS.FILE_EXPORT_MESH]: { params: ExportMeshParamsSchema, result: ExportMeshResultSchema }
} as const;

