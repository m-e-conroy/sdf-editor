// ========================================================================
// SDF Studio 3D - Localhost WebSocket Hub & Multi-Process Relay
// ========================================================================

import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'node:http';
import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import {
  BridgeEnvelope,
  BridgeEnvelopeSchema,
  createWelcomeEnvelope,
  ERROR_CODES
} from '../protocol/index.js';

export interface StudioHubOptions {
  port?: number;
  studioUrl?: string;
  exportDir?: string;
}

interface PendingRequest {
  id: string;
  method: string;
  resolve: (result: any) => void;
  reject: (err: Error) => void;
  onProgress?: (progress: number, message?: string) => void;
  timer: NodeJS.Timeout;
}

export class StudioHub {
  private port: number;
  private token: string;
  private studioUrl: string;
  private server: http.Server | null = null;
  private wss: WebSocketServer | null = null;
  private activeStudioSocket: WebSocket | null = null;
  private relaySocket: WebSocket | null = null;
  private isHub = false;
  private stopped = false;

  private pendingRequests = new Map<string, PendingRequest>();
  private mutationQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  private readonly configPath: string;

  constructor(options: StudioHubOptions = {}) {
    this.port = options.port ?? (Number(process.env.SDF_BRIDGE_PORT) || 8765);
    this.token = process.env.SDF_BRIDGE_TOKEN || 'sdf-studio-bridge';
    this.studioUrl = options.studioUrl || process.env.SDF_STUDIO_URL || 'http://localhost:3000';

    const appData =
      process.env.LOCALAPPDATA ||
      (process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Application Support')
        : path.join(os.homedir(), '.config'));
    const configDir = path.join(appData, 'sdf-studio');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.configPath = path.join(configDir, 'bridge.json');
  }

  public getToken(): string {
    return this.token;
  }

  public getPort(): number {
    return this.port;
  }

  public isConnected(): boolean {
    return Boolean(
      (this.activeStudioSocket && this.activeStudioSocket.readyState === WebSocket.OPEN) ||
        (this.relaySocket && this.relaySocket.readyState === WebSocket.OPEN)
    );
  }

  public async start(): Promise<void> {
    try {
      await this.startAsHub();
      this.saveConfig();
      process.stderr.write(`[SDF Hub] Listening as primary Hub on 127.0.0.1:${this.port}\n`);
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        process.stderr.write(`[SDF Hub] Port ${this.port} in use. Connecting as Relay...\n`);
        await this.connectAsRelay();
      } else {
        throw err;
      }
    }
  }

  private startAsHub(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'sdf-studio-hub' }));
      });

      this.wss = new WebSocketServer({
        noServer: true
      });

      this.server.on('upgrade', (req, socket, head) => {
        // Origin check: allow any local studio (localhost / 127.0.0.1 on any port, tauri, or local webviews)
        const origin = req.headers.origin || '';
        if (origin && !this.isOriginAllowed(origin)) {
          process.stderr.write(`[SDF Hub] Rejected WebSocket from forbidden Origin: ${origin}\n`);
          socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
          socket.destroy();
          return;
        }

        this.wss?.handleUpgrade(req, socket, head, (ws) => {
          this.wss?.emit('connection', ws, req);
        });
      });

      this.wss.on('connection', (ws: WebSocket) => {
        this.handleIncomingConnection(ws);
      });

      this.server.on('error', (err) => {
        reject(err);
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        const address = this.server?.address();
        if (address && typeof address === 'object') {
          this.port = address.port;
        }
        this.isHub = true;
        resolve();
      });
    });
  }

  private handleIncomingConnection(ws: WebSocket): void {
    let isAuthenticated = false;

    ws.on('message', (raw: Buffer) => {
      try {
        const text = raw.toString('utf-8');
        const json = JSON.parse(text);
        const parsed = BridgeEnvelopeSchema.parse(json);

        if (parsed.type === 'hello') {
          if (parsed.token !== this.token) {
            process.stderr.write(`[SDF Hub] Rejected hello with invalid token\n`);
            ws.close(1008, 'Invalid token');
            return;
          }

          isAuthenticated = true;
          if (parsed.role === 'studio') {
            // Park any previous studio tab
            if (this.activeStudioSocket && this.activeStudioSocket !== ws) {
              const parkEnvelope = createWelcomeEnvelope('parked', false);
              this.activeStudioSocket.send(JSON.stringify(parkEnvelope));
            }
            this.activeStudioSocket = ws;
            const welcome = createWelcomeEnvelope(`session_${Date.now()}`, true);
            ws.send(JSON.stringify(welcome));
            process.stderr.write(`[SDF Hub] Active studio tab connected.\n`);
          }
          return;
        }

        if (!isAuthenticated) {
          ws.close(1008, 'Unauthorized');
          return;
        }
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ v: 1, type: 'pong' }));
          return;
        }
        if (parsed.type === 'pong') {
          return;
        }
        if (parsed.type === 'request') {
          // Forward request from a relay client to the active studio tab
          this.callMethod(parsed.method, parsed.params, {
            expectedRevision: parsed.expectedRevision,
            onProgress: (progress, message) => {
              ws.send(JSON.stringify({ v: 1, type: 'progress', id: parsed.id, progress, message }));
            }
          })
            .then((result) => {
              ws.send(JSON.stringify({ v: 1, type: 'response', id: parsed.id, ok: true, result }));
            })
            .catch((err: any) => {
              ws.send(
                JSON.stringify({
                  v: 1,
                  type: 'response',
                  id: parsed.id,
                  ok: false,
                  error: { code: err.code || ERROR_CODES.VALIDATION_ERROR, message: err.message, hint: err.hint }
                })
              );
            });
          return;
        }

        this.handleResponseOrProgress(parsed);
      } catch (err: any) {
        process.stderr.write(`[SDF Hub] Message error: ${err.message}\n`);
      }
    });

    ws.on('close', () => {
      if (this.activeStudioSocket === ws) {
        this.activeStudioSocket = null;
        process.stderr.write(`[SDF Hub] Active studio tab disconnected.\n`);
      }
    });
  }

  private handleResponseOrProgress(parsed: BridgeEnvelope): void {
    if (parsed.type === 'response') {
      const pending = this.pendingRequests.get(parsed.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(parsed.id);
        if (parsed.ok) {
          pending.resolve(parsed.result);
        } else {
          const err = new Error(parsed.error?.message || 'RPC Error');
          (err as any).code = parsed.error?.code || ERROR_CODES.VALIDATION_ERROR;
          (err as any).hint = parsed.error?.hint;
          pending.reject(err);
        }
      }
    } else if (parsed.type === 'progress') {
      const pending = this.pendingRequests.get(parsed.id);
      if (pending && pending.onProgress) {
        pending.onProgress(parsed.progress, parsed.message);
      }
    }
  }

  private async connectAsRelay(): Promise<void> {
    const config = this.loadConfig();
    if (config) {
      this.token = config.token;
      this.port = config.port;
    }

    return new Promise((resolve) => {
      this.relaySocket = new WebSocket(`ws://127.0.0.1:${this.port}`);

      this.relaySocket.on('open', () => {
        process.stderr.write(`[SDF Relay] Connected to existing Hub at 127.0.0.1:${this.port}\n`);
        const hello = {
          v: 1,
          type: 'hello',
          role: 'relay',
          protocol: 1,
          token: this.token,
          appVersion: '1.10.0',
          capabilities: ['relay']
        };
        this.relaySocket?.send(JSON.stringify(hello));
        resolve();
      });

      this.relaySocket.on('message', (raw: Buffer) => {
        try {
          const text = raw.toString('utf-8');
          const json = JSON.parse(text);
          const parsed = BridgeEnvelopeSchema.parse(json);
          if (parsed.type === 'ping') {
            this.relaySocket?.send(JSON.stringify({ v: 1, type: 'pong' }));
            return;
          }
          if (parsed.type === 'pong') {
            return;
          }
          this.handleResponseOrProgress(parsed);
        } catch (err: any) {
          process.stderr.write(`[SDF Relay] Message error: ${err.message}\n`);
        }
      });

      this.relaySocket.on('error', (err) => {
        process.stderr.write(`[SDF Relay] Relay error: ${err.message}\n`);
        resolve();
      });

      this.relaySocket.on('close', () => {
        this.relaySocket = null;
        if (this.stopped) return;
        process.stderr.write(`[SDF Relay] Hub closed. Promoting this process to Hub...\n`);
        this.start().catch((e) => process.stderr.write(`[SDF Hub] Promotion failed: ${e.message}\n`));
      });
    });
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify({ port: this.port, token: this.token }, null, 2),
        { mode: 0o600 }
      );
    } catch {
      // Ignore config save errors
    }
  }

  private loadConfig(): { port: number; token: string } | null {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      }
    } catch {
      // Fallback
    }
    return null;
  }

  public async callMethod<TResult>(
    method: string,
    params: any = {},
    options: {
      timeoutMs?: number;
      expectedRevision?: number;
      onProgress?: (progress: number, message?: string) => void;
    } = {}
  ): Promise<TResult> {
    const isMutating =
      method.startsWith('scene.') &&
      method !== 'scene.get' &&
      method !== 'scene.getScene' &&
      method !== 'scene.listPrimitives';

    if (isMutating) {
      return new Promise<TResult>((resolve, reject) => {
        this.mutationQueue.push(async () => {
          try {
            const res = await this.executeCall<TResult>(method, params, options);
            resolve(res);
          } catch (err) {
            reject(err);
          }
        });
        this.processQueue();
      });
    }

    return this.executeCall<TResult>(method, params, options);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.mutationQueue.length === 0) return;
    this.isProcessingQueue = true;

    while (this.mutationQueue.length > 0) {
      const next = this.mutationQueue.shift();
      if (next) {
        try {
          await next();
        } catch {
          // errors handled in promise wrapper
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private executeCall<TResult>(
    method: string,
    params: any,
    options: {
      timeoutMs?: number;
      expectedRevision?: number;
      onProgress?: (progress: number, message?: string) => void;
    }
  ): Promise<TResult> {
    const targetSocket = this.isHub ? this.activeStudioSocket : this.relaySocket;

    if (!targetSocket || targetSocket.readyState !== WebSocket.OPEN) {
      const err = new Error(
        'Studio browser tab is not connected. Open SDF Studio in your browser and enable the Agent Bridge.'
      );
      (err as any).code = ERROR_CODES.STUDIO_NOT_CONNECTED;
      (err as any).hint = `Open ${this.studioUrl}/#bridge=${this.token}`;
      return Promise.reject(err);
    }

    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timeoutDuration =
      options.timeoutMs ||
      (method === 'file.exportMesh' ? 120000 : method === 'sense.takeSnapshot' ? 15000 : 10000);

    return new Promise<TResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        const err = new Error(`Request '${method}' timed out after ${timeoutDuration / 1000}s`);
        (err as any).code = ERROR_CODES.TIMEOUT;
        reject(err);
      }, timeoutDuration);

      this.pendingRequests.set(id, {
        id,
        method,
        resolve,
        reject,
        onProgress: options.onProgress,
        timer
      });

      const envelope: BridgeEnvelope = {
        v: 1,
        type: 'request',
        id,
        method,
        params,
        ...(options.expectedRevision !== undefined ? { expectedRevision: options.expectedRevision } : {})
      };

      targetSocket.send(JSON.stringify(envelope));
    });
  }

  public async stop(): Promise<void> {
    this.stopped = true;
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Hub stopped'));
    }
    this.pendingRequests.clear();
    this.relaySocket?.close();
    for (const client of this.wss?.clients ?? []) {
      client.terminate();
    }
    this.wss?.close();
    await new Promise<void>((resolve) => (this.server ? this.server.close(() => resolve()) : resolve()));
    this.server = null;
    this.wss = null;
    this.isHub = false;
  }

  private isOriginAllowed(origin: string): boolean {
    if (!origin || origin === 'null') return true;
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return true;
      }
      if (url.protocol === 'tauri:' || url.protocol === 'vscode-webview:') {
        return true;
      }
    } catch {
      // Invalid URL syntax
    }
    return false;
  }
}
