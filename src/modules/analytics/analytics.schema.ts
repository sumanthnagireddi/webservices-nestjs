import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsVisitDocument = AnalyticsVisit & Document;

@Schema({ timestamps: true, collection: 'analytics_visits' })
export class AnalyticsVisit {
  @Prop({ required: true })
  visitorId: string;

  @Prop({ required: true })
  route: string;

  @Prop({ default: '' })
  username: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ default: '' })
  userAgent: string;

  @Prop({ default: '' })
  referrer: string;

  @Prop({ required: true })
  visitedAt: Date;
}

export const AnalyticsVisitSchema = SchemaFactory.createForClass(AnalyticsVisit);
