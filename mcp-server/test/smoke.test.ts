import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { WebSocket } from 'ws';
import * as fs from 'node:fs';
import * as net from 'node:net';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVER_ENTRY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/index.js');
const TOKEN = 'smoke-test-token';

type ToolResult = { isError?: boolean; content: Array<{ type: string; text?: string }> };

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
  });
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.listen(port, '127.0.0.1', () => srv.close(() => resolve(true)));
  });
}

function parseText(result: ToolResult): any {
  return JSON.parse(result.content[0].text ?? '');
}

/** Minimal stand-in for the browser tab: pairs with the hub and answers requests by method. */
async function connectFakeStudio(
  port: number,
  token: string,
  handlers: Record<string, (params: any) => unknown> = {}
): Promise<{ ws: WebSocket; requests: Array<{ method: string; params: any }> }> {
  const ws = new WebSocket(`ws://127.0.0.1:${port}`);
  const requests: Array<{ method: string; params: any }> = [];

  await new Promise<void>((resolve, reject) => {
    ws.once('error', reject);
    ws.once('close', (code) => reject(new Error(`closed before welcome (${code})`)));
    ws.once('open', () => {
      ws.send(JSON.stringify({ v: 1, type: 'hello', role: 'studio', protocol: 1, token, appVersion: 'smoke', capabilities: [] }));
    });
    ws.on('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'welcome') {
        ws.removeAllListeners('close');
        resolve();
      } else if (msg.type === 'request') {
        requests.push({ method: msg.method, params: msg.params });
        const handler = handlers[msg.method];
        const reply = handler
          ? { v: 1, type: 'response', id: msg.id, ok: true, result: handler(msg.params) }
          : { v: 1, type: 'response', id: msg.id, ok: false, error: { code: 'VALIDATION_ERROR', message: `no handler for ${msg.method}` } };
        ws.send(JSON.stringify(reply));
      }
    });
  });

  return { ws, requests };
}

describe('MCP server smoke test', () => {
  let client: Client;
  let port: number;
  let tmpDir: string;
  let exportDir: string;

  beforeAll(async () => {
    if (!fs.existsSync(SERVER_ENTRY)) {
      throw new Error(`Build output missing at ${SERVER_ENTRY}. Run "npm run build" first.`);
    }
    port = await getFreePort();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdf-mcp-smoke-'));
    exportDir = path.join(tmpDir, 'exports');

    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) env[key] = value;
    }
    Object.assign(env, {
      SDF_BRIDGE_PORT: String(port),
      SDF_BRIDGE_TOKEN: TOKEN,
      SDF_EXPORT_DIR: exportDir,
      // Keep the hub's bridge.json out of the real user profile
      LOCALAPPDATA: tmpDir
    });

    client = new Client({ name: 'smoke-test', version: '1.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [SERVER_ENTRY], env, stderr: 'ignore' }));
  }, 20000);

  afterAll(async () => {
    await client?.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('advertises the full tool, resource, and prompt surface', async () => {
    const { tools } = await client.listTools();
    const { resources } = await client.listResources();
    const { prompts } = await client.listPrompts();

    expect(tools).toHaveLength(19);
    expect(tools.map((t) => t.name)).toEqual(
      expect.arrayContaining(['sdf_get_scene', 'sdf_apply_scene_recipe', 'sdf_take_snapshot', 'sdf_export'])
    );
    expect(resources.map((r) => r.uri)).toEqual(
      expect.arrayContaining(['sdf://scene', 'sdf://primitives', 'sdf://conventions', 'sdf://recipes/examples'])
    );
    expect(prompts.map((p) => p.name)).toEqual(expect.arrayContaining(['model_object', 'refine_model']));
  });

  it('serves the primitive catalog from the shared protocol without a studio', async () => {
    const result = (await client.callTool({ name: 'sdf_list_primitives', arguments: {} })) as ToolResult;

    expect(result.isError).toBeFalsy();
    expect(Object.keys(parseText(result).primitives)).toEqual(expect.arrayContaining(['sphere', 'box', 'star_prism']));
  });

  it('reports STUDIO_NOT_CONNECTED with a pairing hint when no tab is open', async () => {
    const result = (await client.callTool({ name: 'sdf_get_scene', arguments: {} })) as ToolResult;

    expect(result.isError).toBe(true);
    const payload = parseText(result);
    expect(payload.error).toBe('STUDIO_NOT_CONNECTED');
    expect(payload.hint).toBe(`Open http://localhost:3000/#bridge=${TOKEN}`);
  });

  it('rejects a studio that pairs with the wrong token', async () => {
    await expect(connectFakeStudio(port, 'sdf-studio-bridge')).rejects.toThrow(/1008/);
  });

  it('relays tool calls to the paired studio and returns its result', async () => {
    const { ws, requests } = await connectFakeStudio(port, TOKEN, {
      'scene.addPrimitive': () => ({ nodeId: 'node_smoke', revision: 7 })
    });
    try {
      const result = (await client.callTool({
        name: 'sdf_add_primitive',
        arguments: { type: 'sphere', position: [1, 2, 3] }
      })) as ToolResult;

      expect(result.isError).toBeFalsy();
      expect(parseText(result)).toEqual({ nodeId: 'node_smoke', revision: 7 });
      expect(requests).toEqual([
        { method: 'scene.addPrimitive', params: expect.objectContaining({ type: 'sphere', position: [1, 2, 3] }) }
      ]);
    } finally {
      ws.close();
    }
  });

  it('writes GLB exports as binary inside the export sandbox', async () => {
    const glbBytes = Buffer.from([0x67, 0x6c, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00]);
    const { ws } = await connectFakeStudio(port, TOKEN, {
      'file.exportMesh': () => ({ filename: 'model.glb', format: 'glb', data: glbBytes.toString('base64') })
    });
    try {
      const result = (await client.callTool({
        name: 'sdf_export',
        arguments: { format: 'glb', filename: '../../escape' }
      })) as ToolResult;

      expect(result.isError).toBeFalsy();
      const { path: writtenPath } = parseText(result);
      expect(path.dirname(writtenPath)).toBe(exportDir);
      expect(path.basename(writtenPath)).toBe('escape.glb');
      expect(fs.readFileSync(writtenPath).equals(glbBytes)).toBe(true);
    } finally {
      ws.close();
    }
  });

  it('releases the bridge port when the host disconnects', async () => {
    await client.close();
    await expect.poll(() => isPortFree(port), { timeout: 5000 }).toBe(true);
  });
});
