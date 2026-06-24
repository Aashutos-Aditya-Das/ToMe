import OpenAI from 'openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { ILLMClient, PromptRequest, LLMResult, ToMeTool } from '../../domain/interfaces.js';

export class OpenAIAdapter implements ILLMClient {
  readonly providerId = 'openai';
  private client: OpenAI;
  private defaultModel = 'gpt-4o';

  constructor(apiKey?: string, defaultModel?: string) {
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
    if (defaultModel) {
      this.defaultModel = defaultModel;
    }
  }

  async generateStructured<T>(prompt: PromptRequest, schema: z.ZodSchema<T>): Promise<LLMResult<T>> {
    const startTime = Date.now();
    
    const jsonSchema = zodToJsonSchema(schema, "OutputSchema") as any;
    const inputSchema = jsonSchema.definitions?.OutputSchema || jsonSchema;
    
    // Fix: Remove $schema if present
    if (inputSchema.$schema) {
      delete inputSchema.$schema;
    }

    // Set additionalProperties to false for strict JSON schema
    if (inputSchema.type === 'object' && inputSchema.additionalProperties === undefined) {
      inputSchema.additionalProperties = false;
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: prompt.systemMessage }
    ];

    for (const m of prompt.userMessages) {
      messages.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      });
    }

    const response = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'OutputSchema',
          strict: true,
          schema: inputSchema
        }
      },
      max_tokens: prompt.maxOutputTokens || 4096,
      temperature: prompt.temperature || 0.0,
    });

    const latencyMs = Date.now() - startTime;
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI failed to return structured content.");
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(content);
    } catch (err) {
      throw new Error(`OpenAI returned invalid JSON: ${content}`);
    }

    const data = schema.parse(parsedJson) as T;

    return {
      data,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0
      },
      model: this.defaultModel,
      latencyMs
    };
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }
}
