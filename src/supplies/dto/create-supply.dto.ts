import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(['kg', 'l', 'm', 'm2', 'm3', 'u'], {
    message:
      'La unidad debe tomar uno de los siguientes valores: kg, l, m, m2, m3, u',
  })
  unit: 'kg' | 'l' | 'm' | 'm2' | 'm3' | 'u';
}
