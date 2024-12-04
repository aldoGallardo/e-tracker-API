import { Injectable } from '@nestjs/common';

@Injectable()
export class DataService {
  // Simula la obtención de datos desde la base de datos o API

  // Obtiene el total de suministros utilizados
  async getTotalSuppliesUsed(): Promise<number> {
    // Este dato sería consultado desde la base de datos.
    return 100; // Ejemplo: 100 suministros usados
  }

  // Obtiene el total de tareas asignadas
  async getTotalAssignments(): Promise<number> {
    return 50; // Ejemplo: 50 asignaciones
  }

  // Obtiene el total de desperdicios generados
  async getTotalWaste(): Promise<number> {
    return 10; // Ejemplo: 10 unidades de desperdicio
  }

  // Obtiene el total de tareas completadas a tiempo
  async getTasksOnTime(): Promise<number> {
    return 40; // Ejemplo: 40 tareas completadas a tiempo
  }

  // Obtiene el total de tareas
  async getTotalTasks(): Promise<number> {
    return 50; // Ejemplo: 50 tareas en total
  }

  // Obtiene el tiempo productivo
  async getProductiveTime(): Promise<number> {
    return 400; // Ejemplo: 400 minutos de tiempo productivo
  }

  // Obtiene el tiempo total trabajado
  async getTotalTimeWorked(): Promise<number> {
    return 500; // Ejemplo: 500 minutos trabajados en total
  }

  // Obtiene el tiempo de inactividad
  async getIdleTime(): Promise<number> {
    return 100; // Ejemplo: 100 minutos de inactividad
  }

  // Obtiene el número total de trabajadores
  async getNumberOfWorkers(): Promise<number> {
    return 5; // Ejemplo: 5 trabajadores
  }

  // Obtiene las tareas completadas sin errores
  async getTasksWithoutErrors(): Promise<number> {
    return 45; // Ejemplo: 45 tareas sin errores
  }

  // Otros métodos adicionales según sea necesario
}
