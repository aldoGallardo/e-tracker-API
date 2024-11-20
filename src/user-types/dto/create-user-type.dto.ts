import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserTypeDto {
  @ApiProperty({ description: 'Name of the user type', example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
