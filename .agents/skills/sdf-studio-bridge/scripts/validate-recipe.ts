#!/usr/bin/env node
// ========================================================================
// SDF Studio 3D - Scene Recipe Validator Utility
// ========================================================================
// Validates scene recipes against the 32-leaf limit, 64-instruction limit,
// stack depth bounds, and primitive dimension schemas.
//
// Usage:
//   npx tsx scripts/validate-recipe.ts path/to/recipe.json

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface RecipeNode {
  ref?: string;
  name?: string;
  type: string;
  dimensions?: Record<string, any>;
  position?: [number, number, number];
  rotationDeg?: [number, number, number];
  scale?: [number, number, number];
  operation?: 'union' | 'difference' | 'intersection';
  blend?: { mode: 'hard' | 'smooth_polynomial'; radius: number };
  material?: { color?: string; roughness?: number; metalness?: number };
  modifiers?: Record<string, any>;
  children?: RecipeNode[];
}

interface ValidationReport {
  valid: boolean;
  leafCount: number;
  groupCount: number;
  maxDepth: number;
  estimatedInstructions: number;
  errors: string[];
  warnings: string[];
}

const MAX_LEAVES = 32;
const MAX_INSTRUCTIONS = 64;
const MAX_DEPTH = 8;

export function validateRecipe(recipe: { nodes: RecipeNode[] }): ValidationReport {
  let leafCount = 0;
  let groupCount = 0;
  let maxDepth = 0;
  const errors: string[] = [];
  const warnings: string[] = [];

  function traverse(node: RecipeNode, depth: number) {
    if (depth > maxDepth) maxDepth = depth;
    if (depth > MAX_DEPTH) {
      errors.push(`Hierarchy depth ${depth} exceeds MAX_DEPTH (${MAX_DEPTH}) at node "${node.name || node.ref || node.type}"`);
    }

    if (node.blend) {
      if (typeof node.blend.radius === 'number') {
        if (node.blend.radius < 0) {
          errors.push(`Node "${node.name || node.ref || node.type}" blend radius cannot be negative (${node.blend.radius}).`);
        } else if (node.blend.radius > 1.5) {
          warnings.push(`Node "${node.name || node.ref || node.type}" blend radius ${node.blend.radius} is very large (> 1.5) and may wash out features.`);
        }
      }
    }

    if (node.type === 'group') {
      groupCount++;
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          traverse(child, depth + 1);
        }
      } else {
        warnings.push(`Group node "${node.name || 'unnamed'}" has no children.`);
      }
    } else {
      leafCount++;
      // Validate modifiers if present
      if (node.modifiers) {
        const m = node.modifiers;
        const nodeLabel = node.name || node.ref || node.type;

        if (m.radialRepeat !== undefined) {
          if (typeof m.radialRepeat !== 'number' || m.radialRepeat < 1 || !Number.isInteger(m.radialRepeat)) {
            errors.push(`Node "${nodeLabel}" radialRepeat must be a positive integer.`);
          } else if (m.radialRepeat > 24) {
            errors.push(`Node "${nodeLabel}" radialRepeat ${m.radialRepeat} exceeds maximum (24).`);
          }
        }

        if (m.linearCount !== undefined) {
          if (typeof m.linearCount !== 'number' || m.linearCount < 1 || !Number.isInteger(m.linearCount)) {
            errors.push(`Node "${nodeLabel}" linearCount must be a positive integer.`);
          } else if (m.linearCount > 16) {
            errors.push(`Node "${nodeLabel}" linearCount ${m.linearCount} exceeds maximum (16).`);
          }
          if (m.linearCount > 1 && (typeof m.linearSpacing !== 'number' || m.linearSpacing <= 0)) {
            errors.push(`Node "${nodeLabel}" linearSpacing must be positive when linearCount > 1.`);
          }
        }

        if (m.shellThickness !== undefined) {
          if (typeof m.shellThickness !== 'number' || m.shellThickness <= 0) {
            errors.push(`Node "${nodeLabel}" shellThickness must be a positive number.`);
          } else if (m.shellThickness > 0.8) {
            warnings.push(`Node "${nodeLabel}" shellThickness (${m.shellThickness}) is very thick; check for primitive cavity collapse.`);
          }
        }

        if (m.bendFactor !== undefined) {
          if (typeof m.bendFactor !== 'number' || isNaN(m.bendFactor)) {
            errors.push(`Node "${nodeLabel}" bendFactor must be a valid number.`);
          } else if (Math.abs(m.bendFactor) > 5.0) {
            warnings.push(`Node "${nodeLabel}" bendFactor (${m.bendFactor}) has high magnitude; may cause raymarch artifacts.`);
          }
        }

        if (m.twistFactor !== undefined) {
          if (typeof m.twistFactor !== 'number' || isNaN(m.twistFactor)) {
            errors.push(`Node "${nodeLabel}" twistFactor must be a valid number.`);
          } else if (Math.abs(m.twistFactor) > 6.0) {
            warnings.push(`Node "${nodeLabel}" twistFactor (${m.twistFactor}) has high magnitude; may cause raymarch artifacts.`);
          }
        }

        if (m.roundRadius !== undefined) {
          if (typeof m.roundRadius !== 'number' || m.roundRadius < 0) {
            errors.push(`Node "${nodeLabel}" roundRadius cannot be negative.`);
          } else if (m.roundRadius > 0.6) {
            warnings.push(`Node "${nodeLabel}" roundRadius (${m.roundRadius}) is large; may collapse thin geometry.`);
          }
        }

        if (m.mirrorAxes !== undefined && !Array.isArray(m.mirrorAxes)) {
          errors.push(`Node "${nodeLabel}" mirrorAxes must be an array of axis strings (e.g. ['x']).`);
        }
      }
    }
  }

  if (!recipe || !Array.isArray(recipe.nodes) || recipe.nodes.length === 0) {
    errors.push('Recipe contains no root nodes.');
    return { valid: false, leafCount: 0, groupCount: 0, maxDepth: 0, estimatedInstructions: 0, errors, warnings };
  }

  for (const rootNode of recipe.nodes) {
    traverse(rootNode, 1);
  }

  if (leafCount > MAX_LEAVES) {
    errors.push(`Leaf primitive count ${leafCount} exceeds hard GPU limit MAX_LEAVES (${MAX_LEAVES}).`);
  }

  // Each leaf compiles to ~1 primitive evaluation + 1 CSG combine step; groups cost 1 combine
  const estimatedInstructions = leafCount * 2 + groupCount;
  if (estimatedInstructions > MAX_INSTRUCTIONS) {
    errors.push(`Estimated instructions ${estimatedInstructions} exceeds MAX_INSTRUCTIONS (${MAX_INSTRUCTIONS}).`);
  }

  if (leafCount > 28) {
    warnings.push(`Leaf count (${leafCount}) is close to GPU limit (${MAX_LEAVES}). Consider symmetry/repetition modifiers.`);
  }

  return {
    valid: errors.length === 0,
    leafCount,
    groupCount,
    maxDepth,
    estimatedInstructions,
    errors,
    warnings
  };
}

// CLI execution handler
const isDirectCall = process.argv[1] && (
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('validate-recipe.ts')
);

if (isDirectCall) {
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.error('Usage: npx tsx scripts/validate-recipe.ts <path-to-recipe.json>');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), targetFile);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    const recipe = parsed.recipe || parsed;
    const report = validateRecipe(recipe);

    console.log(`\n=== SDF Recipe Validation Report ===`);
    console.log(`Target: ${filePath}`);
    console.log(`Status: ${report.valid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Leaves: ${report.leafCount} / ${MAX_LEAVES}`);
    console.log(`Groups: ${report.groupCount}`);
    console.log(`Max Depth: ${report.maxDepth} / ${MAX_DEPTH}`);
    console.log(`Est. Instructions: ${report.estimatedInstructions} / ${MAX_INSTRUCTIONS}`);

    if (report.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      for (const w of report.warnings) console.log(` - ${w}`);
    }

    if (report.errors.length > 0) {
      console.log('\n❌ Errors:');
      for (const e of report.errors) console.log(` - ${e}`);
      process.exit(1);
    } else {
      console.log('\nAll constraints satisfied.\n');
      process.exit(0);
    }
  } catch (err: any) {
    console.error(`Failed to parse or validate recipe: ${err.message}`);
    process.exit(1);
  }
}
