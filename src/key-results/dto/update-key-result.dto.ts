import {
  IsEnum,
  IsDecimal,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { CalculationMethodsEnum } from '../../calculation/calculation-methods.enum';
export class UpdateKeyResultDto {
  @IsOptional()
  @IsEnum(CalculationMethodsEnum)
  method?: CalculationMethodsEnum;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  target?: number;

  @IsOptional()
  @IsDateString()
  date: Date;

  @IsOptional()
  @IsNumber()
  objectiveId?: number;

  @IsOptional()
  @IsNumber()
  dimensionId?: number;
}
