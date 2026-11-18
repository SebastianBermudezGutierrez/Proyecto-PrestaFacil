import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateLoanDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  borrowerName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  borrowerContact?: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsUUID()
  itemId!: string;
}