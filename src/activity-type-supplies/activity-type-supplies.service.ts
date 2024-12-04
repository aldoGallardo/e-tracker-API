import { Injectable } from '@nestjs/common';
import { CreateActivityTypeSupplyDto } from './dto/create-activity-type-supply.dto';
import { UpdateActivityTypeSupplyDto } from './dto/update-activity-type-supply.dto';

@Injectable()
export class ActivityTypeSuppliesService {
  create(createActivityTypeSupplyDto: CreateActivityTypeSupplyDto) {
    return 'This action adds a new activityTypeSupply';
  }

  findAll() {
    return `This action returns all activityTypeSupplies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activityTypeSupply`;
  }

  update(id: number, updateActivityTypeSupplyDto: UpdateActivityTypeSupplyDto) {
    return `This action updates a #${id} activityTypeSupply`;
  }

  remove(id: number) {
    return `This action removes a #${id} activityTypeSupply`;
  }
}
