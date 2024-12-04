import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignedSupplyDto {
  @IsNotEmpty()
  @IsNumber()
  assignmentId: number;

  @IsNotEmpty()
  @IsNumber()
  supplyId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quantityUsed: number;
}
