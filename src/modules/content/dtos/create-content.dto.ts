import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContentDTO {
  @IsNotEmpty()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsString()
  body: string; // HTML or Markdown

  @IsNotEmpty()
  @IsMongoId()
  topicId: string; // reference to Topic

  // Optional: will be fetched from Topic in service
  @IsOptional()
  @IsMongoId()
  technologyId?: string;

  @IsNotEmpty()
  @IsMongoId()
  authorId?: string;

  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date | null;

  @IsOptional()
  isDeleted?: boolean = false;
}
