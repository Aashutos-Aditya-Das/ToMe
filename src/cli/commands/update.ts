import { Command } from 'commander';
import { createCommand } from '../wrapper.js';
import { MemoryGenerationOrchestrator } from '../../application/orchestrator.js';
import { AnthropicAdapter } from '../../adapters/providers/anthropic.js';
import { OpenAIAdapter } from '../../adapters/providers/openai.js';
import { GeminiAdapter } from '../../adapters/providers/gemini.js';
import { ExecutionContext, ILLMClient } from '../../domain/interfaces.js';
import { FallbackLLMClient } from '../../infrastructure/llm/fallback.js';

export function makeUpdateCommand(): Command {
  return createCommand(
    'update',
    'Update the Repository Intelligence State (RIS) and artifacts based on current codebase',
    true, 
    async (ctx) => {
      let llmClient: ILLMClient;

      // 1. Grab unified TOME_API_KEY or fallbacks
      const apiKey = process.env.TOME_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("No API key found. Please set TOME_API_KEY environment variable.");
      }

      // 2. Auto-Detect Provider and setup heavy-to-lite fallback chain
      let clients: ILLMClient[] = [];
      if (apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-') && !apiKey.startsWith('sk-ant-')) {
        ctx.logger.info("Auto-detected OpenAI API Key. Setting up gpt-4o -> gpt-4o-mini fallback chain.");
        clients = [
          new OpenAIAdapter(apiKey, 'gpt-4o'),
          new OpenAIAdapter(apiKey, 'gpt-4o-mini')
        ];
      } else if (apiKey.startsWith('sk-ant-')) {
        ctx.logger.info("Auto-detected Anthropic API Key. Setting up claude-3-5-sonnet -> claude-3-haiku fallback chain.");
        clients = [
          new AnthropicAdapter(apiKey, 'claude-3-5-sonnet-latest'),
          new AnthropicAdapter(apiKey, 'claude-3-haiku-20240307')
        ];
      } else if (apiKey.startsWith('AIzaSy') || apiKey.startsWith('AQ.')) {
        ctx.logger.info("Auto-detected Gemini API Key. Setting up gemini-2.5-pro -> gemini-2.5-flash fallback chain.");
        clients = [
          new GeminiAdapter(apiKey, 'gemini-2.5-pro'),
          new GeminiAdapter(apiKey, 'gemini-2.5-flash')
        ];
      } else {
        // Fallback to config if we can't detect
        ctx.logger.info("Could not auto-detect API key type. Falling back to configured provider.");
        const provider = ctx.config?.provider?.primary;
        if (provider === 'gemini') {
          clients = [new GeminiAdapter(apiKey, ctx.config?.model)];
        } else if (provider === 'openai') {
          clients = [new OpenAIAdapter(apiKey, ctx.config?.model)];
        } else {
          clients = [new AnthropicAdapter(apiKey, ctx.config?.model)];
        }
      }

      llmClient = new FallbackLLMClient(clients);

      const executionContext: ExecutionContext = {
        cwd: ctx.workspaceRoot,
        config: ctx.config!,
        logger: ctx.logger,
        fileSystem: ctx.fileSystem,
        llmClient: llmClient,
        parser: ctx.parser!,
        storage: ctx.storage,
        discovery: ctx.discovery
      };

      const engine = new MemoryGenerationOrchestrator();
      await engine.update(executionContext);
      ctx.logger.info("Update completed successfully.");
    }
  );
}
