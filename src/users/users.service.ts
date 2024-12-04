import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BranchOffice } from '../branch-offices/branch-office.entity';
import { UserType } from '../user-types/user-type.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserType)
    private readonly userTypeRepository: Repository<UserType>,
    @InjectRepository(BranchOffice)
    private readonly branchOfficeRepository: Repository<BranchOffice>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { userTypeId, branchOfficeId } = createUserDto;

    // Verificar si el userType existe
    const userType = await this.userTypeRepository.findOne({
      where: { id: userTypeId },
    });
    if (!userType) {
      throw new NotFoundException('User type not found');
    }

    // Verificar si la oficina de la sucursal existe
    const branchOffice = await this.branchOfficeRepository.findOne({
      where: { id: branchOfficeId },
    });

    if (!branchOffice) {
      throw new NotFoundException('Branch office not found');
    }

    // Crear el usuario con los DTO y las relaciones necesarias
    const user = this.userRepository.create({
      ...createUserDto,
      userType,
      branchOffice,
    });

    return this.userRepository.save(user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Buscar al usuario por su ID (que ahora es un number)
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userType', 'branchOffice'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { userTypeId, branchOfficeId } = updateUserDto;

    // Actualizar userType si se proporciona
    if (userTypeId) {
      const userType = await this.userTypeRepository.findOne({
        where: { id: userTypeId },
      });
      if (!userType) {
        throw new NotFoundException(
          `User type with ID ${userTypeId} not found`,
        );
      }
      user.userType = userType;
    }

    // Actualizar branchOffice si se proporciona
    if (branchOfficeId) {
      const branchOffice = await this.branchOfficeRepository.findOne({
        where: { id: branchOfficeId },
      });
      if (!branchOffice) {
        throw new NotFoundException(
          `Branch office with ID ${branchOfficeId} not found`,
        );
      }
      user.branchOffice = branchOffice;
    }

    // Asignar los valores del DTO a la entidad de usuario
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    // Eliminar usuario por ID
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    // Obtener todos los usuarios con sus relaciones
    return this.userRepository.find({
      relations: ['userType', 'branchOffice'],
    });
  }

  async getUserById(id: number): Promise<User> {
    // Obtener un usuario por su ID con las relaciones
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userType', 'branchOffice'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
