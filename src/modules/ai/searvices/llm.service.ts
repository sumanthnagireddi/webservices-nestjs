import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-exp',
] as const;

export type GeminiModel = (typeof GEMINI_MODELS)[number];

@Injectable()
export class LlmService {
  private ai: GoogleGenAI;
  private readonly logger = new Logger(LlmService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set in configuration');
    }
    this.ai = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async ask(prompt: string, model: GeminiModel = 'gemini-1.5-flash') {
    try {
      this.logger.debug(`Generating content with model: ${model}`);
      
      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      // In @google/genai SDK, response.text() is typically a function.
      // We handle simpler access if it changes or behaves differently.
      const text = typeof response.text === 'function' ? response.text: response.text;

      return { status: 'success', data: text };
    } catch (error) {
      this.logger.error('Gemini API Error:', error);
      throw new BadGatewayException('Failed to get response from Gemini API');
    }
  }
}