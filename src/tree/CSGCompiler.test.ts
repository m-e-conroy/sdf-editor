import { describe, it, expect } from 'vitest';
import { CSGTree } from './CSGTree';
import {
  CSGCompiler,
  OPCODE_PUSH_LEAF,
  OPCODE_COMBINE,
  OPCODE_POST_MOD
} from '../engine/csg/CSGCompiler';
import { SdfEvaluator } from '../engine/cpu/SdfEvaluator';

describe('CSGCompiler', () => {
  it('compiles single primitive into 1 leaf and 1 PUSH_LEAF instruction', () => {
    const tree = new CSGTree();
    tree.root.children = [];
    const sphere = CSGTree.createDefaultNode('sphere', 'TestSphere');
    tree.root.children.push(sphere);

    const compiled = CSGCompiler.compile(tree);
    expect(compiled.leaves.length).toBe(1);
    expect(compiled.instructions.length).toBe(1);
    expect(compiled.instructions[0].opcode).toBe(OPCODE_PUSH_LEAF);
    expect(compiled.instructions[0].arg0).toBe(0);
    expect(compiled.maxStackDepth).toBe(1);

    const range = compiled.nodeLeafRanges.get(sphere.id);
    expect(range).toEqual([0, 0]);
  });

  it('compiles (A - B) binary CSG into 2 leaves, 2 PUSH and 1 COMBINE instruction', () => {
    const tree = new CSGTree();
    tree.root.children = [];
    const box = CSGTree.createDefaultNode('box', 'A');
    const sphere = CSGTree.createDefaultNode('sphere', 'B');
    sphere.csg.operation = 'difference';
    sphere.csg.blendMode = 'smooth_polynomial';
    sphere.csg.blendRadius = 0.15;

    tree.root.children.push(box);
    tree.root.children.push(sphere);

    const compiled = CSGCompiler.compile(tree);
    expect(compiled.leaves.length).toBe(2);
    expect(compiled.instructions.length).toBe(3);
    expect(compiled.instructions[0]).toEqual({
      opcode: OPCODE_PUSH_LEAF,
      arg0: 0,
      arg1: 0,
      arg2: 0
    });
    expect(compiled.instructions[1]).toEqual({
      opcode: OPCODE_PUSH_LEAF,
      arg0: 1,
      arg1: 0,
      arg2: 0
    });
    expect(compiled.instructions[2]).toEqual({
      opcode: OPCODE_COMBINE,
      arg0: 1, // difference
      arg1: 1, // smooth_polynomial
      arg2: 0.15
    });
    expect(compiled.maxStackDepth).toBe(2);
  });

  it('compiles nested CSG expression (A - B) ∪ (C - D) with contiguous leaf ranges', () => {
    const tree = new CSGTree();
    tree.root.children = [];

    // Group 1: (A - B)
    const g1 = CSGTree.createGroupNode('Group1');
    const a = CSGTree.createDefaultNode('box', 'A');
    const b = CSGTree.createDefaultNode('sphere', 'B');
    b.csg.operation = 'difference';
    g1.children.push(a, b);

    // Group 2: (C - D)
    const g2 = CSGTree.createGroupNode('Group2');
    g2.csg.operation = 'union';
    const c = CSGTree.createDefaultNode('cylinder', 'C');
    const d = CSGTree.createDefaultNode('cone', 'D');
    d.csg.operation = 'difference';
    g2.children.push(c, d);

    tree.root.children.push(g1, g2);

    const compiled = CSGCompiler.compile(tree);
    expect(compiled.leaves.length).toBe(4);
    // Group 1: PUSH(A), PUSH(B), COMBINE(diff) -> leaves 0, 1
    // Group 2: PUSH(C), PUSH(D), COMBINE(diff) -> leaves 2, 3
    // Root: COMBINE(union)
    expect(compiled.instructions.length).toBe(7);
    // Peak is A-B result + C + D on the stack before Group 2 combines
    expect(compiled.maxStackDepth).toBe(3);

    expect(compiled.nodeLeafRanges.get(a.id)).toEqual([0, 0]);
    expect(compiled.nodeLeafRanges.get(b.id)).toEqual([1, 1]);
    expect(compiled.nodeLeafRanges.get(g1.id)).toEqual([0, 1]);

    expect(compiled.nodeLeafRanges.get(c.id)).toEqual([2, 2]);
    expect(compiled.nodeLeafRanges.get(d.id)).toEqual([3, 3]);
    expect(compiled.nodeLeafRanges.get(g2.id)).toEqual([2, 3]);

    expect(compiled.nodeLeafRanges.get(tree.root.id)).toEqual([0, 3]);
  });

  it('emits POST_MOD opcode for group rounding and shell', () => {
    const tree = new CSGTree();
    tree.root.children = [];

    const g = CSGTree.createGroupNode('RoundedShellGroup');
    g.modifiers = {
      roundRadius: 0.05,
      shellThickness: 0.02
    };

    const s1 = CSGTree.createDefaultNode('sphere', 'S1');
    const s2 = CSGTree.createDefaultNode('sphere', 'S2');
    s2.csg.operation = 'union';
    g.children.push(s1, s2);

    tree.root.children.push(g);

    const compiled = CSGCompiler.compile(tree);
    const postModInstr = compiled.instructions.find(i => i.opcode === OPCODE_POST_MOD);
    expect(postModInstr).toBeDefined();
    expect(postModInstr?.arg0).toBe(0.05);
    expect(postModInstr?.arg1).toBe(0.02);
  });

  it('evalCompiledScene on CPU matches expected math for (A - B) ∪ (C - D)', () => {
    const tree = new CSGTree();
    tree.root.children = [];

    const g1 = CSGTree.createGroupNode('Group1');
    const a = CSGTree.createDefaultNode('sphere', 'A');
    if (a.primitive) a.primitive.dimensions.radius = 1.0;
    const b = CSGTree.createDefaultNode('sphere', 'B');
    if (b.primitive) b.primitive.dimensions.radius = 0.5;
    b.csg.operation = 'difference';
    b.csg.blendMode = 'hard';
    g1.children.push(a, b);

    tree.root.children.push(g1);

    const compiled = CSGCompiler.compile(tree);

    // At point [0, 0, 0] (center):
    // dist to A (radius 1) = -1.0
    // dist to B (radius 0.5) = -0.5
    // difference: max(-1.0, -(-0.5)) = max(-1.0, 0.5) = 0.5 (outside the hollow shell)
    const distAtOrigin = SdfEvaluator.evalCompiledScene([0, 0, 0], compiled);
    expect(distAtOrigin).toBeCloseTo(0.5, 4);

    // At point [0.75, 0, 0] (inside shell wall of A minus B):
    // dist to A = 0.75 - 1.0 = -0.25
    // dist to B = 0.75 - 0.5 = +0.25
    // difference: max(-0.25, -0.25) = -0.25 (inside)
    const distInWall = SdfEvaluator.evalCompiledScene([0.75, 0, 0], compiled);
    expect(distInWall).toBeCloseTo(-0.25, 4);
  });
});
