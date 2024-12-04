import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { DimensionsService } from './dimensions.service';
import { CreateDimensionDto } from './dto/create-dimension.dto';
import { UpdateDimensionDto } from './dto/update-dimension.dto';
import { Dimension } from './dimension.entity';

@Controller('dimensions')
export class DimensionsController {
  constructor(private readonly dimensionsService: DimensionsService) {}

  @Post()
  createDimension(
    @Body() createDimensionDto: CreateDimensionDto,
  ): Promise<Dimension> {
    return this.dimensionsService.createDimension(createDimensionDto);
  }

  @Get()
  getAllDimensions(): Promise<Dimension[]> {
    return this.dimensionsService.getAllDimensions();
  }

  @Get(':id')
  getDimensionById(@Param('id') id: number): Promise<Dimension> {
    return this.dimensionsService.getDimensionById(id);
  }

  @Patch(':id')
  updateDimension(
    @Param('id') id: number,
    @Body() updateDimensionDto: UpdateDimensionDto,
  ): Promise<Dimension> {
    return this.dimensionsService.updateDimension(id, updateDimensionDto);
  }

  @Delete(':id')
  deleteDimension(@Param('id') id: number): Promise<void> {
    return this.dimensionsService.deleteDimension(id);
  }
}
