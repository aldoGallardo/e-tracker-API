import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['kg', 'l', 'm', 'm2', 'm3', 'u'])
  unit?: 'kg' | 'l' | 'm' | 'm2' | 'm3' | 'u';
}
