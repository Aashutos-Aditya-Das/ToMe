import { promises as fs, existsSync } from 'node:fs';
import * as path from 'node:path';
import { IFileSystem, FileStat } from '../../domain/interfaces.js';

export class LocalFileSystem implements IFileSystem {
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf-8');
  }

  async exists(filePath: string): Promise<boolean> {
    return existsSync(filePath);
  }

  async mkdir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async readDir(dirPath: string): Promise<string[]> {
    return fs.readdir(dirPath);
  }

  /**
   * Naive glob implementation as per "no external dependency" rule.
   * Supports basic recursion and ignore patterns.
   */
  async glob(pattern: string, options: { cwd: string; ignore: string[] }): Promise<string[]> {
    const results: string[] = [];
    
    // Simplistic recursive walk
    const walk = async (currentDir: string) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(options.cwd, fullPath).replace(/\\/g, '/');
        
        const segments = relativePath.split('/');
        if (options.ignore.some(p => segments.includes(p))) {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          // Very basic pattern matching (e.g. *.ts or **/*.ts)
          // Real glob would be much more complex. 
          // For MVP, we'll use a simple regex approach for the requested patterns.
          if (this.matchesPattern(relativePath, pattern)) {
            results.push(fullPath);
          }
        }
      }
    };

    await walk(options.cwd);
    return results;
  }

  private matchesPattern(relativePath: string, pattern: string): boolean {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('^' + escaped.replace(/\\\*/g, '.*') + '$');
    return regex.test(relativePath);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const isWindows = process.platform === 'win32';
    
    if (!isWindows) {
      await fs.rename(oldPath, newPath);
      return;
    }

    // Windows Hardening: Retry loop for EBUSY/EPERM
    // Resolution 14: 100ms, 200ms, 400ms — max 3 retries
    const delays = [100, 200, 400];
    let lastError: unknown;

    for (let i = 0; i <= delays.length; i++) {
      try {
        await fs.rename(oldPath, newPath);
        return;
      } catch (err: unknown) {
        lastError = err;
        if (err instanceof Error && 'code' in err) {
          const code = (err as any).code;
          if ((code === 'EBUSY' || code === 'EPERM') && i < delays.length) {
            await new Promise(resolve => setTimeout(resolve, delays[i]));
            continue;
          }
        }
        throw err;
      }
    }
    throw lastError;
  }

  async remove(filePath: string): Promise<void> {
    await fs.rm(filePath, { recursive: true, force: true });
  }

  async stat(filePath: string): Promise<FileStat> {
    const s = await fs.stat(filePath);
    return {
      size: s.size,
      modifiedMs: s.mtimeMs
    };
  }
}
