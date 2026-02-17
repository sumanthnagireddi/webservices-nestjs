import { Injectable } from '@nestjs/common';
import { CreateInterviewBankDto } from './dto/create-interview-bank.dto';
import { UpdateInterviewBankDto } from './dto/update-interview-bank.dto';

@Injectable()
export class InterviewBankService {
  create(createInterviewBankDto: CreateInterviewBankDto) {
    return 'This action adds a new interviewBank';
  }

  findAll() {
    return `This action returns all interviewBank`;
  }

  findOne(id: number) {
    return `This action returns a #${id} interviewBank`;
  }

  update(id: number, updateInterviewBankDto: UpdateInterviewBankDto) {
    return `This action updates a #${id} interviewBank`;
  }

  remove(id: number) {
    return `This action removes a #${id} interviewBank`;
  }
}
