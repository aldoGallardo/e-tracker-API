import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TestsService } from './tests.service';
import { HttpCode, HttpStatus } from '@nestjs/common';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post('dimensions')
  @HttpCode(HttpStatus.OK)
  async seedDimensions(): Promise<string> {
    try {
      await this.testsService.seedDimensions();
      return 'Dimensiones cargadas correctamente.';
    } catch (error) {
      console.error('Error al cargar dimensiones:', error);
      return 'Error al cargar dimensiones.';
    }
  }

  @Post('calculations')
  @HttpCode(HttpStatus.OK)
  async seedCalculations(): Promise<string> {
    try {
      await this.testsService.seedCalculations();
      return 'Cálculos cargados correctamente.';
    } catch (error) {
      console.error('Error al cargar cálculos:', error);
      return 'Error al cargar cálculos.';
    }
  }
}
