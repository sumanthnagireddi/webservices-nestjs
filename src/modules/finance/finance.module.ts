import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceSchema } from './schema/finance.schema';
import { BudgetSchema } from './schema/budget.schema';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Finance', schema: FinanceSchema },
      { name: 'Budget', schema: BudgetSchema },
    ]),
  ],
})
export class FinanceModule {}
