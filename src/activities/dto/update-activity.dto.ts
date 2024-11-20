import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateActivityDto {
  @ApiProperty({
    description: 'New address for the activity',
    example: '123 Main St',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ApiProperty({
    description: 'New activity type',
    example: 'oDGjdJSQh78JLcVoqR9j',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  activityType?: string;

  @ApiProperty({
    description: 'New order number for the activity',
    example: 'ORD54321',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  orderNumber?: string;
}
