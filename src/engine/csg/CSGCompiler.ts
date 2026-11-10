// ========================================================================
// SDF Studio 3D - Postfix CSG Tree Compiler
// Compiles arbitrary nested CSG group trees into a postfix instruction
// stream evaluated by both the GPU Stack VM and CPU SdfEvaluator.
// ========================================================================

import * as THREE from 'three';
import { CSGTree } from '../../tree/CSGTree';
import { SDFNode, CSGOpType, BlendMode } from '../../tree/types';

export const OPCODE_PUSH_LEAF = 0;
export const OPCODE_COMBINE = 1;
export const OPCODE_POST_MOD = 2;
// Distance-only hint: arg0 = group bound slot, arg1 = instructions in the group body (no-op for exact evaluators)
export const OPCODE_GROUP_SKIP = 3;

export const MAX_STACK_DEPTH = 8;
export const MAX_INSTRUCTIONS = 64;
export const MAX_LEAF_COUNT = 32;
export const MAX_GROUP_SKIPS = 16;

export interface CSGInstruction {
  opcode: number; // 0 = PUSH_LEAF, 1 = COMBINE, 2 = POST_MOD
  arg0: number;   // PUSH_LEAF: leafIndex | COMBINE: op (0: union, 1: diff, 2: intersect) | POST_MOD: roundRadius
  arg1: number;   // COMBINE: blendMode (0: hard, 1: smooth) | POST_MOD: shellThickness
  arg2: number;   // COMBINE: blendRadius (k)
}

export interface CompiledLeaf {
  node: SDFNode;
  leafIndex: number;
  worldMatrix: THREE.Matrix4;
  inverseWorldMatrix: THREE.Matrix4;
}

export interface CompiledGroupSkip {
  node: SDFNode;
  leafRange: [number, number];
}

export interface CompiledScene {
  leaves: CompiledLeaf[];
  instructions: CSGInstruction[];
  nodeLeafRanges: Map<string, [number, number]>;
  maxStackDepth: number;
  /** Groups wrapped in GROUP_SKIP instructions, indexed by the instruction's arg0. */
  groupSkips: CompiledGroupSkip[];
}

export interface CompileOptions {
  /** Emit GROUP_SKIP hints for the largest groups, within the spare instruction budget. */
  groupSkips?: boolean;
}

export class CSGCompiler {
  private static opToNumber(op: CSGOpType): number {
    switch (op) {
      case 'union': return 0;
      case 'difference': return 1;
      case 'intersection': return 2;
      default: return 0;
    }
  }

  private static blendModeToNumber(mode: BlendMode): number {
    return mode === 'smooth_polynomial' ? 1 : 0;
  }

  /**
   * Compiles an SDF tree into an ordered leaf array and postfix instructions.
   */
  public static compile(tree: CSGTree, options: CompileOptions = {}): CompiledScene {
    const base = this.compileWith(tree, null);
    if (!options.groupSkips) return base;

    const budget = Math.min(MAX_GROUP_SKIPS, MAX_INSTRUCTIONS - base.instructions.length);
    if (budget <= 0) return base;

    // Skipping pays off most for groups hiding many leaves; single-leaf groups are covered by leaf culling
    const leafCount = (id: string) => {
      const [start, end] = base.nodeLeafRanges.get(id) ?? [-1, -1];
      return start < 0 ? 0 : end - start + 1;
    };
    const chosen = base.groupNodes
      .filter((g) => leafCount(g.id) >= 2)
      .sort((a, b) => leafCount(b.id) - leafCount(a.id))
      .slice(0, budget);
    if (chosen.length === 0) return base;

    return this.compileWith(tree, new Set(chosen.map((g) => g.id)));
  }

  private static compileWith(
    tree: CSGTree,
    skipGroupIds: Set<string> | null
  ): CompiledScene & { groupNodes: SDFNode[] } {
    const leaves: CompiledLeaf[] = [];
    const instructions: CSGInstruction[] = [];
    const nodeLeafRanges = new Map<string, [number, number]>();
    const groupSkips: CompiledGroupSkip[] = [];
    const groupNodes: SDFNode[] = [];

    let currentStackDepth = 0;
    let maxStackDepth = 0;

    const pushStack = () => {
      currentStackDepth++;
      if (currentStackDepth > maxStackDepth) {
        maxStackDepth = currentStackDepth;
      }
      if (currentStackDepth > MAX_STACK_DEPTH) {
        throw new Error(`CSG Stack overflow: depth ${currentStackDepth} exceeds limit of ${MAX_STACK_DEPTH}`);
      }
    };

    const popStack = (count: number = 1) => {
      currentStackDepth -= count;
      if (currentStackDepth < 0) {
        throw new Error(`CSG Stack underflow: attempted pop below 0`);
      }
    };

    const emitInstruction = (instr: CSGInstruction) => {
      if (instructions.length >= MAX_INSTRUCTIONS) {
        throw new Error(`CSG Instruction overflow: scene exceeds ${MAX_INSTRUCTIONS} instructions`);
      }
      instructions.push(instr);
    };

    const compileNode = (
      node: SDFNode,
      parentMatrix: THREE.Matrix4
    ): { startLeaf: number; endLeaf: number } => {
      const localMatrix = new THREE.Matrix4();
      const pos = new THREE.Vector3(...node.transform.position);
      const rot = new THREE.Euler(...node.transform.rotation, 'XYZ');
      const scale = new THREE.Vector3(...node.transform.scale);
      const quat = new THREE.Quaternion().setFromEuler(rot);
      localMatrix.compose(pos, quat, scale);

      const worldMatrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, localMatrix);
      const inverseWorldMatrix = new THREE.Matrix4().copy(worldMatrix).invert();

      if (node.kind === 'primitive') {
        if (leaves.length >= MAX_LEAF_COUNT) {
          throw new Error(`Scene exceeds maximum supported leaf count of ${MAX_LEAF_COUNT}`);
        }
        const leafIndex = leaves.length;
        leaves.push({
          node,
          leafIndex,
          worldMatrix,
          inverseWorldMatrix
        });

        emitInstruction({
          opcode: OPCODE_PUSH_LEAF,
          arg0: leafIndex,
          arg1: 0,
          arg2: 0
        });
        pushStack();

        const range: [number, number] = [leafIndex, leafIndex];
        nodeLeafRanges.set(node.id, range);
        return { startLeaf: leafIndex, endLeaf: leafIndex };
      }

      // Group Node
      const visibleChildren = (node.children || []).filter(c => c.visible);
      if (visibleChildren.length === 0) {
        nodeLeafRanges.set(node.id, [-1, -1]);
        return { startLeaf: -1, endLeaf: -1 };
      }

      let groupStart = -1;
      let groupEnd = -1;
      groupNodes.push(node);

      let skipIndex = -1;
      if (skipGroupIds?.has(node.id)) {
        skipIndex = instructions.length;
        emitInstruction({ opcode: OPCODE_GROUP_SKIP, arg0: groupSkips.length, arg1: 0, arg2: 0 });
        groupSkips.push({ node, leafRange: [-1, -1] });
      }

      // 1. Compile first visible child to initialize group evaluation
      const firstChild = visibleChildren[0];
      const firstRange = compileNode(firstChild, worldMatrix);
      groupStart = firstRange.startLeaf;
      groupEnd = firstRange.endLeaf;

      // 2. Compile subsequent children and combine with their CSG operation
      for (let i = 1; i < visibleChildren.length; i++) {
        const child = visibleChildren[i];
        const childRange = compileNode(child, worldMatrix);

        if (childRange.startLeaf !== -1) {
          if (groupStart === -1) groupStart = childRange.startLeaf;
          groupEnd = Math.max(groupEnd, childRange.endLeaf);

          emitInstruction({
            opcode: OPCODE_COMBINE,
            arg0: CSGCompiler.opToNumber(child.csg.operation),
            arg1: CSGCompiler.blendModeToNumber(child.csg.blendMode),
            arg2: child.csg.blendRadius || 0.0
          });
          // Binary operation consumes 2 stack items and pushes 1 result: net -1
          popStack(1);
        }
      }

      // 3. Apply Group Post-modifiers if any (e.g. Rounding or Shell)
      if (node.modifiers) {
        const roundRadius = node.modifiers.roundRadius || 0.0;
        const shellThickness = node.modifiers.shellThickness || 0.0;
        if (roundRadius > 0.0 || shellThickness > 0.0) {
          emitInstruction({
            opcode: OPCODE_POST_MOD,
            arg0: roundRadius,
            arg1: shellThickness,
            arg2: 0.0
          });
        }
      }

      const range: [number, number] = [groupStart, groupEnd];
      nodeLeafRanges.set(node.id, range);
      if (skipIndex >= 0) {
        const skip = instructions[skipIndex];
        skip.arg1 = instructions.length - skipIndex - 1;
        groupSkips[skip.arg0].leafRange = range;
      }
      return { startLeaf: groupStart, endLeaf: groupEnd };
    };

    if (tree.root.visible) {
      compileNode(tree.root, new THREE.Matrix4().identity());
    }

    return {
      leaves,
      instructions,
      nodeLeafRanges,
      maxStackDepth,
      groupSkips,
      groupNodes
    };
  }
}
