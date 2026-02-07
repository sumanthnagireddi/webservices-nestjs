import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class LlmService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async ask(prompt: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return { status: 'success', data: response.text };
    } catch (error) {
      console.error('Gemini Error:', error);
      throw new BadGatewayException('Failed to get response from Gemini API');
    }
  }
}