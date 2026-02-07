import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toBeDefined();
    });

    it('should call appService.getHealth()', () => {
      const spy = jest.spyOn(appService, 'getHealth');
      appController.getHealth();
      expect(spy).toHaveBeenCalled();
    });

    it('should return health object with status and timestamp', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
