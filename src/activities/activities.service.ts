import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Firestore, FieldValue, GeoPoint } from '@google-cloud/firestore';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { UpdateActivityTypeDto } from '../activity-types/dto/update-activity-type.dto';
import { Subject, Observable } from 'rxjs'; // Importa Observable y Subject

@Injectable()
export class ActivitiesService {
  private readonly firestore: Firestore;

  // Creamos el Subject para emitir los cambios
  private activityChanges$ = new Subject<any[]>();

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
    this.initActivityListener();
  }

  // Método para escuchar cambios en tiempo real en la colección de actividades
  private initActivityListener() {
    this.firestore.collection('activities').onSnapshot((snapshot) => {
      const activities = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.activityChanges$.next(activities); // Emitir cambios
    });
  }

  // Obtener los cambios de actividades en tiempo real
  getActivityChanges(): Observable<any[]> {
    // Cambiamos el tipo de retorno a Observable
    return this.activityChanges$.asObservable(); // Emitir como un Observable
  }

  async getTotalActivities(): Promise<number> {
    try {
      const counterDoc = await this.firestore
        .collection('counters')
        .doc('activityNumberCounter') // Aquí cambias por el nombre exacto de tu documento
        .get();

      if (!counterDoc.exists) {
        throw new NotFoundException('Contador no encontrado');
      }

      return counterDoc.data().currentActivityNumber;
    } catch (error) {
      throw new HttpException(
        'Error obteniendo el total de usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para obtener todas las actividades con paginación y filtros
  async getAllActivities(
    userId?: string,
    status?: string,
    pageSize: number = 10,
    startAfterActivityNumber?: number,
  ) {
    try {
      let query: FirebaseFirestore.Query = this.firestore
        .collection('activities')
        .orderBy('createdAt')
        .limit(pageSize);

      if (userId) {
        query = query.where('userId', '==', userId);
      }
      if (status) {
        query = query.where('status', '==', status);
      }

      if (startAfterActivityNumber) {
        query = query.startAfter(startAfterActivityNumber);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new BadRequestException('Error fetching activities');
    }
  }

  // Búsqueda por coincidencia en varios campos
  async searchActivities(term: string) {
    const snapshot = await this.firestore.collection('activities').get();
    const lowerTerm = term.toLowerCase();

    const activities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    // Filtrar actividades que coinciden con el término de búsqueda en `orderNumber`, `address`, `branchOffice`, etc.
    const filtered = activities.filter(
      (activity) =>
        activity.orderNumber?.toLowerCase().includes(lowerTerm) ||
        activity.address?.toLowerCase().includes(lowerTerm) ||
        activity.branchOffice?.toLowerCase().includes(lowerTerm) ||
        activity.activityType?.toLowerCase().includes(lowerTerm) ||
        activity.neededSupply?.some((supply: any) =>
          supply.supply?.toLowerCase().includes(lowerTerm),
        ),
    );

    if (filtered.length === 0) {
      throw new NotFoundException('No matching activities found.');
    }

    return filtered;
  }

  // Método para obtener actividades por sucursal
  async getAllActivitiesByBranchOffice(branchOfficeId: string) {
    const activitiesSnapshot = await this.firestore
      .collection('activities')
      .where('branchOffice', '==', branchOfficeId)
      .get();

    if (activitiesSnapshot.empty) {
      throw new NotFoundException(
        `No activities found for branch office ${branchOfficeId}`,
      );
    }

    return activitiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // Método para obtener una actividad por ID
  async getActivityById(id: string) {
    const activityRef = this.firestore.collection('activities').doc(id);
    const activitySnapshot = await activityRef.get();

    if (!activitySnapshot.exists) {
      throw new NotFoundException('Activity not found');
    }

    return { id: activitySnapshot.id, ...activitySnapshot.data() };
  }

  // Crear actividad
  async createActivity(createActivityDto: CreateActivityDto) {
    try {
      const { orderNumber, activityType, address, branchOffice } =
        createActivityDto;

      // Verificar si el número de orden ya existe
      const existingActivity = await this.firestore
        .collection('activities')
        .where('orderNumber', '==', orderNumber)
        .get();

      if (!existingActivity.empty) {
        throw new ConflictException(
          `Activity with order number ${orderNumber} already exists.`,
        );
      }

      // Obtener el tipo de actividad y los suministros necesarios
      const activityTypeSnapshot = await this.firestore
        .collection('activityTypes')
        .doc(activityType)
        .get();

      // Verificar si el tipo de actividad existe
      if (!activityTypeSnapshot.exists) {
        throw new NotFoundException('Activity type not found');
      }

      // Verificar si la sucursal (branchOffice) existe
      const branchOfficeSnapshot = await this.firestore
        .collection('branchOffices')
        .doc(branchOffice)
        .get();

      if (!branchOfficeSnapshot.exists) {
        throw new NotFoundException('Branch office not found');
      }

      const activityTypeData = activityTypeSnapshot.data();
      const neededSupplies = activityTypeData.neededSupplies;

      // Crear el array de supplies con quantity en 0
      const neededSupplyArray = neededSupplies.map((supply: any) => ({
        supply: supply.supply,
        quantity: 0, // Inicializar cantidad en 0
        estimatedUse: supply.estimatedUse,
        unit: supply.unit,
      }));

      // Obtener el siguiente activityNumber
      const counterRef = this.firestore
        .collection('counters')
        .doc('activityNumberCounter');
      const counterDoc = await counterRef.get();
      let newActivityNumber = 1;

      if (counterDoc.exists) {
        newActivityNumber = counterDoc.data().currentActivityNumber + 1;
        await counterRef.update({
          currentActivityNumber: FieldValue.increment(1),
        });
      } else {
        await counterRef.set({ currentActivityNumber: 1 });
      }

      // Crear el documento de actividad
      const activityRef = await this.firestore.collection('activities').add({
        orderNumber,
        activityType,
        address,
        branchOffice,
        neededSupply: neededSupplyArray,
        createdAt: new Date().toISOString(),
        status: 'pending',
        activityNumber: newActivityNumber,
      });

      return {
        id: activityRef.id,
        ...createActivityDto,
        activityNumber: newActivityNumber,
      };
    } catch (error) {
      throw new BadRequestException(
        'Error creating activity: ' + error.message,
      );
    }
  }

  // Método para actualizar los campos de una actividad individual
  async updateIndividualActivity(
    id: string,
    updateActivityDto: UpdateActivityDto,
  ) {
    const activityRef = this.firestore.collection('activities').doc(id);
    const activitySnapshot = await activityRef.get();

    // Verificar si la actividad existe
    if (!activitySnapshot.exists) {
      throw new NotFoundException('Activity not found');
    }

    const activityData = activitySnapshot.data();

    // Verificar si la actividad ya fue completada
    if (activityData.status === 'Completado') {
      throw new BadRequestException(
        'No se puede actualizar la actividad porque ya ha sido completada.',
      );
    }

    // Preparar los datos para actualizar solo los campos permitidos
    const updateData: Partial<UpdateActivityDto> = {};

    if (updateActivityDto.address) {
      updateData.address = updateActivityDto.address;
    }

    if (updateActivityDto.orderNumber) {
      // Verificar que el orderNumber sea único
      const existingActivityWithOrder = await this.firestore
        .collection('activities')
        .where('orderNumber', '==', updateActivityDto.orderNumber)
        .limit(1)
        .get();

      if (
        !existingActivityWithOrder.empty &&
        existingActivityWithOrder.docs[0].id !== id
      ) {
        throw new BadRequestException(
          `Ya existe una actividad con el número de orden "${updateActivityDto.orderNumber}".`,
        );
      }
      updateData.orderNumber = updateActivityDto.orderNumber;
    }

    if (updateActivityDto.activityType) {
      // Verificar que el nuevo tipo de actividad exista
      const activityTypeSnapshot = await this.firestore
        .collection('activityTypes')
        .doc(updateActivityDto.activityType)
        .get();

      if (!activityTypeSnapshot.exists) {
        throw new NotFoundException('Activity type not found');
      }

      // Si se cambia el tipo de actividad, actualizar el tipo en la actividad
      updateData.activityType = updateActivityDto.activityType;
    }

    // Realizar la actualización en Firestore
    await activityRef.update(updateData);

    // Devolver la actividad actualizada
    return { id, ...updateData };
  }

  // Método para actualizar el activityType y las actividades pendientes relacionadas
  async updateActivityTypeAndPendingActivities(
    activityTypeId: string,
    updateActivityTypeDto: UpdateActivityTypeDto,
  ) {
    const activityTypeRef = this.firestore
      .collection('activityTypes')
      .doc(activityTypeId);
    const activityTypeSnapshot = await activityTypeRef.get();

    if (!activityTypeSnapshot.exists) {
      throw new NotFoundException('Activity type not found');
    }

    // Preparar los datos para actualizar el tipo de actividad
    const updateData: { [key: string]: any } = {};

    if (updateActivityTypeDto.name) {
      updateData.name = updateActivityTypeDto.name;
    }
    if (updateActivityTypeDto.description) {
      updateData.description = updateActivityTypeDto.description;
    }
    if (updateActivityTypeDto.neededSupplies) {
      updateData.neededSupplies = updateActivityTypeDto.neededSupplies;
    }

    // Actualizar el tipo de actividad en Firestore
    await activityTypeRef.update(updateData);

    // Obtener actividades pendientes asociadas a este tipo de actividad
    const activitiesSnapshot = await this.firestore
      .collection('activities')
      .where('activityType', '==', activityTypeId)
      .where('status', '==', 'Pendiente')
      .get();

    if (activitiesSnapshot.empty) {
      return {
        message: `Activity type updated, but no pending activities found for type ${activityTypeId}`,
      };
    }

    // Crear un batch para actualizar todas las actividades pendientes
    const batch = this.firestore.batch();
    const neededSupplies = updateActivityTypeDto.neededSupplies || [];

    activitiesSnapshot.docs.forEach((doc) => {
      const activityRef = this.firestore.collection('activities').doc(doc.id);

      // Generar una nueva estructura de `neededSupplies` para la actividad
      const newNeededSupplies = neededSupplies.map((supply) => ({
        supply: supply.supply,
        quantity: supply.quantity,
        estimatedUse: supply.estimatedUse,
        unit: supply.unit,
      }));

      batch.update(activityRef, {
        neededSupply: newNeededSupplies,
        activityType: activityTypeId, // Actualizar el tipo de actividad
      });
    });

    // Ejecutar el batch
    await batch.commit();

    return {
      message: `Activity type updated and ${activitiesSnapshot.docs.length} pending activities were updated`,
    };
  }

  // Método para iniciar una actividad
  async startActivity(id: string, userId: string) {
    const userRef = this.firestore.collection('users').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userData = userSnapshot.data();

    // Verificar si el usuario tiene el campo journey en true
    if (!userData.journey) {
      throw new BadRequestException(
        'No puedes iniciar una actividad si no estás en horario laboral.',
      );
    }

    const activityRef = this.firestore.collection('activities').doc(id);
    const activitySnapshot = await activityRef.get();

    if (!activitySnapshot.exists) {
      throw new NotFoundException('Activity not found');
    }

    const activityData = activitySnapshot.data();

    // Verificar si la actividad ya fue iniciada
    if (activityData.status === 'En progreso' || activityData.startedAt) {
      throw new BadRequestException(
        'Activity has already been started, you cannot start it again.',
      );
    }

    await activityRef.update({
      status: 'En progreso',
      startedAt: new Date().toISOString(),
    });

    return { id, status: 'En progreso' };
  }

  // Completar actividad
  async completeActivity(
    id: string,
    completeActivityDto: CompleteActivityDto,
    userId: string,
  ) {
    try {
      const userRef = this.firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (!userSnapshot.exists) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const userData = userSnapshot.data();

      // Verificar si el usuario tiene el campo journey en true
      if (!userData.journey) {
        throw new BadRequestException(
          'No puedes completar una actividad si no estás en horario laboral.',
        );
      }

      const { comment, evidence, neededSupply, location } = completeActivityDto;

      const activityRef = this.firestore.collection('activities').doc(id);
      const activitySnapshot = await activityRef.get();

      if (!activitySnapshot.exists) {
        throw new NotFoundException('Activity not found');
      }

      const activityData = activitySnapshot.data();

      // Verificar si la actividad ya está completada
      if (activityData.status === 'Completado') {
        throw new BadRequestException('Activity is already completed.');
      }

      // Mapea neededSupply a un objeto simple
      const plainNeededSupply = neededSupply.map((supply) => ({
        supply: supply.supply,
        quantity: supply.quantity,
      }));

      // Prepara los datos de actualización
      const updateData: any = {
        comment,
        evidence,
        neededSupply: plainNeededSupply, // Convertido a un objeto plano
        location: new GeoPoint(location._latitude, location._longitude),
        status: 'Completado',
        completedAt: new Date().toISOString(),
      };

      // Actualiza la actividad en la base de datos
      await activityRef.update(updateData);

      return { message: 'Activity completed successfully', id };
    } catch (error) {
      throw new BadRequestException(
        'Error completing activity: ' + error.message,
      );
    }
  }

  // Eliminar actividad
  async deleteActivity(id: string) {
    try {
      const activityRef = this.firestore.collection('activities').doc(id);
      const activitySnapshot = await activityRef.get();

      if (!activitySnapshot.exists) {
        throw new NotFoundException('Activity not found');
      }

      await activityRef.delete();
      return { message: 'Activity deleted successfully', id };
    } catch (error) {
      throw new BadRequestException(
        'Error deleting activity: ' + error.message,
      );
    }
  }
}
