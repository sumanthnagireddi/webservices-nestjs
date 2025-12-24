import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): any {
    return {
      status: 'Health is ok sumanth!!',
      timestamp: new Date().toISOString(),
    };
  }
}
