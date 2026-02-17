import { Test, TestingModule } from '@nestjs/testing';
import { InterviewBankService } from './interview-bank.service';

describe('InterviewBankService', () => {
  let service: InterviewBankService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterviewBankService],
    }).compile();

    service = module.get<InterviewBankService>(InterviewBankService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
