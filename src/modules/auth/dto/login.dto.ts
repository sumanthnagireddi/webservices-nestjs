import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDataDto {
    @ApiProperty({
        description: 'User password',
        example: 'Password123',
        minLength: 8,
        maxLength: 32,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    // @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
    // @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
    password: string;

    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
    })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}