// ========================================================================
// SDF Studio 3D - 4 MCP Resources
// ========================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StudioHub } from '../hub/StudioHub.js';
import { PRIMITIVE_SCHEMAS, METHODS } from '../protocol/index.js';

export function registerResources(server: McpServer, hub: StudioHub): void {
  // 1. Current Scene JSON
  server.resource('sdf_scene', 'sdf://scene', async () => {
    try {
      const scene = await hub.callMethod(METHODS.SCENE_GET_SCENE, { includeDimensions: true });
      return {
        contents: [
          {
            uri: 'sdf://scene',
            mimeType: 'application/json',
            text: JSON.stringify(scene, null, 2)
          }
        ]
      };
    } catch {
      return {
        contents: [
          {
            uri: 'sdf://scene',
            mimeType: 'application/json',
            text: JSON.stringify({ error: 'Studio not connected' })
          }
        ]
      };
    }
  });

  // 2. Primitives Catalog
  server.resource('sdf_primitives', 'sdf://primitives', async () => ({
    contents: [
      {
        uri: 'sdf://primitives',
        mimeType: 'application/json',
        text: JSON.stringify(PRIMITIVE_SCHEMAS, null, 2)
      }
    ]
  }));

  // 3. Conventions & Limits
  server.resource('sdf_conventions', 'sdf://conventions', async () => ({
    contents: [
      {
        uri: 'sdf://conventions',
        mimeType: 'application/json',
        text: JSON.stringify(
          {
            coordinateSystem: 'Right-handed, Y-up (+Y is up, +X is right, +Z is forward)',
            units: 'Studio units (1.0 = one major grid unit)',
            floorHeight: -1.2,
            angles: 'API uses degrees (Euler XYZ); storage uses radians',
            colors: 'Hex #rrggbb, roughness & metalness in [0, 1]',
            limits: {
              maxLeaves: 32,
              maxInstructions: 64,
              maxNestingDepth: 7,
              maxSamplePoints: 256
            },
            csgSemantics: 'Left-to-right evaluation inside groups. First child initializes the group.'
          },
          null,
          2
        )
      }
    ]
  }));

  // 4. Annotated Example Recipes
  server.resource('sdf_recipes_examples', 'sdf://recipes/examples', async () => ({
    contents: [
      {
        uri: 'sdf://recipes/examples',
        mimeType: 'application/json',
        text: JSON.stringify(
          {
            mug: {
              description: 'Mug with hollow interior and smooth torus handle',
              recipe: {
                mode: 'replace',
                nodes: [
                  {
                    ref: 'body',
                    type: 'group',
                    name: 'Mug Body',
                    children: [
                      {
                        type: 'cylinder',
                        dimensions: { radius: 0.6, height: 1.4 },
                        material: { color: '#e2e8f0', roughness: 0.3 }
                      },
                      {
                        type: 'cylinder',
                        operation: 'difference',
                        position: [0, 0.15, 0],
                        dimensions: { radius: 0.52, height: 1.4 }
                      }
                    ]
                  },
                  {
                    type: 'torus',
                    operation: 'union',
                    blend: { mode: 'smooth_polynomial', radius: 0.08 },
                    position: [0.7, 0, 0],
                    rotationDeg: [90, 0, 0],
                    dimensions: { radiusMajor: 0.35, radiusMinor: 0.08 }
                  }
                ]
              }
            }
          },
          null,
          2
        )
      }
    ]
  }));
}
