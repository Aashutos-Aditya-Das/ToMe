import Parser from 'tree-sitter';
import Python from 'tree-sitter-python';
import { ILanguageAdapter, ExtractedSymbol, ASTDependencyEdge } from '../../domain/interfaces.js';

export class PythonLanguageAdapter implements ILanguageAdapter {
  languageId = 'python';
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(Python);
  }

  supports(filename: string): boolean {
    return filename.endsWith('.py') || filename.endsWith('.pyw');
  }

  async extractSymbols(content: string, filePath: string): Promise<ExtractedSymbol[]> {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const tree = this.parser.parse(content);
    const symbols: ExtractedSymbol[] = [];

    const walk = (node: Parser.SyntaxNode, parentName?: string) => {
      const type = node.type;
      let symbolName: string | undefined;

      const isClassLike = ['class_definition', 'function_definition'].includes(type);

      if (isClassLike) {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbolName = nameNode.text;
          const fqn = parentName ? `${parentName}.${symbolName}` : `${normalizedPath}::${symbolName}`;
          
          let signature = node.text;
          const bodyNode = node.childForFieldName('body') || node.children.find(c => c.type === 'block');
          if (bodyNode) {
            signature = content.substring(node.startIndex, bodyNode.startIndex) + '...';
          }

          symbols.push({
            id: fqn,
            name: symbolName,
            type,
            fqn,
            filePath: normalizedPath,
            range: { startLine: node.startPosition.row + 1, endLine: node.endPosition.row + 1 },
            content: signature.trim()
          });
        }
      }

      const nextParent = symbolName ? (parentName ? `${parentName}.${symbolName}` : `${normalizedPath}::${symbolName}`) : parentName;
      for (const child of node.namedChildren) {
        walk(child, nextParent);
      }
    };

    walk(tree.rootNode);
    return symbols;
  }

  async extractDependencies(content: string, filePath: string): Promise<ASTDependencyEdge[]> {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const tree = this.parser.parse(content);
    const dependencies: ASTDependencyEdge[] = [];

    const walk = (node: Parser.SyntaxNode, parentFqn?: string) => {
      let currentFqn = parentFqn;
      
      const type = node.type;
      if (['class_definition', 'function_definition'].includes(type)) {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const symbolName = nameNode.text;
          currentFqn = parentFqn ? `${parentFqn}.${symbolName}` : `${normalizedPath}::${symbolName}`;
        }
      }

      if (type === 'import_statement') {
        const moduleNodes = node.namedChildren.filter(c => c.type === 'dotted_name' || c.type === 'aliased_import');
        for (const mod of moduleNodes) {
          const target = mod.type === 'aliased_import' ? mod.childForFieldName('name')?.text : mod.text;
          if (target) {
            dependencies.push({
              sourceFQN: currentFqn || normalizedPath,
              targetFQN: target,
              type: 'IMPORT'
            });
          }
        }
      } else if (type === 'import_from_statement') {
        const moduleNameNode = node.childForFieldName('module_name');
        if (moduleNameNode) {
          const target = moduleNameNode.text;
          dependencies.push({
            sourceFQN: currentFqn || normalizedPath,
            targetFQN: target,
            type: 'IMPORT'
          });
        }
      } else if (type === 'call') {
        const functionNode = node.childForFieldName('function');
        if (functionNode && currentFqn) {
          dependencies.push({
            sourceFQN: currentFqn,
            targetFQN: functionNode.text,
            type: 'CALL'
          });
        }
      } else if (type === 'class_definition') {
        const superclassesNode = node.childForFieldName('superclasses');
        if (superclassesNode && currentFqn) {
          for (const arg of superclassesNode.namedChildren) {
            dependencies.push({
              sourceFQN: currentFqn,
              targetFQN: arg.text,
              type: 'INHERIT'
            });
          }
        }
      }

      for (const child of node.namedChildren) {
        walk(child, currentFqn);
      }
    };

    walk(tree.rootNode);
    return dependencies;
  }
}
