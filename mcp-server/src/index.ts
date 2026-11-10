// ========================================================================
// SDF Studio 3D - Standalone MCP Server Main Entrypoint
// ========================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StudioHub } from './hub/StudioHub.js';
import { SafeFileWriter } from './fs/SafeFileWriter.js';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';

async function main() {
  process.stderr.write('[SDF MCP Server] Initializing...\n');

  const hub = new StudioHub();
  await hub.start();

  const fileWriter = new SafeFileWriter();

  const mcp = new McpServer({
    name: 'sdf-studio-3d',
    version: '1.0.0'
  });

  registerTools(mcp, hub, fileWriter);
  registerResources(mcp, hub);
  registerPrompts(mcp);

  const transport = new StdioServerTransport();
  await mcp.connect(transport);

  // The hub's listening socket keeps the event loop alive, so exit explicitly when the host goes away
  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    await hub.stop().catch(() => {});
    await mcp.close().catch(() => {});
    process.exit(0);
  };
  process.stdin.on('end', shutdown);
  process.stdin.on('close', shutdown);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  process.stderr.write('[SDF MCP Server] Connected to stdio transport and ready for host commands.\n');
}

main().catch((err) => {
  process.stderr.write(`[SDF MCP Server Fatal Error] ${err.stack || err.message}\n`);
  process.exit(1);
});
