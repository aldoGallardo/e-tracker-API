// src/kpi-library/kpi-library.service.ts

import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Firestore, Timestamp } from '@google-cloud/firestore';
import * as FirebaseFirestore from '@google-cloud/firestore';

@Injectable()
export class KpiLibraryService {
  private readonly firestore: Firestore;
  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  //Dimensión: Eficiencia en el Uso de Recursos
  // Cálculo 1: Costo de recursos por tarea usando assignments
  async calculateAverageSupplyCostPerAssignment(
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let query = this.firestore
        .collection('assignments')
        .where('status', '==', 'completed') as FirebaseFirestore.Query;

      // Manejar el filtro de ID
      if (filters.id) {
        query = query.where(
          FirebaseFirestore.FieldPath.documentId(),
          '==',
          filters.id,
        );
      }
      if (filters.branchOffice) {
        query = query.where('branchOffice', '==', filters.branchOffice);
      }
      if (filters.activityTypeId) {
        query = query.where('activityType', '==', filters.activityTypeId);
      }
      if (filters.startDate) {
        query = query.where(
          'completedAt',
          '>=',
          FirebaseFirestore.Timestamp.fromDate(filters.startDate),
        );
      }
      if (filters.endDate) {
        query = query.where(
          'completedAt',
          '<=',
          FirebaseFirestore.Timestamp.fromDate(filters.endDate),
        );
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        console.log('No assignments found with the applied filters.');
        return 0;
      }

      const filteredAssignments = snapshot.docs.map((doc) => doc.data());
      console.log(
        'Number of filtered assignments:',
        filteredAssignments.length,
      );

      const suppliesSnapshot = await this.firestore
        .collection('supplies')
        .get();
      const suppliesMap = new Map<string, any>();
      suppliesSnapshot.docs.forEach((doc) => {
        suppliesMap.set(doc.id, doc.data());
      });

      console.log('Supplies loaded:', suppliesMap.size);

      let totalCost = 0;
      let totalAssignments = 0;

      for (const assignment of filteredAssignments) {
        if (assignment.neededSupply) {
          totalAssignments++;
          for (const supply of assignment.neededSupply) {
            const supplyData = suppliesMap.get(supply.supply);
            if (!supplyData) continue;

            const unitCost = supplyData.unitCost || 0;
            const quantityUsed = parseFloat(supply.quantity || '0');
            totalCost += unitCost * quantityUsed;
          }
        }
      }

      const averageCost =
        totalAssignments > 0 ? totalCost / totalAssignments : 0;
      console.log('Average Supply Cost per Assignment:', averageCost);

      return parseFloat(averageCost.toFixed(2));
    } catch (error) {
      console.error('Error in calculateAverageSupplyCostPerAssignment:', error);
      throw new Error('Failed to calculate average supply cost per assignment');
    }
  }

  // Cálculo 2: Cantidad de recursos utilizados
  async calculateResourcesUsage(
    filters: {
      id?: string;
      branchOffice?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<{ resource: string; quantityUsed: number }[]> {
    try {
      const resourceUsageMap: { [resource: string]: number } = {};
      let query = this.firestore.collection(
        'assignments',
      ) as FirebaseFirestore.Query;

      // Filtros dinámicos
      if (filters.id) {
        // Filtrar por ID específico
        query = query.where(
          FirebaseFirestore.FieldPath.documentId(),
          '==',
          filters.id,
        );
      }
      if (filters.branchOffice) {
        query = query.where('branchOffice', '==', filters.branchOffice);
      }
      if (filters.userId) {
        query = query.where('assignTo', '==', filters.userId);
      }

      // Filtro por rango de fechas usando el campo 'completedAt'
      if (filters.startDate || filters.endDate) {
        if (filters.startDate) {
          query = query.where(
            'completedAt',
            '>=',
            Timestamp.fromDate(filters.startDate),
          );
        }
        if (filters.endDate) {
          query = query.where(
            'completedAt',
            '<=',
            Timestamp.fromDate(filters.endDate),
          );
        }
      }

      // Obtener los documentos que cumplen con los filtros
      const snapshot = await query.get();
      if (snapshot.empty) {
        console.log('No assignments found matching the filters.');
        return [];
      }

      console.log(`Total assignments fetched: ${snapshot.size}`);

      // Procesar cada assignment para calcular el uso de recursos
      snapshot.forEach((doc) => {
        const assignment = doc.data();

        if (assignment.neededSupply) {
          assignment.neededSupply.forEach(
            (supply: { supply: string; quantity: number }) => {
              const quantityUsed = parseFloat(String(supply.quantity || '0'));

              if (resourceUsageMap[supply.supply]) {
                resourceUsageMap[supply.supply] += quantityUsed;
              } else {
                resourceUsageMap[supply.supply] = quantityUsed;
              }
            },
          );
        }
      });

      console.log('Resource usage map:', resourceUsageMap);

      // Convertir el mapa de uso de recursos a un arreglo de resultados
      return Object.keys(resourceUsageMap).map((resource) => ({
        resource,
        quantityUsed: resourceUsageMap[resource],
      }));
    } catch (error) {
      console.error('Error in calculateResourcesUsage:', error);
      throw new Error('Failed to calculate resources usage');
    }
  }

  //Dimensión: Puntualidad en la Ejecución de Tareas
  //Cálculo 3: Porcentaje de tareas iniciadas puntualmente
  async calculateOnTimeStartPercentage(
    activities: any[] | null,
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let filteredActivities = activities;

      // Si no se proporciona una lista de actividades y se especifica un ID, cargamos solo esa actividad
      if (!filteredActivities && filters.id) {
        console.log(`Fetching activity with ID: ${filters.id}`);
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          filteredActivities = [activityDoc.data()]; // Convertimos a array para mantener la lógica de cálculo
        } else {
          console.log('No activity found with the specified ID');
          return 0; // Retorna 0 si no se encuentra la actividad
        }
      }

      // Si no se proporciona un ID y no hay actividades cargadas, cargamos todas desde Firestore
      if (!filteredActivities) {
        console.log(
          'No activities provided, loading all activities from Firestore...',
        );
        const snapshot = await this.firestore.collection('activities').get();
        if (snapshot.empty) {
          console.log('No activities found in Firestore.');
          return 0;
        }
        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      console.log('Initial loaded activities:', filteredActivities);

      // Aplicar los filtros adicionales (branchOffice, activityTypeId, startDate, endDate)
      if (filters.activityTypeId) {
        filteredActivities = filteredActivities.filter(
          (activity) => activity.activityType === filters.activityTypeId,
        );
      }
      if (filters.branchOffice) {
        filteredActivities = filteredActivities.filter(
          (activity) => activity.branchOffice === filters.branchOffice,
        );
      }
      if (filters.startDate && filters.endDate) {
        filteredActivities = filteredActivities.filter((activity) => {
          const activityDate = new Date(activity.createdAt._seconds * 1000);
          return (
            activityDate >= filters.startDate && activityDate <= filters.endDate
          );
        });
      }

      console.log(
        'Filtered activities after applying filters:',
        filteredActivities,
      );

      // Si después de aplicar los filtros no quedan actividades, retornar 0
      if (filteredActivities.length === 0) {
        console.log('No activities match the specified filters');
        return 0;
      }

      // Calculamos el porcentaje de tareas iniciadas puntualmente, filtrando solo aquellas entre 8:00 y 9:00 a.m.
      let onTimeStarts = 0;
      let totalTasks = 0;

      // Define la hora de inicio de jornada: 8:10 a.m.
      const workDayStartHour = 8;
      const workDayStartMinute = 10;

      for (const activity of filteredActivities) {
        if (!activity.startedAt) {
          console.log(`Activity ${activity.id} is missing startedAt.`);
          continue;
        }

        // Convertir `startedAt` a un objeto Date
        const startedAtDate = new Date(activity.startedAt._seconds * 1000);

        // Evaluar si `startedAt` está entre 8:00 a.m. y 9:00 a.m.
        const hour = startedAtDate.getHours();
        if (hour === 8) {
          // Solo consideramos las actividades entre 8:00 y 9:00 a.m.
          totalTasks += 1;

          const expectedStartDate = new Date(
            startedAtDate.getFullYear(),
            startedAtDate.getMonth(),
            startedAtDate.getDate(),
            workDayStartHour,
            workDayStartMinute,
          );

          console.log(
            `Activity ${activity.id} - Expected Start: ${expectedStartDate}, Actual Start: ${startedAtDate}`,
          );

          // Si la actividad comenzó a las 8:10 a.m. o antes, cuenta como puntual
          if (startedAtDate <= expectedStartDate) {
            onTimeStarts += 1;
          }
        }
      }

      const onTimeStartPercentage =
        totalTasks > 0 ? (onTimeStarts / totalTasks) * 100 : 0;
      console.log(
        'Calculated on-time start percentage:',
        onTimeStartPercentage,
      );
      return parseFloat(onTimeStartPercentage.toFixed(2));
    } catch (error) {
      console.error('Error in calculateOnTimeStartPercentage:', error);
      throw new Error('Failed to calculate on-time start percentage');
    }
  }

  //Cálculo 4: Tiempo promedio de retraso en el inicio de las tareas
  async calculateAverageStartDelay(
    activities: any[] | null,
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let filteredActivities = activities;

      // Si no se proporciona una lista de actividades y se especifica un ID, cargamos solo esa actividad
      if (!filteredActivities && filters.id) {
        console.log(`Fetching activity with ID: ${filters.id}`);
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          filteredActivities = [activityDoc.data()]; // Convertimos a array para mantener la lógica de cálculo
        } else {
          console.log('No activity found with the specified ID');
          return 0; // Retorna 0 si no se encuentra la actividad
        }
      }

      // Si no se proporciona un ID y no hay actividades cargadas, cargamos todas desde Firestore
      if (!filteredActivities) {
        console.log(
          'No activities provided, loading all activities from Firestore...',
        );
        const snapshot = await this.firestore.collection('activities').get();
        if (snapshot.empty) {
          console.log('No activities found in Firestore.');
          return 0;
        }
        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      console.log('Initial loaded activities:', filteredActivities);

      // Aplicar los filtros adicionales (branchOffice, activityTypeId, startDate, endDate)
      if (filters.activityTypeId) {
        filteredActivities = filteredActivities.filter(
          (activity) => activity.activityType === filters.activityTypeId,
        );
      }
      if (filters.branchOffice) {
        filteredActivities = filteredActivities.filter(
          (activity) => activity.branchOffice === filters.branchOffice,
        );
      }
      if (filters.startDate && filters.endDate) {
        filteredActivities = filteredActivities.filter((activity) => {
          const activityDate = new Date(activity.createdAt._seconds * 1000);
          return (
            activityDate >= filters.startDate && activityDate <= filters.endDate
          );
        });
      }

      console.log(
        'Filtered activities after applying filters:',
        filteredActivities,
      );

      // Si después de aplicar los filtros no quedan actividades, retornar 0
      if (filteredActivities.length === 0) {
        console.log('No activities match the specified filters');
        return 0;
      }

      // Calcular el tiempo promedio de retraso en el inicio de las tareas, solo para aquellas entre 8:00 y 9:00 a.m.
      let totalDelayMinutes = 0;
      let delayedTasks = 0;

      // Define la hora de inicio de jornada: 8:00 a.m.
      const workDayStartHour = 8;
      const workDayStartMinute = 0;

      for (const activity of filteredActivities) {
        if (!activity.startedAt) {
          console.log(`Activity ${activity.id} is missing startedAt.`);
          continue;
        }

        // Convertir `startedAt` a un objeto Date
        const startedAtDate = new Date(activity.startedAt._seconds * 1000);

        // Evaluar si `startedAt` está entre 8:00 a.m. y 9:00 a.m.
        const hour = startedAtDate.getHours();
        if (hour === 8) {
          // Solo consideramos las actividades entre 8:00 y 9:00 a.m.
          const expectedStartDate = new Date(
            startedAtDate.getFullYear(),
            startedAtDate.getMonth(),
            startedAtDate.getDate(),
            workDayStartHour,
            workDayStartMinute,
          );

          // Calcular el retraso solo si la actividad comenzó después de la hora de inicio esperada
          if (startedAtDate > expectedStartDate) {
            const delayInMilliseconds =
              startedAtDate.getTime() - expectedStartDate.getTime();
            const delayInMinutes = Math.floor(
              delayInMilliseconds / (1000 * 60),
            ); // Convertimos a minutos
            totalDelayMinutes += delayInMinutes;
            delayedTasks += 1;

            console.log(
              `Activity ${activity.id} - Expected Start: ${expectedStartDate}, Actual Start: ${startedAtDate}, Delay: ${delayInMinutes} minutes`,
            );
          }
        }
      }

      const averageDelay =
        delayedTasks > 0 ? totalDelayMinutes / delayedTasks : 0;
      console.log('Calculated average start delay (minutes):', averageDelay);
      return parseFloat(averageDelay.toFixed(2));
    } catch (error) {
      console.error('Error in calculateAverageStartDelay:', error);
      throw new Error('Failed to calculate average start delay');
    }
  }

  //Cálculo 5: Tiempo promedio de desplazamiento entre tareas
  async calculateAverageDailyTravelTime(
    assignments: any[] | null,
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let filteredAssignments = assignments;

      if (!filteredAssignments && filters.id) {
        console.log(`Fetching assignment with ID: ${filters.id}`);
        const assignmentDoc = await this.firestore
          .collection('assignments')
          .doc(filters.id)
          .get();
        if (assignmentDoc.exists) {
          filteredAssignments = [assignmentDoc.data()];
        } else {
          console.log('No assignment found with the specified ID');
          return 0;
        }
      }

      if (!filteredAssignments) {
        console.log(
          'No assignments provided, loading all assignments from Firestore...',
        );
        const snapshot = await this.firestore.collection('assignments').get();
        if (snapshot.empty) {
          console.log('No assignments found in Firestore.');
          return 0;
        }
        filteredAssignments = snapshot.docs.map((doc) => doc.data());
      }

      console.log('Initial loaded assignments:', filteredAssignments);

      if (filters.activityTypeId) {
        filteredAssignments = filteredAssignments.filter(
          (assignment) => assignment.activityType === filters.activityTypeId,
        );
      }
      if (filters.branchOffice) {
        filteredAssignments = filteredAssignments.filter(
          (assignment) => assignment.branchOffice === filters.branchOffice,
        );
      }
      if (filters.startDate && filters.endDate) {
        filteredAssignments = filteredAssignments.filter((assignment) => {
          const assignmentDate = new Date(
            assignment.assignmentDate._seconds * 1000,
          );
          return (
            assignmentDate >= filters.startDate &&
            assignmentDate <= filters.endDate
          );
        });
      }

      console.log(
        'Filtered assignments after applying filters:',
        filteredAssignments,
      );

      if (filteredAssignments.length === 0) {
        console.log('No assignments match the specified filters');
        return 0;
      }

      const assignmentsByUserAndDay: { [key: string]: any[] } = {};
      for (const assignment of filteredAssignments) {
        if (assignment.assignTo && assignment.assignmentDate) {
          const date = new Date(assignment.assignmentDate._seconds * 1000);
          const dayKey = `${assignment.assignTo}-${date.toDateString()}`;
          if (!assignmentsByUserAndDay[dayKey]) {
            assignmentsByUserAndDay[dayKey] = [];
          }
          assignmentsByUserAndDay[dayKey].push(assignment);
        }
      }

      const maxTravelTime = 120;
      let totalDailyTravelTimes = 0;
      let dailyTravelTimeCount = 0;

      const workDayStartHour = 8;
      const workDayStartMinute = 0;

      for (const dayKey in assignmentsByUserAndDay) {
        const dailyAssignments = assignmentsByUserAndDay[dayKey];
        dailyAssignments.sort(
          (a, b) => a.startedAt._seconds - b.startedAt._seconds,
        );

        const firstAssignment = dailyAssignments[0];
        let dailyTravelTime = 0;
        let dailyTravelSegments = 0;

        if (firstAssignment.startedAt) {
          const workDayStart = new Date(
            firstAssignment.startedAt._seconds * 1000,
          );
          workDayStart.setHours(workDayStartHour, workDayStartMinute, 0, 0);

          const firstStartDate = new Date(
            firstAssignment.startedAt._seconds * 1000,
          );
          const initialTravelTime = Math.floor(
            (firstStartDate.getTime() - workDayStart.getTime()) / (1000 * 60),
          );

          if (initialTravelTime > 0 && initialTravelTime <= maxTravelTime) {
            dailyTravelTime += initialTravelTime;
            dailyTravelSegments += 1;
          }
        }

        for (let i = 1; i < dailyAssignments.length; i++) {
          const previousAssignment = dailyAssignments[i - 1];
          const currentAssignment = dailyAssignments[i];

          if (previousAssignment.completedAt && currentAssignment.startedAt) {
            const completedAtDate = new Date(
              previousAssignment.completedAt._seconds * 1000,
            );
            const startedAtDate = new Date(
              currentAssignment.startedAt._seconds * 1000,
            );

            const travelTimeInMinutes = Math.floor(
              (startedAtDate.getTime() - completedAtDate.getTime()) /
                (1000 * 60),
            );

            if (
              travelTimeInMinutes > 0 &&
              travelTimeInMinutes <= maxTravelTime
            ) {
              dailyTravelTime += travelTimeInMinutes;
              dailyTravelSegments += 1;
            }
          }
        }

        if (dailyTravelSegments > 0) {
          const dailyAverageTravelTime = dailyTravelTime / dailyTravelSegments;
          totalDailyTravelTimes += dailyAverageTravelTime;
          dailyTravelTimeCount += 1;
          console.log(
            `Average travel time for ${dayKey}: ${dailyAverageTravelTime} minutes`,
          );
        }
      }

      const averageTravelTime =
        dailyTravelTimeCount > 0
          ? totalDailyTravelTimes / dailyTravelTimeCount
          : 0;
      console.log(
        'Calculated overall average daily travel time (minutes):',
        averageTravelTime,
      );
      return parseFloat(averageTravelTime.toFixed(2));
    } catch (error) {
      console.error('Error in calculateAverageDailyTravelTime:', error);
      throw new Error('Failed to calculate average daily travel time');
    }
  }

  //Dimensión: Eficiencia en la Ejecución de Tareas
  //Cálculo 6: Porcentaje de tareas con uso adecuado de recursos
  async calculateResourceUsageCompliance(
    activities: any[] | null,
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let filteredActivities = activities;

      // Cargar actividad específica si solo se proporciona un ID
      if (!filteredActivities && filters.id) {
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          filteredActivities = [activityDoc.data()];
        } else {
          console.log('No activity found with the specified ID');
          return 0;
        }
      }

      // Cargar todas las actividades si no se proporciona ninguna
      if (!filteredActivities) {
        const snapshot = await this.firestore.collection('activities').get();
        if (snapshot.empty) {
          console.log('No activities found in Firestore.');
          return 0;
        }
        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      // Aplicar filtros adicionales
      filteredActivities = filteredActivities.filter((activity) => {
        const activityDate = new Date(activity.completedAt._seconds * 1000);
        return (
          (!filters.activityTypeId ||
            activity.activityType === filters.activityTypeId) &&
          (!filters.branchOffice ||
            activity.branchOffice === filters.branchOffice) &&
          (!filters.startDate || activityDate >= filters.startDate) &&
          (!filters.endDate || activityDate <= filters.endDate)
        );
      });

      if (filteredActivities.length === 0) {
        console.log('No activities match the specified filters');
        return 0;
      }

      let compliantTasks = 0;
      const totalTasks = filteredActivities.length;

      // Evaluar cada actividad para determinar el uso adecuado de recursos
      for (const activity of filteredActivities) {
        let isCompliant = true;

        if (activity.neededSupply && activity.neededSupply.length > 0) {
          for (const supply of activity.neededSupply) {
            if (supply.quantity > supply.estimatedUse) {
              // Comparar directamente sin `parseFloat`
              isCompliant = false;
              break;
            }
          }
        }

        if (isCompliant) {
          compliantTasks += 1;
        }
      }

      const compliancePercentage = (compliantTasks / totalTasks) * 100;
      console.log(
        'Calculated resource usage compliance percentage:',
        compliancePercentage,
      );
      return parseFloat(compliancePercentage.toFixed(2));
    } catch (error) {
      console.error('Error in calculateResourceUsageCompliance:', error);
      throw new Error(
        'Failed to calculate resource usage compliance percentage',
      );
    }
  }

  //Cálculo 7: Tiempo promedio de finalización en comparación con el estimado
  async calculateAverageCompletionTimeDeviation(
    activities: any[] | null,
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let filteredActivities = activities;

      // Cargar actividad específica si solo se proporciona un ID
      if (!filteredActivities && filters.id) {
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          filteredActivities = [activityDoc.data()];
        } else {
          console.log('No activity found with the specified ID');
          return 0;
        }
      }

      // Cargar todas las actividades si no se proporciona ninguna
      if (!filteredActivities) {
        const snapshot = await this.firestore
          .collection('activities')
          .where('status', '==', 'completed')
          .get();

        if (snapshot.empty) {
          console.log('No activities found in Firestore.');
          return 0;
        }

        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      // Aplicar filtros adicionales en memoria
      filteredActivities = filteredActivities.filter((activity) => {
        const completedDate = new Date(activity.completedAt._seconds * 1000);
        return (
          (!filters.activityTypeId ||
            activity.activityType === filters.activityTypeId) &&
          (!filters.branchOffice ||
            activity.branchOffice === filters.branchOffice) &&
          (!filters.startDate || completedDate >= filters.startDate) &&
          (!filters.endDate || completedDate <= filters.endDate)
        );
      });

      if (filteredActivities.length === 0) {
        console.log('No activities match the specified filters');
        return 0;
      }

      let totalDeviation = 0;
      let countedActivities = 0;

      // Calcular la desviación de tiempo de finalización usando `duration` directamente
      for (const activity of filteredActivities) {
        if (
          activity.duration !== undefined &&
          activity.estimatedTime !== undefined
        ) {
          // Calcular la desviación como la diferencia entre `duration` y `estimatedTime`
          const deviation =
            activity.duration - parseFloat(activity.estimatedTime);
          totalDeviation += deviation;
          countedActivities++;
        }
      }

      // Calcular el tiempo promedio de desviación
      const averageDeviation =
        countedActivities > 0 ? totalDeviation / countedActivities : 0;
      console.log(
        'Calculated average completion time deviation:',
        averageDeviation,
      );

      return parseFloat(averageDeviation.toFixed(2));
    } catch (error) {
      console.error('Error in calculateAverageCompletionTimeDeviation:', error);
      throw new Error('Failed to calculate average completion time deviation');
    }
  }

  //Cálculo 8: Tiempo promedio empleado en la ejecución tareas
  async calculateAverageExecutionTime(
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let filteredActivities = [];

      // Si solo se proporciona un ID, cargar esa actividad específica
      if (filters.id) {
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          filteredActivities = [activityDoc.data()];
        } else {
          console.log('No activity found with the specified ID');
          return 0;
        }
      } else {
        // Construir la consulta con los filtros aplicados directamente en Firestore
        let query = this.firestore
          .collection('activities')
          .where('status', '==', 'completed');

        // Aplicar filtro por branchOffice si existe
        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }
        // Aplicar filtro por activityTypeId si existe
        if (filters.activityTypeId) {
          query = query.where('activityType', '==', filters.activityTypeId);
        }
        // Aplicar filtros de fecha usando completedAt
        if (filters.startDate) {
          query = query.where('completedAt', '>=', filters.startDate);
        }
        if (filters.endDate) {
          query = query.where('completedAt', '<=', filters.endDate);
        }

        // Ejecutar la consulta y mapear los resultados
        const snapshot = await query.get();
        if (snapshot.empty) {
          console.log('No activities match the specified filters');
          return 0;
        }

        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      // Calcular el tiempo promedio de ejecución usando `duration`
      let totalDuration = 0;
      let countedActivities = 0;

      for (const activity of filteredActivities) {
        if (activity.duration !== undefined) {
          totalDuration += activity.duration;
          countedActivities++;
        }
      }

      const averageExecutionTime =
        countedActivities > 0 ? totalDuration / countedActivities : 0;
      console.log('Calculated average execution time:', averageExecutionTime);

      return parseFloat(averageExecutionTime.toFixed(2));
    } catch (error) {
      console.error('Error in calculateAverageExecutionTime:', error);
      throw new Error('Failed to calculate average execution time');
    }
  }

  //Cálculo 9: Porcentaje de tareas completadas en el tiempo planificado
  async calculateOnTimeCompletionPercentage(
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let filteredActivities = [];

      // Cargar actividad específica si solo se proporciona un ID
      if (filters.id) {
        console.log(`Fetching activity with ID: ${filters.id}`);
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          const activityData = activityDoc.data();
          // Verificar que el status sea "completed"
          if (activityData?.status === 'completed') {
            filteredActivities = [activityData];
          }
        } else {
          console.log('No activity found with the specified ID');
          return 0;
        }
      } else {
        // Construir la consulta para traer solo actividades completadas
        let query = this.firestore
          .collection('activities')
          .where('status', '==', 'completed');

        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }
        if (filters.activityTypeId) {
          query = query.where('activityType', '==', filters.activityTypeId);
        }
        if (filters.startDate) {
          query = query.where('completedAt', '>=', filters.startDate);
        }
        if (filters.endDate) {
          query = query.where('completedAt', '<=', filters.endDate);
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
          console.log('No activities match the specified filters');
          return 0;
        }

        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      // Calcular el porcentaje de tareas completadas en el tiempo planificado
      let onTimeTasks = 0;
      const totalTasks = filteredActivities.length;

      for (const activity of filteredActivities) {
        // Verificar que duration y estimatedTime existan y comparar
        if (
          activity.duration !== undefined &&
          activity.estimatedTime !== undefined &&
          activity.duration <= activity.estimatedTime
        ) {
          onTimeTasks++;
        }
      }

      const onTimeCompletionPercentage =
        totalTasks > 0 ? (onTimeTasks / totalTasks) * 100 : 0;
      console.log(
        'Calculated on-time completion percentage:',
        onTimeCompletionPercentage,
      );

      return parseFloat(onTimeCompletionPercentage.toFixed(2));
    } catch (error) {
      console.error('Error in calculateOnTimeCompletionPercentage:', error);
      throw new Error('Failed to calculate on-time completion percentage');
    }
  }

  //Dimensión: Optimización en el Uso de Suministros
  //Cálculo 10: Porcentaje de desperdicio de suministros en cada tarea
  async calculateSupplyWastePercentageByItem(
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<{ [supply: string]: number }> {
    try {
      let filteredActivities = [];

      // Cargar actividad específica si solo se proporciona un ID
      if (filters.id) {
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          const activityData = activityDoc.data();
          if (activityData?.status === 'completed') {
            filteredActivities = [activityData];
          }
        } else {
          console.log('No activity found with the specified ID');
          return {};
        }
      } else {
        // Construir la consulta para traer solo actividades completadas
        let query = this.firestore
          .collection('activities')
          .where('status', '==', 'completed');

        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }
        if (filters.activityTypeId) {
          query = query.where('activityType', '==', filters.activityTypeId);
        }
        if (filters.startDate) {
          query = query.where('completedAt', '>=', filters.startDate);
        }
        if (filters.endDate) {
          query = query.where('completedAt', '<=', filters.endDate);
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
          console.log('No activities match the specified filters');
          return {};
        }

        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      // Mapa para almacenar el porcentaje de desperdicio por suministro
      const wastePercentageBySupply: {
        [supply: string]: { waste: number; count: number };
      } = {};

      // Calcular el porcentaje de desperdicio por suministro
      for (const activity of filteredActivities) {
        if (activity.neededSupply && activity.neededSupply.length > 0) {
          for (const supply of activity.neededSupply) {
            const estimatedUse = parseFloat(supply.estimatedUse || '0');
            const quantityUsed = parseFloat(supply.quantity || '0');

            if (estimatedUse > 0) {
              const wastePercentage =
                quantityUsed > estimatedUse
                  ? ((quantityUsed - estimatedUse) / estimatedUse) * 100
                  : 0;

              if (!wastePercentageBySupply[supply.supply]) {
                wastePercentageBySupply[supply.supply] = { waste: 0, count: 0 };
              }

              wastePercentageBySupply[supply.supply].waste += wastePercentage;
              wastePercentageBySupply[supply.supply].count += 1;
            }
          }
        }
      }

      // Calcular el promedio de desperdicio por cada suministro
      const averageWastePercentageBySupply: { [supply: string]: number } = {};
      for (const [supply, data] of Object.entries(wastePercentageBySupply)) {
        averageWastePercentageBySupply[supply] =
          data.count > 0 ? data.waste / data.count : 0;
      }

      console.log(
        'Calculated supply waste percentage by item:',
        averageWastePercentageBySupply,
      );

      return averageWastePercentageBySupply;
    } catch (error) {
      console.error('Error in calculateSupplyWastePercentageByItem:', error);
      throw new Error('Failed to calculate supply waste percentage by item');
    }
  }

  //Cálculo 11: Número de tareas completadas sin sobreconsumo de suministros
  async calculateTasksWithoutOverconsumption(
    activities: any[] | null,
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<number> {
    try {
      let filteredActivities = activities;

      // Cargar actividad específica si se proporciona un ID
      if (!filteredActivities && filters.id) {
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          filteredActivities = [activityDoc.data()];
        } else {
          console.log('No activity found with the specified ID');
          return 0;
        }
      }

      // Cargar todas las actividades si no se proporciona ninguna
      if (!filteredActivities) {
        let query = this.firestore
          .collection('activities')
          .where('status', '==', 'completed');

        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }
        if (filters.activityTypeId) {
          query = query.where('activityType', '==', filters.activityTypeId);
        }
        if (filters.startDate) {
          query = query.where('completedAt', '>=', filters.startDate);
        }
        if (filters.endDate) {
          query = query.where('completedAt', '<=', filters.endDate);
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
          console.log(
            'No activities match the specified filters in Firestore.',
          );
          return 0;
        }
        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      // Validar que filteredActivities esté inicializado correctamente
      if (!Array.isArray(filteredActivities)) {
        console.log('filteredActivities is not an array');
        return 0;
      }

      let tasksWithoutOverconsumption = 0;

      for (const activity of filteredActivities) {
        let isWithinEstimate = true;

        if (activity.neededSupply && activity.neededSupply.length > 0) {
          for (const supply of activity.neededSupply) {
            if (parseFloat(supply.quantity) > parseFloat(supply.estimatedUse)) {
              isWithinEstimate = false;
              break;
            }
          }
        }

        if (isWithinEstimate) {
          tasksWithoutOverconsumption += 1;
        }
      }

      return tasksWithoutOverconsumption;
    } catch (error) {
      console.error('Error in calculateTasksWithoutOverconsumption:', error);
      throw new Error('Failed to calculate tasks without overconsumption');
    }
  }

  //Cálculo 12: Calcula el costo medio en suministros de las tareas completadas.

  //Por ahora me lo salto

  //Cálculo 13: Cantidad de suministros consumidos por tipo de tarea
  async calculateSupplyConsumptionByTaskType(
    activities: any[] | null,
    filters: {
      id?: string;
      branchOffice?: string;
      startDate?: Date;
      endDate?: Date;
      activityTypeId?: string;
    } = {},
  ): Promise<{ [taskType: string]: { [supply: string]: number } }> {
    try {
      let filteredActivities = activities;

      // Cargar actividad específica si se proporciona un ID
      if (!filteredActivities && filters.id) {
        const activityDoc = await this.firestore
          .collection('activities')
          .doc(filters.id)
          .get();
        if (activityDoc.exists) {
          filteredActivities = [activityDoc.data()];
        } else {
          console.log('No activity found with the specified ID');
          return {};
        }
      }

      // Cargar todas las actividades si no se proporciona ninguna
      if (!filteredActivities) {
        let query = this.firestore
          .collection('activities')
          .where('status', '==', 'completed');

        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }
        if (filters.activityTypeId) {
          query = query.where('activityType', '==', filters.activityTypeId);
        }
        if (filters.startDate) {
          query = query.where('completedAt', '>=', filters.startDate);
        }
        if (filters.endDate) {
          query = query.where('completedAt', '<=', filters.endDate);
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
          console.log(
            'No activities match the specified filters in Firestore.',
          );
          return {};
        }
        filteredActivities = snapshot.docs.map((doc) => doc.data());
      }

      if (!Array.isArray(filteredActivities)) {
        console.log('filteredActivities is not an array');
        return {};
      }

      const supplyConsumptionByTaskType: {
        [taskType: string]: { [supply: string]: number };
      } = {};

      for (const activity of filteredActivities) {
        const taskType = activity.activityType;

        if (!supplyConsumptionByTaskType[taskType]) {
          supplyConsumptionByTaskType[taskType] = {};
        }

        if (activity.neededSupply && activity.neededSupply.length > 0) {
          for (const supply of activity.neededSupply) {
            const supplyName = supply.supply;
            const quantityUsed = parseFloat(supply.quantity) || 0;

            if (!supplyConsumptionByTaskType[taskType][supplyName]) {
              supplyConsumptionByTaskType[taskType][supplyName] = 0;
            }

            supplyConsumptionByTaskType[taskType][supplyName] += quantityUsed;
          }
        }
      }

      return supplyConsumptionByTaskType;
    } catch (error) {
      console.error('Error in calculateSupplyConsumptionByTaskType:', error);
      throw new Error('Failed to calculate supply consumption by task type');
    }
  }

  //Dimensión: Tiempo de Inactividad
  //Cálculo 14: Tiempo de actividad de empleados
  async calculateActiveTime(filters: {
    userId?: string;
    branchOffice?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    try {
      const startDateTimestamp = filters.startDate
        ? Timestamp.fromDate(new Date(filters.startDate))
        : null;
      const endDateTimestamp = filters.endDate
        ? Timestamp.fromDate(new Date(filters.endDate))
        : null;

      let usersSnapshot;

      if (filters.userId) {
        const userDoc = await this.firestore
          .collection('users')
          .doc(filters.userId)
          .get();
        if (!userDoc.exists) return 0;
        usersSnapshot = [userDoc];
      } else {
        let query = this.firestore.collection(
          'users',
        ) as FirebaseFirestore.Query;
        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }
        const snapshot = await query.get();
        if (snapshot.empty) return 0;
        usersSnapshot = snapshot.docs;
      }

      let totalActiveTime = 0; // Total en minutos

      for (const doc of usersSnapshot) {
        const user = doc.data();
        console.log('Processing User:', doc.id);
        console.log('User Data:', user);

        const assignmentsSnapshot = await this.firestore
          .collection('assignments')
          .where('assignTo', '==', doc.id)
          .where('status', '==', 'completed')
          .where('startedAt', '>=', startDateTimestamp)
          .where('startedAt', '<=', endDateTimestamp)
          .get();

        if (assignmentsSnapshot.empty) {
          console.log(`No assignments found for User ID: ${doc.id}`);
          continue;
        }

        const totalUserActivityTime = assignmentsSnapshot.docs.reduce(
          (sum, assignmentDoc) => {
            const assignmentData = assignmentDoc.data();
            const duration = assignmentData.duration || 0; // Duración en minutos
            console.log(
              `Assignment ID: ${assignmentDoc.id}, Duration: ${duration} minutes`,
            );
            return sum + duration;
          },
          0,
        );

        console.log(
          `Total Activity Time for User ${doc.id}: ${totalUserActivityTime} minutes`,
        );
        totalActiveTime += totalUserActivityTime;
      }

      console.log(
        'Total Active Time (Tiempo Total de Actividad en minutos):',
        totalActiveTime,
      );

      return totalActiveTime;
    } catch (error) {
      console.error('Error in calculateActiveTime:', error);
      throw new Error('Failed to calculate active time');
    }
  }

  // Cálculo 15: Tiempo de inactividad de empleados
  async calculateIdleTime(filters: {
    userId?: string;
    branchOffice?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    try {
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      let usersSnapshot;

      if (filters.userId) {
        const userDoc = await this.firestore
          .collection('users')
          .doc(filters.userId)
          .get();
        if (!userDoc.exists) return 0;
        usersSnapshot = [userDoc];
      } else {
        let query = this.firestore.collection(
          'users',
        ) as FirebaseFirestore.Query;
        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }
        const snapshot = await query.get();
        if (snapshot.empty) return 0;
        usersSnapshot = snapshot.docs;
      }

      console.log('Fetching all assignments within the date range...');
      const assignmentsSnapshot = await this.firestore
        .collection('assignments')
        .where('status', '==', 'completed')
        .where('startedAt', '>=', startDate || new Date(0))
        .where('startedAt', '<=', endDate || new Date())
        .get();

      console.log(`Total assignments fetched: ${assignmentsSnapshot.size}`);

      const assignmentsByUserAndDate: Record<
        string,
        Record<string, number>
      > = {};

      assignmentsSnapshot.docs.forEach((doc) => {
        const assignment = doc.data();
        const assignTo = assignment.assignTo;
        const startedAt = assignment.startedAt.toDate();
        const duration = assignment.duration || 0;

        const dateKey = startedAt.toISOString().split('T')[0];

        if (!assignmentsByUserAndDate[assignTo]) {
          assignmentsByUserAndDate[assignTo] = {};
        }
        if (!assignmentsByUserAndDate[assignTo][dateKey]) {
          assignmentsByUserAndDate[assignTo][dateKey] = 0;
        }
        assignmentsByUserAndDate[assignTo][dateKey] += duration;

        console.log(
          `Assignment Processed: User ID: ${assignTo}, Date: ${dateKey}, Duration: ${duration}`,
        );
      });

      let totalIdleTime = 0;

      for (const doc of usersSnapshot) {
        const user = doc.data();
        const { dailyAssistance } = user;

        console.log(`Processing User: ${doc.id}`);
        console.log(
          `Daily Assistance Entries: ${dailyAssistance?.length || 0}`,
        );

        if (!dailyAssistance) continue;

        for (const attendance of dailyAssistance) {
          const date =
            attendance.date instanceof Timestamp
              ? attendance.date.toDate()
              : new Date(attendance.date);

          if (
            (!startDate || date >= startDate) &&
            (!endDate || date <= endDate)
          ) {
            const totalMinutes = (attendance.totalHours || 0) * 60;

            const dateKey = date.toISOString().split('T')[0];
            const userAssignments =
              assignmentsByUserAndDate[doc.id]?.[dateKey] || 0;

            console.log('---');
            console.log('Processing Attendance Entry');
            console.log('User ID:', doc.id);
            console.log('Attendance Date:', date);
            console.log('Total Hours (en minutos):', totalMinutes);
            console.log('Total Activity Time (en minutos):', userAssignments);

            const idleTime = totalMinutes - userAssignments;
            if (idleTime > 0) {
              totalIdleTime += idleTime;
              console.log(
                'Idle Time (Tiempo de Inactividad en minutos):',
                idleTime,
              );
            } else {
              console.log('Idle Time is negative or zero. Skipping...');
            }
            console.log('---');
          }
        }
      }

      console.log(
        'Total Idle Time (Tiempo de Inactividad Total en minutos):',
        totalIdleTime,
      );

      return totalIdleTime;
    } catch (error) {
      console.error('Error in calculateIdleTime:', error);
      throw new Error('Failed to calculate idle time');
    }
  }

  //Cálculo 16: Cantidad de empleados activos
  async calculateActiveUsers(filters: {
    userId?: string;
    branchOffice?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    try {
      const startDateTimestamp = filters.startDate
        ? Timestamp.fromDate(new Date(filters.startDate))
        : null;
      const endDateTimestamp = filters.endDate
        ? Timestamp.fromDate(new Date(filters.endDate))
        : null;

      let usersSnapshot;

      if (filters.userId) {
        const userDoc = await this.firestore
          .collection('users')
          .doc(filters.userId)
          .get();
        if (!userDoc.exists) return 0;
        usersSnapshot = [userDoc];
      } else {
        let query = this.firestore.collection(
          'users',
        ) as FirebaseFirestore.Query;
        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }
        const snapshot = await query.get();
        if (snapshot.empty) return 0;
        usersSnapshot = snapshot.docs;
      }

      let activeUsersCount = 0;

      for (const doc of usersSnapshot) {
        const user = doc.data();
        const { dailyAssistance } = user;

        // Verificar si el usuario tiene registros de asistencia en el rango
        const hasActiveEntries = dailyAssistance.some((attendance) => {
          const date =
            attendance.date instanceof Timestamp
              ? attendance.date.toDate()
              : new Date(attendance.date);

          return (
            (!filters.startDate || date >= filters.startDate) &&
            (!filters.endDate || date <= filters.endDate)
          );
        });

        if (hasActiveEntries) {
          activeUsersCount++;
          console.log(`User ID ${doc.id} is active within the filters.`);
        } else {
          console.log(`User ID ${doc.id} is NOT active within the filters.`);
        }
      }

      console.log('Total Active Users:', activeUsersCount);
      return activeUsersCount;
    } catch (error) {
      console.error('Error in calculateActiveUsers:', error);
      throw new Error('Failed to calculate active users');
    }
  }

  //Dimensión: Puntualidad del Personal
  // Cálculo 17: Porcentaje de técnicos que cumplen con los horarios de salida
  async calculateOnTimeDepartureCompliance(filters: {
    userId?: string;
    branchOffice?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    try {
      const outTime = '17:00'; // Hora de salida establecida
      const toleranceMinutes = 10; // Minutos de holgura
      const [outHour, outMinute] = outTime.split(':').map(Number);

      // Crear solo horas de tolerancia para la salida
      const minOutTimeMinutes = outHour * 60 + outMinute - toleranceMinutes;
      const maxOutTimeMinutes = outHour * 60 + outMinute + toleranceMinutes;

      let usersSnapshot;

      if (filters.userId) {
        const userDoc = await this.firestore
          .collection('users')
          .doc(filters.userId)
          .get();
        if (!userDoc.exists) return 0;
        usersSnapshot = [userDoc];
      } else {
        let query = this.firestore.collection(
          'users',
        ) as FirebaseFirestore.Query;

        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }

        const querySnapshot = await query.get();
        if (querySnapshot.empty) {
          console.log(
            'No se encontraron usuarios en la colección dentro del rango especificado.',
          );
          return 0;
        }
        usersSnapshot = querySnapshot.docs;
      }

      let compliantCount = 0;
      let totalCount = 0;

      for (const doc of usersSnapshot) {
        const user = doc.data();
        const { dailyAssistance } = user;

        if (!dailyAssistance || dailyAssistance.length === 0) {
          continue; // Ignorar usuarios sin registros de asistencia
        }

        dailyAssistance.forEach((attendance) => {
          let date;
          if (attendance.date instanceof Timestamp) {
            date = attendance.date.toDate();
          } else if (
            typeof attendance.date === 'string' ||
            attendance.date instanceof Date
          ) {
            date = new Date(attendance.date);
          } else {
            return; // Salir del loop si el formato no es soportado
          }

          // Filtrar solo las fechas en el rango especificado
          if (
            (filters.startDate && date < filters.startDate) ||
            (filters.endDate && date > filters.endDate)
          ) {
            return; // Ignorar registros fuera del rango de fechas
          }

          totalCount += 1;
          console.log('Attendance Date:', date);

          const lastInterval =
            attendance.intervals[attendance.intervals.length - 1];
          const checkOutDate = lastInterval.checkOut.toDate();

          const checkOutMinutes =
            checkOutDate.getHours() * 60 + checkOutDate.getMinutes();

          if (
            checkOutMinutes >= minOutTimeMinutes &&
            checkOutMinutes <= maxOutTimeMinutes
          ) {
            compliantCount += 1;
            console.log('Filtered Data (Compliant):');
            console.log('User ID:', doc.id);
            console.log('Attendance Date:', date);
            console.log('Check-out Date:', checkOutDate);
            console.log('Check-out dentro del rango permitido');
          } else {
            console.log('Filtered Data (Non-Compliant):');
            console.log('User ID:', doc.id);
            console.log('Attendance Date:', date);
            console.log('Check-out Date:', checkOutDate);
            console.log('Check-out fuera del rango permitido');
          }
        });
      }

      const compliancePercentage =
        totalCount > 0 ? (compliantCount / totalCount) * 100 : 0;
      console.log('Filtered Compliance Percentage:', compliancePercentage);

      return compliancePercentage;
    } catch (error) {
      console.error('Error in calculateOnTimeDepartureCompliance:', error);
      throw new Error('Failed to calculate on-time departure compliance');
    }
  }

  //Cálculo 18: Porcentaje de técnicos que cumplen con los horarios de entrada
  async calculateOnTimeEntryCompliance(filters: {
    userId?: string;
    branchOffice?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    try {
      const entryTime = '08:00'; // Hora de entrada establecida
      const toleranceMinutes = 10; // Minutos de holgura
      const [entryHour, entryMinute] = entryTime.split(':').map(Number);

      const minEntryTimeMinutes =
        entryHour * 60 + entryMinute - toleranceMinutes;
      const maxEntryTimeMinutes =
        entryHour * 60 + entryMinute + toleranceMinutes;

      let usersSnapshot;

      if (filters.userId) {
        const userDoc = await this.firestore
          .collection('users')
          .doc(filters.userId)
          .get();
        if (!userDoc.exists) return 0;
        usersSnapshot = [userDoc];
      } else {
        let query = this.firestore.collection(
          'users',
        ) as FirebaseFirestore.Query;

        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }

        const querySnapshot = await query.get();
        if (querySnapshot.empty) {
          console.log(
            'No se encontraron usuarios en la colección dentro del rango especificado.',
          );
          return 0;
        }
        usersSnapshot = querySnapshot.docs;
      }

      let compliantCount = 0;
      let totalCount = 0;

      for (const doc of usersSnapshot) {
        const user = doc.data();
        const { dailyAssistance } = user;

        if (!dailyAssistance || dailyAssistance.length === 0) {
          continue; // Ignorar usuarios sin registros de asistencia
        }

        dailyAssistance.forEach((attendance) => {
          let date;
          if (attendance.date instanceof Timestamp) {
            date = attendance.date.toDate();
          } else if (
            typeof attendance.date === 'string' ||
            attendance.date instanceof Date
          ) {
            date = new Date(attendance.date);
          } else {
            return; // Salir del loop si el formato no es soportado
          }

          // Filtrar solo las fechas en el rango especificado
          if (
            (filters.startDate && date < filters.startDate) ||
            (filters.endDate && date > filters.endDate)
          ) {
            return; // Ignorar registros fuera del rango de fechas
          }

          totalCount += 1;
          console.log('Attendance Date:', date);

          const firstInterval = attendance.intervals[0];
          const checkInDate = firstInterval.checkIn.toDate();

          const checkInMinutes =
            checkInDate.getHours() * 60 + checkInDate.getMinutes();

          if (
            checkInMinutes >= minEntryTimeMinutes &&
            checkInMinutes <= maxEntryTimeMinutes
          ) {
            compliantCount += 1;
            console.log('Filtered Data (Compliant):');
            console.log('User ID:', doc.id);
            console.log('Attendance Date:', date);
            console.log('Check-in Date:', checkInDate);
            console.log('Check-in dentro del rango permitido');
          } else {
            console.log('Filtered Data (Non-Compliant):');
            console.log('User ID:', doc.id);
            console.log('Attendance Date:', date);
            console.log('Check-in Date:', checkInDate);
            console.log('Check-in fuera del rango permitido');
          }
        });
      }

      const compliancePercentage =
        totalCount > 0 ? (compliantCount / totalCount) * 100 : 0;
      console.log('Filtered Compliance Percentage:', compliancePercentage);

      return compliancePercentage;
    } catch (error) {
      console.error('Error in calculateOnTimeEntryCompliance:', error);
      throw new Error('Failed to calculate on-time entry compliance');
    }
  }

  //Cálculo 19: Empleado que cumple con la jornada completa
  async calculateFullDayCompliance(filters: {
    userId?: string;
    branchOffice?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    try {
      const requiredHours = 8; // Horas requeridas para jornada completa

      // Convertir filtros de fechas a Timestamps
      const startDateTimestamp = filters.startDate
        ? Timestamp.fromDate(new Date(filters.startDate))
        : null;
      const endDateTimestamp = filters.endDate
        ? Timestamp.fromDate(new Date(filters.endDate))
        : null;

      let usersSnapshot;

      if (filters.userId) {
        const userDoc = await this.firestore
          .collection('users')
          .doc(filters.userId)
          .get();
        if (!userDoc.exists) return 0;
        usersSnapshot = [userDoc];
      } else {
        let query = this.firestore.collection(
          'users',
        ) as FirebaseFirestore.Query;

        if (filters.branchOffice) {
          query = query.where('branchOffice', '==', filters.branchOffice);
        }

        const querySnapshot = await query.get();
        if (querySnapshot.empty) {
          console.log('No users found with the specified filters.');
          return 0;
        }
        usersSnapshot = querySnapshot.docs;
      }

      let fullDayCompliantCount = 0;
      let totalEntries = 0;

      for (const doc of usersSnapshot) {
        const user = doc.data();
        const { dailyAssistance } = user;

        dailyAssistance.forEach((attendance) => {
          // Verificar si `attendance.date` es un Timestamp y convertirlo si no lo es
          let date;
          if (attendance.date instanceof Timestamp) {
            date = attendance.date.toDate();
          } else {
            console.log(
              'Non-Timestamp Date Detected:',
              doc.id,
              attendance.date,
            );
            date = new Date(attendance.date); // Convertir si es necesario
          }

          // Verificar si la fecha está dentro del rango especificado
          if (
            (!filters.startDate || date >= filters.startDate) &&
            (!filters.endDate || date <= filters.endDate)
          ) {
            totalEntries += 1;

            if (attendance.totalHours >= requiredHours) {
              fullDayCompliantCount += 1;

              console.log('Filtered Data (Compliant):');
              console.log('User ID:', doc.id);
              console.log('Attendance Date:', date);
              console.log('Total Hours:', attendance.totalHours);
              console.log('Cumple con jornada completa');
            } else {
              console.log('Filtered Data (Non-Compliant):');
              console.log('User ID:', doc.id);
              console.log('Attendance Date:', date);
              console.log('Total Hours:', attendance.totalHours);
              console.log('No cumple con jornada completa');
            }
          }
        });
      }

      const compliancePercentage =
        totalEntries > 0 ? (fullDayCompliantCount / totalEntries) * 100 : 0;
      console.log(
        'Filtered Full-Day Compliance Percentage:',
        compliancePercentage,
      );

      return compliancePercentage;
    } catch (error) {
      console.error('Error in calculateFullDayCompliance:', error);
      throw new Error('Failed to calculate full-day compliance');
    }
  }
}
