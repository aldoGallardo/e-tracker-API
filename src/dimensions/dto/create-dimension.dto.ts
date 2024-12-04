import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateDimensionDto {
  @IsNotEmpty()
  @IsString()
  @Length(12, 100)
  name: string;
}
