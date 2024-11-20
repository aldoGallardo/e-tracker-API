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
import { SuppliesService } from './supplies.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
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

@ApiTags('Supplies')
@Controller('supplies')
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  // Crear un supply
  @ApiOperation({ summary: 'Create a new supply' })
  @ApiBody({ type: CreateSupplyDto })
  @ApiResponse({ status: 201, description: 'Supply created successfully' })
  @Post()
  async create(@Body() createSupplyDto: CreateSupplyDto) {
    return this.suppliesService.createSupply(
      createSupplyDto.name,
      createSupplyDto.unit,
    );
  }

  // Obtener el total de supplies
  @ApiOperation({ summary: 'Get total count of supplies' })
  @ApiResponse({ status: 200, description: 'Total count of supplies' })
  @Get('total')
  async getTotalSupplies() {
    const total = await this.suppliesService.getTotalSupplies();
    return { total };
  }

  // Obtener todos los supplies con paginación
  @ApiOperation({ summary: 'Get all supplies with pagination' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    example: 10,
    description: 'Number of supplies per page',
  })
  @ApiQuery({
    name: 'startAfterSupplyNumber',
    required: false,
    example: 5,
    description: 'Pagination cursor',
  })
  @ApiResponse({ status: 200, description: 'List of supplies' })
  @Get()
  async findAll(
    @Query('pageSize') pageSize?: number,
    @Query('startAfterSupplyNumber') startAfterSupplyNumber?: number,
  ) {
    const size = pageSize || 10; // Tamaño por defecto
    return this.suppliesService.getAllSupplies(
      size,
      startAfterSupplyNumber ? Number(startAfterSupplyNumber) : undefined,
    );
  }

  // Obtener un supply por ID
  @ApiOperation({ summary: 'Get a specific supply by ID' })
  @ApiParam({ name: 'id', description: 'Supply ID' })
  @ApiResponse({ status: 200, description: 'Supply details' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.suppliesService.getSupplyById(id);
  }

  // Actualizar un supply
  @ApiOperation({ summary: 'Update a specific supply' })
  @ApiParam({ name: 'id', description: 'Supply ID' })
  @ApiBody({ type: UpdateSupplyDto })
  @ApiResponse({ status: 200, description: 'Supply updated successfully' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupplyDto: UpdateSupplyDto,
  ) {
    return this.suppliesService.updateSupply(
      id,
      updateSupplyDto.name,
      updateSupplyDto.unit,
    );
  }

  // Eliminar un supply
  @ApiOperation({ summary: 'Delete a specific supply by ID' })
  @ApiParam({ name: 'id', description: 'Supply ID' })
  @ApiResponse({ status: 200, description: 'Supply deleted successfully' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.suppliesService.deleteSupply(id);
  }

  // Obtener cambios en tiempo real
  @ApiOperation({
    summary: 'Get real-time changes in supplies (Server-Sent Events)',
  })
  @ApiResponse({ status: 200, description: 'Stream of supply changes' })
  @Sse('changes')
  getSupplyChanges(): Observable<any> {
    return this.suppliesService
      .getSupplyChanges()
      .pipe(map((supplies) => ({ data: supplies })));
  }
}
