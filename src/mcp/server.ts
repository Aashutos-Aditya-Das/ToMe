import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListResourcesRequestSchema, 
  ListToolsRequestSchema, 
  ReadResourceRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { ExecutionContext, RISGraph } from '../domain/interfaces.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export class MCPServer {
  private server: Server;
  private risStateCache: RISGraph | null = null;

  constructor(private context: ExecutionContext) {
    this.server = new Server(
      { name: 'ToMe-MCP', version: '1.0.0' },
      { capabilities: { resources: {}, tools: {} } }
    );
  }

  public async start(): Promise<void> {
    this.setupHandlers();
    
    // Attempt initial load of RIS
    try {
      this.risStateCache = await this.context.storage.load();
    } catch (e) {
      this.context.logger.warn("MCP started but no RIS database found. Run 'tome update' first.");
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Watch for updates
    const risPath = path.join(this.context.cwd, '.tome', '.ris-state.json');
    if (fs.existsSync(risPath)) {
      fs.watch(risPath, async (eventType) => {
        if (eventType === 'change') {
           try {
             this.risStateCache = await this.context.storage.load();
             // Optionally send a notification here if we had client tracking
           } catch(e) {}
        }
      });
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          { uri: 'tome://artifacts/architect.md', name: 'Architecture State' },
          { uri: 'tome://artifacts/memory.md', name: 'Project Memory' },
          { uri: 'tome://artifacts/guardrails.md', name: 'Guardrails' }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      let fileName = '';
      if (request.params.uri === 'tome://artifacts/architect.md') fileName = 'architect.md';
      else if (request.params.uri === 'tome://artifacts/memory.md') fileName = 'memory.md';
      else if (request.params.uri === 'tome://artifacts/guardrails.md') fileName = 'guardrails.md';
      else throw new Error("Resource not found");

      const filePath = path.join(this.context.cwd, '.tome', fileName);
      if (!fs.existsSync(filePath)) {
         throw new Error("Resource not generated yet. Run 'tome update'.");
      }
      const content = fs.readFileSync(filePath, 'utf8');

      return {
        contents: [
          { uri: request.params.uri, mimeType: 'text/markdown', text: content }
        ]
      };
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'query_architecture',
            description: 'Queries the Repository Intelligence State (RIS) for architecture domains.',
            inputSchema: { type: 'object', properties: { domain: { type: 'string' } } }
          },
          {
            name: 'get_human_assertions',
            description: 'Retrieves all human manual overrides to the architecture.',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'get_skeleton',
            description: 'Retrieves the file structure and syntax nodes of the codebase.',
            inputSchema: { type: 'object', properties: {} }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.risStateCache) {
         return { toolResult: "RIS Database empty. Run tome update.", content: [] };
      }

      if (request.params.name === 'query_architecture') {
         const { domain } = request.params.arguments as any || {};
         let result = this.risStateCache.domains || [];
         if (domain) {
            result = result.filter((d: any) => d.name?.value?.toLowerCase().includes(domain.toLowerCase()));
         }
         return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      if (request.params.name === 'get_human_assertions') {
         const assertions: any[] = [];
         const extractHuman = (entities: any[]) => {
           for (const entity of entities) {
             for (const [key, value] of Object.entries(entity)) {
               if (value && typeof value === 'object' && 'derivation' in value) {
                 const claim = value as any;
                 if (claim.derivation === 'HUMAN_ASSERTED') {
                   assertions.push({ entityId: entity.id, attribute: key, value: claim.value });
                 }
               }
             }
           }
         };
         extractHuman(this.risStateCache.domains || []);
         extractHuman(this.risStateCache.services || []);
         extractHuman(this.risStateCache.capabilities || []);
         
         return { content: [{ type: 'text', text: JSON.stringify(assertions, null, 2) }] };
      }

      if (request.params.name === 'get_skeleton') {
         const filesToParse = await this.context.fileSystem.glob('**/*', { 
           cwd: this.context.cwd, 
           ignore: ['node_modules', '.git', 'dist', '.tome'] 
         });
         const repoModel = await this.context.parser.parseWorkspace(filesToParse);
         let skeleton = "Repository Skeleton:\n";
         for (const [p, fileNode] of repoModel.files.entries()) {
           skeleton += `File: ${p}\n`;
           for (const sym of fileNode.symbols) {
              skeleton += `  - ${sym.type} ${sym.name} (ID: ${sym.fqn})\n`;
           }
         }
         return { content: [{ type: 'text', text: skeleton }] };
      }

      throw new Error(`Tool ${request.params.name} not found`);
    });
  }
}
