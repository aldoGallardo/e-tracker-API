import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { ActivityType } from './activity-type.entity';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';

@Injectable()
export class ActivityTypesService {
  constructor(
    @InjectRepository(ActivityType)
    private readonly activityTypeRepository: Repository<ActivityType>,
  ) {}

  private activityTypeChanges$ = new Subject<ActivityType[]>();

  async createActivityType(
    createActivityTypeDto: CreateActivityTypeDto,
  ): Promise<ActivityType> {
    const existingActivityType = await this.activityTypeRepository.findOne({
      where: { name: createActivityTypeDto.name },
    });
    if (existingActivityType) {
      throw new ConflictException(
        'A activity type with this name already exists',
      );
    }

    if (
      createActivityTypeDto.regular &&
      createActivityTypeDto.estimate === undefined
    ) {
      throw new BadRequestException(
        'Estimate is required for regular activities',
      );
    }

    const activityType = this.activityTypeRepository.create(
      createActivityTypeDto,
    );
    return await this.activityTypeRepository.save(activityType);
  }

  async getAllActivityTypes(): Promise<ActivityType[]> {
    return await this.activityTypeRepository.find({
      relations: ['activityTypeSupplies', 'assignments'],
    });
  }

  async getActivityTypeById(id: number): Promise<ActivityType> {
    const activityType = await this.activityTypeRepository.findOne({
      where: { id },
      relations: ['activityTypeSupplies', 'assignments'],
    });

    if (!activityType) {
      throw new NotFoundException(`ActivityType with ID ${id} not found`);
    }

    return activityType;
  }

  async updateActivityType(
    id: number,
    updateActivityTypeDto: UpdateActivityTypeDto,
  ): Promise<ActivityType> {
    const activityType = await this.getActivityTypeById(id);
    if (!activityType) {
      throw new NotFoundException(`ActivityType with ID ${id} not found`);
    }

    if (
      updateActivityTypeDto.name &&
      updateActivityTypeDto.name !== activityType.name
    ) {
      const existingActivityType = await this.activityTypeRepository.findOne({
        where: { name: updateActivityTypeDto.name },
      });
      if (existingActivityType) {
        throw new ConflictException(
          'A activity type with this name already exists',
        );
      }
    }

    // Verificar si estimate es requerido y válido
    if (updateActivityTypeDto.estimate !== undefined) {
      if (typeof updateActivityTypeDto.estimate !== 'number') {
        throw new BadRequestException('Estimate must be a valid number');
      }
      if (updateActivityTypeDto.regular === false) {
        throw new BadRequestException(
          'Cannot assign estimate if regular is false',
        );
      }
      // Asignar regular como true si se proporciona estimate
      updateActivityTypeDto.regular = true;
    }

    // Asegurarse de que estimate sea nulo si regular es falso
    if (updateActivityTypeDto.regular === false) {
      updateActivityTypeDto.estimate = null;
    }

    Object.assign(activityType, updateActivityTypeDto);
    return await this.activityTypeRepository.save(activityType);
  }

  async deleteActivityType(id: number): Promise<void> {
    const activityType = await this.getActivityTypeById(id); // Validar existencia

    // Verificar si hay relaciones activas
    if (
      activityType.activityTypeSupplies.length > 0 ||
      activityType.assignments.length > 0
    ) {
      throw new BadRequestException(
        `Cannot delete ActivityType with active relationships`,
      );
    }

    await this.activityTypeRepository.delete(id);
  }
}
