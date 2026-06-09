import Parser from 'tree-sitter';
import ts from 'tree-sitter-typescript';
import { ILanguageAdapter, ExtractedSymbol, ASTDependencyEdge } from '../../domain/interfaces.js';

export class TypeScriptLanguageAdapter implements ILanguageAdapter {
  languageId = 'typescript';
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(ts.typescript);
  }

  supports(filename: string): boolean {
    return filename.endsWith('.ts') || filename.endsWith('.tsx');
  }

  async extractSymbols(content: string, filePath: string): Promise<ExtractedSymbol[]> {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const tree = this.parser.parse(content);
    const symbols: ExtractedSymbol[] = [];

    const walk = (node: Parser.SyntaxNode, parentName?: string) => {
      const type = node.type;
      let symbolName: string | undefined;

      const isClassLike = ['class_declaration', 'interface_declaration', 'function_declaration', 'type_alias_declaration', 'module'].includes(type);
      const isMethod = type === 'method_definition';

      if (isClassLike || (isMethod && parentName)) {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbolName = nameNode.text;
          const fqn = parentName ? `${parentName}.${symbolName}` : `${normalizedPath}::${symbolName}`;
          
          let signature = node.text;
          const bodyNode = node.childForFieldName('body') || node.children.find(c => c.type === 'statement_block' || c.type === 'class_body');
          if (bodyNode) {
            signature = content.substring(node.startIndex, bodyNode.startIndex) + '{ ... }';
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
      if (['class_declaration', 'interface_declaration', 'function_declaration', 'type_alias_declaration', 'module'].includes(type)) {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const symbolName = nameNode.text;
          currentFqn = parentFqn ? `${parentFqn}.${symbolName}` : `${normalizedPath}::${symbolName}`;
        }
      }

      if (type === 'import_statement' || type === 'export_statement') {
        const sourceNode = node.childForFieldName('source');
        if (sourceNode) {
          const target = sourceNode.text.replace(/['"]/g, '');
          dependencies.push({
            sourceFQN: currentFqn || normalizedPath,
            targetFQN: target,
            type: 'IMPORT'
          });
        }
      } else if (type === 'call_expression') {
        const functionNode = node.childForFieldName('function');
        if (functionNode && currentFqn) {
          dependencies.push({
            sourceFQN: currentFqn,
            targetFQN: functionNode.text,
            type: 'CALL'
          });
        }
      } else if (type === 'class_heritage') {
        for (const child of node.children) {
          if (child.type === 'extends_clause' || child.type === 'implements_clause') {
            for (const grandchild of child.namedChildren) {
              if (currentFqn) {
                dependencies.push({
                  sourceFQN: currentFqn,
                  targetFQN: grandchild.text,
                  type: 'INHERIT'
                });
              }
            }
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
