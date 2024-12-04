import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { AssignedSupply } from './assigned-supply.entity';
import { CreateAssignedSupplyDto } from './dto/create-assigned-supply.dto';
import { UpdateAssignedSupplyDto } from './dto/update-assigned-supply.dto';
import { Assignment } from '../assignments/assignment.entity';
import { Supply } from '../supplies/supply.entity';

@Injectable()
export class AssignedSuppliesService {
  constructor(
    @InjectRepository(AssignedSupply)
    private readonly assignedSupplyRepository: Repository<AssignedSupply>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Supply)
    private readonly supplyRepository: Repository<Supply>,
  ) {}

  private assignedSuppliesChanges$ = new Subject<AssignedSupply[]>();

  async createAssignedSupply(
    createDto: CreateAssignedSupplyDto,
  ): Promise<AssignedSupply> {
    const { assignmentId, supplyId, quantityUsed } = createDto;

    // Validar existencia de Assignment
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`,
      );
    }

    // Validar existencia de Supply
    const supply = await this.supplyRepository.findOne({
      where: { id: supplyId },
    });
    if (!supply) {
      throw new NotFoundException(`Supply with ID ${supplyId} not found`);
    }

    // Verificar duplicados
    const existingRecord = await this.assignedSupplyRepository.findOne({
      where: { assignment, supply },
    });
    if (existingRecord) {
      throw new ConflictException(
        'This supply is already assigned to this assignment',
      );
    }

    const assignedSupply = this.assignedSupplyRepository.create({
      assignment,
      supply,
      quantityUsed,
    });

    return await this.assignedSupplyRepository.save(assignedSupply);
  }

  async getAllAssignedSupplies(): Promise<AssignedSupply[]> {
    return await this.assignedSupplyRepository.find({
      relations: ['assignment', 'supply'],
    });
  }

  async getAssignedSupplyById(id: number): Promise<AssignedSupply> {
    const assignedSupply = await this.assignedSupplyRepository.findOne({
      where: { id },
      relations: ['assignment', 'supply'],
    });

    if (!assignedSupply) {
      throw new NotFoundException(`AssignedSupply with ID ${id} not found`);
    }

    return assignedSupply;
  }

  async updateAssignedSupply(
    id: number,
    updateDto: UpdateAssignedSupplyDto,
  ): Promise<AssignedSupply> {
    const assignedSupply = await this.getAssignedSupplyById(id);

    const { assignmentId, supplyId, quantityUsed } = updateDto;

    if (assignmentId) {
      const assignment = await this.assignmentRepository.findOne({
        where: { id: assignmentId },
      });
      if (!assignment) {
        throw new NotFoundException(
          `Assignment with ID ${assignmentId} not found`,
        );
      }
      assignedSupply.assignment = assignment;
    }

    if (supplyId) {
      const supply = await this.supplyRepository.findOne({
        where: { id: supplyId },
      });
      if (!supply) {
        throw new NotFoundException(`Supply with ID ${supplyId} not found`);
      }
      assignedSupply.supply = supply;
    }

    if (quantityUsed !== undefined) {
      assignedSupply.quantityUsed = quantityUsed;
    }

    return await this.assignedSupplyRepository.save(assignedSupply);
  }

  async deleteAssignedSupply(id: number): Promise<void> {
    const assignedSupply = await this.getAssignedSupplyById(id);
    await this.assignedSupplyRepository.remove(assignedSupply);
  }
}
