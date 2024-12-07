import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyResult } from './key-result.entity';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { Objective } from '../objectives/objective.entity';
import { Dimension } from '../dimensions/dimension.entity';

@Injectable()
export class KeyResultsService {
  constructor(
    @InjectRepository(KeyResult)
    private readonly keyResultRepository: Repository<KeyResult>,

    @InjectRepository(Objective)
    private readonly objectiveRepository: Repository<Objective>,

    @InjectRepository(Dimension)
    private readonly dimensionRepository: Repository<Dimension>,
  ) {}

  async createKeyResult(
    createKeyResultDto: CreateKeyResultDto,
  ): Promise<KeyResult> {
    const { method, goalValue, goalDate, objectiveId, dimensionId } =
      createKeyResultDto;

    const objective = await this.objectiveRepository.findOneBy({
      id: objectiveId,
    });
    if (!objective) {
      throw new NotFoundException(`Objective with ID ${objectiveId} not found`);
    }

    const dimension = await this.dimensionRepository.findOneBy({
      id: dimensionId,
    });
    if (!dimension) {
      throw new NotFoundException(`Dimension with ID ${dimensionId} not found`);
    }

    const keyResult = this.keyResultRepository.create({
      method,
      goalValue,
      goalDate: new Date(goalDate),
      objective,
      dimension,
    });

    return this.keyResultRepository.save(keyResult);
  }

  async getAllKeyResults(): Promise<KeyResult[]> {
    return this.keyResultRepository.find({
      relations: ['objective', 'dimension', 'assignmentDetails'],
    });
  }

  async getKeyResultById(id: number): Promise<KeyResult> {
    const keyResult = await this.keyResultRepository.findOne({
      where: { id },
      relations: ['objective', 'dimension', 'assignmentDetails'],
    });

    if (!keyResult) {
      throw new NotFoundException(`Key Result with ID ${id} not found`);
    }

    return keyResult;
  }

  async updateKeyResult(
    id: number,
    updateKeyResultDto: UpdateKeyResultDto,
  ): Promise<KeyResult> {
    const keyResult = await this.getKeyResultById(id);

    if (updateKeyResultDto.method !== undefined)
      keyResult.method = updateKeyResultDto.method;
    if (updateKeyResultDto.target !== undefined)
      keyResult.goalValue = updateKeyResultDto.target;
    if (updateKeyResultDto.date !== undefined)
      keyResult.goalDate = new Date(updateKeyResultDto.date);

    if (updateKeyResultDto.objectiveId) {
      const objective = await this.objectiveRepository.findOneBy({
        id: updateKeyResultDto.objectiveId,
      });
      if (!objective) {
        throw new NotFoundException(
          `Objective with ID ${updateKeyResultDto.objectiveId} not found`,
        );
      }
      keyResult.objective = objective;
    }

    if (updateKeyResultDto.dimensionId) {
      const dimension = await this.dimensionRepository.findOneBy({
        id: updateKeyResultDto.dimensionId,
      });
      if (!dimension) {
        throw new NotFoundException(
          `Dimension with ID ${updateKeyResultDto.dimensionId} not found`,
        );
      }
      keyResult.dimension = dimension;
    }

    return this.keyResultRepository.save(keyResult);
  }

  async deleteKeyResult(id: number): Promise<void> {
    const result = await this.keyResultRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Key Result with ID ${id} not found`);
    }
  }
}
