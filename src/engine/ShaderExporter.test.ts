import { describe, it, expect } from 'vitest';
import { ShaderExporter } from './ShaderExporter';
import { CSGTree } from '../tree/CSGTree';

describe('ShaderExporter', () => {
  describe('exportShadertoy', () => {
    it('should include all fundamental GLSL primitive distance functions', () => {
      // Arrange
      const tree = new CSGTree();

      // Act
      const glsl = ShaderExporter.exportShadertoy(tree);

      // Assert: Core primitives present in library
      expect(glsl).toContain('float sdSphere(vec3 p, float r)');
      expect(glsl).toContain('float sdBox(vec3 p, vec3 b)');
      expect(glsl).toContain('float sdRoundBox(vec3 p, vec3 b, float r)');
      expect(glsl).toContain('float sdCappedCylinder(vec3 p, float h, float r)');
      expect(glsl).toContain('float sdTorus(vec3 p, float R, float r)');
      expect(glsl).toContain('float sdCapsule(vec3 p, float h, float r)');
      expect(glsl).toContain('float sdCappedCone(vec3 p, float h, float r1, float r2)');
      expect(glsl).toContain('float sdPlane(vec3 p, vec3 n, float h)');
      expect(glsl).toContain('float sdPipe(vec3 p, float h, float r, float th)');
      expect(glsl).toContain('float sdHemisphere(vec3 p, float r)');
      expect(glsl).toContain('float sdEllipsoid(vec3 p, vec3 r)');
      expect(glsl).toContain('float sdTriangularPrism(vec3 p, vec2 h)');
      expect(glsl).toContain('float sdHexagonalPrism(vec3 p, vec2 h)');
      expect(glsl).toContain('float sdOctahedron(vec3 p, float s)');
      expect(glsl).toContain('float sdTetrahedron(vec3 p, float r)');
      expect(glsl).toContain('float sdMandelbulb(vec3 p)');
    });

    it('should include smooth polynomial CSG operations and operators', () => {
      // Arrange
      const tree = new CSGTree();

      // Act
      const glsl = ShaderExporter.exportShadertoy(tree);

      // Assert: CSG operations
      expect(glsl).toContain('float sminPoly(float a, float b, float k)');
      expect(glsl).toContain('float smaxPoly(float a, float b, float k)');
      expect(glsl).toContain('float opUnion(float d1, float d2, float k, bool smoothOp)');
      expect(glsl).toContain('float opDiff(float d1, float d2, float k, bool smoothOp)');
      expect(glsl).toContain('float opInter(float d1, float d2, float k, bool smoothOp)');
    });

    it('should generate complete raymarching, normal gradient, and mainImage entrypoint', () => {
      // Arrange
      const tree = new CSGTree();

      // Act
      const glsl = ShaderExporter.exportShadertoy(tree);

      // Assert
      expect(glsl).toContain('float map(vec3 worldPos)');
      expect(glsl).toContain('vec3 calcNormal(vec3 p)');
      expect(glsl).toContain('float raymarch(vec3 ro, vec3 rd)');
      expect(glsl).toContain('void mainImage(out vec4 fragColor, in vec2 fragCoord)');
    });

    it('should compile default scene with Base Box and Cutter Sphere into map function', () => {
      // Arrange
      const tree = new CSGTree();

      // Act
      const glsl = ShaderExporter.exportShadertoy(tree);

      // Assert
      expect(glsl).toContain('// Node 0: Base Box (box)');
      expect(glsl).toContain('mat4 invMat_0 = mat4(');
      expect(glsl).toContain('vec3 p_0 = (invMat_0 * vec4(worldPos, 1.0)).xyz;');
      expect(glsl).toContain('float d_0 = sdBox(p_0, vec3(');
      expect(glsl).toContain('totalDist = d_0;');

      expect(glsl).toContain('// Node 1: Cutter Sphere (sphere)');
      expect(glsl).toContain('mat4 invMat_1 = mat4(');
      expect(glsl).toContain('vec3 p_1 = (invMat_1 * vec4(worldPos, 1.0)).xyz;');
      expect(glsl).toContain('float d_1 = sdSphere(p_1,');
      expect(glsl).toContain('totalDist = opDiff(totalDist, d_1, 0.1200, true);');
    });

    it('should generate correct code for modifiers: mirror, twist, round, shell', () => {
      // Arrange: Single sphere with all modifiers enabled
      const root = CSGTree.createDefaultNode('sphere', 'Root');
      root.kind = 'group';
      const node = CSGTree.createDefaultNode('cylinder', 'Modified Cylinder');
      node.modifiers = {
        mirrorAxis: 'x',
        twist: 2.0,
        roundRadius: 0.1,
        shellThickness: 0.05
      };
      root.children = [node];
      const tree = new CSGTree(root);

      // Act
      const glsl = ShaderExporter.exportShadertoy(tree);

      // Assert
      expect(glsl).toContain('p_0.x = abs(p_0.x);');
      expect(glsl).toContain('float c_0 = cos(2.0000 * p_0.y);');
      expect(glsl).toContain('float s_0 = sin(2.0000 * p_0.y);');
      expect(glsl).toContain('p_0.xz = mat2(c_0, -s_0, s_0, c_0) * p_0.xz;');
      expect(glsl).toContain('d_0 -= 0.1000;');
      expect(glsl).toContain('d_0 = abs(d_0) - 0.0500;');
    });

    it('should generate union and intersection operations appropriately', () => {
      // Arrange: Two extra nodes with union and intersection
      const root = CSGTree.createDefaultNode('sphere', 'Root');
      root.kind = 'group';

      const prim0 = CSGTree.createDefaultNode('box', 'Box 0');
      const primUnion = CSGTree.createDefaultNode('sphere', 'Sphere Union');
      primUnion.csg.operation = 'union';
      primUnion.csg.blendMode = 'hard';

      const primInter = CSGTree.createDefaultNode('torus', 'Torus Inter');
      primInter.csg.operation = 'intersection';
      primInter.csg.blendMode = 'smooth_polynomial';
      primInter.csg.blendRadius = 0.3;

      root.children = [prim0, primUnion, primInter];
      const tree = new CSGTree(root);

      // Act
      const glsl = ShaderExporter.exportShadertoy(tree);

      // Assert
      expect(glsl).toContain('totalDist = opUnion(totalDist, d_1, 0.0000, false);');
      expect(glsl).toContain('totalDist = opInter(totalDist, d_2, 0.3000, true);');
    });
  });
});

