import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplyDto {
  @ApiProperty({
    description: 'Name of the supply',
    example: 'Hammer',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'Kg',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;
}
