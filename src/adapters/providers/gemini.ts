import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import { ILLMClient, PromptRequest, LLMResult } from '../../domain/interfaces.js';

export class GeminiAdapter implements ILLMClient {
  readonly providerId = 'gemini';
  private client: GoogleGenAI;
  private defaultModel = 'gemini-2.5-flash';

  constructor(apiKey?: string, defaultModel?: string) {
    this.client = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY });
    if (defaultModel) {
      this.defaultModel = defaultModel;
    }
  }

  async generateStructured<T>(prompt: PromptRequest, schema: z.ZodSchema<T>): Promise<LLMResult<T>> {
    const startTime = Date.now();
    
    const jsonSchema = zodToJsonSchema(schema, { name: "OutputSchema", $refStrategy: "none" }) as any;
    let inputSchema = jsonSchema.definitions?.OutputSchema || jsonSchema;
    
    // Remove $schema to prevent API rejection
    if (inputSchema.$schema) {
      delete inputSchema.$schema;
    }

    const contents = prompt.userMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await this.client.models.generateContent({
      model: this.defaultModel,
      contents: contents,
      config: {
        systemInstruction: prompt.systemMessage,
        temperature: prompt.temperature || 0.0,
        maxOutputTokens: prompt.maxOutputTokens || 8192,
        responseMimeType: "application/json",
        responseSchema: inputSchema as any
      }
    });

    const latencyMs = Date.now() - startTime;
    
    const contentText = response.text;
    if (!contentText) {
      throw new Error("Gemini failed to return content.");
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(contentText);
    } catch (err) {
      throw new Error(`Gemini returned invalid JSON: ${contentText}`);
    }

    const data = schema.parse(parsedJson) as T;

    return {
      data,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0
      },
      model: this.defaultModel,
      latencyMs
    };
  }

  async countTokens(text: string): Promise<number> {
    // We could use client.models.countTokens, but for simplicity we keep the heuristic
    return Math.ceil(text.length / 4);
  }
}
