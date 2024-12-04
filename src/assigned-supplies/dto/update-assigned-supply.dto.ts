import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignedSupplyDto } from './create-assigned-supply.dto';

export class UpdateAssignedSupplyDto extends PartialType(
  CreateAssignedSupplyDto,
) {}
