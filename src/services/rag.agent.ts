import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorService } from './vector.service';
import { LlmService } from './llm.service';

@Injectable()
export class RagAgent {
  constructor(
    private embed: EmbeddingService,
    private vector: VectorService,
    private llm: LlmService,
  ) {}

  async ask(question: string) {
    const qVector = await this.embed.embed(question);
    const context = await this.vector.search(qVector);
    if (!context.length) {
      return 'No data available for this question.';
    }

    // rag.agent.ts
    const prompt = `
You are a technical assistant. Use the following context to answer the question. 
If the information isn't in the context, say you don't know, but feel free to explain the context details thoroughly.

Context:
${context.join('\n')}

Question:
${question}
`;

    return this.llm.ask(prompt);
  }
}
