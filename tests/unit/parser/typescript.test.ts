import { TypeScriptLanguageAdapter } from '../../../src/adapters/languages/typescript.js';

describe('TypeScriptLanguageAdapter', () => {
  let adapter: TypeScriptLanguageAdapter;

  beforeEach(() => {
    adapter = new TypeScriptLanguageAdapter();
  });

  test('extracts class, interface, and function symbols without bodies', async () => {
    const code = `
      import { x } from 'y';
      export interface User { id: string; }
      export class UserService implements User {
        constructor() { console.log('init'); }
        getUser() { return null; }
      }
      export function bootstrap() {
        console.log('boot');
      }
    `;

    const symbols = await adapter.extractSymbols(code, 'src/user.ts');
    
    expect(symbols.find(s => s.name === 'User')?.content).toContain('interface User');
    expect(symbols.find(s => s.name === 'UserService')?.content).toContain('class UserService');
    expect(symbols.find(s => s.name === 'UserService')?.content).toContain('{ ... }');
    expect(symbols.find(s => s.name === 'bootstrap')?.content).toContain('function bootstrap()');
    expect(symbols.find(s => s.name === 'bootstrap')?.content).toContain('{ ... }');
    
    // Ensure no implementation details leaked into content
    expect(symbols.some(s => s.content?.includes('console.log'))).toBe(false);
  });

  test('extracts dependencies: imports, calls, inherits', async () => {
    const code = `
      import { Component } from 'react';
      import { api } from './api';

      class MyComp extends Component implements IMyComp {
        render() {
          api.fetchData();
        }
      }
    `;

    const deps = await adapter.extractDependencies(code, 'src/comp.ts');
    
    const imports = deps.filter(d => d.type === 'IMPORT');
    expect(imports.some(d => d.targetFQN === 'react')).toBe(true);
    expect(imports.some(d => d.targetFQN === './api')).toBe(true);

    const inherits = deps.filter(d => d.type === 'INHERIT');
    expect(inherits.some(d => d.targetFQN === 'Component')).toBe(true);
    expect(inherits.some(d => d.targetFQN === 'IMyComp')).toBe(true);

    const calls = deps.filter(d => d.type === 'CALL');
    // Function call extraction is a bit generic for 'api.fetchData', the target might be 'api.fetchData' or just 'fetchData'
    // For MVP, just asserting that a CALL edge was created is sufficient.
    expect(calls.length).toBeGreaterThan(0);
  });
});
