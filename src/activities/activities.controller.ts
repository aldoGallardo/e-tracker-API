import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Sse,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { UpdateActivityTypeDto } from '../activity-types/dto/update-activity-type.dto'; // Importamos desde activity-types
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs'; // Importa Observable
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // Obtener los cambios en tiempo real de las actividades
  @ApiOperation({ summary: 'Get real-time activity changes' })
  @ApiResponse({
    status: 200,
    description: 'Returns real-time activity changes.',
  })
  @Sse('changes')
  getActivityChanges(): Observable<any> {
    return this.activitiesService
      .getActivityChanges()
      .pipe(map((activities) => ({ data: activities })));
  }

  // Crear actividad
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiBody({ type: CreateActivityDto })
  @ApiResponse({ status: 201, description: 'Activity created successfully.' })
  @Post()
  async create(@Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.createActivity(createActivityDto);
  }

  // Obtener todas las actividades con paginación
  @ApiOperation({ summary: 'Get all activities with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of activities.',
  })
  @Get()
  async getAllActivities(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('pageSize') pageSize?: number,
    @Query('startAfterActivityNumber') startAfterActivityNumber?: number,
  ) {
    return this.activitiesService.getAllActivities(
      userId,
      status,
      pageSize || 10, // Por defecto, se obtienen 10 actividades
      startAfterActivityNumber ? Number(startAfterActivityNumber) : undefined,
    );
  }

  // Obtener el total de usuarios
  @ApiOperation({ summary: 'Get the total number of activities' })
  @ApiResponse({ status: 200, description: 'Returns total activity count.' })
  @Get('total')
  async getTotalActivities() {
    const total = await this.activitiesService.getTotalActivities();
    return { total };
  }

  // Búsqueda de actividades por término
  @ApiOperation({ summary: 'Search activities by term' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of activities matching the search term.',
  })
  @Get('search')
  async searchActivities(@Query('term') term: string) {
    return this.activitiesService.searchActivities(term);
  }

  // Obtener actividades por sucursal
  @ApiOperation({ summary: 'Get activities by branch office ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of activities for the specified branch office.',
  })
  @Get('branchOffice/:branchOfficeId')
  async getActivitiesByBranchOffice(
    @Param('branchOfficeId') branchOfficeId: string,
  ) {
    return this.activitiesService.getAllActivitiesByBranchOffice(
      branchOfficeId,
    );
  }

  // Obtener una actividad por ID
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the activity for the specified ID.',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activitiesService.getActivityById(id);
  }

  // Endpoint para actualizar los campos permitidos de una actividad individual
  @Patch(':id/update')
  async updateIndividualActivity(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.updateIndividualActivity(
      id,
      updateActivityDto,
    );
  }

  @ApiOperation({ summary: 'Update activity type and pending activities' })
  @ApiBody({ type: UpdateActivityTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Activity type and pending activities updated successfully.',
  })
  @Patch(':activityTypeId/updatePendingActivities')
  async updateActivityTypeAndPendingActivities(
    @Param('activityTypeId') activityTypeId: string,
    @Body() updateActivityTypeDto: UpdateActivityTypeDto,
  ) {
    return this.activitiesService.updateActivityTypeAndPendingActivities(
      activityTypeId,
      updateActivityTypeDto,
    );
  }

  // Aquí agregamos el nuevo endpoint para iniciar la actividad y pasamos el userId
  @ApiOperation({ summary: 'Start an activity' })
  @ApiResponse({ status: 200, description: 'Activity started successfully.' })
  @Post(':id/start')
  async startActivity(
    @Param('id') id: string,
    @Query('userId') userId: string, // Pasamos el userId
  ) {
    return this.activitiesService.startActivity(id, userId);
  }

  // Completar una actividad
  @ApiOperation({ summary: 'Complete an activity' })
  @ApiBody({ type: CompleteActivityDto })
  @ApiResponse({ status: 200, description: 'Activity completed successfully.' })
  @Post(':id/complete')
  async complete(
    @Param('id') id: string,
    @Body() completeActivityDto: CompleteActivityDto,
    @Query('userId') userId: string, // Pasamos el userId
  ) {
    return this.activitiesService.completeActivity(
      id,
      completeActivityDto,
      userId,
    );
  }
  // Eliminar una actividad
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully.' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.activitiesService.deleteActivity(id);
  }
}
