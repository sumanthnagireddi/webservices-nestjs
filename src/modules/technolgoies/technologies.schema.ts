import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TechnologyDocument = Technology & Document;

@Schema({ timestamps: true })
export class Technology {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [Number], select: false })
  embedding?: number[];
}

export const TechnologySchema = SchemaFactory.createForClass(Technology);

// Create a text index for fallback search
TechnologySchema.index({ name: 'text', description: 'text' });
