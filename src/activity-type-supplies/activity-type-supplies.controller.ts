import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivityTypeSuppliesService } from './activity-type-supplies.service';
import { CreateActivityTypeSupplyDto } from './dto/create-activity-type-supply.dto';
import { UpdateActivityTypeSupplyDto } from './dto/update-activity-type-supply.dto';

@Controller('activity-type-supplies')
export class ActivityTypeSuppliesController {
  constructor(private readonly activityTypeSuppliesService: ActivityTypeSuppliesService) {}

  @Post()
  create(@Body() createActivityTypeSupplyDto: CreateActivityTypeSupplyDto) {
    return this.activityTypeSuppliesService.create(createActivityTypeSupplyDto);
  }

  @Get()
  findAll() {
    return this.activityTypeSuppliesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityTypeSuppliesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityTypeSupplyDto: UpdateActivityTypeSupplyDto) {
    return this.activityTypeSuppliesService.update(+id, updateActivityTypeSupplyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityTypeSuppliesService.remove(+id);
  }
}
