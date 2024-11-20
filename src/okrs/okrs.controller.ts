import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OkrsService } from './okrs.service';
import { CreateOkrDto } from './dto/create-okr.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Query } from '@nestjs/common';

@ApiTags('OKRs')
@Controller('okrs')
export class OkrsController {
  constructor(private readonly okrsService: OkrsService) {}

  // @ApiOperation({ summary: 'Creation of a new OKR' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The OKR has been successfully created.',
  // })
  // @ApiResponse({ status: 400, description: 'Error while creating the OKR.' })
  // @Post('create')
  // async createOkr(@Body() createOkrDto: CreateOkrDto) {
  //   return this.okrsService.createOkr(createOkrDto);
  // }

  @ApiOperation({ summary: 'Obtain dimension by ID' })
  @ApiQuery({ name: 'id', description: 'Dimension ID' })
  @ApiResponse({ status: 200, description: 'Dimension found.' })
  @ApiResponse({ status: 404, description: 'Dimension not found.' })
  @Get('dimensions:id')
  async getDimension(@Query('id') id: string) {
    return this.okrsService.getDimension(id);
  }

  @ApiOperation({ summary: 'List of all dimensions' })
  @ApiResponse({ status: 200, description: 'List of all dimensions.' })
  @Get('dimensions')
  async getAllDimensionsWithCalculations() {
    return this.okrsService.getAllDimensionsWithCalculations();
  }

  @ApiOperation({ summary: 'Get calculations by dimension' })
  @ApiParam({ name: 'dimensionId', description: 'Dimension ID' })
  @ApiResponse({ status: 200, description: 'Calculations found.' })
  @Get('dimensions/:dimensionId/calculations')
  async getCalculationsByDimension(@Param('dimensionId') dimensionId: string) {
    return this.okrsService.getCalculationsByDimension(dimensionId);
  }

  @ApiOperation({ summary: 'Obtain OKR by ID' })
  @ApiParam({ name: 'id', description: 'OKR ID' })
  @ApiResponse({ status: 200, description: 'OKR found.' })
  @ApiResponse({ status: 404, description: 'OKR not found.' })
  @Get(':id')
  async getOkrById(@Param('id') id: string) {
    return this.okrsService.getOkrById(id);
  }

  @ApiOperation({ summary: 'Get all OKRs' })
  @ApiResponse({ status: 200, description: 'List of all OKRs.' })
  @Get()
  async getAllOkrs() {
    return this.okrsService.getAllOkrs();
  }

  @ApiOperation({ summary: 'Get OKR with KPIs' })
  @ApiParam({ name: 'id', description: 'OKR ID' })
  @ApiResponse({ status: 200, description: 'OKR with KPIs found.' })
  @ApiResponse({ status: 404, description: 'OKR not found.' })
  @Get(':id/kpis')
  async getOkrWithKpis(@Param('id') id: string) {
    return this.okrsService.getOkrWithKpis(id);
  }
}
