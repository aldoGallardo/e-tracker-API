import { Controller, Get, Param } from '@nestjs/common';
import { CalculationService } from './calculation.service';

@Controller('calculations')
export class CalculationController {
  constructor(private readonly calculationService: CalculationService) {}

  // Ruta para obtener el tiempo activo total por usuario
  @Get('user/:userId/active-time')
  async getUserActiveTime(@Param('userId') userId: string) {
    return this.calculationService.getUserActiveTime(userId);
  }

  // Ruta para obtener el tiempo activo promedio por sucursal
  @Get('branch/:branchOfficeId/average-active-time')
  async getBranchAverageActiveTime(
    @Param('branchOfficeId') branchOfficeId: string,
  ) {
    return this.calculationService.getBranchAverageActiveTime(branchOfficeId);
  }

  // Ruta para obtener el tiempo activo promedio global
  @Get('global/average-active-time')
  async getGlobalAverageActiveTime() {
    return this.calculationService.getGlobalAverageActiveTime();
  }

  // Ruta para obtener el tiempo promedio de actividad por usuario y tipo de actividad
  @Get('user/:userId/average-activity-time-by-type')
  async getUserAverageActivityTimeByType(@Param('userId') userId: string) {
    return this.calculationService.getUserAverageActivityTimeByType(userId);
  }

  // Ruta para obtener el tiempo promedio de actividad por sucursal y tipo de actividad
  @Get('branch/:branchOfficeId/average-activity-time-by-type')
  async getBranchAverageActivityTimeByType(
    @Param('branchOfficeId') branchOfficeId: string,
  ) {
    return this.calculationService.getBranchAverageActivityTimeByType(
      branchOfficeId,
    );
  }

  // Ruta para obtener el tiempo promedio de actividad global por tipo de actividad
  @Get('global/average-activity-time-by-type')
  async getGlobalAverageActivityTimeByType() {
    return this.calculationService.getGlobalAverageActivityTimeByType();
  }

  // Ruta para obtener suministros utilizados a nivel usuario
  @Get('user/:userId/supplies-used')
  async getUserSuppliesUsed(@Param('userId') userId: string) {
    const result = await this.calculationService.getUserSuppliesUsed(userId);
    return result;
  }

  // Ruta para obtener suministros utilizados a nivel sucursal
  @Get('branch/:branchOfficeId/supplies-used')
  async getBranchSuppliesUsed(@Param('branchOfficeId') branchOfficeId: string) {
    const result =
      await this.calculationService.getBranchSuppliesUsed(branchOfficeId);
    return result;
  }

  // Ruta para obtener suministros utilizados a nivel global
  @Get('global/supplies-used')
  async getGlobalSuppliesUsed() {
    const result = await this.calculationService.getGlobalSuppliesUsed();
    return result;
  }

  // Obtener el tiempo de inactividad de un usuario específico para el día anterior
  @Get('user/:userId/inactivity-time')
  async getUserInactivityTime(@Param('userId') userId: string) {
    return this.calculationService.getUserInactivityTime(userId);
  }

  // Obtener el tiempo de inactividad para todos los usuarios de una oficina de sucursal específica
  @Get('branch/:branchOfficeId/inactivity-time')
  async getBranchOfficeInactivityTime(
    @Param('branchOfficeId') branchOfficeId: string,
  ) {
    return this.calculationService.getBranchOfficeInactivityTime(
      branchOfficeId,
    );
  }

  // Obtener el tiempo de inactividad global para todos los usuarios del día anterior
  @Get('global/inactivity-time')
  async getGlobalInactivityTime() {
    return this.calculationService.getGlobalInactivityTime();
  }
}
