import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateIf((o) => o.regular === true)
  @IsNumber()
  @IsOptional()
  estimate?: number;

  @IsBoolean()
  @IsNotEmpty()
  regular: boolean;
}
