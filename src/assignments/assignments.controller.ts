import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  NotFoundException,
  BadRequestException,
  Sse,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { map } from 'rxjs/operators';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  // Crear una nueva asignación
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiBody({ type: CreateAssignmentDto })
  @ApiResponse({ status: 201, description: 'Assignment created successfully' })
  @Post()
  async createAssignment(@Body() createAssignmentDto: CreateAssignmentDto) {
    try {
      return await this.assignmentsService.createAssignment(
        createAssignmentDto,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Obtener el total de asignaciones
  @ApiOperation({ summary: 'Get total count of assignments' })
  @ApiResponse({ status: 200, description: 'Total count of assignments' })
  @Get('total')
  async getTotalAssignments() {
    const total = await this.assignmentsService.getTotalAssignments();
    return { total };
  }

  // Obtener todas las asignaciones con paginación
  @ApiOperation({ summary: 'Get all assignments with pagination' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    example: 10,
    description: 'Number of assignments per page',
  })
  @ApiQuery({
    name: 'startAfterAssignmentNumber',
    required: false,
    example: 5,
    description: 'Pagination cursor',
  })
  @ApiResponse({ status: 200, description: 'List of assignments' })
  @Get()
  async getAllAssignments(
    @Query('pageSize') pageSize?: number,
    @Query('startAfterAssignmentNumber') startAfterAssignmentNumber?: number,
  ) {
    try {
      return await this.assignmentsService.getAllAssignments(
        pageSize || 10,
        startAfterAssignmentNumber,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Obtener asignaciones filtradas por branchOffice y otras opciones
  @ApiOperation({
    summary: 'Get assignments by branch office with optional filters',
  })
  @ApiParam({ name: 'id', description: 'Branch office ID' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of assignments by branch office',
  })
  @Get('branchOffice/:id')
  async getAssignmentsByBranchOffice(
    @Param('id') branchOfficeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    try {
      return await this.assignmentsService.getAllAssignmentsByBranchOffice(
        branchOfficeId,
        startDate,
        endDate,
        userId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  // Obtener asignaciones filtradas por diversos criterios
  @ApiOperation({ summary: 'Get assignments by various filters' })
  @ApiParam({ name: 'identifier', description: 'Identifier for filter type' })
  @ApiQuery({
    name: 'isGlobal',
    required: false,
    description: 'Filter for global assignments',
  })
  @ApiQuery({
    name: 'isBranch',
    required: false,
    description: 'Filter for branch assignments',
  })
  @ApiQuery({
    name: 'isUser',
    required: false,
    description: 'Filter for user assignments',
  })
  @ApiQuery({
    name: 'isAssignment',
    required: false,
    description: 'Filter for specific assignments',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date',
  })
  @ApiResponse({
    status: 200,
    description: 'List of assignments based on filters',
  })
  @Get(':identifier')
  async getAssignmentsByFilters(
    @Param('identifier') identifier: string,
    @Query('isGlobal') isGlobal?: boolean,
    @Query('isBranch') isBranch?: boolean,
    @Query('isUser') isUser?: boolean,
    @Query('isAssignment') isAssignment?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      return await this.assignmentsService.getAllAssignmentsByFilters(
        identifier,
        isGlobal,
        isBranch,
        isUser,
        isAssignment,
        start,
        end,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Obtener una asignación por ID
  @ApiOperation({ summary: 'Retrieve a specific assignment by ID' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Details of the assignment' })
  @Get(':id')
  async getAssignmentById(@Param('id') id: string) {
    try {
      return await this.assignmentsService.getAssignmentById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  // Actualizar una asignación
  @ApiOperation({ summary: 'Update an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiBody({ type: UpdateAssignmentDto })
  @ApiResponse({ status: 200, description: 'Assignment updated successfully' })
  @Patch(':id')
  async updateAssignment(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    try {
      return await this.assignmentsService.updateAssignment(
        id,
        updateAssignmentDto,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Relanzar los errores conocidos para ser manejados por NestJS automáticamente
      }
      // Cualquier otro tipo de error será respondido como un error genérico
      throw new BadRequestException(
        'Error updating assignment: ' + error.message,
      );
    }
  }

  // Eliminar una asignación
  @ApiOperation({ summary: 'Delete an assignment by ID' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiResponse({ status: 200, description: 'Assignment deleted successfully' })
  @Delete(':id')
  async deleteAssignment(@Param('id') id: string) {
    try {
      return await this.assignmentsService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  // Obtener los cambios en tiempo real de las asignaciones
  @ApiOperation({
    summary: 'Get real-time changes in assignments (Server-Sent Events)',
  })
  @ApiResponse({ status: 200, description: 'Stream of assignment changes' })
  @Sse('changes')
  getAssignmentChanges() {
    return this.assignmentsService
      .getAssignmentChanges()
      .pipe(map((assignments) => ({ data: assignments })));
  }
}
