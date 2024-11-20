import { IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBranchOfficeDto {
  @ApiProperty({
    description: 'Name of the branch office',
    example: 'Updated Office Name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Updated location coordinates of the branch office',
    example: { latitude: -8.109052, longitude: -79.021534 },
  })
  @IsOptional()
  @IsObject()
  location: {
    latitude: number;
    longitude: number;
  };
}
