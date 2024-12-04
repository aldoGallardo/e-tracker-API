import { PartialType } from '@nestjs/swagger';
import { CreateActivityTypeSupplyDto } from './create-activity-type-supply.dto';

export class UpdateActivityTypeSupplyDto extends PartialType(CreateActivityTypeSupplyDto) {}
