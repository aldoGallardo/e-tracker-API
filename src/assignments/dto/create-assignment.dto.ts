import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  orderNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  comment: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  address: string;

  @IsNotEmpty()
  @IsEnum(['pending', 'completed', 'inProgress'])
  @ApiProperty()
  status: 'pending' | 'completed' | 'inProgress';

  @IsNotEmpty()
  @IsDate()
  @ApiProperty()
  startedAt: Date;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty()
  completedAt: Date;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  longitude: number;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  evidence: string[];

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  duration: number;

  @IsNotEmpty()
  @ApiProperty()
  assignToId: number; // ID del usuario asignado

  @IsNotEmpty()
  @ApiProperty()
  assignFromId: number; // ID del usuario asignador

  @IsNotEmpty()
  @ApiProperty()
  activityTypeId: number; // ID del tipo de actividad
}
