import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { BranchOfficesService } from './branch-offices.service';
import { CreateBranchOfficeDto } from './dto/create-branch-office.dto';
import { UpdateBranchOfficeDto } from './dto/update-branch-office.dto';

@Controller('branch-offices')
export class BranchOfficesController {
  constructor(private readonly branchOfficesService: BranchOfficesService) {}

  @Post()
  createBranchOffice(@Body() createBranchOfficeDto: CreateBranchOfficeDto) {
    return this.branchOfficesService.createBranchOffice(createBranchOfficeDto);
  }

  @Get()
  getAllBranchOffices() {
    return this.branchOfficesService.getAllBranchOffices();
  }

  @Get(':id')
  getBranchOfficeById(@Param('id') id: number) {
    return this.branchOfficesService.getBranchOfficeById(id);
  }

  @Patch(':id')
  updateBranchOffice(
    @Param('id') id: number,
    @Body() updateBranchOfficeDto: UpdateBranchOfficeDto,
  ) {
    return this.branchOfficesService.updateBranchOffice(
      id,
      updateBranchOfficeDto,
    );
  }

  @Delete(':id')
  deleteBranchOffice(@Param('id') id: number) {
    return this.branchOfficesService.deleteBranchOffice(id);
  }
}
