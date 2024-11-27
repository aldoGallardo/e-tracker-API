import { IsNotEmpty, IsString, IsIn } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateObjectiveDto {
  @ApiProperty({
    example: 'increase',
    enum: ['increase', 'keep', 'reduce'],
  })
  @IsNotEmpty()
  @IsIn(['increase', 'keep', 'reduce']) // Validación explícita para las acciones
  action: string; // "increase", "keep", "reduce"

  @ApiProperty({ example: 'Eficiencia Operativa' })
  @IsNotEmpty()
  @IsString()
  dimension: string; // "Eficiencia Operativa", "Proactividad Operativa", etc.
}
