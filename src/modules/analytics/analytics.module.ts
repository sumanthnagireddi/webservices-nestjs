import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsVisit, AnalyticsVisitSchema } from './analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsVisit.name, schema: AnalyticsVisitSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
