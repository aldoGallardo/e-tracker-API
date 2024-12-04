import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  async create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.createAssignment(createAssignmentDto);
  }

  @Get()
  async findAll() {
    return this.assignmentsService.getAllAssignments();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assignmentsService.getAssignmentById(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.updateAssignment(id, updateAssignmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.assignmentsService.deleteAssignment(+id);
  }
}
