import { IsArray, ValidateNested, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Definir NeededSupplyDto para estructura específica
export class NeededSupplyDto {
  @ApiProperty({ description: 'ID of the supply', example: 'supply1' })
  @IsString()
  @IsNotEmpty()
  supply: string;

  @ApiProperty({
    description: 'Estimated usage for this supply',
    example: '100',
  })
  @IsString()
  @IsNotEmpty()
  estimatedUse: string;

  @ApiProperty({ description: 'Unit of the supply', example: 'Unidad' })
  @IsString()
  @IsNotEmpty()
  unit: string;
}

export class CreateActivityTypeDto {
  @ApiProperty({ description: 'Activity name', example: 'Inspection' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Activity description',
    example: 'General inspection of the site',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'List of needed supplies for the activity type',
    type: [NeededSupplyDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NeededSupplyDto)
  neededSupplies: NeededSupplyDto[];
}
