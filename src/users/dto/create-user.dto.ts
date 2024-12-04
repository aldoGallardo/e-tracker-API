import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  surname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  dni: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  profileImage?: string;

  @IsEnum(['active', 'inactive'])
  @ApiProperty({ default: 'active' })
  contractStatus: 'active' | 'inactive' = 'active';

  @ApiProperty()
  journey: boolean;

  @IsNotEmpty()
  @ApiProperty()
  userTypeId: number; // ID del tipo de usuario

  @IsNotEmpty()
  @ApiProperty()
  branchOfficeId: number; // ID de la oficina asignada
}
