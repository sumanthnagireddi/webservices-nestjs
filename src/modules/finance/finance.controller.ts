import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceDto } from './dto/finance/create-finance.dto';
import { UpdateFinanceDto } from './dto/finance/update-finance.dto';
import { CopyBudgetDto } from './dto/budget/copyBudget.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('/add-expense')
  create(@Body() createFinanceDto: CreateFinanceDto) {
    return this.financeService.create(createFinanceDto);
  }

  @Get('/get-expenses')
  findAll() {
    return this.financeService.findAll();
  }

  // finance.controller.ts
  @Get('expenses')
  findAllExpensesPerMonth(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year ?? `${new Date().getFullYear()}`);
    const m = parseInt(month ?? `${new Date().getMonth() + 1}`);
    return this.financeService.findAllExpensesPerMonth(y, m);
  }

  @Get('/get-expense/:id')
  findOne(@Param('id') id: string) {
    return this.financeService.findOne(id);
  }

  @Patch('/update-expense/:id')
  update(@Param('id') id: string, @Body() updateFinanceDto: UpdateFinanceDto) {
    return this.financeService.update(id, updateFinanceDto);
  }

  @Delete('/delete-expense/:id')
  remove(@Param('id') id: string) {
    return this.financeService.remove(id);
  }
  // --- Budget APIs ---
  @Get('/budget/:monthKey')
  getBudget(@Param('monthKey') monthKey: string) {
    return this.financeService.getBudgetForMonth(monthKey);
  }

  @Put('/budget/:monthKey')
  setBudget(@Param('monthKey') monthKey: string, @Body() body: any) {
    return this.financeService.saveBudgetForMonth(monthKey, body);
  }

  @Post('/budget/copy')
  copyBudget(@Body() budgetDto: CopyBudgetDto) {
    return this.financeService.copyBudgetToMonth(
      budgetDto.fromKey,
      budgetDto.toKey,
    );
  }

  // --- Bulk Add Expenses (for SMS import) ---
  @Post('/add-expenses')
  addExpenses(@Body() expenses: CreateFinanceDto[]) {
    return [];
  }
}
