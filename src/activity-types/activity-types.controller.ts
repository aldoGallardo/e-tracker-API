import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ActivityTypesService } from './activity-types.service';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';

@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activityTypeService: ActivityTypesService) {}

  @Post()
  async create(@Body() createActivityTypeDto: CreateActivityTypeDto) {
    return this.activityTypeService.createActivityType(createActivityTypeDto);
  }

  @Get()
  async findAll() {
    return this.activityTypeService.getAllActivityTypes();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activityTypeService.getActivityTypeById(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateActivityTypeDto: UpdateActivityTypeDto,
  ) {
    return this.activityTypeService.updateActivityType(
      id,
      updateActivityTypeDto,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.activityTypeService.deleteActivityType(+id);
  }
}
