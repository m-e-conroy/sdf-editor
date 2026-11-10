// Copies the canonical protocol from shared/protocol into src/protocol (gitignored)
// so the server compiles it against its own zod and keeps dist/index.js as the entry.
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '..', 'shared', 'protocol');
const target = join(root, 'src', 'protocol');

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

for (const file of readdirSync(source)) {
  if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
    cpSync(join(source, file), join(target, file));
  }
}
