import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class EvidenceItemDto {
  @ApiProperty({
    description: 'Name or type of the evidence item',
    example: 'evidence1',
  })
  @IsString()
  @IsNotEmpty()
  evidence: string; // Name or type of the evidence

  @ApiProperty({
    description: 'URL of the evidence item',
    example: 'https://example.com/evidence1.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string; // URL of the evidence
}

class SupplyQuantityDto {
  @ApiProperty({ description: 'ID of the supply used', example: 'supply5' })
  @IsString()
  @IsString()
  @IsNotEmpty()
  supply: string;

  @ApiProperty({ description: 'Quantity of the supply used', example: 5 })
  @IsNotEmpty()
  quantity: number;
}

class LocationDto {
  @ApiProperty({
    description: 'Latitude of the activity location',
    example: -8.081392673815078,
  })
  @IsNotEmpty()
  _latitude: number;

  @ApiProperty({
    description: 'Longitude of the activity location',
    example: -79.00012484998189,
  })
  @IsNotEmpty()
  _longitude: number;
}

export class CompleteActivityDto {
  @ApiProperty({
    description: 'Completion comment for the activity',
    example: 'Completed successfully',
  })
  @IsString()
  @IsNotEmpty()
  comment: string; // Obligatorio

  @ApiProperty({
    description: 'Array of evidence items related to the activity',
    type: [EvidenceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDto)
  evidence: EvidenceItemDto[]; // Array of evidence objects

  @ApiProperty({
    description: 'Array of supplies needed to complete the activity',
    type: [SupplyQuantityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupplyQuantityDto)
  @IsNotEmpty()
  neededSupply: SupplyQuantityDto[]; // Obligatorio

  @ApiProperty({
    description: 'Geolocation coordinates for completing the activity',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty()
  location: LocationDto; // Obligatorio
}
