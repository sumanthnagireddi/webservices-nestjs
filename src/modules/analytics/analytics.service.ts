import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalyticsVisit, AnalyticsVisitDocument } from './analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(AnalyticsVisit.name)
    private readonly analyticsModel: Model<AnalyticsVisitDocument>,
  ) {}

  async recordVisit(input: {
    route: string;
    visitorId?: string;
    username?: string;
    ip: string;
    userAgent: string;
    referrer?: string;
  }) {
    if (!input.route) return { recorded: false };
    const visit = await this.analyticsModel.create({
      visitorId: input.visitorId || 'unknown',
      route: input.route.slice(0, 500),
      username: (input.username || '').slice(0, 100),
      ip: (input.ip || 'unknown').slice(0, 100),
      userAgent: input.userAgent.slice(0, 500),
      referrer: (input.referrer || '').slice(0, 500),
      visitedAt: new Date(),
    });
    return visit.toObject();
  }

  async listVisits(limit = 500) {
    const safeLimit = Math.min(Math.max(Number(limit) || 500, 1), 5000);
    const visits = await this.analyticsModel
      .find({})
      .sort({ visitedAt: -1, _id: -1 })
      .limit(safeLimit)
      .lean()
      .exec();
    return { total: visits.length, visits };
  }
}
