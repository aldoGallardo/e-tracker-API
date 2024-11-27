import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import {
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Objectives')
@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectiveService: ObjectivesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Objective' })
  @ApiResponse({ status: 201, description: 'Objective created successfully.' })
  async createObjective(@Body() createObjectiveDto: CreateObjectiveDto) {
    return this.objectiveService.createObjective(createObjectiveDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Objectives' })
  @ApiResponse({ status: 200, description: 'Returns a list of Objectives.' })
  async getObjectives() {
    return this.objectiveService.getObjectives();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific Objective by ID' })
  @ApiParam({ name: 'id', description: 'Objective ID' })
  @ApiResponse({ status: 200, description: 'Returns the specified Objective.' })
  async getObjectiveById(@Param('id') id: string) {
    return this.objectiveService.getObjectiveById(id);
  }

  @ApiOperation({ summary: 'Update a specific objective' })
  @ApiParam({ name: 'id', description: 'Objective ID' })
  @ApiBody({ type: UpdateObjectiveDto })
  @ApiResponse({ status: 200, description: 'Objective updated successfully' })
  @Put(':id')
  async updateObjective(
    @Param('id') id: string,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ) {
    return this.objectiveService.updateObjective(id, updateObjectiveDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific Objective by ID' })
  @ApiParam({ name: 'id', description: 'Objective ID' })
  @ApiResponse({ status: 200, description: 'Objective deleted successfully.' })
  async removeObjective(@Param('id') id: string) {
    return this.objectiveService.removeObjective(id);
  }
}
