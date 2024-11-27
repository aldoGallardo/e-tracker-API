import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Firestore, Timestamp } from '@google-cloud/firestore';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';

@Injectable()
export class ObjectivesService {
  private readonly firestore: Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async createObjective(createObjectiveDto: CreateObjectiveDto) {
    try {
      const { action, dimension } = createObjectiveDto;

      // Verificar la existencia de la dimensión
      const dimensionDoc = await this.firestore
        .collection('dimensions')
        .doc(dimension)
        .get();
      if (!dimensionDoc.exists) {
        throw new NotFoundException(`Dimension with ID ${dimension} not found`);
      }

      // Crear el nuevo objetivo
      const newObjective = {
        action,
        dimension,
        keyResults: [], // Inicializar el array vacío para KRs asociados
        createdAt: Timestamp.now(), // Usar Timestamp de Firestore
      };

      // Guardar el objetivo en Firestore
      const docRef = await this.firestore
        .collection('objectives')
        .add(newObjective);

      return { id: docRef.id, ...newObjective };
    } catch (error) {
      throw error; // Re-lanzar el error para que NestJS lo maneje
    }
  }

  // Método para obtener todos los Objectives
  async getObjectives() {
    try {
      const snapshot = await this.firestore.collection('objectives').get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error; // Re-lanzar el error
    }
  }

  // Método para obtener un Objective por ID
  async getObjectiveById(id: string) {
    try {
      const doc = await this.firestore.collection('objectives').doc(id).get();
      if (!doc.exists) {
        throw new NotFoundException(`Objective with ID ${id} not found`);
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw error; // Re-lanzar el error
    }
  }

  // Método para actualizar un Objective
  async updateObjective(id: string, updateObjectiveDto: UpdateObjectiveDto) {
    try {
      const objectiveRef = this.firestore.collection('objectives').doc(id);
      const doc = await objectiveRef.get();

      if (!doc.exists) {
        throw new NotFoundException(`Objective with ID ${id} not found`);
      }

      const updateData: { [key: string]: any } = { ...updateObjectiveDto };

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException('No fields to update provided');
      }

      await objectiveRef.update(updateData);
      return { id, ...updateData };
    } catch (error) {
      throw error; // Re-lanzar el error
    }
  }

  // Método para eliminar un Objective y sus Key Results asociados
  async removeObjective(id: string) {
    try {
      const docRef = this.firestore.collection('objectives').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException(`Objective with ID ${id} not found`);
      }

      // Eliminar Key Results asociados
      const keyResults = doc.data().keyResults || [];
      const batch = this.firestore.batch();

      for (const krId of keyResults) {
        const krDocRef = this.firestore.collection('keyResults').doc(krId);
        batch.delete(krDocRef);
      }

      batch.delete(docRef);
      await batch.commit();

      return {
        message: `Objective with ID ${id} and associated Key Results removed successfully`,
      };
    } catch (error) {
      throw error; // Re-lanzar el error
    }
  }
}
