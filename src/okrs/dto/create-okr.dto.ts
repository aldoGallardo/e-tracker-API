import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOkrDto {
  @ApiProperty({
    description: 'Título del OKR',
    example: 'Incrementar productividad en campo',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descripción del OKR',
    example: 'Mejorar la eficiencia del equipo de campo.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Plazo del OKR', example: 'Q4 2024' })
  @IsNotEmpty()
  @IsString()
  deadline: string;

  @ApiProperty({
    description: 'Lista de KPIs relacionados',
    example: ['kpi1', 'kpi2'],
  })
  @IsArray()
  @IsNotEmpty()
  kpis: string[];

  @ApiProperty({
    description: 'Lista de Resultados Clave para este OKR',
    example: [
      'Completar 90% de las tareas a tiempo',
      'Reducir desperdicios en un 10%',
    ],
  })
  @IsOptional()
  @IsArray()
  keyResults: string[];
}
