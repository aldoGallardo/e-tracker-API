import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { User } from '../users/user.entity';
import { ActivityType } from '../activity-types/activity-type.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ActivityType)
    private readonly activityTypeRepository: Repository<ActivityType>,
  ) {}

  async createAssignment(
    createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    const { assignToId, assignFromId, activityTypeId } = createAssignmentDto;

    const assignTo = await this.userRepository.findOne({
      where: { id: assignToId },
    });
    const assignFrom = await this.userRepository.findOne({
      where: { id: assignFromId },
    });
    const activityType = await this.activityTypeRepository.findOne({
      where: { id: activityTypeId },
    });

    if (!assignTo || !assignFrom || !activityType) {
      throw new NotFoundException('Invalid user or activity type ID');
    }

    const assignment = this.assignmentRepository.create({
      ...createAssignmentDto,
      assignTo,
      assignFrom,
      activityType,
      createdAt: new Date(),
    });

    return this.assignmentRepository.save(assignment);
  }

  async updateAssignment(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['assignTo', 'assignFrom', 'activityType'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    const { assignToId, assignFromId, activityTypeId } = updateAssignmentDto;

    if (assignToId) {
      const assignTo = await this.userRepository.findOne({
        where: { id: assignToId },
      });
      if (!assignTo) {
        throw new NotFoundException(`User with ID ${assignToId} not found`);
      }
      assignment.assignTo = assignTo;
    }

    if (assignFromId) {
      const assignFrom = await this.userRepository.findOne({
        where: { id: assignFromId },
      });
      if (!assignFrom) {
        throw new NotFoundException(`User with ID ${assignFromId} not found`);
      }
      assignment.assignFrom = assignFrom;
    }

    if (activityTypeId) {
      const activityType = await this.activityTypeRepository.findOne({
        where: { id: assignFromId },
      });
      if (!activityType) {
        throw new NotFoundException(
          `Activity Type with ID ${activityTypeId} not found`,
        );
      }
      assignment.activityType = activityType;
    }

    Object.assign(assignment, updateAssignmentDto);
    return this.assignmentRepository.save(assignment);
  }

  async deleteAssignment(id: number): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    await this.assignmentRepository.delete(id);
  }

  async getAllAssignments(): Promise<Assignment[]> {
    return this.assignmentRepository.find({
      relations: ['assignTo', 'assignFrom', 'activityType', 'assignedSupplies'],
    });
  }

  async getAssignmentById(id: number): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['assignTo', 'assignFrom', 'activityType', 'assignedSupplies'],
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }
}
