import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchOffice } from './branch-office.entity';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';

@Injectable()
export class BranchOfficesService {
  constructor(
    @InjectRepository(BranchOffice)
    private readonly branchOfficeRepository: Repository<BranchOffice>,
  ) {}

  async createBranchOffice(
    createBranchOfficeDto: CreateBranchOfficeDto,
  ): Promise<BranchOffice> {
    const branchOffice = this.branchOfficeRepository.create(
      createBranchOfficeDto,
    );
    return this.branchOfficeRepository.save(branchOffice);
  }

  async updateBranchOffice(
    id: number,
    updateBranchOfficeDto: UpdateBranchOfficeDto,
  ): Promise<BranchOffice> {
    const branchOffice = await this.branchOfficeRepository.findOne({
      where: { id },
    });
    if (!branchOffice) {
      throw new NotFoundException(`Branch office with ID ${id} not found`);
    }

    Object.assign(branchOffice, updateBranchOfficeDto);
    return this.branchOfficeRepository.save(branchOffice);
  }

  async deleteBranchOffice(id: number): Promise<void> {
    const branchOffice = await this.branchOfficeRepository.findOne({
      where: { id },
    });
    if (!branchOffice) {
      throw new NotFoundException(`Branch office with ID ${id} not found`);
    }

    await this.branchOfficeRepository.delete(id);
  }

  async getAllBranchOffices(): Promise<BranchOffice[]> {
    return this.branchOfficeRepository.find({ relations: ['users'] });
  }

  async getBranchOfficeById(id: number): Promise<BranchOffice> {
    const branchOffice = await this.branchOfficeRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!branchOffice) {
      throw new NotFoundException(`Branch office with ID ${id} not found`);
    }

    return branchOffice;
  }
}
