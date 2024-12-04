import { CalculationMethodsEnum } from './calculation-methods.enum';

export class CalculationMethods {
  // Uso de Recursos
  static [CalculationMethodsEnum.USAGE_EFFICIENCY](
    totalSuppliesUsed: number,
    totalAssignments: number,
  ): number {
    return totalSuppliesUsed / totalAssignments;
  }

  static [CalculationMethodsEnum.WASTE_REDUCTION](
    totalWaste: number,
    totalSuppliesUsed: number,
  ): number {
    return (totalWaste / totalSuppliesUsed) * 100;
  }

  static [CalculationMethodsEnum.WASTE_MAINTENANCE](
    totalWaste: number,
    totalSuppliesUsed: number,
    threshold: number,
  ): boolean {
    return (totalWaste / totalSuppliesUsed) * 100 <= threshold;
  }

  // Eficiencia en el Cumplimiento de Tareas
  static [CalculationMethodsEnum.ON_TIME_COMPLETION](
    tasksOnTime: number,
    totalTasks: number,
  ): number {
    return (tasksOnTime / totalTasks) * 100;
  }

  static [CalculationMethodsEnum.ON_TIME_MAINTENANCE](
    tasksOnTime: number,
    totalTasks: number,
    threshold: number,
  ): boolean {
    return (tasksOnTime / totalTasks) * 100 >= threshold;
  }

  // Gestión del Tiempo
  static [CalculationMethodsEnum.TIME_PRODUCTIVITY](
    productiveTime: number,
    totalTimeWorked: number,
  ): number {
    return (productiveTime / totalTimeWorked) * 100;
  }

  static [CalculationMethodsEnum.IDLE_TIME_REDUCTION](
    idleTime: number,
    numberOfAssignments: number,
  ): number {
    return idleTime / numberOfAssignments;
  }

  static [CalculationMethodsEnum.TIME_MAINTENANCE](
    idleTime: number,
    totalTimeWorked: number,
    threshold: number,
  ): boolean {
    return (idleTime / totalTimeWorked) * 100 <= threshold;
  }

  // Calidad de Ejecución
  static [CalculationMethodsEnum.QUALITY_IMPROVEMENT](
    tasksWithoutErrors: number,
    totalTasks: number,
  ): number {
    return (tasksWithoutErrors / totalTasks) * 100;
  }

  static [CalculationMethodsEnum.QUALITY_MAINTENANCE](
    tasksWithoutErrors: number,
    totalTasks: number,
    threshold: number,
  ): boolean {
    return (tasksWithoutErrors / totalTasks) * 100 >= threshold;
  }

  // Productividad por Trabajador
  static [CalculationMethodsEnum.PRODUCTIVITY_INCREASE](
    tasksCompleted: number,
    workers: number,
  ): number {
    return tasksCompleted / workers;
  }

  static [CalculationMethodsEnum.PRODUCTIVITY_MAINTENANCE](
    tasksCompleted: number,
    workers: number,
    threshold: number,
  ): boolean {
    return tasksCompleted / workers >= threshold;
  }

  // Cumplimiento de Plazos
  static [CalculationMethodsEnum.DEADLINE_COMPLIANCE](
    tasksOnTime: number,
    totalTasks: number,
  ): number {
    return (tasksOnTime / totalTasks) * 100;
  }

  static [CalculationMethodsEnum.DEADLINE_MAINTENANCE](
    tasksOnTime: number,
    totalTasks: number,
    threshold: number,
  ): boolean {
    return (tasksOnTime / totalTasks) * 100 >= threshold;
  }

  // Desempeño General por Tipo de Actividad
  static [CalculationMethodsEnum.ACTIVITY_PERFORMANCE_INCREASE](
    tasksCompletedSuccessfully: number,
    totalTasksByActivityType: number,
  ): number {
    return (tasksCompletedSuccessfully / totalTasksByActivityType) * 100;
  }

  static [CalculationMethodsEnum.ACTIVITY_PERFORMANCE_MAINTENANCE](
    tasksCompletedSuccessfully: number,
    totalTasksByActivityType: number,
    threshold: number,
  ): boolean {
    return (
      (tasksCompletedSuccessfully / totalTasksByActivityType) * 100 >= threshold
    );
  }
}
