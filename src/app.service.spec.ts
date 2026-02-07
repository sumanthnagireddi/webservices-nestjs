import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status object', () => {
      const result = service.getHealth();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return status property', () => {
      const result = service.getHealth();
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('Health is ok sumanth!!');
    });

    it('should return timestamp property', () => {
      const result = service.getHealth();
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should return valid ISO timestamp', () => {
      const result = service.getHealth();
      const date = new Date(result.timestamp);
      expect(date.toISOString()).toBe(result.timestamp);
    });

    it('should return current timestamp', () => {
      const beforeCall = new Date();
      const result = service.getHealth();
      const afterCall = new Date();
      const resultDate = new Date(result.timestamp);

      expect(resultDate.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(resultDate.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });
});
