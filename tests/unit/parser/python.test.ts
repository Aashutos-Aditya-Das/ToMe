import { PythonLanguageAdapter } from '../../../src/adapters/languages/python.js';

describe('PythonLanguageAdapter', () => {
  let adapter: PythonLanguageAdapter;

  beforeEach(() => {
    adapter = new PythonLanguageAdapter();
  });

  test('extracts class and function symbols without bodies', async () => {
    const code = `
import os
from sys import argv

class MyClass(BaseClass):
    def my_method(self):
        print("Hello")
        return True

def main():
    print("Main")
    `;

    const symbols = await adapter.extractSymbols(code, 'src/main.py');
    
    expect(symbols.find(s => s.name === 'MyClass')?.content).toContain('class MyClass');
    expect(symbols.find(s => s.name === 'MyClass')?.content).toContain('...');
    expect(symbols.find(s => s.name === 'main')?.content).toContain('def main()');
    expect(symbols.find(s => s.name === 'main')?.content).toContain('...');
    
    // Ensure no implementation details leaked into content
    expect(symbols.some(s => s.content?.includes('print'))).toBe(false);
  });

  test('extracts dependencies: imports, calls, inherits', async () => {
    const code = `
import requests
from django.db import models

class User(models.Model):
    def save(self, *args, **kwargs):
        requests.post('webhook')
        super().save(*args, **kwargs)
    `;

    const deps = await adapter.extractDependencies(code, 'src/user.py');
    
    const imports = deps.filter(d => d.type === 'IMPORT');
    expect(imports.some(d => d.targetFQN === 'requests')).toBe(true);
    expect(imports.some(d => d.targetFQN === 'django.db')).toBe(true);

    const inherits = deps.filter(d => d.type === 'INHERIT');
    expect(inherits.some(d => d.targetFQN === 'models.Model')).toBe(true);

    const calls = deps.filter(d => d.type === 'CALL');
    expect(calls.length).toBeGreaterThan(0);
  });
});
