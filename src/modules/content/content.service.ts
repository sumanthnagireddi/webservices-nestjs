import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Content } from './content.schema';
import { Model, Types } from 'mongoose';
import { CreateContentDTO } from './dtos/create-content.dto';
import { TopicDocument, Topics } from '../topics/topics.schema';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
    @InjectModel(Topics.name) private readonly topicModel: Model<TopicDocument>,
  ) {}

  async createContent(
    payload: CreateContentDTO,
    userId: any,
  ): Promise<Content> {
    const topic = await this.topicModel.findById(payload.topicId).lean();

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    const existingContent = await this.contentModel.findOne({
      topicId: new Types.ObjectId(payload.topicId),
    });
    if (existingContent) {
      throw new ConflictException('Content already exists for this topic');
    }
    const content = new this.contentModel({
      title: topic.name,
      description: topic.topic_description,
      body: payload.body,
      topicId: topic._id,
      technologyId: topic.technologyId,
      authorId: userId,
      status: payload.status ?? 'draft',
      publishedAt: payload.status === 'published' ? new Date() : null,
      isDeleted: false,
      createdBy: new Types.ObjectId(userId),
    });
    return this.contentModel.create(content);
  }
  async getContentByTopicId(id: string) {
    const topicId = new Types.ObjectId(id);
    const content = await this.contentModel.findOneAndUpdate(
      { topicId },
      { $set: { lastFetchedAt: new Date() } },
      { new: true },
    );
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    return content;
  }
  async getContents() {
    return await this.contentModel.find();
  }
  async updateContent(id: string, body: any) {
    const topicId = new Types.ObjectId(id);

    const updated = await this.contentModel.findOneAndUpdate(
      { topicId },
      body,
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Content not found');
    }

    return updated;
  }
}
