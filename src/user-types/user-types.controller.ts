import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UserTypesService } from './user-types.service';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('User Types')
@Controller('userTypes')
export class UserTypesController {
  constructor(private readonly userTypesService: UserTypesService) {}

  // Crear un nuevo tipo de usuario
  @ApiOperation({ summary: 'Create a new user type' })
  @ApiResponse({ status: 201, description: 'User type created successfully' })
  @ApiBody({ type: CreateUserTypeDto })
  @Post()
  async create(@Body() createUserTypeDto: { name: string }) {
    return this.userTypesService.createUserType(createUserTypeDto);
  }

  // Obtener todos los tipos de usuario
  @ApiOperation({ summary: 'Retrieve all user types' })
  @ApiResponse({ status: 200, description: 'List of user types' })
  @Get()
  async findAll() {
    return this.userTypesService.getAllUserTypes();
  }

  // Eliminar un tipo de usuario
  @ApiOperation({ summary: 'Delete a user type by ID' })
  @ApiResponse({ status: 200, description: 'User type deleted successfully' })
  @ApiParam({ name: 'id', description: 'ID of the user type to delete' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userTypesService.deleteUserType(id);
  }
}
