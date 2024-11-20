import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';

@Injectable()
export class ActivityTypesService {
  private firestore: admin.firestore.Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  // Obtener todos los tipos de actividades
  // async getAllActivityTypes() {
  //   const snapshot = await this.firestore.collection('activityTypes').get();
  //   return snapshot.docs.map((doc) => ({
  //     id: doc.id,
  //     ...(doc.data() as any), // Mapeamos correctamente los campos
  //   }));
  // }

  async getActivityTypes() {
    const activityTypesSnapshot = await this.firestore
      .collection('activityTypes')
      .get();
    const activityTypes = activityTypesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return activityTypes;
  }

  // Búsqueda por coincidencia en nombre, descripción y neededSupplies
  async searchActivityTypes(term: string) {
    const snapshot = await this.firestore.collection('activityTypes').get();
    const lowerTerm = term.toLowerCase();

    const activityTypes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    const filtered = activityTypes.filter(
      (activityType) =>
        activityType.name.toLowerCase().includes(lowerTerm) ||
        activityType.description.toLowerCase().includes(lowerTerm) ||
        activityType.neededSupplies.some((supply: string) =>
          supply.toLowerCase().includes(lowerTerm),
        ),
    );

    return filtered;
  }

  // Obtener tipo de actividad por ID
  async getActivityTypeById(activityTypeId: string) {
    const activityType = await this.firestore
      .collection('activityTypes')
      .doc(activityTypeId)
      .get();

    if (!activityType.exists) {
      throw new NotFoundException('Activity type not found');
    }

    return { id: activityType.id, ...activityType.data() };
  }

  // Crear un ActivityType verificando que el nombre no exista
  async createActivityType(createActivityTypeDto: CreateActivityTypeDto) {
    const { name, description, neededSupplies } = createActivityTypeDto;

    // Verificar si ya existe un tipo de actividad con el mismo nombre
    const existingActivityType = await this.firestore
      .collection('activityTypes')
      .where('name', '==', name)
      .get();

    if (!existingActivityType.empty) {
      throw new ConflictException(
        `Activity type with the name "${name}" already exists.`,
      );
    }

    // Verificar supplies (omito para mantener el enfoque)
    // ...

    const activityTypeRef = await this.firestore
      .collection('activityTypes')
      .add({
        name,
        description,
        neededSupplies,
        createdAt: new Date(),
      });

    return { id: activityTypeRef.id, name, description, neededSupplies };
  }

  // Actualizar un ActivityType con verificación de nombres únicos
  async updateActivityType(id: string, updateData: UpdateActivityTypeDto) {
    const activityTypeRef = this.firestore.collection('activityTypes').doc(id);
    const activityTypeDoc = await activityTypeRef.get();

    if (!activityTypeDoc.exists) {
      throw new NotFoundException('Activity type not found');
    }

    // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
    if (updateData.name) {
      const existingActivityType = await this.firestore
        .collection('activityTypes')
        .where('name', '==', updateData.name)
        .get();

      if (
        !existingActivityType.empty &&
        existingActivityType.docs[0].id !== id
      ) {
        throw new ConflictException(
          `Activity type with the name "${updateData.name}" already exists.`,
        );
      }
    }

    // Filtramos solo los campos que realmente deben actualizarse
    const fieldsToUpdate: Partial<UpdateActivityTypeDto> = {};
    if (updateData.name) fieldsToUpdate.name = updateData.name;
    if (updateData.description)
      fieldsToUpdate.description = updateData.description;
    if (updateData.neededSupplies)
      fieldsToUpdate.neededSupplies = updateData.neededSupplies;

    // Si no hay nada que actualizar, lanzar un error
    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    await activityTypeRef.update(fieldsToUpdate); // Actualizamos solo los campos válidos
    return { id, ...fieldsToUpdate };
  }

  // Eliminar ActivityType solo si no está en uso
  async deleteActivityType(id: string) {
    const activityTypeRef = this.firestore.collection('activityTypes').doc(id);
    const activityTypeDoc = await activityTypeRef.get();

    if (!activityTypeDoc.exists) {
      throw new NotFoundException('Activity type not found');
    }

    // Verificar si el ActivityType está en uso en alguna actividad
    const activitiesUsingType = await this.firestore
      .collection('activities')
      .where('activityType', '==', id)
      .get();

    if (!activitiesUsingType.empty) {
      throw new BadRequestException(
        'Cannot delete activity type because it is in use by one or more activities.',
      );
    }

    // Si no está en uso, eliminar el ActivityType
    await activityTypeRef.delete();
    return { message: `Activity type with ID ${id} deleted successfully` };
  }
}
