import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { User } from '../users/user.entity';
import { Assistance } from 'src/assistance/entities/assistance.entity';

@Injectable()
export class CalculationService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>, // Inyectamos el repositorio de asignaciones
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Inyectamos el repositorio de usuarios
    @InjectRepository(Assistance)
    private readonly assistanceRepository: Repository<Assistance>, // Inyectamos el repositorio de asistencias
  ) {}

  // Método para obtener el tiempo activo total por usuario
  async getUserActiveTime(userId: string) {
    const result = await this.assignmentRepository.query(
      `
    SELECT 
      SUM(duration) AS totalActiveTime
    FROM 
      assignments
    WHERE 
      status = 'completed'
      AND "completedAt" BETWEEN 
        (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
      AND "assignToId" = $1  -- ID del usuario
    `,
      [userId],
    );

    return result || null;
  }

  // Método para obtener el tiempo activo promedio por sucursal (promediado por el número de usuarios)
  async getBranchAverageActiveTime(branchOfficeId: string) {
    const result = await this.assignmentRepository.query(
      `
    SELECT 
      SUM(duration) / COUNT(DISTINCT "assignToId") AS averageActiveTime
    FROM 
      assignments
    WHERE 
      status = 'completed'
      AND "completedAt" BETWEEN 
        (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
      AND "branchOfficeId" = $1  -- ID de la sucursal
    `,
      [branchOfficeId],
    );

    return result || null;
  }

  // Método para obtener el tiempo activo promedio global (promediado por el número de usuarios)
  async getGlobalAverageActiveTime() {
    const result = await this.assignmentRepository.query(`
    SELECT 
      SUM(duration) / COUNT(DISTINCT "assignToId") AS averageActiveTime
    FROM 
      assignments
    WHERE 
      status = 'completed'
      AND "completedAt" BETWEEN 
        (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
  `);

    return result || null;
  }
  // Método para obtener el tiempo promedio de actividad por tipo de actividad y usuario
  async getUserAverageActivityTimeByType(userId: string) {
    const result = await this.assignmentRepository.query(
      `
    SELECT 
      "activityTypeId",
      AVG(duration) AS averageDuration
    FROM 
      assignments
    WHERE 
      status = 'completed'
      AND "completedAt" BETWEEN 
        (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
      AND "assignToId" = $1  -- ID del usuario
    GROUP BY 
      "activityTypeId";
    `,
      [userId],
    );

    return result || null;
  }

  // Método para obtener el tiempo promedio de actividad por tipo de actividad y sucursal
  async getBranchAverageActivityTimeByType(branchOfficeId: string) {
    const result = await this.assignmentRepository.query(
      `
    SELECT 
      "activityTypeId",
      AVG(duration) AS averageDuration
    FROM 
      assignments
    WHERE 
      status = 'completed'
      AND "completedAt" BETWEEN 
        (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
      AND "branchOfficeId" = $1  -- ID de la sucursal
    GROUP BY 
      "activityTypeId";
    `,
      [branchOfficeId],
    );

    return result || null;
  }

  // Método para obtener el tiempo promedio de actividad global por tipo de actividad
  async getGlobalAverageActivityTimeByType() {
    const result = await this.assignmentRepository.query(`
    SELECT 
      "activityTypeId",
      AVG(duration) AS averageDuration
    FROM 
      assignments
    WHERE 
      status = 'completed'
      AND "completedAt" BETWEEN 
        (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
    GROUP BY 
      "activityTypeId";
  `);

    return result || null;
  }

  async getUserSuppliesUsed(userId: string) {
    const result = await this.assignmentRepository.query(
      `
      SELECT 
        at."name" AS "activityType",
        s."id" AS "supplyId", 
        SUM(asu."quantityUsed") AS "totalUsed",
        COUNT(DISTINCT a."id") AS "totalAssignments",
        SUM(asu."quantityUsed") / COUNT(DISTINCT a."id") AS "averageUsedPerAssignment"
      FROM 
        assignments a
      INNER JOIN 
        assigned_supplies asu ON a."id" = asu."assignmentId"
      INNER JOIN 
        supplies s ON asu."supplyId" = s."id"
      INNER JOIN
        activity_types at ON a."activityTypeId" = at."id"
      WHERE 
        a."status" = 'completed' 
        AND a."completedAt" BETWEEN 
            (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
        AND a."assignToId" = $1
      GROUP BY 
        at."name", s."id";
    `,
      [userId],
    );

    return result || null;
  }

  async getBranchSuppliesUsed(branchOfficeId: string) {
    const result = await this.assignmentRepository.query(
      `
      SELECT 
        at."name" AS "activityType",
        s."id" AS "supplyId", 
        SUM(asu."quantityUsed") AS "totalUsed",
        COUNT(DISTINCT a."id") AS "totalAssignments",
        SUM(asu."quantityUsed") / COUNT(DISTINCT a."id") AS "averageUsedPerAssignment"
      FROM 
        assignments a
      INNER JOIN 
        assigned_supplies asu ON a."id" = asu."assignmentId"
      INNER JOIN 
        supplies s ON asu."supplyId" = s."id"
      INNER JOIN
        activity_types at ON a."activityTypeId" = at."id"
      WHERE 
        a."status" = 'completed' 
        AND a."completedAt" BETWEEN 
            (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
        AND a."branchOfficeId" = $1
      GROUP BY 
        at."name", s."id";
    `,
      [branchOfficeId],
    );

    return result || null;
  }

  async getGlobalSuppliesUsed() {
    const result = await this.assignmentRepository.query(`
      SELECT 
        at."name" AS "activityType",
        s."id" AS "supplyId", 
        SUM(asu."quantityUsed") AS "totalUsed",
        COUNT(DISTINCT a."id") AS "totalAssignments",
        SUM(asu."quantityUsed") / COUNT(DISTINCT a."id") AS "averageUsedPerAssignment"
      FROM 
        assignments a
      INNER JOIN 
        assigned_supplies asu ON a."id" = asu."assignmentId"
      INNER JOIN 
        supplies s ON asu."supplyId" = s."id"
      INNER JOIN
        activity_types at ON a."activityTypeId" = at."id"
      WHERE 
        a."status" = 'completed' 
        AND a."completedAt" BETWEEN 
            (CURRENT_DATE - INTERVAL '1 day') AND (CURRENT_DATE - INTERVAL '1 second')
      GROUP BY 
        at."name", s."id";
    `);

    return result || null;
  }

  // Método para obtener el tiempo de inactividad por usuario
  async getUserInactivityTime(userId: string) {
    const result = await this.assistanceRepository.query(
      `
      WITH AssistanceTimes AS (
          SELECT 
              a."userId",
              a."date" AS entryTime,
              b."date" AS exitTime,
              EXTRACT(EPOCH FROM (b."date" - a."date")) / 3600 AS downtimeHours
          FROM 
              assistances a
          JOIN 
              assistances b ON a."userId" = b."userId" 
              AND a.type = 'IN' 
              AND b.type = 'OUT'
          WHERE 
              a."date"::date = CURRENT_DATE - INTERVAL '1 day'
              AND b."date"::date = CURRENT_DATE - INTERVAL '1 day'
          ORDER BY 
              a."userId", a."date"
      )
      SELECT 
          "userId", 
          SUM(downtimeHours) AS totalDowntime
      FROM 
          AssistanceTimes
      WHERE 
          "userId" = $1
      GROUP BY 
          "userId";
      `,
      [userId],
    );

    return result[0] || { userId, totalDowntime: 0 }; // Retorna 0 si no hay datos
  }

  // Método para obtener el tiempo de inactividad por oficina de sucursal
  async getBranchOfficeInactivityTime(branchOfficeId: string) {
    const result = await this.assistanceRepository.query(
      `
      WITH AssistanceTimes AS (
          SELECT 
              a."userId",
              a."date" AS entryTime,
              b."date" AS exitTime,
              EXTRACT(EPOCH FROM (b."date" - a."date")) / 3600 AS downtimeHours
          FROM 
              assistances a
          JOIN 
              assistances b ON a."userId" = b."userId" 
              AND a.type = 'IN' 
              AND b.type = 'OUT'
          JOIN 
              users u ON u.id = a."userId"  -- Aseguramos el JOIN con la tabla de usuarios
          WHERE 
              a."date"::date = CURRENT_DATE - INTERVAL '1 day'
              AND b."date"::date = CURRENT_DATE - INTERVAL '1 day'
              AND u."branchOfficeId" = $1  -- Filtramos por el branchOfficeId proporcionado
          ORDER BY 
              a."userId", a."date"
      )
      SELECT 
          "userId", 
          SUM(downtimeHours) AS totalDowntime
      FROM 
          AssistanceTimes
      GROUP BY 
          "userId";
      `,
      [branchOfficeId] // Parámetro para filtrar por branchOfficeId
    );
  
    return result || []; // Retornamos un arreglo vacío si no hay resultados
  }
  

  // Método para obtener el tiempo de inactividad global (para todos los usuarios)
  async getGlobalInactivityTime() {
    const result = await this.assistanceRepository.query(
      `
      WITH AssistanceTimes AS (
          SELECT 
              a."userId",
              a."date" AS entryTime,
              b."date" AS exitTime,
              EXTRACT(EPOCH FROM (b."date" - a."date")) / 3600 AS downtimeHours
          FROM 
              assistances a
          JOIN 
              assistances b ON a."userId" = b."userId" 
              AND a.type = 'IN' 
              AND b.type = 'OUT'
          WHERE 
              a."date"::date = CURRENT_DATE - INTERVAL '1 day'
              AND b."date"::date = CURRENT_DATE - INTERVAL '1 day'
          ORDER BY 
              a."userId", a."date"
      )
      SELECT 
          "userId", 
          SUM(downtimeHours) AS totalDowntime
      FROM 
          AssistanceTimes
      GROUP BY 
          "userId";
      `,
    );

    return result || []; // Retorna un arreglo vacío si no hay datos
  }
}
