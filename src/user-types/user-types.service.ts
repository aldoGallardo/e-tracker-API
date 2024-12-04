import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from './user-type.entity';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';

@Injectable()
export class UserTypesService {
  constructor(
    @InjectRepository(UserType)
    private userTypeRepository: Repository<UserType>,
  ) {}

  // Crear un nuevo tipo de usuario
  async create(createUserTypeDto: CreateUserTypeDto): Promise<UserType> {
    const userType = this.userTypeRepository.create(createUserTypeDto);
    return this.userTypeRepository.save(userType);
  }

  // Obtener todos los tipos de usuario
  async findAll(): Promise<UserType[]> {
    return this.userTypeRepository.find({ relations: ['users'] });
  }

  // Obtener un tipo de usuario por ID
  async findOne(id: number): Promise<UserType> {
    return this.userTypeRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  // Actualizar un tipo de usuario
  async update(
    id: number,
    updateUserTypeDto: UpdateUserTypeDto,
  ): Promise<UserType> {
    const userType = await this.userTypeRepository.findOne({ where: { id } });
    if (!userType) {
      throw new Error('UserType not found');
    }
    Object.assign(userType, updateUserTypeDto);
    return this.userTypeRepository.save(userType);
  }

  // Eliminar un tipo de usuario
  async remove(id: number): Promise<void> {
    const userType = await this.userTypeRepository.findOne({ where: { id } });
    await this.userTypeRepository.remove(userType);
  }
}
