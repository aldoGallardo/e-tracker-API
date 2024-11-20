import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  Sse,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterAssistanceDto } from './dto/register-assistance.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint para crear un nuevo usuario
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters.' })
  @ApiBody({ type: CreateUserDto })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  // Obtener el total de usuarios
  @ApiOperation({ summary: 'Get total number of users' })
  @ApiResponse({ status: 200, description: 'Total number of users retrieved.' })
  @Get('total')
  async getTotalUsers() {
    const total = await this.usersService.getTotalUsers();
    return { total };
  }

  // Obtener todos los usuarios con paginación y filtros opcionales
  @ApiOperation({
    summary: 'Get all users with optional pagination and filters',
  })
  @ApiResponse({ status: 200, description: 'Users list retrieved.' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by user name',
  })
  @ApiQuery({
    name: 'userType',
    required: false,
    description: 'Filter by user type',
  })
  @ApiQuery({
    name: 'branchOffice',
    required: false,
    description: 'Filter by branch office ID',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of users per page',
    example: 10,
  })
  @ApiQuery({
    name: 'startAfterUserNumber',
    required: false,
    description: 'Pagination start after user number',
  })
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('userType') userType?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('pageSize') pageSize?: number, // Tamaño de la página
    @Query('startAfterUserNumber') startAfterUserNumber?: number, // Paginación por userNumber
  ) {
    const size = pageSize || 10; // Si no se pasa pageSize, usa 10 como valor por defecto
    return this.usersService.getAllUsers(
      name,
      userType,
      branchOffice,
      size, // Usamos el valor calculado de pageSize
      startAfterUserNumber ? Number(startAfterUserNumber) : undefined, // Convertir a número
    );
  }

  // Obtener todos los usuarios con paginación y filtros opcionales, ignorando el campo dailyAssistance
  @ApiOperation({ summary: 'Get all users excluding daily assistance' })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved without daily assistance.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by user name',
  })
  @ApiQuery({
    name: 'userType',
    required: false,
    description: 'Filter by user type',
  })
  @ApiQuery({
    name: 'branchOffice',
    required: false,
    description: 'Filter by branch office ID',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of users per page',
    example: 10,
  })
  @ApiQuery({
    name: 'startAfterUserNumber',
    required: false,
    description: 'Pagination start after user number',
  })
  @Get('without-daily-assistance')
  async findAllWithoutDailyAssistance(
    @Query('name') name?: string,
    @Query('userType') userType?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('pageSize') pageSize?: number, // Tamaño de la página
    @Query('startAfterUserNumber') startAfterUserNumber?: number, // Paginación por userNumber
  ) {
    const size = pageSize || 10; // Si no se pasa pageSize, usa 10 como valor por defecto
    return this.usersService.getAllUsersWithoutDailyAssistance(
      name,
      userType,
      branchOffice,
      size, // Usamos el valor calculado de pageSize
      startAfterUserNumber ? Number(startAfterUserNumber) : undefined, // Convertir a número
    );
  }

  // Obtener un usuario específico por ID
  @ApiOperation({ summary: 'Retrieve a specific user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  // Endpoint para actualizar la asistencia del usuario
  @ApiOperation({ summary: 'Update user assistance' })
  @ApiResponse({ status: 200, description: 'Assistance updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: RegisterAssistanceDto })
  @Patch(':id/assistance')
  async updateAssistance(
    @Param('id') userId: string,
    @Body() registerAssistanceDto: RegisterAssistanceDto,
  ) {
    return this.usersService.updateAssistance(userId, registerAssistanceDto);
  }

  // Actualizar un usuario específico
  @ApiOperation({ summary: 'Update a specific user' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return this.usersService.updateUser(id, updateData);
  }

  // Eliminar un usuario
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // Endpoint para obtener cambios en tiempo real (Server-Sent Events - SSE)
  @ApiOperation({ summary: 'Get real-time user changes (SSE)' })
  @ApiResponse({
    status: 200,
    description: 'SSE connection established for real-time user changes.',
  })
  @Sse('changes')
  getUserChanges(): Observable<any> {
    return this.usersService
      .getUserChanges()
      .pipe(map((users) => ({ data: users })));
  }
}
