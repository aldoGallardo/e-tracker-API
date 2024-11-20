// src/kpi-library/kpi-library.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { KpiLibraryService } from './kpis-library.service';

@Controller('kpi-library')
export class KpiLibraryController {
  constructor(private readonly kpiLibraryService: KpiLibraryService) {}

  //Cálculo 1
  @Get('calculate-average-supply-cost')
  async calculateAverageSupplyCost(
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<number> {
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    return this.kpiLibraryService.calculateAverageSupplyCostPerAssignment(
      filters,
    );
  }

  //Cálculo 2
  @Get('calculate-resources-usage')
  async calculateResourcesUsage(
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ resource: string; quantityUsed: number }[]> {
    // Convertir fechas de los parámetros a objetos Date, si están presentes
    const filters = {
      id,
      branchOffice,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    // Llamar al servicio y pasarle los filtros
    return this.kpiLibraryService.calculateResourcesUsage(filters);
  }

  //Cálculo 3
  @Get('calculate-on-time-start-percentage')
  async calculateOnTimeStartPercentage(
    @Query('activities') activities?: string,
    @Query('activityTypeId') activityTypeId?: string,
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    try {
      let parsedActivities = [];

      if (activities) {
        try {
          parsedActivities = JSON.parse(activities);
        } catch (error) {
          throw new Error("Invalid JSON format in 'activities' parameter");
        }
      }

      const filters = {
        id,
        branchOffice,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        activityTypeId,
      };

      return this.kpiLibraryService.calculateOnTimeStartPercentage(
        parsedActivities.length ? parsedActivities : null,
        filters,
      );
    } catch (error) {
      console.error('Error in calculateOnTimeStartPercentage:', error);
      throw new Error('Failed to calculate on-time start percentage');
    }
  }

  //Cálculo 4
  @Get('calculate-average-start-delay')
  async calculateAverageStartDelay(
    @Query('activities') activities?: string,
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<number> {
    let parsedActivities = [];

    // Validar y parsear activities si existe
    if (activities) {
      try {
        parsedActivities = JSON.parse(activities);
      } catch (error) {
        throw new Error("Invalid JSON format in 'activities' parameter");
      }
    }

    // Convertimos las fechas de string a Date si existen
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    // Llamar al servicio para calcular el tiempo promedio de retraso
    return this.kpiLibraryService.calculateAverageStartDelay(
      parsedActivities.length ? parsedActivities : null,
      filters,
    );
  }

  @Get('calculate-average-travel-time')
  async calculateAverageTravelTime(
    @Query('assignments') assignments?: string,
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<number> {
    let parsedAssignments = [];

    // Validar y parsear assignments si existe
    if (assignments) {
      try {
        parsedAssignments = JSON.parse(assignments);
      } catch (error) {
        throw new Error("Invalid JSON format in 'assignments' parameter");
      }
    }

    // Convertimos las fechas de string a Date si existen
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    // Llamar al servicio para calcular el tiempo promedio de desplazamiento entre assignments
    return this.kpiLibraryService.calculateAverageDailyTravelTime(
      parsedAssignments.length ? parsedAssignments : null,
      filters,
    );
  }

  @Get('calculate-resource-usage-compliance')
  async calculateResourceUsageCompliance(
    @Query('activities') activities?: string,
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<number> {
    let parsedActivities = [];

    // Validar y parsear actividades si existe
    if (activities) {
      try {
        parsedActivities = JSON.parse(activities);
      } catch (error) {
        throw new Error("Invalid JSON format in 'activities' parameter");
      }
    }

    // Convertir fechas de string a Date si existen
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    // Llamar al servicio para calcular el porcentaje de cumplimiento en uso de recursos
    return this.kpiLibraryService.calculateResourceUsageCompliance(
      parsedActivities.length ? parsedActivities : null,
      filters,
    );
  }

  @Get('calculate-average-completion-time-deviation')
  async calculateAverageCompletionTimeDeviation(
    @Query('activities') activities?: string,
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<number> {
    let parsedActivities = [];

    // Validar y parsear actividades si existe
    if (activities) {
      try {
        parsedActivities = JSON.parse(activities);
      } catch (error) {
        throw new Error("Invalid JSON format in 'activities' parameter");
      }
    }

    // Convertir fechas de string a Date si existen
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    // Llamar al servicio para calcular la desviación promedio de tiempo de finalización
    return this.kpiLibraryService.calculateAverageCompletionTimeDeviation(
      parsedActivities.length ? parsedActivities : null,
      filters,
    );
  }

  @Get('calculate-average-execution-time')
  async calculateAverageExecutionTime(
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<number> {
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    return this.kpiLibraryService.calculateAverageExecutionTime(filters);
  }

  @Get('calculate-on-time-completion-percentage')
  async calculateOnTimeCompletionPercentage(
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<number> {
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    return this.kpiLibraryService.calculateOnTimeCompletionPercentage(filters);
  }

  @Get('calculate-supply-waste-percentage-by-item')
  async calculateSupplyWastePercentageByItem(
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<{ [supply: string]: number }> {
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    return this.kpiLibraryService.calculateSupplyWastePercentageByItem(filters);
  }

  @Get('tasks-without-overconsumption')
  async calculateTasksWithoutOverconsumption(
    @Query('activities') activities?: string,
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<number> {
    let parsedActivities = [];

    // Validar y parsear actividades si existe
    if (activities) {
      try {
        parsedActivities = JSON.parse(activities);
      } catch (error) {
        throw new Error("Invalid JSON format in 'activities' parameter");
      }
    }

    // Convertir fechas de string a Date si existen
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    // Llamar al servicio para calcular el número de tareas sin sobreconsumo
    return this.kpiLibraryService.calculateTasksWithoutOverconsumption(
      parsedActivities.length ? parsedActivities : null,
      filters,
    );
  }

  @Get('calculate-supply-consumption-by-task-type')
  async calculateSupplyConsumptionByTaskType(
    @Query('activities') activities?: string,
    @Query('id') id?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityTypeId') activityTypeId?: string,
  ): Promise<{ [taskType: string]: { [supply: string]: number } }> {
    let parsedActivities = [];

    // Validar y parsear actividades si existe
    if (activities) {
      try {
        parsedActivities = JSON.parse(activities);
      } catch (error) {
        throw new Error("Invalid JSON format in 'activities' parameter");
      }
    }

    // Convertir fechas de string a Date si existen
    const filters = {
      id,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      activityTypeId,
    };

    return this.kpiLibraryService.calculateSupplyConsumptionByTaskType(
      parsedActivities.length ? parsedActivities : null,
      filters,
    );
  }

  //Cálculo 14
  @Get('calculate-active-time')
  async calculateActiveTime(
    @Query('userId') userId?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    // Convertir los parámetros de fecha de string a Date si se proporcionan
    const filters = {
      userId,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    // Llamar al servicio con los filtros proporcionados
    return this.kpiLibraryService.calculateActiveTime(filters);
  }

  //Cálculo 15
  @Get('calculate-idle-time')
  async calculateIdleTime(
    @Query('userId') userId?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    // Convertir los parámetros de fecha de string a Date si se proporcionan
    const filters = {
      userId,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    // Llamar al servicio con los filtros proporcionados
    return this.kpiLibraryService.calculateIdleTime(filters);
  }

  //Cálculo 16
  @Get('calculate-active-users')
  async calculateActiveUsers(
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    // Convertir los parámetros de fecha de string a Date si se proporcionan
    const filters = {
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    // Llamar al servicio con los filtros proporcionados
    return this.kpiLibraryService.calculateActiveUsers(filters);
  }

  //Cálculo 17
  @Get('calculate-on-time-departure-compliance')
  async calculateOnTimeDepartureCompliance(
    @Query('userId') userId?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    // Convertir los parámetros de fecha de string a Date si se proporcionan
    const filters = {
      userId,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    // Llamar al servicio con los filtros proporcionados
    return this.kpiLibraryService.calculateOnTimeDepartureCompliance(filters);
  }

  //Cálculo 18
  @Get('calculate-on-time-entry-compliance')
  async calculateOnTimeEntryCompliance(
    @Query('userId') userId?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    // Convertir las fechas de los parámetros a objetos Date, si están presentes
    const filters = {
      userId,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    // Llamar al servicio y pasarle los filtros
    return this.kpiLibraryService.calculateOnTimeEntryCompliance(filters);
  }

  //Cálculo 19
  @Get('calculate-full-day-compliance')
  async calculateFullDayCompliance(
    @Query('userId') userId?: string,
    @Query('branchOffice') branchOffice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<number> {
    // Convertir las fechas de los parámetros a objetos Date, si están presentes
    const filters = {
      userId,
      branchOffice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    // Llamar al servicio y pasarle los filtros
    return this.kpiLibraryService.calculateFullDayCompliance(filters);
  }
}
