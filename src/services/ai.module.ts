import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorService } from './vector.service';
import { LlmService } from './llm.service';
import { RagAgent } from './rag.agent';
import { AiController } from './ai.controller';

// ai.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Add this!
  providers: [EmbeddingService, VectorService, LlmService, RagAgent],
  controllers: [AiController],
})
export class AiModule {}