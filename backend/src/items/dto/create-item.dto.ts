import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
}