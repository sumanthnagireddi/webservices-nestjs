import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { VectorService } from '../modules/ai/searvices/vector.service';
import { LlmService } from '../modules/ai/searvices/llm.service';
import { RagAgent } from '../modules/ai/agents/rag.agent';
import { AiController } from './ai.controller';
import { Content, ContentSchema } from '../modules/content/content.schema';
import { Blog, BlogSchema } from '../modules/blogs/blog.schema';
import {
  Technology,
  TechnologySchema,
} from '../modules/technolgoies/technologies.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Technology.name, schema: TechnologySchema },
    ]),
  ],
  providers: [
    VectorService,
    LlmService,
    RagAgent,
  ],
  controllers: [AiController],
})
export class AiModule { }
