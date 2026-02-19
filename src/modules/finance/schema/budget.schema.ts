import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BudgetDocument = Budget & Document;

@Schema({ collection: 'budgets', timestamps: true })
export class Budget {
    @Prop({ required: true, unique: true })
    monthKey: string; // e.g. '2026-02'

    @Prop({ required: true })
    monthlyBudget: number;

    @Prop({ required: true, default: 80 })
    alertThreshold: number;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);