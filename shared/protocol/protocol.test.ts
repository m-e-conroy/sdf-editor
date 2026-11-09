import { describe, it, expect } from 'vitest';
import {
  BridgeEnvelopeSchema,
  createHelloEnvelope,
  createWelcomeEnvelope,
  createRequestEnvelope,
  createProgressEnvelope,
  createResponseSuccess,
  createResponseError,
  ERROR_CODES,
  PRIMITIVE_TYPES,
  PRIMITIVE_SCHEMAS,
  SceneRecipeSchema,
  METHOD_SCHEMAS,
  METHODS
} from './index';

describe('@sdf-studio/protocol Envelope v1', () => {
  it('validates a hello envelope', () => {
    const hello = createHelloEnvelope('studio', 'token_123', '1.10.0', ['groups', 'snapshot']);
    const parsed = BridgeEnvelopeSchema.parse(hello);
    expect(parsed.type).toBe('hello');
    if (parsed.type === 'hello') {
      expect(parsed.role).toBe('studio');
      expect(parsed.token).toBe('token_123');
    }
  });

  it('validates a welcome envelope', () => {
    const welcome = createWelcomeEnvelope('s_42', true);
    const parsed = BridgeEnvelopeSchema.parse(welcome);
    expect(parsed.type).toBe('welcome');
    if (parsed.type === 'welcome') {
      expect(parsed.sessionId).toBe('s_42');
      expect(parsed.active).toBe(true);
    }
  });

  it('validates a request envelope with expected revision', () => {
    const req = createRequestEnvelope('req_1', 'scene.addPrimitive', { type: 'sphere' }, 12);
    const parsed = BridgeEnvelopeSchema.parse(req);
    expect(parsed.type).toBe('request');
    if (parsed.type === 'request') {
      expect(parsed.id).toBe('req_1');
      expect(parsed.method).toBe('scene.addPrimitive');
      expect(parsed.expectedRevision).toBe(12);
    }
  });

  it('validates a progress envelope within 0.0 to 1.0', () => {
    const progress = createProgressEnvelope('req_1', 0.65, 'Baking meshes');
    const parsed = BridgeEnvelopeSchema.parse(progress);
    expect(parsed.type).toBe('progress');
    if (parsed.type === 'progress') {
      expect(parsed.progress).toBe(0.65);
      expect(parsed.message).toBe('Baking meshes');
    }
  });

  it('validates successful and error response envelopes', () => {
    const success = createResponseSuccess('req_1', { nodeId: 'node_abc' }, 13);
    const parsedSuccess = BridgeEnvelopeSchema.parse(success);
    expect(parsedSuccess.type).toBe('response');
    if (parsedSuccess.type === 'response') {
      expect(parsedSuccess.ok).toBe(true);
      expect(parsedSuccess.revision).toBe(13);
    }

    const failure = createResponseError(
      'req_2',
      ERROR_CODES.LIMIT_EXCEEDED,
      'Scene has reached maximum 32 leaf primitives.',
      'Merge primitives using CSG or group them.'
    );
    const parsedFailure = BridgeEnvelopeSchema.parse(failure);
    expect(parsedFailure.type).toBe('response');
    if (parsedFailure.type === 'response') {
      expect(parsedFailure.ok).toBe(false);
      expect(parsedFailure.error?.code).toBe('LIMIT_EXCEEDED');
      expect(parsedFailure.error?.hint).toBeDefined();
    }
  });

  it('rejects invalid envelopes', () => {
    expect(() =>
      BridgeEnvelopeSchema.parse({
        v: 2, // invalid version
        type: 'hello'
      })
    ).toThrow();

    expect(() =>
      BridgeEnvelopeSchema.parse({
        v: 1,
        type: 'progress',
        id: 'p1',
        progress: 1.5 // > 1.0
      })
    ).toThrow();
  });
});

describe('@sdf-studio/protocol Primitive Registry', () => {
  it('covers all 22 primitives in PRIMITIVE_TYPES and PRIMITIVE_SCHEMAS', () => {
    expect(PRIMITIVE_TYPES.length).toBe(22);

    for (const type of PRIMITIVE_TYPES) {
      const schema = PRIMITIVE_SCHEMAS[type];
      expect(schema).toBeDefined();
      expect(schema.type).toBe(type);
      expect(schema.name.length).toBeGreaterThan(0);
      expect(schema.description.length).toBeGreaterThan(0);
      expect(['basic', 'cad', 'organic', 'polyhedra', 'fractal']).toContain(schema.category);
      expect(schema.fields).toBeDefined();
      expect(schema.defaultDimensions).toBeDefined();

      // Check each default dimension has a field definition
      for (const key of Object.keys(schema.defaultDimensions)) {
        expect(schema.fields[key]).toBeDefined();
      }
    }
  });

  it('provides exact default dimensions for fundamental primitives', () => {
    expect(PRIMITIVE_SCHEMAS.sphere.defaultDimensions.radius).toBe(0.8);
    expect(PRIMITIVE_SCHEMAS.box.defaultDimensions.size).toEqual([0.7, 0.7, 0.7]);
    expect(PRIMITIVE_SCHEMAS.cylinder.defaultDimensions).toEqual({ radius: 0.5, height: 0.8 });
    expect(PRIMITIVE_SCHEMAS.torus.defaultDimensions).toEqual({ radiusMajor: 0.7, radiusMinor: 0.25 });
  });
});

describe('@sdf-studio/protocol Scene Recipe Spec', () => {
  it('validates a nested CSG recipe (Mug with cavity and handle)', () => {
    const validRecipe = {
      mode: 'replace' as const,
      dryRun: false,
      nodes: [
        {
          ref: 'shell',
          type: 'group' as const,
          name: 'Mug Shell',
          children: [
            {
              ref: 'outer',
              type: 'cylinder' as const,
              dimensions: { radius: 0.6, height: 1.4 },
              material: { color: '#d9c7a7', roughness: 0.4 }
            },
            {
              ref: 'cavity',
              type: 'cylinder' as const,
              operation: 'difference' as const,
              position: [0, 0.1, 0] as [number, number, number],
              dimensions: { radius: 0.5, height: 1.4 }
            }
          ]
        },
        {
          ref: 'handle',
          type: 'torus' as const,
          operation: 'union' as const,
          blend: { mode: 'smooth_polynomial' as const, radius: 0.05 },
          position: [0.75, 0, 0] as [number, number, number],
          rotationDeg: [90, 0, 0] as [number, number, number],
          dimensions: { radiusMajor: 0.3, radiusMinor: 0.07 }
        }
      ]
    };

    const parsed = SceneRecipeSchema.parse(validRecipe);
    expect(parsed.nodes.length).toBe(2);
    expect(parsed.nodes[0].children?.length).toBe(2);
  });

  it('rejects invalid recipe nodes and invalid color hex format', () => {
    expect(() =>
      SceneRecipeSchema.parse({
        mode: 'replace',
        nodes: [
          {
            type: 'cylinder',
            material: {
              color: 'invalid-hex-color' // invalid regex
            }
          }
        ]
      })
    ).toThrow();
  });
});

describe('@sdf-studio/protocol Method Schemas', () => {
  it('has schemas registered for all 19 RPC bridge methods', () => {
    const methodKeys = Object.values(METHODS);
    expect(methodKeys.length).toBe(19);

    for (const method of methodKeys) {
      expect(METHOD_SCHEMAS[method]).toBeDefined();
      expect(METHOD_SCHEMAS[method].params).toBeDefined();
      expect(METHOD_SCHEMAS[method].result).toBeDefined();
    }
  });

  it('validates sample distance params capped at 256 points', () => {
    const schema = METHOD_SCHEMAS[METHODS.SENSE_SAMPLE_DISTANCE].params;

    const valid = schema.parse({
      points: [
        [0, 0, 0],
        [1, 1, 1]
      ]
    });
    expect(valid.points.length).toBe(2);

    const tooMany = Array.from({ length: 257 }, () => [0, 0, 0]);
    expect(() => schema.parse({ points: tooMany })).toThrow();
  });
});

