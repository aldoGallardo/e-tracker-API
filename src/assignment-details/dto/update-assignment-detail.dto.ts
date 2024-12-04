import { IsDecimal, IsOptional, IsDateString } from 'class-validator';

export class UpdateAssignmentDetailDto {
  @IsOptional()
  @IsDecimal()
  calculatedValue?: number;

  @IsOptional()
  @IsDecimal()
  thresholdValue?: number;

  @IsOptional()
  @IsDateString()
  date: Date;

  @IsOptional()
  keyResultId?: number;

  @IsOptional()
  assignmentId?: number;
}
