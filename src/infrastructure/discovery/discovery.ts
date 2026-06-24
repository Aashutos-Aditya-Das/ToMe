import * as path from 'node:path';
import { IFileSystem, ResolvedConfiguration } from '../../domain/interfaces.js';

export class RepositoryDiscovery {
  // Common ignore patterns to always exclude
  private readonly DEFAULT_IGNORES = [
    'node_modules',
    '.git',
    '.tome',
    'dist',
    'build',
    'coverage'
  ];

  constructor(
    private readonly fs: IFileSystem,
    private readonly config: ResolvedConfiguration,
    private readonly supportedExtensions: string[]
  ) {}

  /**
   * Discovers all supported files in the repository.
   * Enforces ignore rules, language extension filtering, and deterministic ordering.
   * Returns POSIX-normalized paths relative to the workspaceRoot.
   */
  async discoverFiles(workspaceRoot: string): Promise<string[]> {
    const combinedIgnores = [
      ...this.DEFAULT_IGNORES,
      ...(this.config.parser?.ignorePatterns || [])
    ];

    // Use IFileSystem to recursively find all files.
    // The underlying glob implementation handles directory traversal and ignore patterns.
    const allFiles = await this.fs.glob('**/*', {
      cwd: workspaceRoot,
      ignore: combinedIgnores
    });

    // 1. Language Filtering & 2. Path Normalization (Relative to Workspace Root)
    const supportedFiles: string[] = [];

    for (const filePath of allFiles) {
      // Normalize to POSIX relative path
      const relativePath = path.relative(workspaceRoot, filePath).replace(/\\/g, '/');
      
      const ext = path.extname(relativePath);
      if (this.supportedExtensions.includes(ext)) {
        supportedFiles.push(relativePath);
      }
    }

    // 3. Deterministic Ordering
    supportedFiles.sort();

    return supportedFiles;
  }
}
