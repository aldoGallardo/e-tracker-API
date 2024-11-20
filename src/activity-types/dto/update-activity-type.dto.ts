import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityTypeDto } from './create-activity-type.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class NeededSupplyDto {
  @ApiProperty({
    description: 'ID of the required supply',
    example: 'supply7',
  })
  @IsString()
  supply: string;

  @ApiProperty({
    description: 'Quantity of required supply',
    example: 5,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Estimated usage for the supply',
    example: '1',
  })
  @IsString()
  estimatedUse: string;

  @ApiProperty({
    description: 'Unit of the supply',
    example: 'Unidad',
  })
  @IsString()
  unit: string;
}

export class UpdateActivityTypeDto extends PartialType(CreateActivityTypeDto) {
  @ApiProperty({
    description: 'Activity Type ID to update',
    example: 'abc123',
  })
  id?: string;

  @ApiProperty({
    description: 'List of needed supplies for the activity type',
    type: [NeededSupplyDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NeededSupplyDto)
  neededSupplies?: NeededSupplyDto[];
}
