import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'ID of the user assigning the task',
    example: 'user123',
  })
  @IsNotEmpty()
  @IsString()
  assignFrom: string;

  @ApiProperty({
    description: 'ID of the user being assigned the task',
    example: 'user456',
  })
  @IsNotEmpty()
  @IsString()
  assignTo: string;

  @ApiProperty({
    description: 'Date of the assignment',
    example: '2023-05-15T00:00:00Z',
  })
  @IsNotEmpty()
  assignmentDate: string;

  @ApiProperty({
    description: 'Order number associated with the assignment',
    example: 'ORD123',
  })
  @IsNotEmpty()
  @IsString()
  orderNumber: string;
}
