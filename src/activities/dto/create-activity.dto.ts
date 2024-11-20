import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({
    description: 'The order number of the activity',
    example: 'ORD123456',
  })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({
    description: 'Id of the type of the activity',
    example: 'geJuJZgSDvaQq0sroQTh',
  })
  @IsString()
  @IsNotEmpty()
  activityType: string;

  @ApiProperty({
    description: 'The address of the activity',
    example: '123 Main St.',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Id of branch office associated with the activity',
    example: 'eDXAk8wwiPluA7671oj6',
  })
  @IsString()
  @IsNotEmpty()
  branchOffice: string;
}
