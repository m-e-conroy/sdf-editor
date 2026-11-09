// ========================================================================
// SDF Studio 3D - MCP Safe File Writer (Sandboxed Export Directory)
// ========================================================================

import * as fs from 'node:fs';
import * as path from 'node:path';

export interface WriteFileOptions {
  filename?: string;
  defaultName?: string;
  extension: '.glb' | '.obj' | '.glsl' | '.sdf.json' | '.png';
  content: string | Buffer;
  overwrite?: boolean;
}

export interface WriteFileResult {
  filepath: string;
  filename: string;
  bytes: number;
}

export class SafeFileWriter {
  private readonly exportDir: string;
  private readonly allowedExtensions = new Set(['.glb', '.obj', '.glsl', '.sdf.json', '.png']);

  constructor(customExportDir?: string) {
    const defaultDir = process.env.SDF_EXPORT_DIR || path.resolve(process.cwd(), 'exports');
    this.exportDir = path.resolve(customExportDir || defaultDir);

    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  public getExportDir(): string {
    return this.exportDir;
  }

  public writeFile(opts: WriteFileOptions): WriteFileResult {
    const rawName = opts.filename?.trim() || opts.defaultName || `export_${Date.now()}`;
    const cleanBase = path.basename(rawName);

    // Validate extension
    let targetExt = opts.extension;
    let targetBase = cleanBase;

    if (cleanBase.endsWith('.sdf.json')) {
      targetExt = '.sdf.json';
    } else {
      const ext = path.extname(cleanBase).toLowerCase();
      if (ext && this.allowedExtensions.has(ext)) {
        targetExt = ext as any;
      } else if (!cleanBase.endsWith(targetExt)) {
        targetBase = `${cleanBase}${targetExt}`;
      }
    }

    const resolvedPath = path.resolve(this.exportDir, targetBase);

    // Strict sandbox check: reject directory traversal
    const relative = path.relative(this.exportDir, resolvedPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`PATH_REJECTED: Target path escapes export sandbox: ${opts.filename}`);
    }

    // Overwrite safety check
    if (fs.existsSync(resolvedPath) && !opts.overwrite) {
      const parsed = path.parse(resolvedPath);
      let count = 1;
      let alternativePath = resolvedPath;
      while (fs.existsSync(alternativePath)) {
        alternativePath = path.join(this.exportDir, `${parsed.name}_${count}${targetExt}`);
        count++;
      }
      return this.writeDirect(alternativePath, opts.content);
    }

    return this.writeDirect(resolvedPath, opts.content);
  }

  private writeDirect(filepath: string, content: string | Buffer): WriteFileResult {
    if (Buffer.isBuffer(content)) {
      fs.writeFileSync(filepath, content);
      return {
        filepath,
        filename: path.basename(filepath),
        bytes: content.length
      };
    }

    // Check if content is base64 data URL
    if (content.startsWith('data:')) {
      const base64Index = content.indexOf(';base64,');
      if (base64Index !== -1) {
        const rawBase64 = content.substring(base64Index + 8);
        const buf = Buffer.from(rawBase64, 'base64');
        fs.writeFileSync(filepath, buf);
        return {
          filepath,
          filename: path.basename(filepath),
          bytes: buf.length
        };
      }
    }

    fs.writeFileSync(filepath, content, 'utf-8');
    const stats = fs.statSync(filepath);
    return {
      filepath,
      filename: path.basename(filepath),
      bytes: stats.size
    };
  }
}
