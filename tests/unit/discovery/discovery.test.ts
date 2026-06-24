import { RepositoryDiscovery } from '../../../src/infrastructure/discovery/discovery.js';
import { WorkspaceRootResolver } from '../../../src/infrastructure/discovery/workspace-root.js';
import { IFileSystem, ResolvedConfiguration } from '../../../src/domain/interfaces.js';

class MockFS implements IFileSystem {
  private files: string[] = [];
  
  setFiles(files: string[]) {
    this.files = files;
  }

  async readFile() { return ''; }
  async writeFile() {}
  
  async exists(path: string) { 
    return path.endsWith('.git'); 
  }
  
  async mkdir() {}
  async readDir() { return []; }
  async glob(pattern: string, options: { cwd: string; ignore: string[] }): Promise<string[]> {
    return this.files.filter(f => {
      const segments = f.replace(/\\/g, '/').split('/');
      if (options.ignore.some(i => segments.includes(i))) return false;
      return true;
    });
  }
  async rename() {}
  async remove() {}
  async stat() { return { size: 0, modifiedMs: 0 }; }
}

const mockConfig: ResolvedConfiguration = {
  provider: { primary: 'anthropic' },
  model: 'test',
  extraction: { mode: 'STANDARD', maxFiles: 5, maxCostPerRun: 10, maxConcurrency: 3 },
  parser: { ignorePatterns: ['custom_ignore'] },
  storage: { preserveOrphansForCycles: 3 },
  mcp: { enabled: false }
};

describe('WorkspaceRootResolver', () => {
  let fs: MockFS;
  let rootResolver: WorkspaceRootResolver;

  beforeEach(() => {
    fs = new MockFS();
    rootResolver = new WorkspaceRootResolver(fs);
  });

  test('determines and normalizes workspace root', async () => {
    const root1 = await rootResolver.resolve('C:\\Users\\Test\\Repo');
    expect(root1).not.toContain('\\');
    
    const root2 = await rootResolver.resolve('/Users/Test/Repo/');
    expect(root2.endsWith('/')).toBe(false); // Trailing slash removed
  });
});

describe('RepositoryDiscovery', () => {
  let fs: MockFS;
  let discovery: RepositoryDiscovery;

  beforeEach(() => {
    fs = new MockFS();
    discovery = new RepositoryDiscovery(fs, mockConfig, ['.ts', '.py']);
  });

  test('filters unsupported files and applies deterministic ordering', async () => {
    fs.setFiles([
      '/root/src/z.ts',
      '/root/src/a.ts',
      '/root/README.md',
      '/root/src/b.py',
      '/root/image.png'
    ]);

    const files = await discovery.discoverFiles('/root');
    expect(files).toEqual([
      'src/a.ts',
      'src/b.py',
      'src/z.ts'
    ]); // Sorted alphabetically, unsupported removed, relative paths
  });

  test('normalizes backslashes to forward slashes in discovered files', async () => {
    fs.setFiles([
      '/root/src\\win\\a.ts',
      '/root/src/unix/b.ts'
    ]);

    const files = await discovery.discoverFiles('/root');
    expect(files).toEqual([
      'src/unix/b.ts',
      'src/win/a.ts'
    ]);
  });

  test('applies default and custom ignore rules based on path segments', async () => {
    fs.setFiles([
      '/root/src/a.ts',
      '/root/node_modules/bad.ts',
      '/root/.git/config.ts',
      '/root/dist/out.ts',
      '/root/custom_ignore/skip.ts',
      '/root/src/my-node_modules-helper.ts' // Should NOT be ignored
    ]);

    const files = await discovery.discoverFiles('/root');
    expect(files).toEqual([
      'src/a.ts',
      'src/my-node_modules-helper.ts'
    ]);
  });

  test('handles empty repositories gracefully', async () => {
    fs.setFiles([]);
    const files = await discovery.discoverFiles('/root');
    expect(files).toEqual([]);
  });
});
