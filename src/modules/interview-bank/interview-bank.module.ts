import { Module } from '@nestjs/common';
import { InterviewBankService } from './interview-bank.service';
import { InterviewBankController } from './interview-bank.controller';

@Module({
  controllers: [InterviewBankController],
  providers: [InterviewBankService],
})
export class InterviewBankModule {}
