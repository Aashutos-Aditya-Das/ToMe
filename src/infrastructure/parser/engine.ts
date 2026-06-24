import { createHash } from 'node:crypto';
import { 
  IParserEngine, 
  ILanguageAdapter, 
  RepositoryModel, 
  FileNode,
  ExtractedSymbol,
  ASTDependencyEdge,
  IFileSystem,
  ILogger,
  ResolvedConfiguration
} from '../../domain/interfaces.js';
import { TypeScriptLanguageAdapter } from '../../adapters/languages/typescript.js';
import { PythonLanguageAdapter } from '../../adapters/languages/python.js';

export class ParserEngine implements IParserEngine {
  private adapters: ILanguageAdapter[];
  private maxFiles: number;

  constructor(
    private readonly fs: IFileSystem,
    private readonly logger: ILogger,
    config?: ResolvedConfiguration
  ) {
    this.adapters = [
      new TypeScriptLanguageAdapter(),
      new PythonLanguageAdapter()
    ];
    // Default to 500 if config is not yet provided, but allow injection
    this.maxFiles = config?.extraction.maxFiles ?? 500;
  }

  private getAdapter(filename: string): ILanguageAdapter | undefined {
    return this.adapters.find(a => a.supports(filename));
  }

  private generateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  async parseFile(path: string, content: string): Promise<FileNode> {
    const adapter = this.getAdapter(path);
    if (!adapter) {
      throw new Error(`Unsupported file: ${path}`);
    }

    try {
      const symbols = await adapter.extractSymbols(content, path);
      const dependencies = await adapter.extractDependencies(content, path);
      
      return {
        path,
        symbols,
        dependencies,
        checksum: this.generateChecksum(content),
        content
      };
    } catch (err: unknown) {
      this.logger.warn(`Failed to parse file: ${path}. Skipping.`, err);
      return {
        path,
        symbols: [],
        dependencies: [],
        checksum: this.generateChecksum(content),
        content
      };
    }
  }

  private smartSample(paths: string[], maxFiles: number): string[] {
    const scoreFile = (path: string): number => {
      let score = 0;
      const lower = path.toLowerCase();
      
      // Keywords that typically indicate architecturally significant files
      const highPriority = ['index', 'main', 'app', 'server', 'config', 'route', 'controller', 'architecture', 'readme', 'module', 'service'];
      for (const kw of highPriority) {
        if (lower.includes(kw)) score += 50;
      }

      // Root level files or shallow files are more important
      const depth = path.split('/').length - 1;
      score -= depth * 10;

      // Penalize test files
      if (lower.includes('test') || lower.includes('spec')) score -= 50;

      return score;
    };

    const scored = paths.map(p => ({ path: p, score: scoreFile(p) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxFiles).map(s => s.path);
  }

  async parseWorkspace(paths: string[]): Promise<RepositoryModel> {
    if (paths.length > this.maxFiles) {
      this.logger.warn(`Repository too large (${paths.length} files). Engaging Smart Sampling to select the top ${this.maxFiles} most architecturally significant files to prevent LLM quota exhaustion.`);
      paths = this.smartSample(paths, this.maxFiles);
    }

    const filesMap = new Map<string, FileNode>();

    for (const filePath of paths) {
      const adapter = this.getAdapter(filePath);
      if (!adapter) {
        continue; // REPAIR 3: Completely ignore unsupported files
      }

      try {
        const content = await this.fs.readFile(filePath);
        const node = await this.parseFile(filePath, content);
        filesMap.set(filePath, node);
      } catch (err: unknown) {
        this.logger.warn(`Failed to read or parse file: ${filePath}. Skipping.`, err);
      }
    }

    return {
      workspaceRoot: '', // Usually injected by the executor/orchestrator or passed via a config, leaving blank as it's not provided in the interface arguments.
      files: filesMap,
      getAllSymbols(): ExtractedSymbol[] {
        const all: ExtractedSymbol[] = [];
        for (const file of filesMap.values()) {
          all.push(...file.symbols);
        }
        return all;
      },
      getSymbolByFQN(fqn: string): ExtractedSymbol | undefined {
        for (const file of filesMap.values()) {
          const found = file.symbols.find((s: ExtractedSymbol) => s.fqn === fqn);
          if (found) return found;
        }
        return undefined;
      }
    };
  }
}
