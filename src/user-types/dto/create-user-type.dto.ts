import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'], {
    message:
      'El estado debe ser uno de los siguientes valores: active, inactive',
  })
  status: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
