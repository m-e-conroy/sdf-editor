// ========================================================================
// SDF Studio 3D - Scene Budget & Limits Validator
// ========================================================================

import { CSGTree } from '../tree/CSGTree';
import type { SDFNode } from '../tree/types';

export const MAX_LEAVES = 32;
export const MAX_INSTRUCTIONS = 64;
export const MAX_DEPTH = 7;

export interface SceneLimitsValidationResult {
  valid: boolean;
  leafCount: number;
  depth: number;
  instructionCount: number;
  error?: string;
}

/**
 * Counts the number of geometric primitive leaf nodes in a subtree.
 */
export function countLeaves(node: SDFNode): number {
  if (node.kind === 'primitive') {
    let count = 1;
    for (const child of node.children) {
      count += countLeaves(child);
    }
    return count;
  }

  let count = 0;
  for (const child of node.children) {
    count += countLeaves(child);
  }
  return count;
}

/**
 * Computes maximum nesting depth of the CSG tree.
 */
export function computeDepth(node: SDFNode, currentDepth = 1): number {
  if (!node.children || node.children.length === 0) {
    return currentDepth;
  }

  let maxChildDepth = currentDepth;
  for (const child of node.children) {
    const childDepth = computeDepth(child, currentDepth + 1);
    if (childDepth > maxChildDepth) {
      maxChildDepth = childDepth;
    }
  }
  return maxChildDepth;
}

/**
 * Validates the CSGTree against engine limits.
 */
export function validateSceneLimits(tree: CSGTree | SDFNode): SceneLimitsValidationResult {
  const root = tree instanceof CSGTree ? tree.root : tree;
  const leafCount = countLeaves(root);
  const depth = computeDepth(root);
  // Postfix VM instructions: 1 push per leaf + 1 combine per non-initial node + post modifiers
  const instructionCount = leafCount > 0 ? 2 * leafCount - 1 : 0;

  if (leafCount > MAX_LEAVES) {
    return {
      valid: false,
      leafCount,
      depth,
      instructionCount,
      error: `Scene exceeds maximum leaf limit: ${leafCount}/${MAX_LEAVES} primitives. Delete or merge nodes, or use radial/linear arrays.`
    };
  }

  if (depth > MAX_DEPTH) {
    return {
      valid: false,
      leafCount,
      depth,
      instructionCount,
      error: `Scene hierarchy exceeds maximum depth: ${depth}/${MAX_DEPTH} levels.`
    };
  }

  if (instructionCount > MAX_INSTRUCTIONS) {
    return {
      valid: false,
      leafCount,
      depth,
      instructionCount,
      error: `Scene exceeds instruction limit: ${instructionCount}/${MAX_INSTRUCTIONS} VM instructions.`
    };
  }

  return {
    valid: true,
    leafCount,
    depth,
    instructionCount
  };
}
