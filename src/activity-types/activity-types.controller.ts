import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ActivityTypesService } from './activity-types.service';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Activity Types')
@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activityTypesService: ActivityTypesService) {}

  // Crear un ActivityType
  @ApiOperation({ summary: 'Create a new Activity Type' })
  @ApiBody({ type: CreateActivityTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Activity Type created successfully',
  })
  @Post()
  async create(@Body() createActivityTypeDto: CreateActivityTypeDto) {
    return this.activityTypesService.createActivityType(createActivityTypeDto);
  }

  // Obtener todos los ActivityTypes (opcionalmente con búsqueda)
  @ApiOperation({
    summary: 'Retrieve all Activity Types, optionally filtered by search term',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter Activity Types',
  })
  @ApiResponse({ status: 200, description: 'List of Activity Types' })
  @Get()
  async getActivityTypes(@Query('search') search?: string) {
    if (search) {
      return this.activityTypesService.searchActivityTypes(search);
    }
    return this.activityTypesService.getActivityTypes();
  }

  // Obtener un ActivityType por ID
  @ApiOperation({ summary: 'Retrieve a specific Activity Type by ID' })
  @ApiParam({ name: 'id', description: 'Activity Type ID' })
  @ApiResponse({ status: 200, description: 'Details of the Activity Type' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activityTypesService.getActivityTypeById(id);
  }

  // Actualizar un ActivityType
  @ApiOperation({ summary: 'Update an Activity Type' })
  @ApiParam({ name: 'id', description: 'Activity Type ID' })
  @ApiBody({ type: UpdateActivityTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Activity Type updated successfully',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActivityTypeDto: UpdateActivityTypeDto,
  ) {
    return this.activityTypesService.updateActivityType(
      id,
      updateActivityTypeDto,
    );
  }

  // Eliminar un ActivityType (solo si no está en uso)
  @ApiOperation({ summary: 'Delete an Activity Type if it is not in use' })
  @ApiParam({ name: 'id', description: 'Activity Type ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity Type deleted successfully',
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.activityTypesService.deleteActivityType(id);
  }
}
