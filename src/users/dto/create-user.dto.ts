// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumberString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RegisterAssistanceDto } from './register-assistance.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User first name', example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'User last name', example: 'Pérez' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'juan.perez@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password for authentication',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'User phone number', example: '+51987654321' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'URL of the user profile picture',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({
    description: 'User birth date in format YYYY-MM-DD',
    example: '1990-05-15',
  })
  @IsNotEmpty()
  @IsString()
  birthDate: string;

  @ApiProperty({
    description: 'Branch office ID to which the user belongs',
    example: '2OIW6pbuHYEjywnPR41N',
  })
  @IsNotEmpty()
  @IsString()
  branchOffice: string;

  @ApiProperty({
    description: 'User type, either admin or technician',
    example: 'technician',
  })
  @IsNotEmpty()
  @IsString()
  userType: string;

  @ApiProperty({
    description: 'User DNI (exactly 8 digits)',
    example: '12345678',
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(8, 8)
  dni: string;

  @ApiProperty({
    description: 'Daily assistance records for the user',
    type: [RegisterAssistanceDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegisterAssistanceDto)
  dailyAssistance?: RegisterAssistanceDto[];
}
