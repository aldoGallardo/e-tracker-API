import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplyDto {
  @ApiProperty({ description: 'Name of the supply', example: 'Screwdriver' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unit of measurement', example: 'Unit' })
  @IsNotEmpty()
  @IsString()
  unit: string;
}
