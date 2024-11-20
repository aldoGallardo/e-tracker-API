import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { BadRequestException } from '@nestjs/common';
import { KpiCalculator } from './kpis-calculation.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Query } from '@nestjs/common';

@ApiTags('KPIs')
@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @ApiOperation({ summary: 'Create a new KPI' })
  @ApiResponse({
    status: 201,
    description: 'The KPI has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post('create')
  async createKpi(@Body() createKpiDto: CreateKpiDto) {
    return this.kpisService.createKpi(createKpiDto);
  }

  @ApiOperation({ summary: 'Get KPI by ID' })
  @ApiParam({ name: 'id', description: 'KPI ID' })
  @ApiResponse({ status: 200, description: 'The KPI was found.' })
  @ApiResponse({ status: 404, description: 'KPI not found.' })
  @Get(':id')
  async getKpiById(@Param('id') id: string) {
    return this.kpisService.getKpiById(id);
  }

  @ApiOperation({ summary: 'Calculate KPI' })
  @ApiParam({ name: 'id', description: 'ID of the KPI to calculate' })
  @ApiResponse({ status: 200, description: 'Result of the KPI calculation.' })
  @ApiResponse({ status: 400, description: 'Error while calculating the KPI.' })
  @Post('calculate/:id')
  async calculateKpi(
    @Param('id') id: string,
    @Body() variables: Record<string, number>,
  ) {
    return this.kpisService.calculateKpi(id, variables);
  }

  @ApiOperation({ summary: 'Validate formula' })
  @ApiResponse({ status: 200, description: 'Formula is valid.' })
  @ApiResponse({ status: 400, description: 'Formula is invalid.' })
  @Post('validate-formula')
  validateFormula(
    @Body() body: { formula: string; variables: Record<string, number> },
  ) {
    try {
      return KpiCalculator.validateFormula(body.formula, body.variables);
    } catch (error) {
      throw new BadRequestException(`Fórmula inválida: ${error.message}`);
    }
  }
}
