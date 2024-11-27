import { IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
export class CreateKeyResultDto {
  @ApiProperty({
    description: 'Nombre del Key Result.',
    example: 'Aumentar la eficiencia en la ejecución de tareas al 90%',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID del cálculo asociado al KR.',
    example: 'calculateEfficiency',
  })
  @IsNotEmpty()
  @IsString()
  calculation: string;

  @ApiProperty({
    description: 'Valor objetivo del Key Result.',
    example: 90,
  })
  @IsNotEmpty()
  @IsNumber()
  targetValue: number;

  @ApiProperty({
    description: 'Tipo del objetivo, e.g., porcentaje o cantidad.',
    enum: ['percentage', 'quantity'],
    example: 'percentage',
  })
  @IsNotEmpty()
  @IsIn(['percentage', 'quantity'])
  targetType: string;

  @ApiProperty({
    description: 'Acción esperada sobre el KPI.',
    enum: ['increase', 'keep', 'reduce'],
    example: 'increase',
  })
  @IsNotEmpty()
  @IsIn(['increase', 'keep', 'reduce'])
  targetAction: string;

  @ApiProperty({
    description: 'Tipo de marco de tiempo.',
    enum: ['daily', 'weekly', 'monthly', 'trimesterly', 'semesterly', 'yearly'],
    example: 'monthly',
  })
  @IsNotEmpty()
  @IsIn(['daily', 'weekly', 'monthly', 'trimesterly', 'semesterly', 'yearly'])
  goalType: string;

  @ApiProperty({
    description: 'ID del objetivo padre asociado.',
    example: 'o1',
  })
  @IsNotEmpty()
  @IsString()
  objectiveId: string;
}
