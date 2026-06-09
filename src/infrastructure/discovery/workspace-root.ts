import * as path from 'node:path';
import { IFileSystem } from '../../domain/interfaces.js';

export class WorkspaceRootResolver {
  constructor(private readonly fs: IFileSystem) {}

  /**
   * Determines the canonical absolute path of the workspace root by walking up
   * the directory tree to find the .git marker, normalizing it to POSIX forward slashes.
   */
  async resolve(cwd: string): Promise<string> {
    let current = path.resolve(cwd).replace(/\\/g, '/');
    if (current.endsWith('/')) current = current.slice(0, -1);

    while (current.length > 0) {
      if (await this.fs.exists(`${current}/.git`)) {
        return current;
      }
      const parent = path.resolve(current, '..').replace(/\\/g, '/');
      if (parent === current || parent === `${current}/`) break;
      current = parent;
    }
    
    throw new Error('NotARepositoryError: Could not find .git repository root.');
  }
}
