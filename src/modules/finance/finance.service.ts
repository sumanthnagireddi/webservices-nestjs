import { Injectable } from '@nestjs/common';
import { CreateFinanceDto } from './dto/finance/create-finance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Finance, FinanceDocument } from './schema/finance.schema';
import { Budget, BudgetDocument } from './schema/budget.schema';
import { Model } from 'mongoose';
import { UpdateFinanceDto } from './dto/finance/update-finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Finance.name)
    private readonly financeModel: Model<FinanceDocument>,
    @InjectModel(Budget.name)
    private readonly budgetModel: Model<BudgetDocument>,
  ) {}

  // --- Expenses ---
  async create(createFinanceDto: CreateFinanceDto): Promise<Finance> {
    return await this.financeModel.create(createFinanceDto);
  }

  findAll(): Promise<Finance[]> {
    return this.financeModel.find().exec();
  }
  // finance.service.ts - fix the date query
  findAllExpensesPerMonth(year: number, month: number): Promise<Finance[]> {

    // Use the `date` field (YYYY-MM-DD string) instead of createdAt
    // since createdAt is stored as a locale string, not ISO
    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0); // last day of month
    const endStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    return this.financeModel
      .find({
        date: { $gte: startStr, $lte: endStr },
      })
      .sort({ date: -1 })
      .exec();
  }
  findOne(id: string) {
    return this.financeModel.findById(id).exec();
  }

  update(id: string, updateFinanceDto: UpdateFinanceDto) {
    return this.financeModel
      .findByIdAndUpdate(id, updateFinanceDto, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.financeModel.findByIdAndDelete(id).exec();
  }

  addExpenses(expenses: CreateFinanceDto[]): Promise<Finance[]> {
    return this.financeModel.insertMany(expenses) as Promise<Finance[]>;
  }

  // --- Budgets ---
  async getBudgetForMonth(monthKey: string) {
    const budget = await this.budgetModel.findOne({ monthKey }).exec();
    return budget ?? { monthlyBudget: 0, alertThreshold: 80 };
  }

  async saveBudgetForMonth(
    monthKey: string,
    settings: { monthlyBudget: number; alertThreshold: number },
  ) {
    await this.budgetModel
      .findOneAndUpdate(
        { monthKey },
        { ...settings, monthKey },
        { upsert: true, new: true },
      )
      .exec();
    return { success: true };
  }

  async copyBudgetToMonth(fromKey: string, toKey: string) {
    const from = await this.getBudgetForMonth(fromKey);
    return this.saveBudgetForMonth(toKey, {
      monthlyBudget: from.monthlyBudget,
      alertThreshold: from.alertThreshold,
    });
  }
}
