// ========================================================================
// SDF Studio 3D - Bridge Request Dispatcher (Task 2.2)
// Routes incoming MCP Bridge RPC requests to SceneStore, RaymarchRenderer,
// SceneQueries, and Exporters.
// Enforces single-undo transactions and expectedRevision verification.
// ========================================================================

import {
  ERROR_CODES,
  createResponseSuccess,
  createResponseError,
  createProgressEnvelope,
  type RequestEnvelope,
  type ResponseEnvelope
} from '../../shared/protocol/envelope';
import { PRIMITIVE_REGISTRY } from '../../shared/protocol/primitives';
import { SceneStore } from '../store/SceneStore';
import { CSGTree } from '../tree/CSGTree';
import type { SDFNode, PrimitiveType } from '../tree/types';
import { SceneQueries } from '../engine/SceneQueries';
import { ShaderExporter } from '../engine/ShaderExporter';
import { generateGLBBuffer, exportOBJ, computeAutoBounds } from '../engine/MeshExporter';
import { MeshExtractor } from '../engine/MeshExtractor';
import { countLeaves } from '../engine/SceneLimits';
import type { AgentBridge } from './AgentBridge';
import type { RaymarchRenderer } from '../engine/RaymarchRenderer';

const toVec3 = (v: number[]): [number, number, number] => [v[0], v[1], v[2]];

export class BridgeDispatcher {
  private bridge: AgentBridge;
  private sceneStore: SceneStore;
  private renderer: RaymarchRenderer | null = null;
  private meshExtractor: MeshExtractor = new MeshExtractor();

  constructor(
    bridge: AgentBridge,
    sceneStore: SceneStore = SceneStore.getInstance(),
    renderer: RaymarchRenderer | null = null
  ) {
    this.bridge = bridge;
    this.sceneStore = sceneStore;
    this.renderer = renderer;

    // Listen to inbound MCP requests from the bridge
    this.bridge.addEventListener('request-received', ((event: CustomEvent<{ request: RequestEnvelope }>) => {
      if (event.detail?.request) {
        this.dispatch(event.detail.request);
      }
    }) as EventListener);
  }

  public setRenderer(renderer: RaymarchRenderer): void {
    this.renderer = renderer;
  }

  /**
   * Main dispatch entrypoint for an incoming RequestEnvelope.
   */
  public async dispatch(request: RequestEnvelope): Promise<ResponseEnvelope> {
    const { id, method, params, expectedRevision } = request;

    // 1. Verify expectedRevision for mutating or revision-sensitive requests
    if (expectedRevision !== undefined && expectedRevision !== this.sceneStore.revision) {
      const summary = {
        revision: this.sceneStore.revision,
        leafCount: countLeaves(this.sceneStore.tree.root),
        selectedNodeId: this.sceneStore.selectedNodeId
      };
      const response = createResponseError(
        id,
        ERROR_CODES.REVISION_CONFLICT,
        `Revision conflict: expected revision ${expectedRevision}, but current revision is ${this.sceneStore.revision}.`,
        JSON.stringify(summary)
      );
      this.bridge.sendResponse(response);
      return response;
    }

    try {
      let result: any;

      switch (method) {
        // --- 1. Scene Read & Introspection ---
        case 'scene.getScene':
        case 'scene.get': {
          result = this.handleGetScene();
          break;
        }

        case 'scene.listPrimitives': {
          result = { primitives: PRIMITIVE_REGISTRY };
          break;
        }

        // --- 2. Scene Mutations (Wrapped in Transactions) ---
        case 'scene.addPrimitive': {
          result = this.handleAddPrimitive(params);
          break;
        }

        case 'scene.createGroup': {
          result = this.handleCreateGroup(params);
          break;
        }

        case 'scene.updateNode': {
          result = this.handleUpdateNode(params);
          break;
        }

        case 'scene.deleteNode': {
          result = this.handleDeleteNode(params);
          break;
        }

        case 'scene.duplicateNode': {
          result = this.handleDuplicateNode(params);
          break;
        }

        case 'scene.moveNode': {
          result = this.handleMoveNode(params);
          break;
        }

        case 'scene.ungroup': {
          result = this.handleUngroup(params);
          break;
        }

        case 'scene.clearScene':
        case 'scene.clear': {
          result = this.handleClearScene(params);
          break;
        }

        case 'scene.applyRecipe': {
          result = await this.handleApplyRecipe(params);
          break;
        }

        case 'scene.history': {
          result = this.handleHistory(params);
          break;
        }

        // --- 3. UI Controls ---
        case 'ui.selectNode':
        case 'ui.select': {
          result = this.handleSelectNode(params);
          break;
        }

        case 'ui.setCamera': {
          result = this.handleSetCamera(params);
          break;
        }

        // --- 4. Sensing & Vision ---
        case 'sense.takeSnapshot':
        case 'sense.snapshot': {
          result = await this.handleTakeSnapshot(params);
          break;
        }

        case 'sense.contactSheet': {
          result = await this.handleContactSheet(params);
          break;
        }

        case 'sense.getBounds':
        case 'query.bounds': {
          result = this.handleGetBounds(params);
          break;
        }

        case 'sense.sampleDistance':
        case 'query.sampleDistance': {
          result = this.handleSampleDistance(params);
          break;
        }

        case 'query.volume': {
          result = this.handleEstimateVolume(params);
          break;
        }

        // --- 5. Project & Export ---
        case 'file.project': {
          result = this.handleProject(params);
          break;
        }

        case 'file.exportMesh':
        case 'export.mesh': {
          result = await this.handleExportMesh(id, params);
          break;
        }

        case 'export.shader': {
          result = this.handleExportShader(params);
          break;
        }

        default: {
          const response = createResponseError(
            id,
            ERROR_CODES.VALIDATION_ERROR,
            `Unknown or unsupported RPC method: "${method}".`
          );
          this.bridge.sendResponse(response);
          return response;
        }
      }

      const response = createResponseSuccess(id, result, this.sceneStore.revision);
      this.bridge.sendResponse(response);
      return response;
    } catch (err: any) {
      const code = err.code || ERROR_CODES.VALIDATION_ERROR;
      const message = err.message || String(err);
      const response = createResponseError(id, code, message);
      this.bridge.sendResponse(response);
      return response;
    }
  }

  // --- Handlers ---

  private handleGetScene(): any {
    const root = this.sceneStore.tree.root;

    const countNodes = (n: SDFNode): { leaves: number; groups: number; depth: number } => {
      let leaves = n.kind === 'primitive' ? 1 : 0;
      let groups = n.kind === 'group' ? 1 : 0;
      let maxChildDepth = 0;
      for (const child of n.children) {
        const sub = countNodes(child);
        leaves += sub.leaves;
        groups += sub.groups;
        if (sub.depth > maxChildDepth) maxChildDepth = sub.depth;
      }
      return { leaves, groups, depth: maxChildDepth + 1 };
    };

    const stats = countNodes(root);

    return {
      scene: this.sceneStore.tree.toJSON(),
      revision: this.sceneStore.revision,
      selection: this.sceneStore.selectedNodeId,
      counts: {
        leaves: stats.leaves,
        instructions: stats.leaves + stats.groups,
        groups: stats.groups,
        depth: stats.depth
      }
    };
  }

  private handleAddPrimitive(params: any): any {
    const type: PrimitiveType = params.type || 'sphere';
    const newNode = CSGTree.createDefaultNode(type, params.name);

    if (params.dimensions && newNode.primitive) {
      newNode.primitive.dimensions = { ...newNode.primitive.dimensions, ...params.dimensions };
    }
    if (params.position) {
      newNode.transform.position = toVec3(params.position);
    }
    if (params.rotationDeg) {
      // Convert degrees to radians
      newNode.transform.rotation = [
        (params.rotationDeg[0] * Math.PI) / 180,
        (params.rotationDeg[1] * Math.PI) / 180,
        (params.rotationDeg[2] * Math.PI) / 180
      ];
    }
    if (params.scale) {
      newNode.transform.scale = toVec3(params.scale);
    }
    if (params.operation) {
      newNode.csg.operation = params.operation;
    }
    if (params.blend) {
      newNode.csg.blendMode = params.blend.mode || 'hard';
      newNode.csg.blendRadius = params.blend.radius || 0.0;
    }
    if (params.material) {
      newNode.material = { ...newNode.material, ...params.material };
    }
    if (params.modifiers) {
      newNode.modifiers = { ...newNode.modifiers, ...params.modifiers };
    }

    this.sceneStore.transaction(`Add ${newNode.name}`, () => {
      this.sceneStore.addNode(newNode, params.parentId);
      if (params.index !== undefined && params.parentId) {
        this.sceneStore.reparentNode(newNode.id, params.parentId, params.index);
      }
    });

    return {
      nodeId: newNode.id,
      revision: this.sceneStore.revision
    };
  }

  private handleCreateGroup(params: any): any {
    let groupNode: SDFNode;

    this.sceneStore.transaction(`Create Group ${params.name || 'Group'}`, () => {
      groupNode = this.sceneStore.createGroup(
        params.name || 'Group',
        params.parentId,
        params.wrapNodeIds
      );
      if (params.operation) {
        this.sceneStore.updateNode(groupNode.id, {
          csg: {
            ...groupNode.csg,
            operation: params.operation,
            ...(params.blend ? { blendMode: params.blend.mode, blendRadius: params.blend.radius } : {})
          }
        });
      }
    });

    return {
      groupId: groupNode!.id,
      revision: this.sceneStore.revision
    };
  }

  private handleUpdateNode(params: any): any {
    const { nodeId, ...updates } = params;
    const node = this.sceneStore.tree.findNode(nodeId);
    if (!node) {
      const err: any = new Error(`Node not found: ${nodeId}`);
      err.code = ERROR_CODES.NODE_NOT_FOUND;
      throw err;
    }

    const cleanUpdates: Partial<SDFNode> = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name;
    if (updates.visible !== undefined) cleanUpdates.visible = updates.visible;

    if (updates.position || updates.rotationDeg || updates.scale) {
      cleanUpdates.transform = { ...node.transform };
      if (updates.position) cleanUpdates.transform.position = toVec3(updates.position);
      if (updates.rotationDeg) {
        cleanUpdates.transform.rotation = [
          (updates.rotationDeg[0] * Math.PI) / 180,
          (updates.rotationDeg[1] * Math.PI) / 180,
          (updates.rotationDeg[2] * Math.PI) / 180
        ];
      }
      if (updates.scale) cleanUpdates.transform.scale = toVec3(updates.scale);
    }

    if (updates.dimensions && node.primitive) {
      cleanUpdates.primitive = {
        ...node.primitive,
        dimensions: { ...node.primitive.dimensions, ...updates.dimensions }
      };
    }

    if (updates.operation || updates.blend) {
      cleanUpdates.csg = { ...node.csg };
      if (updates.operation) cleanUpdates.csg.operation = updates.operation;
      if (updates.blend) {
        cleanUpdates.csg.blendMode = updates.blend.mode || node.csg.blendMode;
        cleanUpdates.csg.blendRadius = updates.blend.radius ?? node.csg.blendRadius;
      }
    }

    if (updates.material) {
      cleanUpdates.material = { ...node.material, ...updates.material };
    }

    if (updates.modifiers) {
      cleanUpdates.modifiers = { ...node.modifiers, ...updates.modifiers };
    }

    this.sceneStore.transaction(`Update ${node.name}`, () => {
      this.sceneStore.updateNode(nodeId, cleanUpdates);
    });

    return {
      nodeId,
      revision: this.sceneStore.revision
    };
  }

  private handleDeleteNode(params: any): any {
    const node = this.sceneStore.tree.findNode(params.nodeId);
    if (!node) {
      const err: any = new Error(`Node not found: ${params.nodeId}`);
      err.code = ERROR_CODES.NODE_NOT_FOUND;
      throw err;
    }

    this.sceneStore.transaction(`Delete ${node.name}`, () => {
      this.sceneStore.removeNode(params.nodeId);
    });

    return {
      deletedId: params.nodeId,
      revision: this.sceneStore.revision
    };
  }

  private handleDuplicateNode(params: any): any {
    let dupNode: SDFNode | null = null;
    const source = this.sceneStore.tree.findNode(params.nodeId);
    this.sceneStore.transaction(`Duplicate ${params.nodeId}`, () => {
      dupNode = this.sceneStore.duplicateNode(params.nodeId);
      // An explicit offset is relative to the source, replacing the UI's default nudge
      if (dupNode && source && params.offset) {
        this.sceneStore.updateNode(dupNode.id, {
          transform: {
            ...dupNode.transform,
            position: [
              source.transform.position[0] + params.offset[0],
              source.transform.position[1] + params.offset[1],
              source.transform.position[2] + params.offset[2]
            ]
          }
        });
      }
    });

    if (!dupNode) {
      const err: any = new Error(`Failed to duplicate node: ${params.nodeId}`);
      err.code = ERROR_CODES.NODE_NOT_FOUND;
      throw err;
    }

    return {
      newNodeId: (dupNode as SDFNode).id,
      revision: this.sceneStore.revision
    };
  }

  private handleMoveNode(params: any): any {
    this.sceneStore.transaction(`Move ${params.nodeId}`, () => {
      if (params.newParentId) {
        this.sceneStore.reparentNode(params.nodeId, params.newParentId, params.index);
      } else {
        const parent = this.sceneStore.tree.findParent(params.nodeId);
        if (parent) {
          this.sceneStore.reparentNode(params.nodeId, parent.id, params.index);
        }
      }
    });

    return {
      nodeId: params.nodeId,
      newParentId: params.newParentId,
      index: params.index,
      revision: this.sceneStore.revision
    };
  }

  private handleUngroup(params: any): any {
    const group = this.sceneStore.tree.findNode(params.groupId);
    if (!group || group.kind !== 'group') {
      const err: any = new Error(`Group node not found: ${params.groupId}`);
      err.code = ERROR_CODES.NODE_NOT_FOUND;
      throw err;
    }

    const releasedNodeIds = group.children.map((c) => c.id);

    this.sceneStore.transaction(`Ungroup ${group.name}`, () => {
      this.sceneStore.ungroupNode(params.groupId);
    });

    return {
      dissolvedGroupId: params.groupId,
      releasedNodeIds,
      revision: this.sceneStore.revision
    };
  }

  private handleClearScene(params: any): any {
    this.sceneStore.transaction('Clear Scene', () => {
      if (params?.mode === 'default') {
        this.sceneStore.tree.root = CSGTree.createDefaultScene();
      } else {
        const root = CSGTree.createDefaultNode('sphere', 'Root Union');
        root.kind = 'group';
        root.children = [];
        this.sceneStore.tree.root = root;
      }
      this.sceneStore.selectNode(this.sceneStore.tree.root.id);
    });

    return {
      revision: this.sceneStore.revision
    };
  }

  private async handleApplyRecipe(params: any): Promise<any> {
    const { recipe, dryRun, mode } = params;
    if (!recipe || !Array.isArray(recipe.nodes)) {
      const err: any = new Error('Recipe must contain a nodes array');
      err.code = ERROR_CODES.VALIDATION_ERROR;
      throw err;
    }

    const refs: Record<string, string> = {};
    const warnings: string[] = [];

    // Helper to recursively build nodes
    const buildNode = (recNode: any): SDFNode => {
      const isGroup = recNode.type === 'group';
      const node = CSGTree.createDefaultNode(isGroup ? 'sphere' : recNode.type, recNode.name);
      if (isGroup) {
        node.kind = 'group';
      }

      if (recNode.ref) {
        refs[recNode.ref] = node.id;
      }

      if (recNode.dimensions && node.primitive) {
        node.primitive.dimensions = { ...node.primitive.dimensions, ...recNode.dimensions };
      }
      if (recNode.position) {
        node.transform.position = toVec3(recNode.position);
      }
      if (recNode.rotationDeg) {
        node.transform.rotation = [
          (recNode.rotationDeg[0] * Math.PI) / 180,
          (recNode.rotationDeg[1] * Math.PI) / 180,
          (recNode.rotationDeg[2] * Math.PI) / 180
        ];
      }
      if (recNode.scale) {
        node.transform.scale = toVec3(recNode.scale);
      }
      if (recNode.operation) {
        node.csg.operation = recNode.operation;
      }
      if (recNode.blend) {
        node.csg.blendMode = recNode.blend.mode || 'hard';
        node.csg.blendRadius = recNode.blend.radius || 0.0;
      }
      if (recNode.material) {
        node.material = { ...node.material, ...recNode.material };
      }
      if (recNode.modifiers) {
        node.modifiers = { ...node.modifiers, ...recNode.modifiers };
      }

      if (Array.isArray(recNode.children)) {
        node.children = recNode.children.map((child: any) => buildNode(child));
      }

      return node;
    };

    const newRoots = recipe.nodes.map((n: any) => buildNode(n));

    if (!dryRun) {
      this.sceneStore.transaction('Apply Scene Recipe', () => {
        if (mode === 'append' && params.parentId) {
          const parent = this.sceneStore.tree.findNode(params.parentId);
          if (parent) {
            for (const n of newRoots) {
              parent.children.push(n);
            }
          }
        } else {
          // Replace mode
          const root = CSGTree.createDefaultNode('sphere', 'Root Union');
          root.kind = 'group';
          root.children = newRoots;
          this.sceneStore.tree.root = root;
          this.sceneStore.selectNode(newRoots.length > 0 ? newRoots[0].id : root.id);
        }
      });
    }

    return {
      revision: this.sceneStore.revision,
      refs,
      counts: {
        leaves: countLeaves(this.sceneStore.tree.root),
        instructions: 0,
        depth: 0
      },
      warnings
    };
  }

  private handleHistory(params: any): any {
    const action = params?.action || 'undo';
    const steps = Math.max(1, params?.steps || 1);

    for (let i = 0; i < steps; i++) {
      if (action === 'undo') {
        this.sceneStore.undo();
      } else {
        this.sceneStore.redo();
      }
    }

    return {
      revision: this.sceneStore.revision,
      canUndo: this.sceneStore.canUndo(),
      canRedo: this.sceneStore.canRedo()
    };
  }

  private handleSelectNode(params: any): any {
    const targetId = params?.nodeId || null;
    this.sceneStore.selectNode(targetId);
    return {
      selectedNodeId: this.sceneStore.selectedNodeId
    };
  }

  private handleSetCamera(params: any): any {
    if (this.renderer) {
      if (params?.view) {
        if (params.view === 'perspective') {
          // Perspective angle
          this.renderer.renderSnapshot({ view: 'perspective' });
        } else {
          this.renderer.setCameraView(params.view);
        }
      }
    }

    return {
      camera: {
        position: [0, 0, 4],
        target: [0, 0, 0],
        distance: 4
      }
    };
  }

  private async handleTakeSnapshot(params: any): Promise<any> {
    if (!this.renderer) {
      throw new Error('Renderer not available for snapshot');
    }

    const views = params?.views || ['current'];
    const width = params?.width || 512;
    const height = params?.height || 512;
    const format = params?.format ? `image/${params.format}` : 'image/png';
    const showGrid = params?.showGrid ?? false;

    const images: any[] = [];

    for (const v of views) {
      if (v === 'contact_sheet') {
        const sheet = await this.renderer.renderContactSheet({
          viewWidth: Math.floor(width / 2),
          viewHeight: Math.floor(height / 2),
          format: format as any
        });
        images.push({
          view: 'contact_sheet',
          dataUrl: sheet.dataUrl,
          width: sheet.width,
          height: sheet.height,
          mimeType: format
        });
      } else {
        const viewPreset = v === 'current' ? undefined : v;
        const snap = await this.renderer.renderSnapshot({
          view: viewPreset as any,
          width,
          height,
          format: format as any,
          showGrid
        });
        images.push({
          view: v,
          dataUrl: snap.dataUrl,
          width: snap.width,
          height: snap.height,
          mimeType: format
        });
      }
    }

    return { images };
  }

  private async handleContactSheet(params: any): Promise<any> {
    if (!this.renderer) {
      throw new Error('Renderer not available for contact sheet');
    }
    const viewWidth = params?.viewWidth || 512;
    const viewHeight = params?.viewHeight || 512;
    const format = params?.format ? `image/${params.format}` : 'image/png';

    const sheet = await this.renderer.renderContactSheet({
      viewWidth,
      viewHeight,
      format: format as any
    });

    return {
      dataUrl: sheet.dataUrl,
      width: sheet.width,
      height: sheet.height,
      mimeType: format
    };
  }

  private handleGetBounds(params: any): any {
    const tight = Boolean(params?.tight);
    const bounds = SceneQueries.getBounds(this.sceneStore.tree, params?.nodeId, tight);

    let volumeEstimate: number | undefined;
    if (params?.includeVolume) {
      const volResult = SceneQueries.estimateVolume(this.sceneStore.tree, params?.nodeId);
      volumeEstimate = volResult.volume;
    }

    return {
      min: bounds.min,
      max: bounds.max,
      size: bounds.size,
      center: bounds.center,
      ...(volumeEstimate !== undefined ? { volumeEstimate } : {})
    };
  }

  private handleSampleDistance(params: any): any {
    const points = params?.points || [];
    const result = SceneQueries.sampleDistance(this.sceneStore.tree, points, params?.nodeId);

    const samples = points.map((pt: any, i: number) => ({
      point: pt,
      distance: result.distances[i],
      nearestNodeId: result.nearestNodeId
    }));

    return { samples };
  }

  private handleEstimateVolume(params: any): any {
    const vol = SceneQueries.estimateVolume(this.sceneStore.tree, params?.nodeId);
    return {
      volume: vol.volume,
      boundingBoxVolume: vol.boundingBoxVolume,
      fillRatio: vol.fillRatio
    };
  }

  private handleProject(params: any): any {
    const action = params?.action || 'save';
    if (action === 'save') {
      const doc = this.sceneStore.tree.toJSON();
      return {
        success: true,
        filename: params?.filename || 'scene.sdf.json',
        projectData: doc,
        revision: this.sceneStore.revision
      };
    } else {
      if (params?.projectData) {
        this.sceneStore.loadFromJSON(params.projectData);
        return {
          success: true,
          revision: this.sceneStore.revision
        };
      }
      return { success: false };
    }
  }

  private async handleExportMesh(requestId: string, params: any): Promise<any> {
    const format = params?.format || 'glb';
    if (format === 'glsl') {
      return this.handleExportShader(params);
    }
    const resolution = typeof params?.resolution === 'string' ? parseInt(params.resolution, 10) : (params?.resolution || 64);
    const filename = params?.filename || `model.${format}`;

    // Send initial progress
    this.bridge.sendProgress(createProgressEnvelope(requestId, 0.1, 'Generating marching cubes bounds'));

    const bounds = computeAutoBounds(this.sceneStore.tree);
    this.bridge.sendProgress(createProgressEnvelope(requestId, 0.3, 'Extracting surface mesh'));

    // Extract mesh
    const result = await this.meshExtractor.extract(
      this.sceneStore.tree,
      resolution,
      (prog) => {
        this.bridge.sendProgress(createProgressEnvelope(requestId, 0.3 + prog * 0.5, `Polygonizing ${(prog * 100).toFixed(0)}%`));
      },
      bounds
    );

    this.bridge.sendProgress(createProgressEnvelope(requestId, 0.9, 'Encoding mesh buffer'));

    if (format === 'obj') {
      const objText = exportOBJ(result.positions, result.normals, 'SDF_Mesh');
      return {
        filename,
        format: 'obj',
        bytes: objText.length,
        data: objText
      };
    } else {
      const glbBuffer = generateGLBBuffer(result.positions, result.normals, '#e2e8f0');
      // Encode as Base64 for JSON transfer
      let binary = '';
      const bytes = new Uint8Array(glbBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      return {
        filename,
        format: 'glb',
        bytes: glbBuffer.byteLength,
        data: base64
      };
    }
  }

  private handleExportShader(params: any): any {
    const glsl = ShaderExporter.exportShadertoy(this.sceneStore.tree);
    return {
      filename: params?.filename || 'shader.glsl',
      format: 'glsl',
      data: glsl
    };
  }
}
