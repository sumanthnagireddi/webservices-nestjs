import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBudgetDto {
    @IsNotEmpty()
    @IsString()
    monthKey: string;
    @IsNotEmpty()
    @IsNumber()
    amount: number;
    @IsNotEmpty()
    @IsNumber()
    threshold: number;
}