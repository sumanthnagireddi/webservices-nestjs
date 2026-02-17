import { Test, TestingModule } from '@nestjs/testing';
import { InterviewBankController } from './interview-bank.controller';
import { InterviewBankService } from './interview-bank.service';

describe('InterviewBankController', () => {
  let controller: InterviewBankController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewBankController],
      providers: [InterviewBankService],
    }).compile();

    controller = module.get<InterviewBankController>(InterviewBankController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
