import { Body, Controller, Post } from '@nestjs/common';
import { RagAgent } from '../modules/ai/agents/rag.agent';

@Controller('ai')
export class AiController {
  constructor(private rag: RagAgent) { }

  @Post('ask')
  ask(@Body('question') question: string) {
    return this.rag.ask(question);
  }
}
