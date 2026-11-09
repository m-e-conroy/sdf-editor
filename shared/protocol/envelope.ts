// ========================================================================
// SDF Studio 3D - Bridge Protocol Envelope v1 & Error Codes
// ========================================================================

import { z } from 'zod';

export const PROTOCOL_VERSION = 1 as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NODE_NOT_FOUND: 'NODE_NOT_FOUND',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  REVISION_CONFLICT: 'REVISION_CONFLICT',
  STUDIO_NOT_CONNECTED: 'STUDIO_NOT_CONNECTED',
  SESSION_PARKED: 'SESSION_PARKED',
  TIMEOUT: 'TIMEOUT',
  EXPORT_FAILED: 'EXPORT_FAILED',
  PATH_REJECTED: 'PATH_REJECTED',
  UNSUPPORTED_PROTOCOL: 'UNSUPPORTED_PROTOCOL'
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ErrorCodeSchema = z.nativeEnum(ERROR_CODES);

export const ProtocolErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  hint: z.string().optional()
});

export type ProtocolError = z.infer<typeof ProtocolErrorSchema>;

// --- Envelope Schemas ---

export const HelloEnvelopeSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('hello'),
  role: z.enum(['studio', 'relay']),
  protocol: z.literal(PROTOCOL_VERSION),
  token: z.string().min(1),
  appVersion: z.string(),
  capabilities: z.array(z.string())
});

export type HelloEnvelope = z.infer<typeof HelloEnvelopeSchema>;

export const WelcomeEnvelopeSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('welcome'),
  sessionId: z.string().min(1),
  active: z.boolean()
});

export type WelcomeEnvelope = z.infer<typeof WelcomeEnvelopeSchema>;

export const RequestEnvelopeSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('request'),
  id: z.string().min(1),
  method: z.string().min(1),
  params: z.unknown().optional(),
  expectedRevision: z.number().int().nonnegative().optional()
});

export type RequestEnvelope<TParams = unknown> = Omit<z.infer<typeof RequestEnvelopeSchema>, 'params'> & {
  params?: TParams;
};

export const ProgressEnvelopeSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('progress'),
  id: z.string().min(1),
  progress: z.number().min(0).max(1),
  message: z.string().optional()
});

export type ProgressEnvelope = z.infer<typeof ProgressEnvelopeSchema>;

export const ResponseEnvelopeSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('response'),
  id: z.string().min(1),
  ok: z.boolean(),
  result: z.unknown().optional(),
  error: ProtocolErrorSchema.optional(),
  revision: z.number().int().nonnegative().optional()
});

export type ResponseEnvelope<TResult = unknown> = Omit<z.infer<typeof ResponseEnvelopeSchema>, 'result'> & {
  result?: TResult;
};

export const PingEnvelopeSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('ping')
});

export type PingEnvelope = z.infer<typeof PingEnvelopeSchema>;

export const PongEnvelopeSchema = z.object({
  v: z.literal(PROTOCOL_VERSION),
  type: z.literal('pong')
});

export type PongEnvelope = z.infer<typeof PongEnvelopeSchema>;

export const BridgeEnvelopeSchema = z.discriminatedUnion('type', [
  HelloEnvelopeSchema,
  WelcomeEnvelopeSchema,
  RequestEnvelopeSchema,
  ProgressEnvelopeSchema,
  ResponseEnvelopeSchema,
  PingEnvelopeSchema,
  PongEnvelopeSchema
]);

export type BridgeEnvelope = z.infer<typeof BridgeEnvelopeSchema>;

// --- Envelope Constructors & Helpers ---

export function createHelloEnvelope(
  role: 'studio' | 'relay',
  token: string,
  appVersion: string,
  capabilities: string[] = ['groups', 'snapshot', 'queries']
): HelloEnvelope {
  return {
    v: PROTOCOL_VERSION,
    type: 'hello',
    role,
    protocol: PROTOCOL_VERSION,
    token,
    appVersion,
    capabilities
  };
}

export function createWelcomeEnvelope(sessionId: string, active: boolean): WelcomeEnvelope {
  return {
    v: PROTOCOL_VERSION,
    type: 'welcome',
    sessionId,
    active
  };
}

export function createRequestEnvelope(
  id: string,
  method: string,
  params?: unknown,
  expectedRevision?: number
): RequestEnvelope {
  return {
    v: PROTOCOL_VERSION,
    type: 'request',
    id,
    method,
    params,
    ...(expectedRevision !== undefined ? { expectedRevision } : {})
  };
}

export function createProgressEnvelope(id: string, progress: number, message?: string): ProgressEnvelope {
  return {
    v: PROTOCOL_VERSION,
    type: 'progress',
    id,
    progress: Math.max(0, Math.min(1, progress)),
    ...(message !== undefined ? { message } : {})
  };
}

export function createResponseSuccess<T>(id: string, result: T, revision?: number): ResponseEnvelope<T> {
  return {
    v: PROTOCOL_VERSION,
    type: 'response',
    id,
    ok: true,
    result,
    ...(revision !== undefined ? { revision } : {})
  };
}

export function createResponseError(
  id: string,
  code: ErrorCode | string,
  message: string,
  hint?: string
): ResponseEnvelope<never> {
  return {
    v: PROTOCOL_VERSION,
    type: 'response',
    id,
    ok: false,
    error: {
      code,
      message,
      ...(hint !== undefined ? { hint } : {})
    }
  };
}

