import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchOfficeDto {
  @ApiProperty({
    description: 'Name of the branch office',
    example: 'Main Office',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Location coordinates of the branch office',
    example: { latitude: -8.109052, longitude: -79.021534 },
  })
  @IsNotEmpty()
  @IsObject()
  location: {
    latitude: number;
    longitude: number;
  };
}
