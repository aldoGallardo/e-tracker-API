import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dimension } from './dimension.entity';
import { CreateDimensionDto } from './dto/create-dimension.dto';
import { UpdateDimensionDto } from './dto/update-dimension.dto';

@Injectable()
export class DimensionsService {
  constructor(
    @InjectRepository(Dimension)
    private readonly dimensionRepository: Repository<Dimension>,
  ) {}

  async createDimension(
    createDimensionDto: CreateDimensionDto,
  ): Promise<Dimension> {
    const dimension = this.dimensionRepository.create(createDimensionDto);
    return this.dimensionRepository.save(dimension);
  }

  async getAllDimensions(): Promise<Dimension[]> {
    return this.dimensionRepository.find({
      relations: ['objectives', 'keyResults'], // Relacionamos con las entidades relacionadas
    });
  }

  async getDimensionById(id: number): Promise<Dimension> {
    const dimension = await this.dimensionRepository.findOne({
      where: { id },
      relations: ['objectives', 'keyResults'],
    });
    if (!dimension) {
      throw new NotFoundException(`Dimension with ID ${id} not found`);
    }
    return dimension;
  }

  async updateDimension(
    id: number,
    updateDimensionDto: UpdateDimensionDto,
  ): Promise<Dimension> {
    const dimension = await this.getDimensionById(id);

    if (updateDimensionDto.name) {
      dimension.name = updateDimensionDto.name;
    }

    return this.dimensionRepository.save(dimension);
  }

  async deleteDimension(id: number): Promise<void> {
    const result = await this.dimensionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Dimension with ID ${id} not found`);
    }
  }
}
