import { describe, it, expect, beforeEach } from 'vitest';
import { SHAPE_CATALOG } from '../icons/shapeIcons';
import { CSGTree } from '../tree/CSGTree';
import { UniformPacker } from '../engine/UniformPacker';
import { SceneStore } from '../store/SceneStore';
import { PrimitiveType } from '../tree/types';

const PRIMITIVE_SHAPES = SHAPE_CATALOG.filter(
  (s): s is typeof s & { type: PrimitiveType } => s.type !== 'group'
);

describe('SdfShapePalette & SHAPE_CATALOG', () => {
  beforeEach(() => {
    const store = SceneStore.getInstance();
    store.tree.root = CSGTree.createDefaultScene();
  });

  describe('Catalog Completeness & Metadata Validation', () => {
    it('should contain all 21 core geometric and advanced primitives plus the CSG Group', () => {
      expect(PRIMITIVE_SHAPES).toHaveLength(21);
      expect(SHAPE_CATALOG).toHaveLength(22);
      expect(SHAPE_CATALOG.find((s) => s.type === 'group')?.category).toBe('cad');
    });

    const expectedTypes: PrimitiveType[] = [
      'sphere',
      'box',
      'cylinder',
      'torus',
      'capsule',
      'cone',
      'pipe',
      'hemisphere',
      'ellipsoid',
      'pyramid',
      'hexagonal_prism',
      'triangular_prism',
      'tetrahedron',
      'octahedron',
      'mandelbulb',
      'capped_torus',
      'chain_link',
      'chamfer_cylinder',
      'egg',
      'heart',
      'star_prism'
    ];

    it('should have unique, valid PrimitiveType for every catalog entry', () => {
      const catalogTypes = SHAPE_CATALOG.map((s) => s.type);
      expectedTypes.forEach((expectedType) => {
        expect(catalogTypes).toContain(expectedType);
      });
      // No duplicate types
      const uniqueTypes = new Set(catalogTypes);
      expect(uniqueTypes.size).toBe(SHAPE_CATALOG.length);
    });

    it('should have non-empty metadata, badges, and valid SVG icons for each shape', () => {
      SHAPE_CATALOG.forEach((shape) => {
        expect(shape.name.trim().length).toBeGreaterThan(0);
        expect(shape.description.trim().length).toBeGreaterThan(0);
        expect(shape.badge.trim().length).toBeGreaterThan(0);
        expect(shape.iconSvg).toContain('<svg');
        expect(shape.iconSvg).toContain('</svg>');
        expect(shape.iconSvg).toContain('viewBox=');
      });
    });
  });

  describe('Category Partitioning', () => {
    it('should partition shapes into 4 distinct geometric categories', () => {
      const euclidean = SHAPE_CATALOG.filter((s) => s.category === 'euclidean');
      const curved = SHAPE_CATALOG.filter((s) => s.category === 'curved');
      const polyhedra = SHAPE_CATALOG.filter((s) => s.category === 'polyhedra');
      const fractal = SHAPE_CATALOG.filter((s) => s.category === 'fractal');

      expect(euclidean).toHaveLength(7); // sphere, box, cylinder, torus, capsule, cone, chamfer_cylinder
      expect(curved).toHaveLength(7); // pipe, hemisphere, ellipsoid, capped_torus, chain_link, egg, heart
      expect(polyhedra).toHaveLength(6); // pyramid, hex_prism, tri_prism, tetrahedron, octahedron, star_prism
      expect(fractal).toHaveLength(1); // mandelbulb

      expect(euclidean.length + curved.length + polyhedra.length + fractal.length).toBe(21);
    });
  });

  describe('Engine Compatibility & Node Spawning', () => {
    it('should successfully instantiate a valid SDFNode in CSGTree for every catalog primitive', () => {
      PRIMITIVE_SHAPES.forEach((shape) => {
        const node = CSGTree.createDefaultNode(shape.type);
        expect(node).toBeDefined();
        expect(node.id).toBeDefined();
        expect(node.primitive?.type).toBe(shape.type);
        expect(node.transform.position).toEqual([0, 0, 0]);
        expect(node.transform.scale).toEqual([1, 1, 1]);
        expect(node.material.color).toBe('#e2e8f0');
      });
    });

    it('should pack uniforms without errors for every catalog primitive type', () => {
      PRIMITIVE_SHAPES.forEach((shape) => {
        const tree = new CSGTree(CSGTree.createDefaultNode('sphere', 'Root'));
        tree.root.kind = 'group';
        const node = CSGTree.createDefaultNode(shape.type);
        tree.root.children = [node];

        const packed = UniformPacker.pack(tree);
        expect(packed.nodeCount).toBe(1);
        expect(packed.dimensions[0]).toBeDefined();
        // Dimension components should be valid finite numbers
        expect(Number.isFinite(packed.dimensions[0].x)).toBe(true);
        expect(Number.isFinite(packed.dimensions[0].y)).toBe(true);
        expect(Number.isFinite(packed.dimensions[0].z)).toBe(true);
        expect(Number.isFinite(packed.dimensions[0].w)).toBe(true);
      });
    });

    it('should add newly spawned nodes to SceneStore and select them', () => {
      const store = SceneStore.getInstance();
      const initialCount = store.tree.flattenWithTransforms().length;

      const torusItem = PRIMITIVE_SHAPES.find((s) => s.type === 'torus')!;
      const node = CSGTree.createDefaultNode(torusItem.type);
      store.addNode(node);
      store.selectNode(node.id);

      const updatedCount = store.tree.flattenWithTransforms().length;
      expect(updatedCount).toBe(initialCount + 1);
      expect(store.selectedNodeId).toBe(node.id);
      expect(store.getSelectedNode()?.id).toBe(node.id);
    });
  });

  describe('Search & Filter Logic', () => {
    it('should filter shapes by name or keyword', () => {
      const query = 'cube';
      const results = SHAPE_CATALOG.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.type.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('box');
    });

    it('should find all prisms when searching for "prism"', () => {
      const query = 'prism';
      const results = SHAPE_CATALOG.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.type.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
      expect(results.length).toBeGreaterThanOrEqual(2);
      const types = results.map((r) => r.type);
      expect(types).toContain('hexagonal_prism');
      expect(types).toContain('triangular_prism');
    });
  });
});
