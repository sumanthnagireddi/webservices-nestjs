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

  async getDailySummary(days = 7) {
    const safeDays = Math.min(Math.max(Math.floor(Number(days) || 7), 1), 30);
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    end.setUTCDate(end.getUTCDate() + 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - safeDays);

    const grouped = await this.analyticsModel.aggregate<{
      _id: string;
      visits: number;
      visitorIds: string[];
    }>([
      { $match: { visitedAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$visitedAt',
              timezone: 'UTC',
            },
          },
          visits: { $sum: 1 },
          visitorIds: { $addToSet: '$visitorId' },
        },
      },
    ]).exec();

    const byDate = new Map(grouped.map((day) => [
      day._id,
      {
        visits: day.visits,
        uniqueVisitors: day.visitorIds.filter(
          (visitorId) => visitorId && visitorId !== 'unknown',
        ).length,
      },
    ]));
    const totalUniqueVisitors = new Set(
      grouped.flatMap((day) => day.visitorIds).filter(
        (visitorId) => visitorId && visitorId !== 'unknown',
      ),
    ).size;
    const daily: Array<{
      date: string;
      visits: number;
      uniqueVisitors: number;
    }> = [];
    for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
      const date = new Date(end);
      date.setUTCDate(date.getUTCDate() - offset - 1);
      const key = date.toISOString().slice(0, 10);
      daily.push({
        date: key,
        visits: byDate.get(key)?.visits ?? 0,
        uniqueVisitors: byDate.get(key)?.uniqueVisitors ?? 0,
      });
    }

    return {
      days: safeDays,
      totalVisits: daily.reduce((total, day) => total + day.visits, 0),
      totalUniqueVisitors,
      daily,
    };
  }
}
