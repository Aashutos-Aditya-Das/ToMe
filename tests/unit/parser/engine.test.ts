import { ParserEngine } from '../../../src/infrastructure/parser/engine.js';
import { IFileSystem, FileStat } from '../../../src/domain/interfaces.js';

class MockLogger {
  debug() {}
  info() {}
  warn() {}
  error() {}
}

class MockFS implements IFileSystem {
  private files = new Map<string, string>();
  
  setFile(path: string, content: string) {
    this.files.set(path, content);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) throw new Error('File not found');
    return content;
  }
  async writeFile() {}
  async exists() { return false; }
  async mkdir() {}
  async readDir() { return []; }
  async glob() { return []; }
  async rename() {}
  async remove() {}
  async stat() { return { size: 0, modifiedMs: 0 }; }
}

describe('ParserEngine', () => {
  let engine: ParserEngine;
  let fs: MockFS;
  let logger: MockLogger;

  beforeEach(() => {
    fs = new MockFS();
    logger = new MockLogger();
    engine = new ParserEngine(fs, logger);
  });

  test('parses a workspace up to 500 files and smartly samples on > 500', async () => {
    const paths = Array.from({ length: 501 }, (_, i) => `file${i}.ts`);
    for (const p of paths) {
      fs.setFile(p, `console.log('${p}');`);
    }
    const result = await engine.parseWorkspace(paths);
    expect(result.files.size).toBe(500); // Should cap at 500
  });

  test('extracts symbols and dependencies from a mixed repository', async () => {
    fs.setFile('a.ts', 'class A {}');
    fs.setFile('b.py', 'class B:\n  pass');
    fs.setFile('c.txt', 'unsupported text');

    const model = await engine.parseWorkspace(['a.ts', 'b.py', 'c.txt']);

    expect(model.files.has('a.ts')).toBe(true);
    expect(model.files.has('b.py')).toBe(true);
    expect(model.files.has('c.txt')).toBe(false); // Unsupported file completely ignored

    const symbols = model.getAllSymbols();
    expect(symbols.find(s => s.name === 'A')).toBeDefined();
    expect(symbols.find(s => s.name === 'B')).toBeDefined();
  });

  test('recovers from malformed files', async () => {
    fs.setFile('bad.ts', 'class { missingName {}');
    
    const model = await engine.parseWorkspace(['bad.ts']);
    
    // Tree-sitter handles syntax errors gracefully and builds what it can
    // We just want to ensure it doesn't crash the entire process
    expect(model.files.has('bad.ts')).toBe(true);
  });
});
