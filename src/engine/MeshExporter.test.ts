import { describe, it, expect } from 'vitest';
import { exportOBJ, exportGLB } from './MeshExporter';

describe('MeshExporter', () => {
  const samplePositions = new Float32Array([
    0.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0
  ]);
  const sampleNormals = new Float32Array([
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
  ]);

  describe('exportOBJ', () => {
    it('should export valid Wavefront OBJ format with headers and object name', () => {
      // Act
      const obj = exportOBJ(samplePositions, sampleNormals, 'CustomObject');

      // Assert
      expect(obj).toContain('# Wavefront OBJ Exported from SDF Studio 3D');
      expect(obj).toContain('# Vertices: 3 | Triangles: 1');
      expect(obj).toContain('o CustomObject');
      expect(obj).toContain('s 1');
    });

    it('should export correct vertex and normal lines with 5 decimal precision', () => {
      // Act
      const obj = exportOBJ(samplePositions, sampleNormals);

      // Assert
      expect(obj).toContain('v 0.00000 0.00000 0.00000');
      expect(obj).toContain('v 1.00000 0.00000 0.00000');
      expect(obj).toContain('v 0.00000 1.00000 0.00000');
      expect(obj).toContain('vn 0.00000 0.00000 1.00000');
    });

    it('should export 1-indexed face definitions with v//vn syntax', () => {
      // Act
      const obj = exportOBJ(samplePositions, sampleNormals);

      // Assert: 1-indexed triangular face
      expect(obj).toContain('f 1//1 2//2 3//3');
    });

    it('should handle empty geometry gracefully', () => {
      // Act
      const emptyPositions = new Float32Array([]);
      const emptyNormals = new Float32Array([]);
      const obj = exportOBJ(emptyPositions, emptyNormals);

      // Assert
      expect(obj).toContain('# Vertices: 0 | Triangles: 0');
      expect(obj).not.toContain('f ');
    });
  });

  describe('exportGLB', () => {
    it('should export a valid glTF 2.0 binary container with correct magic and version', async () => {
      // Act
      const blob = await exportGLB(samplePositions, sampleNormals, '#3498db');

      // Assert: Blob type
      expect(blob.type).toBe('model/gltf-binary');

      // Read buffer
      const buffer = await blob.arrayBuffer();
      const dataView = new DataView(buffer);

      // 12-byte GLB Header
      const magic = dataView.getUint32(0, true);
      const version = dataView.getUint32(4, true);
      const totalLength = dataView.getUint32(8, true);

      expect(magic).toBe(0x46546c67); // 'glTF'
      expect(version).toBe(2);
      expect(totalLength).toBe(buffer.byteLength);
    });

    it('should contain a valid JSON chunk with correct glTF metadata structure', async () => {
      // Act
      const blob = await exportGLB(samplePositions, sampleNormals, '#e2e8f0');
      const buffer = await blob.arrayBuffer();
      const dataView = new DataView(buffer);

      // Chunk 0: JSON
      const jsonChunkLength = dataView.getUint32(12, true);
      const jsonChunkType = dataView.getUint32(16, true);

      expect(jsonChunkType).toBe(0x4e4f534a); // 'JSON'
      expect(jsonChunkLength % 4).toBe(0); // 4-byte aligned

      // Decode and parse JSON
      const jsonBytes = new Uint8Array(buffer, 20, jsonChunkLength);
      const jsonStr = new TextDecoder().decode(jsonBytes).trim();
      const gltf = JSON.parse(jsonStr);

      expect(gltf.asset.version).toBe('2.0');
      expect(gltf.asset.generator).toBe('SDF Studio 3D');
      expect(gltf.scenes).toBeDefined();
      expect(gltf.nodes[0].name).toBe('SDF_Mesh');
      expect(gltf.meshes[0].primitives[0].mode).toBe(4); // TRIANGLES
      expect(gltf.accessors).toHaveLength(2); // POSITION and NORMAL
      expect(gltf.accessors[0].count).toBe(3);
      expect(gltf.accessors[0].componentType).toBe(5126); // FLOAT
      expect(gltf.accessors[0].type).toBe('VEC3');
    });

    it('should contain a valid BIN chunk containing position and normal buffers', async () => {
      // Act
      const blob = await exportGLB(samplePositions, sampleNormals);
      const buffer = await blob.arrayBuffer();
      const dataView = new DataView(buffer);

      // Chunk 0 offset and length
      const jsonChunkLength = dataView.getUint32(12, true);
      const binHeaderOffset = 12 + 8 + jsonChunkLength;

      // Chunk 1: BIN
      const binChunkLength = dataView.getUint32(binHeaderOffset, true);
      const binChunkType = dataView.getUint32(binHeaderOffset + 4, true);

      expect(binChunkType).toBe(0x004e4942); // 'BIN\0'
      expect(binChunkLength % 4).toBe(0); // 4-byte aligned

      const binDataOffset = binHeaderOffset + 8;
      const posFloats = new Float32Array(buffer, binDataOffset, 9);

      // Verify position data in BIN chunk
      expect(posFloats[0]).toBeCloseTo(0.0);
      expect(posFloats[3]).toBeCloseTo(1.0);
      expect(posFloats[7]).toBeCloseTo(1.0);
    });

    it('should correctly encode custom material hex color into glTF baseColorFactor', async () => {
      // Act: #ff0000 (red)
      const blob = await exportGLB(samplePositions, sampleNormals, '#ff0000');
      const buffer = await blob.arrayBuffer();
      const dataView = new DataView(buffer);

      const jsonChunkLength = dataView.getUint32(12, true);
      const jsonBytes = new Uint8Array(buffer, 20, jsonChunkLength);
      const gltf = JSON.parse(new TextDecoder().decode(jsonBytes).trim());

      const colorFactor = gltf.materials[0].pbrMetallicRoughness.baseColorFactor;
      expect(colorFactor[0]).toBeCloseTo(1.0);
      expect(colorFactor[1]).toBeCloseTo(0.0);
      expect(colorFactor[2]).toBeCloseTo(0.0);
      expect(colorFactor[3]).toBeCloseTo(1.0);
    });

    it('should handle empty buffers without throwing', async () => {
      // Act
      const empty = new Float32Array([]);
      const blob = await exportGLB(empty, empty);

      // Assert
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });
  });
});

