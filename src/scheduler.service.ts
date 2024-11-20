import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { KpisService } from './kpis/kpis.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly kpisService: KpisService) {
    this.scheduleDailyKpiCalculation();
  }

  scheduleDailyKpiCalculation() {
    cron.schedule('0 0 * * *', async () => {
      this.logger.log('Iniciando cálculo automático de KPIs');
      try {
        const kpis = await this.kpisService.getAllKpis();
        for (const kpi of kpis) {
          const variables = {}; // Configura las variables necesarias
          await this.kpisService.updateKpiValue(kpi.id, variables);
        }
        this.logger.log('Cálculo de KPIs completado');
      } catch (error) {
        this.logger.error('Error al calcular los KPIs:', error.message);
      }
    });
  }
}
