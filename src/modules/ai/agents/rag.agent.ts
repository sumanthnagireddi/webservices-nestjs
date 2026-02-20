import { Injectable, Logger } from '@nestjs/common';
import { VectorService, SearchResult } from '../searvices/vector.service';
import { LlmService } from '../searvices/llm.service';

@Injectable()
export class RagAgent {
  private readonly logger = new Logger(RagAgent.name);

  constructor(
    private vector: VectorService,
    private llm: LlmService,
  ) {}

  async ask(question: string) {
    this.logger.log(`Processing question: "${question}"`);

    // Search for relevant context using text search (no embeddings needed)
    const searchResults = await this.vector.search(question, 5);

    if (!searchResults.length) {
      return {
        status: 'success',
        data: "I don't have any relevant information in the knowledge base to answer that question. Please make sure your content has been added to the database.",
      };
    }

    // Build context from search results
    const contextParts = searchResults.map((result, idx) => {
      return `[${idx + 1}] ${result.type.toUpperCase()}: ${result.title}\n${result.text}\n(Relevance: ${(result.score * 10).toFixed(1)}/10)`;
    });

    const context = contextParts.join('\n\n---\n\n');
    console.log('Constructed context for RAG:\n', context);
    // Create the RAG prompt
    const prompt = `
QUESTION:
${question}`;

    // Get response from LLM
    return this.llm.ask(prompt);
  }
}
