// ========================================================================
// SDF Studio 3D - High-Fidelity 3D Mesh Exporter (OBJ & Binary glTF 2.0 GLB)
// ========================================================================

/**
 * Exports extracted mesh data to Wavefront .OBJ string format.
 * @param positions Interleaved [x, y, z, ...] vertex coordinates
 * @param normals Interleaved [nx, ny, nz, ...] vertex normal vectors
 * @param objectName Custom object identifier
 */
export function exportOBJ(
  positions: Float32Array,
  normals: Float32Array,
  objectName = 'SDF_Mesh'
): string {
  const vertexCount = Math.floor(positions.length / 3);
  const faceCount = Math.floor(vertexCount / 3);

  const lines: string[] = [];
  lines.push('# ========================================================================');
  lines.push('# Wavefront OBJ Exported from SDF Studio 3D');
  lines.push(`# Vertices: ${vertexCount} | Triangles: ${faceCount}`);
  lines.push('# ========================================================================');
  lines.push(`o ${objectName}`);
  lines.push('');

  // 1. Geometric Vertices (v x y z)
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i].toFixed(5);
    const y = positions[i + 1].toFixed(5);
    const z = positions[i + 2].toFixed(5);
    lines.push(`v ${x} ${y} ${z}`);
  }

  lines.push('');

  // 2. Vertex Normals (vn nx ny nz)
  for (let i = 0; i < normals.length; i += 3) {
    const nx = normals[i].toFixed(5);
    const ny = normals[i + 1].toFixed(5);
    const nz = normals[i + 2].toFixed(5);
    lines.push(`vn ${nx} ${ny} ${nz}`);
  }

  lines.push('');
  lines.push('s 1');

  // 3. Triangular Faces (f v1//vn1 v2//vn2 v3//vn3 - 1-indexed)
  for (let i = 1; i <= vertexCount; i += 3) {
    lines.push(`f ${i}//${i} ${i + 1}//${i + 1} ${i + 2}//${i + 2}`);
  }

  return lines.join('\n');
}

/**
 * Converts a hex color string ('#rrggbb') into normalized RGB floats [0..1].
 */
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  if (isNaN(bigint)) return [0.88, 0.9, 0.94];
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
}

/**
 * Exports extracted mesh data directly to a valid Binary glTF 2.0 (.glb) container.
 * Strictly compliant with Khronos glTF 2.0 specification.
 * @param positions Interleaved [x, y, z, ...] vertex coordinates
 * @param normals Interleaved [nx, ny, nz, ...] vertex normal vectors
 * @param colorHex Optional surface material color
 */
export async function exportGLB(
  positions: Float32Array,
  normals: Float32Array,
  colorHex = '#e2e8f0'
): Promise<Blob> {
  const vertexCount = Math.floor(positions.length / 3);

  // 1. Calculate bounding box for POSITION accessor
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }

  if (vertexCount === 0) {
    minX = minY = minZ = maxX = maxY = maxZ = 0;
  }

  // 2. Prepare Binary Buffer
  const posBytes = new Uint8Array(positions.buffer, positions.byteOffset, positions.byteLength);
  const normBytes = new Uint8Array(normals.buffer, normals.byteOffset, normals.byteLength);

  const posByteLength = posBytes.byteLength;
  const normByteLength = normBytes.byteLength;
  const totalBinLength = posByteLength + normByteLength;

  // 4-byte alignment padding for binary chunk
  const padBin = (4 - (totalBinLength % 4)) % 4;
  const binBufferLength = totalBinLength + padBin;
  const binBuffer = new Uint8Array(binBufferLength);

  binBuffer.set(posBytes, 0);
  binBuffer.set(normBytes, posByteLength);
  // Padding bytes are 0x00 by default

  const [r, g, b] = hexToRgb(colorHex);

  // 3. glTF 2.0 JSON Metadata Hierarchy
  const gltf = {
    asset: {
      version: '2.0',
      generator: 'SDF Studio 3D'
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'SDF_Mesh' }],
    meshes: [
      {
        name: 'SDF_Mesh',
        primitives: [
          {
            attributes: {
              POSITION: 0,
              NORMAL: 1
            },
            mode: 4, // TRIANGLES
            material: 0
          }
        ]
      }
    ],
    materials: [
      {
        name: 'SDF_Material',
        pbrMetallicRoughness: {
          baseColorFactor: [r, g, b, 1.0],
          metallicFactor: 0.1,
          roughnessFactor: 0.35
        }
      }
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: vertexCount,
        type: 'VEC3',
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ]
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: vertexCount,
        type: 'VEC3'
      }
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: posByteLength,
        target: 34962 // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: posByteLength,
        byteLength: normByteLength,
        target: 34962 // ARRAY_BUFFER
      }
    ],
    buffers: [
      {
        byteLength: binBufferLength
      }
    ]
  };

  const jsonStr = JSON.stringify(gltf);
  const encoder = new TextEncoder();
  const jsonEncoded = encoder.encode(jsonStr);

  // Pad JSON chunk to 4-byte boundary with space (0x20)
  const padJson = (4 - (jsonEncoded.byteLength % 4)) % 4;
  const jsonChunkLength = jsonEncoded.byteLength + padJson;
  const jsonBuffer = new Uint8Array(jsonChunkLength);
  jsonBuffer.set(jsonEncoded, 0);
  for (let i = 0; i < padJson; i++) {
    jsonBuffer[jsonEncoded.byteLength + i] = 0x20; // space character
  }

  // 4. Construct Binary glTF (GLB) File Structure
  // Header: 12 bytes
  // Chunk 0 (JSON): 8 bytes header + jsonChunkLength
  // Chunk 1 (BIN):  8 bytes header + binBufferLength
  const totalGlbLength = 12 + (8 + jsonChunkLength) + (8 + binBufferLength);
  const glbBuffer = new ArrayBuffer(totalGlbLength);
  const dataView = new DataView(glbBuffer);

  // GLB Header
  dataView.setUint32(0, 0x46546c67, true); // Magic: 'glTF' (0x46546C67)
  dataView.setUint32(4, 2, true);          // Version 2
  dataView.setUint32(8, totalGlbLength, true); // Total length

  // Chunk 0: JSON
  let byteOffset = 12;
  dataView.setUint32(byteOffset, jsonChunkLength, true); // Chunk Length
  dataView.setUint32(byteOffset + 4, 0x4e4f534a, true);  // Chunk Type: 'JSON'
  byteOffset += 8;
  new Uint8Array(glbBuffer, byteOffset, jsonChunkLength).set(jsonBuffer);
  byteOffset += jsonChunkLength;

  // Chunk 1: BIN
  dataView.setUint32(byteOffset, binBufferLength, true); // Chunk Length
  dataView.setUint32(byteOffset + 4, 0x004e4942, true);  // Chunk Type: 'BIN\0'
  byteOffset += 8;
  new Uint8Array(glbBuffer, byteOffset, binBufferLength).set(binBuffer);

  return new Blob([glbBuffer], { type: 'model/gltf-binary' });
}

/**
 * Triggers a browser file download from a Blob or typed data.
 * @param blob Blob instance to trigger download for
 * @param filename Desired download filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
