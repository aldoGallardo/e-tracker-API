import { PartialType } from '@nestjs/mapped-types';
import { CreateUserTypeDto } from './create-user-type.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserTypeDto extends PartialType(CreateUserTypeDto) {
  @ApiProperty({
    description: 'Updated name of the user type',
    example: 'SuperAdmin',
  })
  name?: string;
}
