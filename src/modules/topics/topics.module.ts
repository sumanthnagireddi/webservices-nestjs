import { Global, Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Topics, TopicSchema } from './topics.schema';
import { Content, ContentSchema } from '../content/content.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Topics.name,
        schema: TopicSchema,
      },
      { name: Content.name, schema: ContentSchema },
    ]),
  ],
  controllers: [TopicController],
  providers: [TopicService],
})
export class TopicsModule {}
