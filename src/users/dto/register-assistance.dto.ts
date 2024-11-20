// src/users/dto/register-assistance.dto.ts
import { IsNotEmpty, IsObject, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAssistanceDto {
  @ApiProperty({
    description: 'Timestamp in milliseconds since Epoch',
    example: 1697462400000, // 16 Oct 2023, 8:00 AM
  })
  @IsNotEmpty()
  @IsNumber()
  currentTime: number;

  @ApiProperty({
    description: 'Current location of the user when registering assistance',
    example: { latitude: -8.109052, longitude: -79.021534 },
  })
  @IsNotEmpty()
  @IsObject()
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}
