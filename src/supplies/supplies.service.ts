import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { Subject } from 'rxjs';
import { Supply } from './supply.entity';

@Injectable()
export class SuppliesService {
  constructor(
    @InjectRepository(Supply)
    private readonly supplyRepository: Repository<Supply>,
  ) {}

  private suppliesChange$ = new Subject<any[]>();

  async createSupply(createSupplyDto: CreateSupplyDto): Promise<Supply> {
    const existingSupply = await this.supplyRepository.findOne({
      where: { name: createSupplyDto.name },
    });
    if (existingSupply) {
      throw new BadRequestException('A supply with this name already exists');
    }
    const supply = this.supplyRepository.create(createSupplyDto);
    return await this.supplyRepository.save(supply);
  }

  async getAllSupplies(): Promise<Supply[]> {
    return await this.supplyRepository.find({
      relations: ['activityTypeSupplies', 'assignedSupplies'],
    });
  }

  async getSupplyById(id: number): Promise<Supply> {
    const supply = await this.supplyRepository.findOne({
      where: { id },
      relations: ['activityTypeSupplies', 'assignedSupplies'],
    });

    if (!supply) {
      throw new NotFoundException(`Supply with ID ${id} not found`);
    }

    return supply;
  }

  async updateSupply(
    id: number,
    updateSupplyDto: UpdateSupplyDto,
  ): Promise<Supply> {
    const supply = await this.getSupplyById(id); // Validar existencia
    Object.assign(supply, updateSupplyDto); // Actualizar datos
    return await this.supplyRepository.save(supply);
  }

  async deleteSupply(id: number): Promise<void> {
    const supply = await this.getSupplyById(id); // Validar existencia

    // Verificar si hay relaciones activas
    if (
      supply.activityTypeSupplies.length > 0 ||
      supply.assignedSupplies.length > 0
    ) {
      throw new BadRequestException(
        `Cannot delete supply with active relationships`,
      );
    }

    await this.supplyRepository.delete(id);
  }
}
