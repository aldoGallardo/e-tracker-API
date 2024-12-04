import {
  IsNumber,
  IsDecimal,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateAssignmentDetailDto {
  @IsDecimal()
  calculatedValue: number;

  @IsOptional()
  @IsDecimal()
  thresholdValue?: number;

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  // Aquí se asume que se recibirá un ID de KeyResult y Assignment para asociarlos
  @IsNotEmpty()
  @IsNumber()
  keyResultId: number;

  @IsNotEmpty()
  @IsNumber()
  assignmentId: number;
}
