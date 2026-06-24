import Anthropic from '@anthropic-ai/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { ILLMClient, PromptRequest, LLMResult, ToMeTool } from '../../domain/interfaces.js';

export class AnthropicAdapter implements ILLMClient {
  readonly providerId = 'anthropic';
  private client: Anthropic;
  private defaultModel = 'claude-3-5-sonnet-20240620';

  constructor(apiKey?: string, defaultModel?: string) {
    this.client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
    if (defaultModel) {
      this.defaultModel = defaultModel;
    }
  }

  async generateStructured<T>(prompt: PromptRequest, schema: z.ZodSchema<T>): Promise<LLMResult<T>> {
    const startTime = Date.now();
    
    const extractionToolName = 'extract_intelligence';
    const jsonSchema = zodToJsonSchema(schema, "OutputSchema") as any;
    const inputSchema = jsonSchema.definitions?.OutputSchema || jsonSchema;
    
    // Fix: Remove $schema from inputSchema as Anthropic API rejects it
    if (inputSchema.$schema) {
      delete inputSchema.$schema;
    }

    const tools: Anthropic.Tool[] = [
      {
        name: extractionToolName,
        description: 'Extracts the structured intelligence from the repository context.',
        input_schema: inputSchema
      }
    ];

    if (prompt.tools) {
       for (const t of prompt.tools) {
          const tSchema = zodToJsonSchema(t.parameters) as any;
          if (tSchema.$schema) delete tSchema.$schema;
          tools.push({
            name: t.name,
            description: t.description,
            input_schema: tSchema
          });
       }
    }

    const messages: Anthropic.MessageParam[] = prompt.userMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    const response = await this.client.messages.create({
      model: this.defaultModel,
      system: prompt.systemMessage,
      messages: messages,
      tools: tools,
      tool_choice: { type: 'tool', name: extractionToolName },
      max_tokens: prompt.maxOutputTokens || 4096,
      temperature: prompt.temperature || 0.0,
    });

    const latencyMs = Date.now() - startTime;
    
    const toolCall = response.content.find(c => c.type === 'tool_use') as Anthropic.ToolUseBlock;
    if (!toolCall) {
      throw new Error("Anthropic failed to use the required extraction tool.");
    }

    const data = schema.parse(toolCall.input) as T;

    return {
      data,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      },
      model: this.defaultModel,
      latencyMs
    };
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }
}
