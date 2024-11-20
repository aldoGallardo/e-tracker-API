import { IsNotEmpty, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKpiDto {
  @ApiProperty({
    description: 'Nombre del KPI',
    example: 'Uso eficiente de recursos',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Fórmula del KPI',
    example: 'resources.used / resources.total * 100',
  })
  @IsNotEmpty()
  @IsString()
  formula: string;

  @ApiProperty({
    description: 'Descripción del KPI',
    example: 'Evalúa el uso eficiente de los recursos.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Valor objetivo del KPI', example: 95 })
  @IsNotEmpty()
  @IsNumber()
  targetValue: number;

  @ApiProperty({ description: 'Valor actual del KPI', example: 85 })
  @IsNotEmpty()
  @IsNumber()
  currentValue: number;

  @ApiProperty({
    description: 'Frecuencia de revisión del KPI',
    example: 'Mensual',
  })
  @IsNotEmpty()
  @IsEnum(['Diario', 'Semanal', 'Mensual', 'Trimestral', 'Anual'])
  frequency: string;
}
