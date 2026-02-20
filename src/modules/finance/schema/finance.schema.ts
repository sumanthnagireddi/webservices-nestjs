import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
export type FinanceDocument = Finance & Document;
@Schema({ collection: 'finance', timestamps: true })
export class Finance {
    @Prop({required:true})
    title: string;

    @Prop({required:true})
    amount: number;

    @Prop({required:true})
    category: string;

    @Prop({ required:true})
    date: string;

    @Prop()
    notes: string;

    @Prop()
    source: string;

    @Prop()
    createdAt: string;

    @Prop()
    updatedAt: string;

    @Prop()
    deletedAt: string;

    @Prop()
    isDeleted: boolean;

    @Prop()
    card: string;
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);
