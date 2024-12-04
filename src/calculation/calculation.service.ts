import { Injectable } from '@nestjs/common';
import { KeyResult } from 'src/key-results/key-result.entity';
import { CalculationMethods } from './calculation-methods';

@Injectable()
export class CalculationService {
  executeCalculation(keyResult: KeyResult, values: number[]): number | boolean {
    const methodName = keyResult.method; // Ahora `method` es un string

    const method = CalculationMethods[methodName]; // Accedemos al método usando el nombre como clave

    if (method) {
      const expectedParams = this.getExpectedParams(methodName);

      if (values.length === expectedParams) {
        return method(...values); // Llamamos al método con los valores adecuados
      } else {
        throw new Error(
          `Cantidad incorrecta de parámetros para el método ${keyResult.method}`,
        );
      }
    } else {
      throw new Error(`Método de cálculo ${keyResult.method} no encontrado`);
    }
  }

  private getExpectedParams(method: string): number {
    switch (method) {
      case 'usage_efficiency':
      case 'waste_reduction':
      case 'on_time_completion':
      case 'time_productivity':
      case 'quality_improvement':
      case 'deadline_compliance':
      case 'activity_performance_increase':
        return 2; // Métodos con dos parámetros
      case 'waste_maintenance':
      case 'on_time_maintenance':
      case 'idle_time_reduction':
      case 'time_maintenance':
      case 'quality_maintenance':
      case 'productivity_maintenance':
      case 'deadline_maintenance':
      case 'activity_performance_maintenance':
        return 3; // Métodos con tres parámetros
      default:
        return 0; // No se espera ningún parámetro
    }
  }
}
