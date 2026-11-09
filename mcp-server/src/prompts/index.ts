// ========================================================================
// SDF Studio 3D - 2 MCP Prompts (model_object & refine_model)
// ========================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {
  // 1. model_object
  server.prompt(
    'model_object',
    'Guides an AI agent through planning, constructing, inspecting, and refining a 3D model.',
    {
      description: z.string().describe('What 3D object to model (e.g. coffee mug, spaceship, gear)'),
      style: z.string().optional().describe('Art or functional style (e.g. low-poly, mechanical, organic)')
    },
    (args) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `You are an expert 3D generative CAD artist using SDF Studio 3D.`,
              `Goal: Model a high-quality 3D object based on: "${args.description}"${args.style ? ` in style "${args.style}"` : ''}.`,
              ``,
              `Follow this strict engineering cycle:`,
              `1. PLAN: Read 'sdf://conventions' and 'sdf://primitives'. Decompose the object into boolean sub-expressions using groups. Keep under 32 leaves.`,
              `2. BUILD: Formulate a single, cohesive declarative recipe and call 'sdf_apply_scene_recipe'.`,
              `3. SEE: Call 'sdf_get_contact_sheet' to visually inspect your shape from all 4 standard angles simultaneously.`,
              `4. MEASURE: Call 'sdf_get_bounds' to ensure sizes, proportions, and floor alignment (floor is at y = -1.2) are correct.`,
              `5. REFINE: Make surgical edits with 'sdf_update_node' or 'sdf_apply_scene_recipe' to polish details and smooth unions.`
            ].join('\n')
          }
        }
      ]
    })
  );

  // 2. refine_model
  server.prompt(
    'refine_model',
    'Inspects the current scene, critiques it against user feedback, and applies surgical improvements.',
    {
      feedback: z.string().describe('User critique or desired modifications')
    },
    (args) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `The user wants adjustments to the current 3D model: "${args.feedback}".`,
              ``,
              `Steps:`,
              `1. Call 'sdf_get_scene' to view the current hierarchy and node IDs.`,
              `2. Call 'sdf_get_contact_sheet' to observe the areas needing changes.`,
              `3. Apply minimal, precise edits with 'sdf_update_node', 'sdf_delete_node', or 'sdf_add_primitive'.`,
              `4. Confirm the result with another snapshot.`
            ].join('\n')
          }
        }
      ]
    })
  );
}
