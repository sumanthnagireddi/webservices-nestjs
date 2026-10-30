import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('visits')
  recordVisit(@Req() request: any, @Body() body: {
    route: string;
    visitorId?: string;
    username?: string;
    referrer?: string;
  }) {
    const forwarded = request.headers?.['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : request.ip || request.socket?.remoteAddress || 'unknown';

    return this.analyticsService.recordVisit({
      ...body,
      ip,
      userAgent: request.headers?.['user-agent'] || '',
    });
  }

  @Get('visits')
  listVisits(@Query('limit') limit?: string) {
    return this.analyticsService.listVisits(Number(limit ?? 500));
  }
}
