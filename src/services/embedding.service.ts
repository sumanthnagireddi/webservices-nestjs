import { HfInference, InferenceClient } from '@huggingface/inference';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private hf: InferenceClient;

  constructor(private config: ConfigService) {
    this.hf = new InferenceClient(this.config.get<string>('HF_API_KEY'));
  }

  async embed(text: string): Promise<number[]> {
    const embedding = await this.hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
      parameters: { normalize: true },  // Sentence-level mean pool + L2 norm
    });
    return embedding[0] as number[];  // Single vector (handles batch)
  }
}
