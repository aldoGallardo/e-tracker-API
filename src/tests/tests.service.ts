import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class TestsService {
  private firestore: Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  // Datos de ejemplo
  dimensions = [
    {
      id: 'efficientResourceManagement',
      name: 'Gestión Eficiente de Recursos',
      description:
        'Optimización en el uso y control de los recursos necesarios para las tareas.',
      associateCalculations: [
        'avgSupplyCostTask',
        'totalResourcesUsed',
        'tasksResourceCompliant',
        'supplyWastePerTask',
        'tasksWithoutOveruse',
        'supplyConsumedTaskType',
        'totalSupplyWaste',
        'mostWastedResources',
      ],
    },
    {
      id: 'operationalProactivity',
      name: 'Proactividad Operativa',
      description:
        'Medición de la actividad y eficiencia operativa de los empleados.',
      associateCalculations: [
        'activeTimeEmployees',
        'idleTimeEmployees',
        'activeEmployeeCount',
      ],
    },
    {
      id: 'taskCompliance',
      name: 'Cumplimiento de Tareas',
      description:
        'Evaluación del desempeño en términos de tiempo y finalización de tareas.',
      associateCalculations: [
        'onTimeStartTasks',
        'avgStartDelay',
        'avgTravelTimeTasks',
        'avgCompletionDeviation',
        'avgExecutionTime',
        'tasksOnTime',
      ],
    },
    {
      id: 'laborCompliance',
      name: 'Cumplimiento Laboral',
      description:
        'Supervisión del cumplimiento de horarios y jornadas laborales por parte de los técnicos.',
      associateCalculations: [
        'techniciansOnTimeDeparture',
        'techniciansOnTimeEntry',
        'techniciansFullDay',
      ],
    },
  ];

  calculations = [
    {
      id: 'avgSupplyCostTask',
      name: 'Costo promedio de recursos por tarea',
      description: 'Costo promedio de recursos para instalaciones y traslados.',
      dimension: 'efficientResourceManagement',
      range: { min: 455, max: 515 },
    },
    {
      id: 'totalResourcesUsed',
      name: 'Cantidad de recursos utilizados',
      description: 'Cantidad total de recursos utilizados en las tareas.',
      dimension: 'efficientResourceManagement',
      range: { min: 0, max: 0 },
    },
    {
      id: 'tasksResourceCompliant',
      name: 'Tareas con uso adecuado de recursos',
      description: 'Número de tareas con uso adecuado de recursos.',
      dimension: 'efficientResourceManagement',
      range: { min: 2, max: 4 },
    },
    {
      id: 'supplyWastePerTask',
      name: 'Desperdicio de suministros por tarea',
      description: 'Cantidad de suministros desperdiciados por cada tarea.',
      dimension: 'efficientResourceManagement',
      range: { min: 0, max: 20 },
    },
    {
      id: 'tasksWithoutOveruse',
      name: 'Tareas completadas sin sobreconsumo',
      description:
        'Número de tareas completadas sin sobreconsumo de suministros.',
      dimension: 'efficientResourceManagement',
      range: { min: 1, max: 3 },
    },
    {
      id: 'supplyConsumedTaskType',
      name: 'Suministros consumidos por tipo de tarea',
      description:
        'Cantidad de suministros consumidos agrupados por tipo de tarea.',
      dimension: 'efficientResourceManagement',
      range: { min: 0, max: 0 },
    },
    {
      id: 'activeTimeEmployees',
      name: 'Tiempo de actividad de empleados',
      description: 'Tiempo total de actividad de los empleados en minutos.',
      dimension: 'operationalProactivity',
      range: { min: 390, max: 450 },
    },
    {
      id: 'idleTimeEmployees',
      name: 'Tiempo de inactividad de empleados',
      description: 'Tiempo total de inactividad de los empleados en minutos.',
      dimension: 'operationalProactivity',
      range: { min: 0, max: 60 },
    },
    {
      id: 'activeEmployeeCount',
      name: 'Cantidad de empleados activos',
      description: 'Cantidad de empleados activos en el período analizado.',
      dimension: 'operationalProactivity',
      range: { min: 3, max: 5 },
    },
    {
      id: 'onTimeStartTasks',
      name: 'Tareas iniciadas puntualmente',
      description:
        'Número de tareas iniciadas puntualmente dentro del período analizado.',
      dimension: 'taskCompliance',
      range: { min: 2, max: 4 },
    },
    {
      id: 'avgStartDelay',
      name: 'Retraso promedio en inicio de tareas',
      description: 'Tiempo promedio de retraso en el inicio de las tareas.',
      dimension: 'taskCompliance',
      range: { min: 0, max: 30 },
    },
    {
      id: 'avgTravelTimeTasks',
      name: 'Desplazamiento promedio entre tareas',
      description: 'Tiempo promedio de desplazamiento entre tareas en minutos.',
      dimension: 'taskCompliance',
      range: { min: 5, max: 35 },
    },
    {
      id: 'avgCompletionDeviation',
      name: 'Desviación promedio en finalización',
      description:
        'Tiempo promedio de finalización en comparación con el estimado.',
      dimension: 'taskCompliance',
      range: { min: 15, max: 60 },
    },
    {
      id: 'avgExecutionTime',
      name: 'Tiempo promedio de ejecución',
      description: 'Tiempo promedio empleado en la ejecución de tareas.',
      dimension: 'taskCompliance',
      range: { min: 10, max: 120 },
    },
    {
      id: 'tasksOnTime',
      name: 'Tareas completadas en tiempo planificado',
      description:
        'Número de tareas completadas dentro del tiempo planificado.',
      dimension: 'taskCompliance',
      range: { min: 2, max: 4 },
    },
    {
      id: 'techniciansOnTimeDeparture',
      name: 'Técnicos que cumplen con horarios de salida',
      description:
        'Cantidad de técnicos que cumplieron con los horarios de salida establecidos.',
      dimension: 'laborCompliance',
      range: { min: 3, max: 5 },
    },
    {
      id: 'techniciansOnTimeEntry',
      name: 'Técnicos que cumplen con horarios de entrada',
      description:
        'Cantidad de técnicos que cumplieron con los horarios de entrada establecidos.',
      dimension: 'laborCompliance',
      range: { min: 2, max: 4 },
    },
    {
      id: 'techniciansFullDay',
      name: 'Técnicos con jornada completa cumplida',
      description:
        'Número de técnicos que cumplieron con la jornada laboral completa.',
      dimension: 'laborCompliance',
      range: { min: 2, max: 4 },
    },
    {
      id: 'totalSupplyWaste',
      name: 'Desperdicio total de suministros',
      description:
        'Cantidad total de suministros desperdiciados en las operaciones.',
      dimension: 'efficientResourceManagement',
      range: { min: 0, max: 0 },
    },
    {
      id: 'mostWastedResources',
      name: 'Recursos más desperdiciados',
      description: 'Recursos con mayor cantidad de desperdicio acumulado.',
      dimension: 'efficientResourceManagement',
      range: { min: 0, max: 0 },
    },
  ];

  employees = {
    eDXAk8wwiPluA7671oj6: [
      'ElrdDKtOoFclPNbWlwAE1SlSpWr2',
      '00XQb2bBgpdnCkLhPNifWAVUhqS2',
      '2cvihaIvdvY9IjX7EQtXs7It2Qt2',
      '2W1KefDwCqccZUt3wkM6Doe2jcm2',
      '7Z76RjV0lFYBEySO0GI7c3R3q3H3',
    ],
    '2OIW6pbuHYEjywnPR41N': [
      'Dts41LI94HN4IaormUR0FehzT6y1',
      'IX7tt0aQyeds0usj6YfbREiCPZE2',
      'EPIMzemadlg3OyGJawRK0LpSDdr1',
      'Eyv6R5j2EPh8QQDbDEKLTQ8w6xy1',
    ],
  };

  private generateRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async seedDimensions(): Promise<void> {
    for (const dimension of this.dimensions) {
      await this.firestore
        .collection('dimensions')
        .doc(dimension.id)
        .set(dimension);
    }
    console.log('Dimensiones cargadas correctamente.');
  }

  async seedCalculations(): Promise<void> {
    for (const calculation of this.calculations) {
      const calcRef = this.firestore
        .collection('calculations')
        .doc(calculation.id);

      // Crear cálculo principal
      await calcRef.set({
        name: calculation.name,
        description: calculation.description,
        dimension: calculation.dimension,
      });

      // Inicializar acumuladores para global
      let globalTotal = 0;
      let globalCount = 0;

      for (const [branchOfficeId, userIds] of Object.entries(this.employees)) {
        let branchTotal = 0;
        let branchCount = 0;

        for (const userId of userIds) {
          const randomValue = this.generateRandomValue(
            calculation.range.min,
            calculation.range.max,
          );

          // Subcolección employees
          const employeeData = {
            daily: [
              {
                periodStart: '2024-11-26',
                total: randomValue,
                count: 1,
                average: randomValue,
              },
            ],
            weekly: [
              {
                periodStart: '2024-W48',
                total: randomValue,
                count: 1,
                average: randomValue,
              },
            ],
            monthly: [
              {
                periodStart: '2024-11',
                total: randomValue,
                count: 1,
                average: randomValue,
              },
            ],
            trimesterly: [
              {
                periodStart: '2024-Q4',
                total: randomValue,
                count: 1,
                average: randomValue,
              },
            ],
            semesterly: [
              {
                periodStart: '2024-S2',
                total: randomValue,
                count: 1,
                average: randomValue,
              },
            ],
            yearly: [
              {
                periodStart: '2024',
                total: randomValue,
                count: 1,
                average: randomValue,
              },
            ],
          };

          branchTotal += randomValue;
          branchCount++;

          // Agregar a global
          globalTotal += randomValue;
          globalCount++;

          await calcRef.collection('employees').doc(userId).set(employeeData);
        }

        // Subcolección branchOffice
        const branchAverage = branchTotal / branchCount;
        const branchData = {
          daily: [
            {
              periodStart: '2024-11-26',
              total: branchTotal,
              count: branchCount,
              average: branchAverage,
            },
          ],
          weekly: [
            {
              periodStart: '2024-W48',
              total: branchTotal,
              count: branchCount,
              average: branchAverage,
            },
          ],
          monthly: [
            {
              periodStart: '2024-11',
              total: branchTotal,
              count: branchCount,
              average: branchAverage,
            },
          ],
          trimesterly: [
            {
              periodStart: '2024-Q4',
              total: branchTotal,
              count: branchCount,
              average: branchAverage,
            },
          ],
          semesterly: [
            {
              periodStart: '2024-S2',
              total: branchTotal,
              count: branchCount,
              average: branchAverage,
            },
          ],
          yearly: [
            {
              periodStart: '2024',
              total: branchTotal,
              count: branchCount,
              average: branchAverage,
            },
          ],
        };

        await calcRef
          .collection('branchOffice')
          .doc(branchOfficeId)
          .set(branchData);
      }

      // Subcolección global
      const globalAverage = globalTotal / globalCount;
      const globalData = {
        daily: [
          {
            periodStart: '2024-11-26',
            total: globalTotal,
            count: globalCount,
            average: globalAverage,
          },
        ],
        weekly: [
          {
            periodStart: '2024-W48',
            total: globalTotal,
            count: globalCount,
            average: globalAverage,
          },
        ],
        monthly: [
          {
            periodStart: '2024-11',
            total: globalTotal,
            count: globalCount,
            average: globalAverage,
          },
        ],
        trimesterly: [
          {
            periodStart: '2024-Q4',
            total: globalTotal,
            count: globalCount,
            average: globalAverage,
          },
        ],
        semesterly: [
          {
            periodStart: '2024-S2',
            total: globalTotal,
            count: globalCount,
            average: globalAverage,
          },
        ],
        yearly: [
          {
            periodStart: '2024',
            total: globalTotal,
            count: globalCount,
            average: globalAverage,
          },
        ],
      };

      await calcRef.collection('global').doc('summary').set(globalData);

      console.log(
        `Cálculo ${calculation.name} creado correctamente con datos globales.`,
      );
    }
  }
}
