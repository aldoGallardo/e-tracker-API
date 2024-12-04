import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { AssignedSuppliesService } from './assigned-supplies.service';
import { CreateAssignedSupplyDto } from './dto/create-assigned-supply.dto';
import { UpdateAssignedSupplyDto } from './dto/update-assigned-supply.dto';

@Controller('assigned-supplies')
export class AssignedSuppliesController {
  constructor(
    private readonly assignedSuppliesService: AssignedSuppliesService,
  ) {}

  @Post()
  async create(@Body() createDto: CreateAssignedSupplyDto) {
    return this.assignedSuppliesService.createAssignedSupply(createDto);
  }

  @Get()
  async findAll() {
    return this.assignedSuppliesService.getAllAssignedSupplies();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.assignedSuppliesService.getAssignedSupplyById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateAssignedSupplyDto,
  ) {
    return this.assignedSuppliesService.updateAssignedSupply(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.assignedSuppliesService.deleteAssignedSupply(id);
  }
}
