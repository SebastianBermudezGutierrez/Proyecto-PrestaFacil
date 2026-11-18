import {
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateItemDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(80)
  category?: string;
}