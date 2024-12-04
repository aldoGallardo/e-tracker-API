import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Objective } from './objective.entity';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { Dimension } from 'src/dimensions/dimension.entity';

@Injectable()
export class ObjectivesService {
  constructor(
    @InjectRepository(Objective)
    private readonly objectiveRepository: Repository<Objective>,
    @InjectRepository(Dimension)
    private readonly dimensionRepository: Repository<Dimension>,
  ) {}

  async createObjective(
    createObjectiveDto: CreateObjectiveDto,
  ): Promise<Objective> {
    const { dimensionId, action } = createObjectiveDto;

    // Verificar si la dimensión existe
    const dimension = await this.dimensionRepository.findOne({
      where: { id: dimensionId },
    });
    if (!dimension) {
      throw new NotFoundException(`Dimension with ID ${dimensionId} not found`);
    }

    const objective = this.objectiveRepository.create({
      action,
      dimension,
    });

    return this.objectiveRepository.save(objective);
  }

  async getAllObjectives(): Promise<Objective[]> {
    return this.objectiveRepository.find({
      relations: ['keyResults', 'dimension'], // Incluye relaciones
    });
  }

  async getObjectiveById(id: number): Promise<Objective> {
    const objective = await this.objectiveRepository.findOne({
      where: { id },
      relations: ['keyResults', 'dimension'],
    });
    if (!objective) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }
    return objective;
  }

  async updateObjective(
    id: number,
    updateObjectiveDto: UpdateObjectiveDto,
  ): Promise<Objective> {
    const objective = await this.getObjectiveById(id);
    const { dimensionId, action } = updateObjectiveDto;

    // Actualizar dimensión si se proporciona
    if (dimensionId) {
      const dimension = await this.dimensionRepository.findOne({
        where: { id: dimensionId },
      });
      if (!dimension) {
        throw new NotFoundException(
          `Dimension with ID ${dimensionId} not found`,
        );
      }
      objective.dimension = dimension;
    }

    // Actualizar acción
    if (action) {
      objective.action = action;
    }

    return this.objectiveRepository.save(objective);
  }

  async deleteObjective(id: number): Promise<void> {
    const result = await this.objectiveRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Objective with ID ${id} not found`);
    }
  }
}
