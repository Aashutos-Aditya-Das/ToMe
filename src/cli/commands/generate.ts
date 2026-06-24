import { Command } from 'commander';
import { createCommand } from '../wrapper.js';
import { MemoryGenerationOrchestrator } from '../../application/orchestrator.js';
import { AnthropicAdapter } from '../../adapters/providers/anthropic.js';
import { OpenAIAdapter } from '../../adapters/providers/openai.js';
import { GeminiAdapter } from '../../adapters/providers/gemini.js';
import { ExecutionContext } from '../../domain/interfaces.js';

export function makeGenerateCommand(): Command {
  return createCommand(
    'generate',
    'Generate repository intelligence',
    true, 
    async (ctx) => {
      ctx.logger.info(`Repository validated. Configuration loaded. Dependencies constructed for ${ctx.workspaceRoot}`);
      
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

      const engine = new MemoryGenerationOrchestrator();
      await engine.update(executionContext);
      ctx.logger.info("Generation completed successfully.");
    }
  );
}
