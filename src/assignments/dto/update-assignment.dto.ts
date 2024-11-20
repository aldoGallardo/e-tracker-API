import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssignmentDto {
  @ApiProperty({
    description: 'ID of the user assigning the task',
    example: 'user123',
    required: false,
  })
  @IsOptional()
  @IsString()
  assignFrom?: string;

  @ApiProperty({
    description: 'ID of the user being assigned the task',
    example: 'user456',
    required: false,
  })
  @IsOptional()
  @IsString()
  assignTo?: string;

  @ApiProperty({
    description: 'Order number associated with the assignment',
    example: 'ORD123',
    required: false,
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;
}
