import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { AssignmentDetailsService } from './assignment-details.service';
import { CreateAssignmentDetailDto } from './dto/create-assignment-detail.dto';
import { UpdateAssignmentDetailDto } from './dto/update-assignment-detail.dto';
import { AssignmentDetail } from './assignment-detail.entity';

@Controller('assignment-details')
export class AssignmentDetailsController {
  constructor(
    private readonly assignmentDetailService: AssignmentDetailsService,
  ) {}

  @Post()
  async create(
    @Body() createAssignmentDetailDto: CreateAssignmentDetailDto,
  ): Promise<AssignmentDetail> {
    return this.assignmentDetailService.create(createAssignmentDetailDto);
  }

  @Get()
  async findAll(): Promise<AssignmentDetail[]> {
    return this.assignmentDetailService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<AssignmentDetail> {
    return this.assignmentDetailService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateAssignmentDetailDto: UpdateAssignmentDetailDto,
  ): Promise<AssignmentDetail> {
    return this.assignmentDetailService.update(id, updateAssignmentDetailDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.assignmentDetailService.remove(id);
  }
}
