import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentDetail } from './assignment-detail.entity';
import { CreateAssignmentDetailDto } from './dto/create-assignment-detail.dto';
import { UpdateAssignmentDetailDto } from './dto/update-assignment-detail.dto';
import { Assignment } from '../assignments/assignment.entity';
import { KeyResult } from '../key-results/key-result.entity';

@Injectable()
export class AssignmentDetailsService {
  constructor(
    @InjectRepository(AssignmentDetail)
    private readonly assignmentDetailRepository: Repository<AssignmentDetail>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(KeyResult)
    private readonly keyResultRepository: Repository<KeyResult>,
  ) {}

  // Crear un nuevo detalle de asignación
  async create(
    createAssignmentDetailDto: CreateAssignmentDetailDto,
  ): Promise<AssignmentDetail> {
    const { keyResultId, assignmentId, ...data } = createAssignmentDetailDto;

    const keyResult = await this.keyResultRepository.findOne({
      where: { id: keyResultId },
    });
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });

    const assignmentDetail = this.assignmentDetailRepository.create({
      ...data,
      keyResult,
      assignment,
    });

    return this.assignmentDetailRepository.save(assignmentDetail);
  }

  // Obtener todos los detalles de asignación
  async findAll(): Promise<AssignmentDetail[]> {
    return this.assignmentDetailRepository.find({
      relations: ['keyResult', 'assignment'],
    });
  }

  // Obtener un detalle de asignación por ID
  async findOne(id: number): Promise<AssignmentDetail> {
    return this.assignmentDetailRepository.findOne({
      where: { id },
      relations: ['keyResult', 'assignment'],
    });
  }

  // Actualizar un detalle de asignación
  async update(
    id: number,
    updateAssignmentDetailDto: UpdateAssignmentDetailDto,
  ): Promise<AssignmentDetail> {
    await this.findOne(id); // Verificar si el detalle existe

    await this.assignmentDetailRepository.update(id, updateAssignmentDetailDto);
    return this.findOne(id);
  }

  // Eliminar un detalle de asignación
  async remove(id: number): Promise<void> {
    await this.assignmentDetailRepository.delete(id);
  }
}
