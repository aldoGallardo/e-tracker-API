import {
  IsEnum,
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { CalculationMethodsEnum } from '../../calculation/calculation-methods.enum';

export class CreateKeyResultDto {
  @IsEnum(CalculationMethodsEnum)
  method: CalculationMethodsEnum;

  @IsDecimal({ decimal_digits: '0,2' })
  target: number;

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsNotEmpty()
  @IsNumber()
  objectiveId: number;

  @IsNotEmpty()
  @IsNumber()
  dimensionId: number;
}
