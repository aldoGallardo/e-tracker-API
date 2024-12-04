import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { Objective } from './objective.entity';

@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Post()
  createObjective(
    @Body() createObjectiveDto: CreateObjectiveDto,
  ): Promise<Objective> {
    return this.objectivesService.createObjective(createObjectiveDto);
  }

  @Get()
  getAllObjectives(): Promise<Objective[]> {
    return this.objectivesService.getAllObjectives();
  }

  @Get(':id')
  getObjectiveById(@Param('id') id: number): Promise<Objective> {
    return this.objectivesService.getObjectiveById(id);
  }

  @Patch(':id')
  updateObjective(
    @Param('id') id: number,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ): Promise<Objective> {
    return this.objectivesService.updateObjective(id, updateObjectiveDto);
  }

  @Delete(':id')
  deleteObjective(@Param('id') id: number): Promise<void> {
    return this.objectivesService.deleteObjective(id);
  }
}
