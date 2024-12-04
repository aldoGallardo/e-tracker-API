import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateObjectiveDto {
  @IsOptional()
  @IsEnum(['reduce', 'maintain', 'increase'])
  action?: 'reduce' | 'maintain' | 'increase';

  @IsOptional()
  @IsNumber()
  dimensionId?: number;
}
