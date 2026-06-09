import { RISGraph } from '../../domain/interfaces.js';

export interface MemoryArtifact {
  fileName: string;
  content: string;
}

export class MarkdownStore {
  /**
   * Deterministically serializes the RISGraph into the 5 target artifacts.
   * Note: Generation logic (the actual text) is managed by the Serializer domain service.
   * This class handles the physical file formatting (Frontmatter, LF endings).
   */
  serializeArtifacts(graph: RISGraph, artifactContents: Record<string, string>): MemoryArtifact[] {
    const artifacts: MemoryArtifact[] = [];
    const files = ['architect.md', 'memory.md', 'guardrails.md', 'recover.md', 'walkthrough.md'];

    for (const fileName of files) {
      const body = artifactContents[fileName] || '';
      const content = this.formatWithFrontmatter(graph, body);
      artifacts.push({
        fileName,
        content: content.replace(/\r\n/g, '\n') // Force LF
      });
    }

    return artifacts;
  }

  private formatWithFrontmatter(graph: RISGraph, body: string): string {
    const yaml = [
      '---',
      `tome_version: "${graph.meta.tomeVersion}"`,
      `checksum: "${graph.meta.schemaVersion}"`, // Using schemaVersion as placeholder for actual code checksum
      `last_updated: "${graph.meta.lastUpdated}"`,
      '---',
      '',
      body
    ].join('\n');

    return yaml;
  }
}
