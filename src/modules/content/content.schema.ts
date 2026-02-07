import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContentDocument = Content & Document;

@Schema({
  collection: 'content',
  timestamps: true, // adds createdAt & updatedAt automatically
})
export class Content {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  body: string; // HTML or Markdown

  @Prop({ type: Types.ObjectId, ref: 'Technology', required: true })
  technologyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Topic', required: true, unique: true })
  topicId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
    index: true,
  })
  status: 'draft' | 'published';

  @Prop({ type: Date, default: null })
  publishedAt: Date | null;

  @Prop({ type: Date, default: null })
  lastFetchedAt: Date;

  @Prop({ type: [Number], select: false })
  embedding?: number[];
}

export const ContentSchema = SchemaFactory.createForClass(Content);

// Create a text index for fallback search
ContentSchema.index({ title: 'text', body: 'text', description: 'text' });
