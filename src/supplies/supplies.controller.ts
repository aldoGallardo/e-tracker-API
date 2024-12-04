import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { Supply } from './supply.entity';

@Controller('supplies')
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Post()
  async create(@Body() createSupplyDto: CreateSupplyDto): Promise<Supply> {
    return this.suppliesService.createSupply(createSupplyDto);
  }

  @Get()
  async findAll(): Promise<Supply[]> {
    return this.suppliesService.getAllSupplies();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Supply> {
    return this.suppliesService.getSupplyById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSupplyDto: UpdateSupplyDto,
  ): Promise<Supply> {
    return this.suppliesService.updateSupply(id, updateSupplyDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.suppliesService.deleteSupply(id);
  }
}
