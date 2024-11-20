import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Sse,
  Query,
} from '@nestjs/common';
import { BranchOfficesService } from './branch-offices.service';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Branch Offices')
@Controller('branchOffices')
export class BranchOfficesController {
  constructor(private readonly branchOfficesService: BranchOfficesService) {}

  // Crear una sucursal
  @ApiOperation({ summary: 'Create a new branch office' })
  @ApiResponse({
    status: 201,
    description: 'Branch office created successfully',
  })
  @ApiBody({ type: CreateBranchOfficeDto })
  @Post()
  async create(@Body() createBranchOfficeDto: CreateBranchOfficeDto) {
    return this.branchOfficesService.createBranchOffice(
      createBranchOfficeDto.name,
      createBranchOfficeDto.location,
    );
  }

  // Obtener el total de sucursales
  @ApiOperation({ summary: 'Get total number of branch offices' })
  @ApiResponse({ status: 200, description: 'Total count of branch offices' })
  @Get('total')
  async getTotalBranchOffices() {
    const total = await this.branchOfficesService.getTotalBranchOffices();
    return { total };
  }

  // Obtener todas las sucursales con paginación
  @ApiOperation({ summary: 'Get all branch offices with pagination' })
  @ApiResponse({ status: 200, description: 'List of branch offices' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of branch offices per page',
    example: 10,
  })
  @ApiQuery({
    name: 'startAfterBranchOfficeNumber',
    required: false,
    description: 'Starting branch office number for pagination',
    example: 1,
  })
  @Get()
  async findAll(
    @Query('pageSize') pageSize?: number,
    @Query('startAfterBranchOfficeNumber')
    startAfterBranchOfficeNumber?: number,
  ) {
    const size = pageSize || 10; // Valor por defecto de 10
    return this.branchOfficesService.getAllBranchOffices(
      size,
      startAfterBranchOfficeNumber
        ? Number(startAfterBranchOfficeNumber)
        : undefined, // Convertimos a número
    );
  }

  // Obtener una sucursal por ID
  @ApiOperation({ summary: 'Get branch office by ID' })
  @ApiResponse({ status: 200, description: 'Branch office data' })
  @ApiParam({ name: 'id', description: 'ID of the branch office' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.branchOfficesService.getBranchOfficeById(id);
  }

  // Actualizar una sucursal
  @ApiOperation({ summary: 'Update an existing branch office' })
  @ApiResponse({
    status: 200,
    description: 'Branch office updated successfully',
  })
  @ApiParam({ name: 'id', description: 'ID of the branch office' })
  @ApiBody({ type: UpdateBranchOfficeDto })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBranchOfficeDto: UpdateBranchOfficeDto,
  ) {
    return this.branchOfficesService.updateBranchOffice(
      id,
      updateBranchOfficeDto.name,
      updateBranchOfficeDto.location,
    );
  }

  // Eliminar una sucursal
  @ApiOperation({ summary: 'Delete a branch office' })
  @ApiResponse({
    status: 200,
    description: 'Branch office deleted successfully',
  })
  @ApiParam({ name: 'id', description: 'ID of the branch office' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.branchOfficesService.deleteBranchOffice(id);
  }

  // Obtener cambios en tiempo real de las sucursales
  @ApiOperation({ summary: 'Get real-time changes for branch offices' })
  @ApiResponse({
    status: 200,
    description: 'Real-time updates for branch offices',
  })
  @Sse('changes')
  getBranchOfficeChanges(): Observable<any> {
    return this.branchOfficesService
      .getBranchOfficeChanges()
      .pipe(map((branchOffices) => ({ data: branchOffices })));
  }
}
