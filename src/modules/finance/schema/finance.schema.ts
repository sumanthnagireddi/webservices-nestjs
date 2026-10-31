import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FinanceDocument = Finance & Document;

export type FinanceType =
  | 'expense'
  | 'debt'
  | 'budget'
  | 'income'
  | 'construction'
  | 'home_budget'
  | 'card'
  | 'card_bill'
  | 'chit';

export const FINANCE_TYPES = [
  'expense',
  'debt',
  'budget',
  'income',
  'construction',
  'home_budget',
  'card',
  'card_bill',
  'chit',
] as const satisfies readonly FinanceType[];

export function isFinanceType(value: string | undefined): value is FinanceType {
  return (
    typeof value === 'string' && FINANCE_TYPES.includes(value as FinanceType)
  );
}

@Schema({ collection: 'finance', timestamps: true })
export class Finance {
  @Prop({
    required: true,
    enum: FINANCE_TYPES,
    default: 'expense',
  })
  type: FinanceType;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  title: string;

  @Prop()
  amount: number;

  @Prop()
  category: string;

  @Prop()
  date: string;

  @Prop()
  notes: string;

  @Prop()
  source: string;

  @Prop()
  cardType: string;

  @Prop()
  name: string;

  @Prop()
  debtType: string;

  @Prop()
  status: string;

  @Prop()
  paidAmount: number;

  @Prop()
  description: string;

  @Prop()
  dueDate: string;

  @Prop()
  monthKey: string;

  @Prop()
  monthlyBudget: number;

  @Prop()
  alertThreshold: number;

  @Prop()
  lastFour: string;

  @Prop()
  billingDay: number;

  @Prop()
  dueDay: number;

  @Prop()
  creditLimit: number;

  @Prop()
  cardId: string;

  @Prop()
  usedBy: string;

  @Prop()
  vendor: string;

  @Prop()
  isPaid: boolean;

  @Prop()
  startMonth: string;

  @Prop()
  chitValue: number;

  @Prop()
  duration: number;

  @Prop()
  members: number;

  @Prop()
  monthlyInstallment: number;

  @Prop()
  commissionType: 'PERCENT' | 'FIXED';

  @Prop()
  commissionValue: number;

  @Prop()
  currentMonth: number;

  @Prop()
  firstAndLastFixed: boolean;

  @Prop({ type: [Number], default: [] })
  terminalDividendMonths: number[];

  @Prop({
    type: [
      {
        month: Number,
        winningBid: Number,
        isActual: { type: Boolean, default: true },
        verified: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  auctions: {
    month: number;
    winningBid: number;
    isActual?: boolean;
    verified?: boolean;
  }[];

  @Prop({
    type: [
      {
        month: Number,
        amountPaid: Number,
      },
    ],
    default: [],
  })
  payments: {
    month: number;
    amountPaid: number;
  }[];

  @Prop({
    type: [
      {
        id: { type: String, default: () => new Types.ObjectId().toString() },
        amount: Number,
        date: String,
        notes: String,
      },
    ],
    default: [],
  })
  partialPayments: { id: string; amount: number; date: string; notes: string }[];
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);

FinanceSchema.index({ type: 1 });
FinanceSchema.index({ type: 1, date: 1 });
FinanceSchema.index({ type: 1, monthKey: 1 }, { unique: false });
FinanceSchema.index({ type: 1, status: 1 });
