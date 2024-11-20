import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

// Definir una interfaz para el técnico
interface Technician {
  id: string;
  branchOffice: string; // Asegúrate de que esta propiedad existe en Firestore
}

interface User {
  id: string;
  branchOffice: string;
  userType: string; // Asegúrate de que esta propiedad está incluida
}

@Injectable()
export class TestsService {
  private firestore: Firestore;
  private activityNumberCounter = 1; // Contador para el activityNumber
  private assignmentNumberCounter = 1; // Contador para el assignmentNumber

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async getCollectionData(collectionName: string) {
    const snapshot = await this.firestore.collection(collectionName).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data;
  }

  // Obtener técnico por ID
  async getTechnicianById(userId: string): Promise<Technician> {
    const userRef = await this.firestore.collection('users').doc(userId).get();
    if (!userRef.exists) {
      throw new Error(`Técnico con ID ${userId} no encontrado.`);
    }
    return { id: userRef.id, ...userRef.data() } as Technician;
  }

  // Obtener admin por branchOffice
  async getAdminByBranchOffice(branchOfficeId: string) {
    // Busca todos los usuarios en la sucursal
    const usersInBranch = await this.firestore
      .collection('users')
      .where('branchOffice', '==', branchOfficeId)
      .get();

    // Filtrar solo administradores
    const admins = usersInBranch.docs
      .map((doc) => ({ id: doc.id, ...doc.data() })) // Asegúrate de incluir todos los campos del documento
      .filter((user: User) => user.userType === 'XTz672YroECmH05WXvGs'); // Filtrar por userType

    // Verificar si se encontraron administradores
    if (admins.length === 0) {
      throw new Error(
        `No se encontró un administrador para la sucursal ${branchOfficeId}.`,
      );
    }

    return admins[0]; // Retorna el primer admin encontrado
  }

  async generateActivitiesForMultipleUsers(startDate: Date, endDate: Date) {
    const users = await this.getCollectionData('users'); // Obtener todos los usuarios
    const technicians = users.filter(
      (user: User) => user.userType === 'iA9m6EFG56ygs32OOYsI',
    ); // Filtrar técnicos

    const results = [];

    for (const technician of technicians) {
      const userResult = await this.generateActivitiesForUserInRange(
        technician.id,
        startDate,
        endDate,
      );
      results.push({
        userId: technician.id,
        activities: userResult.activities,
        assignments: userResult.assignments,
      });
    }

    return {
      message: 'Actividades y asignaciones generadas para múltiples usuarios',
      results,
    };
  }

  private async generateActivitiesForUserInRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const activities = [];
    const assignments = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        // Solo lunes a viernes
        const dailyResult = await this.generateDailyActivitiesAndAssignments(
          userId,
          new Date(currentDate),
        );
        activities.push(...dailyResult.activities);
        assignments.push(...dailyResult.assignments);
      }
      currentDate.setDate(currentDate.getDate() + 1); // Avanzar al siguiente día
    }

    return { activities, assignments };
  }

  // Generar actividades y asignaciones para un usuario en un día
  async generateDailyActivitiesAndAssignments(userId: string, date: Date) {
    const technician = await this.getTechnicianById(userId);
    if (!technician.branchOffice) {
      throw new Error(
        `El técnico con ID ${userId} no tiene definida una sucursal.`,
      );
    }
    const activityTypes = await this.getCollectionData('activityTypes');
    if (activityTypes.length === 0) {
      throw new Error('No se encontraron tipos de actividades.');
    }
    const admin = await this.getAdminByBranchOffice(technician.branchOffice);
    const activities = [];
    const assignments = [];
    const startTime = new Date(date);
    startTime.setHours(8, 0, 0, 0);
    let currentTime = new Date(startTime);
    let endTime = new Date(date);
    endTime.setHours(16, 30, 0, 0);

    // Generar createdAt primero, dentro de hasta 2 días antes
    const createdAt = this.getRandomCreatedAt(date);

    // Generar assignmentDate, que será el mismo día que startedAt
    const assignmentDate = new Date(date);
    assignmentDate.setHours(
      8 + Math.floor(Math.random() * 2),
      Math.floor(Math.random() * 60),
    ); // Entre 8 AM y 9 AM

    // Generar actividades para cubrir la jornada laboral
    while (currentTime.getHours() < 16 && activities.length < 5) {
      const randomType = this.getRandomActivityType(activityTypes);
      const { description, estimatedTime, neededSupplies = [] } = randomType;

      // Establecer el tiempo de actividad
      let activityDuration = estimatedTime || Math.floor(Math.random() * 480);

      // Asegurarse de que no sobrepase el horario laboral
      let activityEndTime = new Date(
        currentTime.getTime() + activityDuration * 60000,
      );
      if (activityEndTime > endTime) {
        activityEndTime = endTime;
        activityDuration = (endTime.getTime() - currentTime.getTime()) / 60000;
      }

      const activity = {
        activityNumber: this.activityNumberCounter++,
        activityType: randomType.id,
        address: `Calle ${Math.floor(Math.random() * 1000)} Trujillo`,
        branchOffice: technician.branchOffice,
        comment: 'Actividad completada satisfactoriamente',
        createdAt: createdAt,
        description,
        duration: activityDuration,
        estimatedTime,
        evidence: this.generateEvidence(),
        neededSupply: this.mapNeededSupplies(neededSupplies),
        orderNumber: `C000${this.activityNumberCounter}`, // Asegurar número único
        serviceLocation: this.generateServiceLocation(),
        startedAt: new Date(currentTime),
        completedAt: new Date(activityEndTime),
        status: 'completed',
      };
      activities.push(activity);

      const assignment = {
        activityType: activity.activityType,
        address: activity.address,
        assignFrom: admin.id,
        assignTo: technician.id,
        assignmentDate: assignmentDate,
        assignmentNumber: this.assignmentNumberCounter++,
        branchOffice: activity.branchOffice,
        comment: activity.comment,
        completedAt: new Date(activityEndTime),
        createdAt: activity.createdAt,
        description: activity.description,
        duration: activity.duration,
        estimatedTime: activity.estimatedTime,
        evidence: activity.evidence,
        neededSupply: activity.neededSupply,
        orderNumber: activity.orderNumber,
        serviceLocation: activity.serviceLocation,
        startedAt: new Date(currentTime),
        status: activity.status,
      };
      assignments.push(assignment);

      // Pausa aleatoria de 3 a 10 minutos entre actividades
      const pauseDuration = Math.floor(Math.random() * 8) + 3;
      currentTime = new Date(activityEndTime.getTime() + pauseDuration * 60000);

      // Si la próxima actividad se pasa del final del día, rompemos el bucle
      if (currentTime >= endTime) {
        break;
      }
    }

    await Promise.all(
      activities.map((activity) =>
        this.firestore.collection('activities').add(activity),
      ),
    );
    await Promise.all(
      assignments.map((assignment) =>
        this.firestore.collection('assignments').add(assignment),
      ),
    );

    return {
      message: 'Actividades y asignaciones generadas exitosamente',
      activities,
      assignments,
    };
  }

  // Método para obtener una fecha de creación aleatoria dentro del horario laboral, 1-2 días antes
  private getRandomCreatedAt(date: Date) {
    const randomDays = Math.floor(Math.random() * 2) + 1; // Entre 1 y 2 días antes
    const createdAt = new Date(date);
    createdAt.setDate(createdAt.getDate() - randomDays);
    createdAt.setHours(
      8 + Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 60),
    ); // Entre 8 AM y 10 AM
    return createdAt;
  }

  // Método para obtener una fecha de asignación aleatoria dentro del mismo día que startedAt
  private getRandomAssignmentDate(date: Date) {
    const assignmentDate = new Date(date);
    assignmentDate.setHours(
      8 + Math.floor(Math.random() * 2),
      Math.floor(Math.random() * 60),
    ); // Entre 8 AM y 9 AM
    return assignmentDate;
  }

  // Método para obtener una fecha de inicio aleatoria dentro del horario laboral
  private getRandomStartedAt(date: Date) {
    const startedAt = new Date(date);
    startedAt.setHours(
      8 + Math.floor(Math.random() * 9),
      Math.floor(Math.random() * 60),
    ); // Entre 8 AM y 4 PM
    return startedAt;
  }

  // Obtener un tipo de actividad aleatorio
  private getRandomActivityType(activityTypes: any[]) {
    const randomIndex = Math.floor(Math.random() * activityTypes.length);
    return activityTypes[randomIndex];
  }

  // Generar evidencia de la actividad
  private generateEvidence() {
    return Array.from({ length: 4 }, (_, index) => ({
      evidence: `evidence${index + 1}`,
      url: `https://example.com/evidence${index + 1}.jpg`,
    }));
  }

  // Mapear supplies necesarios
  private mapNeededSupplies(neededSupplies: any[]) {
    return neededSupplies.map((supply) => {
      let quantity = Math.floor(Math.random() * (supply.estimatedUse + 1)); // Aleatorio entre 0 y estimatedUse
      if (supply.supply === 'supply4' || supply.supply === 'supply9') {
        quantity = Math.min(quantity, supply.estimatedUse + 100); // Hasta +100 si es cable
      }
      return {
        ...supply,
        quantity:
          quantity >= supply.estimatedUse ? quantity : supply.estimatedUse, // quantity debe ser igual a estimatedUse o +1
      };
    });
  }

  // Generar ubicación del servicio
  private generateServiceLocation() {
    return [Math.random() * -10, Math.random() * -80]; // Coordenadas aleatorias
  }

  // Obtener duración aleatoria en un rango
  private getRandomDuration(baseTime: number) {
    const minDuration = Math.max(0, baseTime - 10); // Margen de 10 minutos menos
    const maxDuration = baseTime + 20; // Margen de 20 minutos más
    return (
      Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration
    );
  }
}
