import { Model } from 'mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsVisitDocument } from './analytics.schema';

describe('AnalyticsService', () => {
  it('returns daily visit and unique visitor counts without double-counting visitors in the total', async () => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const yesterdayDate = new Date(now);
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterday = yesterdayDate.toISOString().slice(0, 10);
    const twoDaysAgoDate = new Date(yesterdayDate);
    twoDaysAgoDate.setUTCDate(twoDaysAgoDate.getUTCDate() - 1);
    const exec = jest.fn().mockResolvedValue([
      { _id: today, visits: 3, visitorIds: ['visitor-a', 'visitor-b', 'unknown'] },
      { _id: yesterday, visits: 2, visitorIds: ['visitor-a', 'unknown'] },
    ]);
    const analyticsModel = {
      aggregate: jest.fn().mockReturnValue({ exec }),
    } as unknown as Model<AnalyticsVisitDocument>;
    const service = new AnalyticsService(analyticsModel);

    const result = await service.getDailySummary(3);

    expect(result.days).toBe(3);
    expect(result.totalVisits).toBe(5);
    expect(result.totalUniqueVisitors).toBe(2);
    expect(result.daily).toEqual([
      { date: twoDaysAgoDate.toISOString().slice(0, 10), visits: 0, uniqueVisitors: 0 },
      { date: yesterday, visits: 2, uniqueVisitors: 1 },
      { date: today, visits: 3, uniqueVisitors: 2 },
    ]);
  });
});
