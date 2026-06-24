import { z } from 'zod';
import { ILLMClient, PromptRequest, LLMResult } from '../../domain/interfaces.js';

/**
 * src/infrastructure/llm/fallback.ts
 * Implementation of the Pipeline-level Provider Fallback strategy.
 */
export class FallbackLLMClient implements ILLMClient {
  public readonly providerId: string;
  private clients: ILLMClient[];

  constructor(clients: ILLMClient[]) {
    if (clients.length === 0) {
      throw new Error("FallbackLLMClient requires at least one ILLMClient.");
    }
    this.clients = clients;
    this.providerId = `FallbackChain(${clients.map(c => c.providerId).join(' -> ')})`;
  }

  async generateStructured<T>(prompt: PromptRequest, schema: z.ZodSchema<T>): Promise<LLMResult<T>> {
    let lastError: unknown;
    for (const client of this.clients) {
      try {
        console.log(`[FallbackLLMClient] Attempting generation with ${client.providerId}...`);
        const result = await client.generateStructured(prompt, schema);
        return result;
      } catch (err) {
        lastError = err;
        console.warn(`[FallbackLLMClient] Client ${client.providerId} failed. Falling back to next client... Error: ${(err as Error).message}`);
      }
    }
    throw new Error(`[FallbackLLMClient] All clients in fallback chain failed. Last error: ${(lastError as Error)?.message}`);
  }

  async countTokens(text: string): Promise<number> {
    // We just use the first client's tokenizer for counting tokens.
    return this.clients[0].countTokens(text);
  }
}
