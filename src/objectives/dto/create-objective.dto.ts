import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateObjectiveDto {
  @IsNotEmpty()
  @IsEnum(['reduce', 'maintain', 'increase'], {
    message:
      'The action  must be one of the following values: reduce, maintain, increase',
  })
  action: 'reduce' | 'maintain' | 'increase';

  @IsNotEmpty()
  @IsNumber()
  dimensionId: number;
}
