import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CopyBudgetDto } from './dto/budget/copyBudget.dto';
import { CreateDebtDto } from './dto/finance/create-debt.dto';
import { CreateFinanceDto } from './dto/finance/create-finance.dto';
import { CreateCardDto } from './dto/finance/create-card.dto';
import { PartialPaymentDto } from './dto/finance/partial-payment.dto';
import { UpdateFinanceDto } from './dto/finance/update-finance.dto';
import {
  Finance,
  FinanceDocument,
  FinanceType,
} from './schema/finance.schema';

type BudgetSettings = {
  monthlyBudget: number;
  alertThreshold: number;
};

type ExpenseMode = Extract<FinanceType, 'expense' | 'construction'>;
type BudgetMode = Extract<FinanceType, 'budget' | 'home_budget'>;

type FinanceCategoryBreakdown = {
  category: string;
  total: number;
};

export type FinanceDashboard = {
  monthKey: string;
  expenseType: ExpenseMode;
  budgetType: BudgetMode;
  budget: BudgetSettings;
  expenses: Finance[];
  summary: {
    totalSpent: number;
    budget: number;
    remaining: number;
    percentUsed: number;
    totalTransactions: number;
    categoryBreakdown: FinanceCategoryBreakdown[];
  };
};

const DEFAULT_BUDGET: BudgetSettings = {
  monthlyBudget: 0,
  alertThreshold: 80,
};

const CONSTRUCTION_BUDGET_KEY = 'construction-overall';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Finance.name)
    private readonly financeModel: Model<FinanceDocument>,
  ) {}

  create(dto: CreateFinanceDto, type?: FinanceType): Promise<Finance> {
    const resolvedType = this.resolveExpenseType(type ?? dto.type);

    return this.financeModel.create({
      ...dto,
      type: resolvedType,
    });
  }

  findAllExpenses(type?: FinanceType): Promise<Finance[]> {
    const resolvedType = this.resolveExpenseType(type);

    return this.financeModel
      .find({
        type: resolvedType,
        isDeleted: { $ne: true },
      })
      .sort({ date: -1 })
      .exec();
  }

  findAllExpensesPerMonth(
    year: number,
    month: number,
    type?: FinanceType,
  ): Promise<Finance[]> {
    const resolvedType = this.resolveExpenseType(type);
    if (resolvedType === 'construction') {
      return this.findAllExpenses(resolvedType);
    }

    const { startStr, endStr } = this.getMonthRange(year, month);

    return this.financeModel
      .find({
        type: resolvedType,
        isDeleted: { $ne: true },
        date: { $gte: startStr, $lte: endStr },
      })
      .sort({ date: -1 })
      .exec();
  }

  findOne(id: string) {
    return this.financeModel.findById(id).exec();
  }

  update(id: string, dto: UpdateFinanceDto) {
    return this.financeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  updateCard(id: string, dto: any) {
    return this.financeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  remove(id: string) {
    return this.financeModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
  }

  addExpenses(expenses: CreateFinanceDto[], type?: FinanceType): Promise<Finance[]> {
    const resolvedType = this.resolveExpenseType(type);
    const withType = expenses.map((expense) => ({
      ...expense,
      type: resolvedType,
    }));
    return this.financeModel.insertMany(withType) as Promise<Finance[]>;
  }

  findAllDebts(): Promise<Finance[]> {
    return this.financeModel
      .find({ type: 'debt', isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  createDebt(dto: CreateDebtDto): Promise<Finance> {
    return this.financeModel.create({
      ...dto,
      type: 'debt',
      paidAmount: 0,
      status: 'pending',
    });
  }

  updateDebt(id: string, dto: Partial<CreateDebtDto>) {
    return this.financeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  removeDebt(id: string) {
    return this.financeModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
  }

  async getBudgetForMonth(monthKey: string, type?: FinanceType) {
    const budgetType = this.resolveBudgetType(type);
    const resolvedMonthKey = this.resolveBudgetMonthKey(monthKey, budgetType);
    const budget = await this.financeModel
      .findOne({ type: budgetType, monthKey: resolvedMonthKey, isDeleted: false })
      .exec();

    return budget ?? DEFAULT_BUDGET;
  }

  async saveBudgetForMonth(
    monthKey: string,
    settings: BudgetSettings,
    type?: FinanceType,
  ) {
    const budgetType = this.resolveBudgetType(type);
    const resolvedMonthKey = this.resolveBudgetMonthKey(monthKey, budgetType);
    return this.financeModel
      .findOneAndUpdate(
        { type: budgetType, monthKey: resolvedMonthKey },
        {
          ...settings,
          type: budgetType,
          monthKey: resolvedMonthKey,
          isDeleted: false,
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async copyBudgetToMonth(
    fromKey: CopyBudgetDto['fromKey'],
    toKey: CopyBudgetDto['toKey'],
    type?: FinanceType,
  ) {
    const from = await this.getBudgetForMonth(fromKey, type);
    return this.saveBudgetForMonth(
      toKey,
      {
        monthlyBudget: from.monthlyBudget,
        alertThreshold: from.alertThreshold ?? DEFAULT_BUDGET.alertThreshold,
      },
      type,
    );
  }

  async getDashboard(
    year: number,
    month: number,
    type?: FinanceType,
  ): Promise<FinanceDashboard> {
    const expenseType = this.resolveExpenseType(type);
    const budgetType = this.getBudgetTypeForExpenseMode(expenseType);
    const monthKey = this.getMonthKey(year, month);
    const isConstructionMode = expenseType === 'construction';
    const budgetKey = this.resolveBudgetMonthKey(monthKey, budgetType);

    const [expenses, budget] = await Promise.all([
      isConstructionMode
        ? this.findAllExpenses(expenseType)
        : this.findAllExpensesPerMonth(year, month, expenseType),
      this.getBudgetForMonth(budgetKey, budgetType),
    ]);

    return {
      monthKey: budgetKey,
      expenseType,
      budgetType,
      budget,
      expenses,
      summary: this.summarizeExpenses(expenses, budget),
    };
  }

  findDebtsByType(debtType: 'owed_to_me' | 'i_owe'): Promise<Finance[]> {
    return this.financeModel
      .find({ type: 'debt', debtType, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  findSettledDebts(): Promise<Finance[]> {
    return this.financeModel
      .find({ type: 'debt', status: 'settled', isDeleted: false })
      .sort({ updatedAt: -1 })
      .exec();
  }

  findOneDebt(id: string): Promise<Finance | null> {
    return this.financeModel.findById(id).exec();
  }

  async markDebtSettled(id: string): Promise<Finance | null> {
    const debt = await this.financeModel.findById(id).exec();
    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    return this.financeModel
      .findByIdAndUpdate(
        id,
        { status: 'settled', paidAmount: debt.amount },
        { new: true },
      )
      .exec();
  }

  async recordPartialPayment(
    id: string,
    dto: PartialPaymentDto,
  ): Promise<Finance | null> {
    const debt = await this.financeModel.findById(id).exec();
    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    const newPaid = Math.min((debt.paidAmount ?? 0) + dto.amount, debt.amount);
    const newStatus = newPaid >= debt.amount ? 'settled' : 'partial';

    return this.financeModel
      .findByIdAndUpdate(
        id,
        { paidAmount: newPaid, status: newStatus },
        { new: true },
      )
      .exec();
  }

  async getDebtSummary() {
    const debts = await this.financeModel
      .find({ type: 'debt', isDeleted: false, status: { $ne: 'settled' } })
      .exec();

    const totalOwedToMe = debts
      .filter((debt) => debt.debtType === 'owed_to_me')
      .reduce((sum, debt) => sum + (debt.amount - (debt.paidAmount ?? 0)), 0);

    const totalIOwe = debts
      .filter((debt) => debt.debtType === 'i_owe')
      .reduce((sum, debt) => sum + (debt.amount - (debt.paidAmount ?? 0)), 0);

    return {
      totalOwedToMe,
      totalIOwe,
      netBalance: totalOwedToMe - totalIOwe,
      totalPending: debts.filter((debt) => debt.status === 'pending').length,
      totalPartial: debts.filter((debt) => debt.status === 'partial').length,
    };
  }

  private normalizeChit(chit: Finance): any {
    const raw = chit as Finance & {
      _id?: Types.ObjectId;
      createdAt?: string;
    };
    return {
      id: raw._id?.toString() ?? (raw as any).id,
      name: raw.title ?? raw.name ?? 'Unnamed chit',
      startMonth: raw.startMonth ?? '',
      chitValue: raw.chitValue,
      duration: raw.duration,
      members: raw.members,
      monthlyInstallment: raw.monthlyInstallment,
      commissionType: raw.commissionType ?? 'PERCENT',
      commissionValue: raw.commissionValue ?? 0,
      currentMonth: raw.currentMonth ?? 1,
      firstAndLastFixed: raw.firstAndLastFixed ?? true,
      terminalDividendMonths: raw.terminalDividendMonths ?? [],
      auctions: [...(raw.auctions ?? [])]
        .sort((a, b) => a.month - b.month)
        .map((auction: any) => ({
          month: Number(auction.month),
          winningBid: Number(auction.winningBid),
          isActual: auction.isActual !== false,
          verified: auction.verified === true,
        })),
    };
  }

  async getChits(): Promise<any[]> {
    const chits = await this.financeModel
      .find({ type: 'chit', isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .exec();
    return chits.map((chit) => this.normalizeChit(chit));
  }

  async getChit(id: string): Promise<any> {
    const chit = await this.financeModel.findOne({
      _id: id,
      type: 'chit',
      isDeleted: { $ne: true },
    }).exec();
    if (!chit) throw new NotFoundException('Chit not found');
    return this.normalizeChit(chit);
  }

  async createChit(body: any): Promise<any> {
    if (
      !body.name ||
      Number(body.chitValue) <= 0 ||
      Number(body.duration) < 2 ||
      Number(body.members) < 1 ||
      Number(body.monthlyInstallment) <= 0
    ) throw new BadRequestException('Invalid chit details');
    if (Number(body.members) * Number(body.monthlyInstallment) !== Number(body.chitValue)) {
      throw new BadRequestException('Members x monthly installment must equal chit value');
    }
    const document = await this.financeModel.create({
      type: 'chit',
      title: String(body.name).trim(),
      chitValue: Number(body.chitValue),
      duration: Number(body.duration),
      members: Number(body.members),
      monthlyInstallment: Number(body.monthlyInstallment),
      commissionType: body.commissionType === 'FIXED' ? 'FIXED' : 'PERCENT',
      commissionValue: Number(body.commissionValue ?? 0),
      currentMonth: Number(body.currentMonth ?? 1),
      startMonth: body.startMonth || undefined,
      firstAndLastFixed: body.firstAndLastFixed !== false,
      terminalDividendMonths: Array.isArray(body.terminalDividendMonths)
        ? body.terminalDividendMonths.map(Number)
        : [],
      auctions: [],
      isDeleted: false,
    });
    return this.normalizeChit(document);
  }

  async updateChit(id: string, body: any): Promise<any> {
    const raw = await this.financeModel.findOne({
      _id: id,
      type: 'chit',
      isDeleted: { $ne: true },
    }).exec();
    if (!raw) throw new NotFoundException('Chit not found');

    const patch: Record<string, any> = {};
    if (typeof body.name === 'string') patch.title = body.name.trim();
    if (body.chitValue !== undefined) patch.chitValue = Number(body.chitValue);
    if (body.duration !== undefined) patch.duration = Number(body.duration);
    if (body.members !== undefined) patch.members = Number(body.members);
    if (body.monthlyInstallment !== undefined) patch.monthlyInstallment = Number(body.monthlyInstallment);
    if (body.commissionType !== undefined) patch.commissionType = body.commissionType;
    if (body.commissionValue !== undefined) patch.commissionValue = Number(body.commissionValue);
    if (body.currentMonth !== undefined) patch.currentMonth = Number(body.currentMonth);
    if (body.startMonth !== undefined) patch.startMonth = String(body.startMonth);

    const next = {
      chitValue: patch.chitValue ?? raw.chitValue,
      members: patch.members ?? raw.members,
      monthlyInstallment: patch.monthlyInstallment ?? raw.monthlyInstallment,
    };
    if (next.members * next.monthlyInstallment !== next.chitValue) {
      throw new BadRequestException('Members x monthly installment must equal chit value');
    }

    const updated = await this.financeModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    if (!updated) throw new NotFoundException('Chit not found');
    return this.normalizeChit(updated);
  }

  async addChitAuction(id: string, body: { month: number; winningBid: number }): Promise<any> {
    const raw = await this.financeModel.findOne({ _id: id, type: 'chit', isDeleted: { $ne: true } }).exec();
    if (!raw) throw new NotFoundException('Chit not found');
    const month = Number(body.month);
    const commission = this.getChitCommission(raw);
    const winningBid = month === Number(raw.duration)
      ? Math.max(1, Number(raw.chitValue) - commission)
      : Number(body.winningBid);
    if (month < 1 || month > raw.duration) throw new BadRequestException('Auction month is out of range');
    if (winningBid <= 0 || (month !== Number(raw.duration) && winningBid >= raw.chitValue)) {
      throw new BadRequestException('Winning payout must be greater than zero and below chit value');
    }
    const auctions = (raw.auctions ?? []).filter((auction) => auction.month !== month);
    auctions.push({ month, winningBid, isActual: true, verified: false });
    raw.auctions = auctions.sort((a, b) => a.month - b.month);
    raw.currentMonth = Math.max(raw.currentMonth ?? 1, month);
    raw.markModified('auctions');
    await raw.save();
    return this.normalizeChit(raw);
  }

  async verifyChitAuction(
    id: string,
    month: number,
  ): Promise<any> {
    const raw = await this.financeModel.findOne({
      _id: id,
      type: 'chit',
      isDeleted: { $ne: true },
    }).exec();
    if (!raw) throw new NotFoundException('Chit not found');
    const auction = (raw.auctions ?? []).find(
      (item: any) => item.month === Number(month),
    );
    if (!auction) {
      throw new BadRequestException('Edit and save a winning payout before verification');
    }
    raw.auctions = (raw.auctions ?? []).map((item: any) =>
      item.month === Number(month)
        ? {
            month: item.month,
            winningBid: item.winningBid,
            verified: true,
            isActual: true,
          }
        : item,
    );
    raw.currentMonth = Math.max(raw.currentMonth ?? 1, Number(month));
    raw.markModified('auctions');
    await raw.save();
    return this.normalizeChit(raw);
  }

  async deleteChit(id: string): Promise<{ deleted: true }> {
    const result = await this.financeModel.findOneAndUpdate(
      { _id: id, type: 'chit' },
      { isDeleted: true },
      { new: true },
    ).exec();
    if (!result) throw new NotFoundException('Chit not found');
    return { deleted: true };
  }

  async getChitDashboard() {
    const chits = await this.getChits();
    let totalPaidToDate = 0;
    let totalDividendsEarnedToDate = 0;
    for (const chit of chits) {
      const schedule = this.buildChitSchedule(chit, false);
      totalPaidToDate += schedule
        .filter((row) => row.month <= chit.currentMonth)
        .reduce((sum, row) => sum + row.installmentPaid, 0);
      totalDividendsEarnedToDate += schedule
        .filter((row) => row.month <= chit.currentMonth)
        .reduce((sum, row) => sum + row.dividendPerMember, 0);
    }
    return {
      chitCount: chits.length,
      totalChitValue: chits.reduce((sum, chit) => sum + chit.chitValue, 0),
      totalPaidToDate,
      totalDividendsEarnedToDate,
      chits,
    };
  }

  async simulateChit(
    id: string,
    body: { withdrawalMonth: number; winningBid: number; targetAnnualReturn?: number },
  ) {
    const chit = await this.getChit(id);
    const withdrawalMonth = Number(body.withdrawalMonth);
    const requestedWinningBid = Number(body.winningBid);
    const winningBid = withdrawalMonth === chit.duration
      ? Math.max(1, Number(chit.chitValue) - this.getChitCommission(chit))
      : requestedWinningBid;
    const targetAnnualReturn = Number(body.targetAnnualReturn ?? 12);
    if (withdrawalMonth < 1 || withdrawalMonth > chit.duration) throw new BadRequestException('Withdrawal month is out of range');
    if (winningBid <= 0 || (withdrawalMonth !== chit.duration && winningBid >= chit.chitValue)) {
      throw new BadRequestException('Winning payout must be between 0 and chit value');
    }
    const schedule = this.buildChitSchedule(chit, true, withdrawalMonth, winningBid);
    const totalInstallments = schedule.reduce((sum, row) => sum + row.installmentPaid, 0);
    const terminalDividends = schedule.reduce((sum, row) => sum + row.terminalDividend, 0);
    const netCashCost = totalInstallments - terminalDividends;
    const nominalNetGain = winningBid - netCashCost;
    const cashFlows = schedule.map((row) => -row.installmentPaid);
    cashFlows[withdrawalMonth - 1] += winningBid;
    cashFlows[cashFlows.length - 1] += terminalDividends;
    const monthlyRate = Math.pow(1 + targetAnnualReturn / 100, 1 / 12) - 1;
    const npvAtTargetReturn = cashFlows.reduce(
      (sum, cashFlow, index) => sum + cashFlow / Math.pow(1 + monthlyRate, index + 1),
      0,
    );

    let low = 1;
    let high = chit.chitValue - 1;
    for (let index = 0; index < 60; index += 1) {
      const mid = Math.floor((low + high) / 2);
      const candidateSchedule = this.buildChitSchedule(chit, true, withdrawalMonth, mid);
      const candidateInstallments = candidateSchedule.reduce((sum, row) => sum + row.installmentPaid, 0);
      const candidateTerminal = candidateSchedule.reduce((sum, row) => sum + row.terminalDividend, 0);
      const candidateFlows = candidateSchedule.map((row) => -row.installmentPaid);
      candidateFlows[withdrawalMonth - 1] += mid;
      candidateFlows[candidateFlows.length - 1] += candidateTerminal;
      const candidateNpv = candidateFlows.reduce(
        (sum, cashFlow, i) => sum + cashFlow / Math.pow(1 + monthlyRate, i + 1),
        0,
      );
      const candidateNetCost = candidateInstallments - candidateTerminal;
      if (candidateNpv >= 0 && candidateNetCost >= 0) high = mid;
      else low = mid + 1;
    }
    const minimumWinningPayoutForTargetReturn = low;
    return {
      chitId: id,
      withdrawalMonth,
      winningBid,
      totalInstallments,
      terminalDividends,
      netCashCost,
      payout: winningBid,
      nominalNetGain,
      nominalReturnPercent: netCashCost > 0 ? (nominalNetGain / netCashCost) * 100 : 0,
      npvAtTargetReturn,
      targetAnnualReturn,
      maximumDiscountBidForTargetReturn: chit.chitValue - minimumWinningPayoutForTargetReturn,
      minimumWinningPayoutForTargetReturn,
      monthlySchedule: schedule,
      assumptions: [
        'First and final installments are fixed at the maximum monthly installment.',
        'Auction dividends reduce subsequent installments and are not subtracted twice.',
        'Terminal dividends are credited separately.',
        'Final-month payout equals chit value minus commission.',
        'Projected auction bids are estimates from recorded bids.',
      ],
    };
  }

  private buildChitSchedule(
    chit: any,
    includeProjection: boolean,
    overrideMonth?: number,
    overrideBid?: number,
  ): any[] {
    const bids = this.projectChitBids(chit);
    if (overrideMonth && overrideBid) bids[overrideMonth - 1] = overrideBid;
    const raw = bids.map((winningBid, index) => {
      const month = index + 1;
      const auction = chit.auctions.find(
        (item: any) => item.month === month && item.verified === true,
      );
      const hasOverrideConflict = auction
        && overrideMonth === month
        && overrideBid !== undefined
        && Number(overrideBid) !== Number(auction.winningBid);
      const isActual = !!auction && !hasOverrideConflict;
      const discount = Math.max(0, chit.chitValue - winningBid);
      const commission = chit.commissionType === 'PERCENT'
        ? (chit.chitValue * chit.commissionValue) / 100
        : chit.commissionValue;
      const distributableDiscount = Math.max(0, discount - commission);
      return {
        month,
        winningBid,
        discount,
        commission,
        dividendPerMember: distributableDiscount / chit.members,
        installmentPaid: 0,
        terminalDividend: 0,
        isActual,
        source: isActual ? 'ACTUAL' : 'PROJECTED',
      };
    });
    raw.forEach((row, index) => {
      const firstOrLast = row.month === 1 || row.month === chit.duration;
      const previousDividend = index > 0 ? raw[index - 1].dividendPerMember : 0;
      row.installmentPaid = chit.firstAndLastFixed && firstOrLast
        ? chit.monthlyInstallment
        : Math.max(0, chit.monthlyInstallment - previousDividend);
      if ((chit.terminalDividendMonths ?? []).includes(row.month)) {
        row.terminalDividend = row.dividendPerMember;
      }
    });
    return raw;
  }

  private getChitCommission(chit: any): number {
    return chit.commissionType === 'PERCENT'
      ? (Number(chit.chitValue) * Number(chit.commissionValue ?? 0)) / 100
      : Number(chit.commissionValue ?? 0);
  }

  private projectChitBids(chit: any): number[] {
    const actual = [...(chit.auctions ?? [])]
      .sort((a, b) => a.month - b.month);
    if (!actual.length) {
      return Array.from({ length: chit.duration }, (_, index) => {
        const ratio = chit.duration === 1 ? 0 : index / (chit.duration - 1);
        const finalBid = Math.max(1, chit.chitValue - this.getChitCommission(chit));
        const startBid = Math.round(chit.chitValue * 0.76);
        return index === chit.duration - 1
          ? finalBid
          : Math.round(startBid + (finalBid - startBid) * ratio);
      });
    }
    const bids = Array.from({ length: chit.duration }, (_, index) => {
      const month = index + 1;
      const exact = actual.find((auction) => auction.month === month);
      return exact ? exact.winningBid : 0;
    });

    const firstActual = actual[0];
    const firstKnownBid =
      firstActual.month === 1
        ? firstActual.winningBid
        : Math.round(chit.chitValue * 0.76);
    if (!bids[0]) bids[0] = firstKnownBid;

    for (let index = 0; index < actual.length - 1; index += 1) {
      const left = actual[index];
      const right = actual[index + 1];
      const monthDifference = right.month - left.month;
      for (let month = left.month + 1; month < right.month; month += 1) {
        const ratio = (month - left.month) / monthDifference;
        bids[month - 1] = Math.round(
          left.winningBid + (right.winningBid - left.winningBid) * ratio,
        );
      }
    }

    const last = actual[actual.length - 1];
    const previous = actual.length > 1 ? actual[actual.length - 2] : null;
    const defaultIncrease =
      Math.max(1, Math.round(chit.chitValue * 0.20 / Math.max(1, chit.duration - 1)));
    let monthlyIncrease = previous && last.month > previous.month
      ? (last.winningBid - previous.winningBid) / (last.month - previous.month)
      : defaultIncrease;

    if (last.month === 1 && actual.length === 1) {
      monthlyIncrease = defaultIncrease;
    }
    monthlyIncrease = Math.max(1, monthlyIncrease);

    for (let month = last.month + 1; month <= chit.duration; month += 1) {
      const previousBid = month === last.month + 1 ? last.winningBid : bids[month - 2];
      bids[month - 1] = Math.min(
        chit.chitValue,
        Math.round(previousBid + monthlyIncrease),
      );
    }

    for (let month = 1; month < firstActual.month; month += 1) {
      if (month === 1 && firstActual.month === 1) continue;
      const previousBid = month === 1 ? firstKnownBid : bids[month - 2];
      bids[month - 1] = Math.min(
        firstActual.winningBid,
        Math.round(previousBid + defaultIncrease),
      );
    }

    for (let month = 1; month < chit.duration; month += 1) {
      bids[month] = Math.max(bids[month], bids[month - 1]);
    }

    const finalBid = Math.max(1, Number(chit.chitValue) - this.getChitCommission(chit));
    const projected = bids.map((bid, index) => {
      if (index === chit.duration - 1) return finalBid;
      if (bid > 0 && bid < chit.chitValue) return bid;
      if (bid <= 0) {
        return Math.min(chit.chitValue, Math.round(firstKnownBid + defaultIncrease * index));
      }
      return chit.chitValue - 1;
    });

    return projected;
  }

  private resolveExpenseType(type?: string): ExpenseMode {
    return type === 'construction' ? 'construction' : 'expense';
  }

  private resolveBudgetType(type?: string): BudgetMode {
    return type === 'home_budget' ? 'home_budget' : 'budget';
  }

  private getBudgetTypeForExpenseMode(type: ExpenseMode): BudgetMode {
    return type === 'construction' ? 'home_budget' : 'budget';
  }

  private resolveBudgetMonthKey(monthKey: string, type: BudgetMode): string {
    return type === 'home_budget' ? CONSTRUCTION_BUDGET_KEY : monthKey;
  }

  private getMonthRange(year: number, month: number) {
    const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0);
    const endStr = `${year}-${String(month).padStart(2, '0')}-${String(
      endDate.getDate(),
    ).padStart(2, '0')}`;

    return { startStr, endStr };
  }

  private getMonthKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  private summarizeExpenses(
    expenses: Finance[],
    budget: BudgetSettings,
  ): FinanceDashboard['summary'] {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budgetAmount = budget.monthlyBudget ?? 0;
    const remaining = budgetAmount - totalSpent;
    const percentUsed =
      budgetAmount > 0 ? Math.round((totalSpent / budgetAmount) * 100) : 0;

    const categoryTotals = expenses.reduce<Record<string, number>>(
      (totals, expense) => {
        const key = expense.category || 'other';
        totals[key] = (totals[key] ?? 0) + expense.amount;
        return totals;
      },
      {},
    );

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((left, right) => right.total - left.total);

    return {
      totalSpent,
      budget: budgetAmount,
      remaining,
      percentUsed,
      totalTransactions: expenses.length,
      categoryBreakdown,
    };
  }

  // --- New Methods for Next-App Dashboard Integration ---

  // Cards
  getCards(): Promise<Finance[]> {
    return this.financeModel.find({ type: 'card', isDeleted: { $ne: true } }).exec();
  }

  addCard(dto: CreateCardDto): Promise<Finance> {
    return this.financeModel.create({ ...dto, type: 'card' });
  }

  async deleteCard(id: string): Promise<boolean> {
    await this.financeModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
    return true;
  }

  // Personal Expenses
  getPersonalExpenses(): Promise<Finance[]> {
    return this.financeModel.find({ type: 'expense', isDeleted: { $ne: true } }).exec();
  }

  addPersonalExpense(dto: CreateFinanceDto): Promise<Finance> {
    return this.financeModel.create({ ...dto, type: 'expense' });
  }

  async deletePersonalExpense(id: string): Promise<boolean> {
    await this.financeModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
    return true;
  }

  // Personal Target
  async getPersonalTarget(): Promise<number> {
    const budget = await this.financeModel.findOne({ type: 'budget', monthKey: 'global', isDeleted: { $ne: true } }).exec();
    return budget ? budget.monthlyBudget : 10000;
  }

  async updatePersonalTarget(target: number): Promise<number> {
    await this.financeModel.findOneAndUpdate(
      { type: 'budget', monthKey: 'global' },
      { monthlyBudget: target, isDeleted: false },
      { upsert: true, new: true }
    ).exec();
    return target;
  }

  // Construction Expenses
  getConstructionExpenses(): Promise<Finance[]> {
    return this.financeModel.find({ type: 'construction', isDeleted: { $ne: true } }).exec();
  }

  addConstructionExpense(dto: CreateFinanceDto): Promise<Finance> {
    return this.financeModel.create({ ...dto, type: 'construction' });
  }

  async updateConstructionExpenseStatus(id: string, status: string): Promise<boolean> {
    await this.financeModel.findByIdAndUpdate(id, { status }).exec();
    return true;
  }

  async deleteConstructionExpense(id: string): Promise<boolean> {
    await this.financeModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
    return true;
  }

  // Construction Budget
  async getConstructionBudget(): Promise<number> {
    const budget = await this.financeModel.findOne({ type: 'home_budget', monthKey: 'construction-overall', isDeleted: { $ne: true } }).exec();
    return budget ? budget.monthlyBudget : 5000000;
  }

  async updateConstructionBudget(budget: number): Promise<number> {
    await this.financeModel.findOneAndUpdate(
      { type: 'home_budget', monthKey: 'construction-overall' },
      { monthlyBudget: budget, isDeleted: false },
      { upsert: true, new: true }
    ).exec();
    return budget;
  }

  // Debts Ledger
  private mapDebtToFrontend(doc: any) {
    const statusMapped = doc.status === 'settled' || doc.status === 'Paid'
      ? 'Paid'
      : doc.status === 'partial' || doc.status === 'Partial'
      ? 'Partial'
      : 'Pending';

    return {
      id: doc._id || doc.id,
      contactName: doc.name || doc.contactName || '',
      amount: doc.amount,
      type: doc.debtType === 'owed_to_me' ? 'Receivable' : 'Payable',
      dueDate: doc.dueDate || '',
      status: statusMapped,
      notes: doc.notes || doc.description || '',
      paidAmount: doc.paidAmount || 0,
      partialPayments: doc.partialPayments || [],
    };
  }

  async getDebtsLedger(): Promise<any[]> {
    const debts = await this.financeModel.find({ type: 'debt', isDeleted: { $ne: true } }).exec();
    return debts.map(d => this.mapDebtToFrontend(d));
  }

  async addDebtLedger(dto: any): Promise<any> {
    const created = await this.financeModel.create({
      type: 'debt',
      name: dto.contactName,
      amount: dto.amount,
      debtType: dto.type === 'Receivable' ? 'owed_to_me' : 'i_owe',
      dueDate: dto.dueDate,
      status: 'pending',
      notes: dto.notes,
      paidAmount: 0,
      partialPayments: [],
    });
    return this.mapDebtToFrontend(created);
  }

  async editDebtLedger(id: string, dto: any): Promise<any> {
    const debt = await this.financeModel.findById(id).exec();
    if (!debt) throw new NotFoundException('Debt not found');

    const updates: any = {};
    if (dto.contactName !== undefined) updates.name = dto.contactName;
    if (dto.amount !== undefined) updates.amount = dto.amount;
    if (dto.type !== undefined) {
      updates.debtType = dto.type === 'Receivable' ? 'owed_to_me' : 'i_owe';
    }
    if (dto.dueDate !== undefined) updates.dueDate = dto.dueDate;
    if (dto.notes !== undefined) updates.notes = dto.notes;

    const newAmount = dto.amount !== undefined ? dto.amount : debt.amount;
    const currentPaidAmount = debt.paidAmount || 0;

    let newStatus = debt.status;
    if (currentPaidAmount >= newAmount) {
      newStatus = 'settled';
    } else if (currentPaidAmount > 0) {
      newStatus = 'partial';
    } else {
      newStatus = 'pending';
    }
    updates.status = newStatus;

    const updated = await this.financeModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    return this.mapDebtToFrontend(updated);
  }

  async updateDebtLedgerStatus(id: string, status: string): Promise<boolean> {
    const debt = await this.financeModel.findById(id).exec();
    if (!debt) throw new NotFoundException('Debt not found');
    const backendStatus = status === 'Paid' ? 'settled' : 'pending';
    const paidAmount = status === 'Paid' ? debt.amount : 0;
    
    const updates: any = { status: backendStatus, paidAmount };
    if (status !== 'Paid') {
      // Reopening debt clears partial payments
      updates.partialPayments = [];
    }
    
    await this.financeModel.findByIdAndUpdate(id, updates).exec();
    return true;
  }

  async deleteDebtLedger(id: string): Promise<boolean> {
    await this.financeModel.findByIdAndUpdate(id, { isDeleted: true }).exec();
    return true;
  }

  async addPartialPayment(id: string, dto: { amount: number, date: string, notes?: string }): Promise<any> {
    const debt = await this.financeModel.findById(id).exec();
    if (!debt) throw new NotFoundException('Debt not found');

    const newPayment = {
      id: new Types.ObjectId().toString(),
      amount: dto.amount,
      date: dto.date,
      notes: dto.notes || '',
    };

    const partialPayments = debt.partialPayments || [];
    partialPayments.push(newPayment);

    const paidAmount = partialPayments.reduce((sum, p) => sum + p.amount, 0);
    let status = 'pending';
    if (paidAmount >= debt.amount) {
      status = 'settled';
    } else if (paidAmount > 0) {
      status = 'partial';
    }

    const updated = await this.financeModel.findByIdAndUpdate(
      id,
      { partialPayments, paidAmount, status },
      { new: true }
    ).exec();
    return this.mapDebtToFrontend(updated);
  }

  async editPartialPayment(id: string, partialId: string, dto: { amount?: number, date?: string, notes?: string }): Promise<any> {
    const debt = await this.financeModel.findById(id).exec();
    if (!debt) throw new NotFoundException('Debt not found');

    const partialPayments = debt.partialPayments || [];
    const index = partialPayments.findIndex(p => p.id === partialId);
    if (index === -1) throw new NotFoundException('Partial payment record not found');

    if (dto.amount !== undefined) partialPayments[index].amount = dto.amount;
    if (dto.date !== undefined) partialPayments[index].date = dto.date;
    if (dto.notes !== undefined) partialPayments[index].notes = dto.notes;

    const paidAmount = partialPayments.reduce((sum, p) => sum + p.amount, 0);
    let status = 'pending';
    if (paidAmount >= debt.amount) {
      status = 'settled';
    } else if (paidAmount > 0) {
      status = 'partial';
    }

    const updated = await this.financeModel.findByIdAndUpdate(
      id,
      { partialPayments, paidAmount, status },
      { new: true }
    ).exec();
    return this.mapDebtToFrontend(updated);
  }

  async deletePartialPayment(id: string, partialId: string): Promise<any> {
    const debt = await this.financeModel.findById(id).exec();
    if (!debt) throw new NotFoundException('Debt not found');

    let partialPayments = debt.partialPayments || [];
    partialPayments = partialPayments.filter(p => p.id !== partialId);

    const paidAmount = partialPayments.reduce((sum, p) => sum + p.amount, 0);
    let status = 'pending';
    if (paidAmount >= debt.amount) {
      status = 'settled';
    } else if (paidAmount > 0) {
      status = 'partial';
    }

    const updated = await this.financeModel.findByIdAndUpdate(
      id,
      { partialPayments, paidAmount, status },
      { new: true }
    ).exec();
    return this.mapDebtToFrontend(updated);
  }

  // Card Billing Calculation
  async getCardBillStatements(targetMonth: string): Promise<any[]> {
    const cards = await this.financeModel.find({ type: 'card', isDeleted: { $ne: true } }).exec();
    const expenses = await this.financeModel.find({ type: 'expense', isDeleted: { $ne: true } }).exec();
    const paidBillsList = await this.financeModel.find({ type: 'card_bill', isDeleted: { $ne: true } }).exec();
    
    const paidBills: Record<string, boolean> = {};
    paidBillsList.forEach(pb => {
      paidBills[`${pb.cardId}_${pb.monthKey}`] = pb.isPaid;
    });

    const year = parseInt(targetMonth.split('-')[0], 10);
    const month = parseInt(targetMonth.split('-')[1], 10); // 1-indexed

    return cards.map(card => {
      const billingDay = card.billingDay;
      const dueDay = card.dueDay;

      // Start date of the cycle is previous month's billingDay + 1
      let startYear = year;
      let startMonth = month - 1;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = year - 1;
      }
      
      const startDateStr = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(billingDay + 1).padStart(2, '0')}`;
      const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(billingDay).padStart(2, '0')}`;

      // Due date calculation
      let dueYear = year;
      let dueMonth = month;
      
      if (dueDay < billingDay) {
        dueMonth = month + 1;
      }
      if (dueMonth > 12) {
        dueMonth = 1;
        dueYear = year + 1;
      }
      
      const dueDateStr = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;

      // Filter transactions that fall within this date range for this card
      const startMs = new Date(startDateStr).getTime();
      const endMs = new Date(endDateStr).getTime();

      const cardTransactions = expenses.filter(exp => {
        if (exp.cardId !== String(card._id)) return false;
        const expMs = new Date(exp.date).getTime();
        return expMs >= startMs && expMs <= endMs;
      }).map(exp => ({
        id: exp._id,
        amount: exp.amount,
        category: exp.category,
        date: exp.date,
        cardId: exp.cardId,
        usedBy: exp.usedBy,
        notes: exp.notes
      }));

      const totalAmount = cardTransactions.reduce((sum, item) => sum + item.amount, 0);
      const billKey = `${card._id}_${targetMonth}`;
      const isPaid = !!paidBills[billKey];

      return {
        cardId: String(card._id),
        cardName: card.name,
        statementMonth: targetMonth,
        startDate: startDateStr,
        endDate: endDateStr,
        dueDate: dueDateStr,
        totalAmount,
        transactions: cardTransactions,
        isPaid
      };
    });
  }

  async markCardBillAsPaid(cardId: string, targetMonth: string, isPaid: boolean): Promise<boolean> {
    await this.financeModel.findOneAndUpdate(
      { type: 'card_bill', cardId, monthKey: targetMonth },
      { type: 'card_bill', cardId, monthKey: targetMonth, isPaid, isDeleted: false },
      { upsert: true, new: true }
    ).exec();
    return true;
  }
}
