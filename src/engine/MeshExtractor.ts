// ========================================================================
// SDF Studio 3D - High-Performance Marching Cubes Mesh Extractor
// ========================================================================

import { CSGTree } from '../tree/CSGTree';
import type { WorkerNodeData, WorkerExtractRequest } from '../workers/marchingCubes.worker';
import { computeAutoBounds } from './MeshExporter';

export interface ExtractionResult {
  positions: Float32Array;
  normals: Float32Array;
}

export type ProgressCallback = (progress: number) => void;

export class MeshExtractor {
  private activeWorker: Worker | null = null;

  /**
   * Extract polygon mesh using Marching Cubes from a CSGTree in a Web Worker.
   * @param tree The CSG AST to polygonize
   * @param resolution Grid resolution along each axis (standard: 32, 64, 128)
   * @param onProgress Optional progress callback (0.0 to 1.0)
   * @param bounds Optional custom 3D bounding box
   */
  public async extract(
    tree: CSGTree,
    resolution = 64,
    onProgress?: ProgressCallback,
    bounds?: { min: [number, number, number]; max: [number, number, number] }
  ): Promise<ExtractionResult> {
    // Terminate any previous in-flight worker
    this.terminate();

    // 1. Flatten tree and serialize transforms for worker thread
    const flattened = tree.flattenWithTransforms();
    const nodes: WorkerNodeData[] = flattened.map((item) => ({
      id: item.node.id,
      type: item.node.primitive.type,
      dimensions: item.node.primitive.dimensions,
      csg: item.node.csg,
      modifiers: item.node.modifiers,
      material: item.node.material,
      inverseMatrix: Array.from(item.inverseWorldMatrix.elements)
    }));

    // 2. Validate resolution
    const validResolution = [32, 64, 128].includes(resolution)
      ? resolution
      : Math.max(16, Math.min(128, resolution));

    // 3. Spawn Web Worker
    const worker = new Worker(
      new URL('../workers/marchingCubes.worker.ts', import.meta.url),
      { type: 'module' }
    );
    this.activeWorker = worker;

    return new Promise<ExtractionResult>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent) => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'progress') {
          if (onProgress && typeof data.progress === 'number') {
            onProgress(Math.min(1.0, Math.max(0.0, data.progress)));
          }
        } else if (data.type === 'complete') {
          this.terminate();
          resolve({
            positions: data.positions,
            normals: data.normals
          });
        } else if (data.type === 'error') {
          this.terminate();
          reject(new Error(data.error || 'Marching cubes mesh extraction failed.'));
        }
      };

      worker.onerror = (err: ErrorEvent) => {
        this.terminate();
        reject(new Error(`Worker execution error: ${err.message}`));
      };

      const request: WorkerExtractRequest = {
        nodes,
        resolution: validResolution,
        bounds: bounds ?? computeAutoBounds(tree)
      };

      worker.postMessage(request);
    });
  }

  /**
   * Terminate any active worker operation immediately.
   */
  public terminate(): void {
    if (this.activeWorker) {
      this.activeWorker.terminate();
      this.activeWorker = null;
    }
  }
}
