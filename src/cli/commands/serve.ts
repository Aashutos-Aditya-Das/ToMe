import { Command } from 'commander';
import { createCommand } from '../wrapper.js';
import { MCPServer } from '../../mcp/server.js';
import { AnthropicAdapter } from '../../adapters/providers/anthropic.js';
import { OpenAIAdapter } from '../../adapters/providers/openai.js';
import { GeminiAdapter } from '../../adapters/providers/gemini.js';
import { ExecutionContext } from '../../domain/interfaces.js';

export function makeServeCommand(): Command {
  return createCommand(
    'serve',
    'Start the Model Context Protocol (MCP) server over stdio',
    true, 
    async (ctx) => {
      let llmClient;
      const provider = ctx.config?.provider?.primary;
      if (provider === 'gemini') {
        llmClient = new GeminiAdapter(process.env.GEMINI_API_KEY, ctx.config?.model);
      } else if (provider === 'openai') {
        llmClient = new OpenAIAdapter(undefined, ctx.config?.model);
      } else {
        llmClient = new AnthropicAdapter(undefined, ctx.config?.model);
      }

      const executionContext: ExecutionContext = {
        cwd: ctx.workspaceRoot,
        config: ctx.config!,
        logger: ctx.logger,
        fileSystem: ctx.fileSystem,
        llmClient: llmClient,
        parser: ctx.parser!,
        storage: ctx.storage
      };

      const server = new MCPServer(executionContext);
      await server.start();
      // Server runs until stdio closes
    }
  );
}
