import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Firestore, Timestamp, FieldValue } from '@google-cloud/firestore';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { KeyResultsCalculationService } from './key-results-calculation.service';

@Injectable()
export class KeyResultsService {
  private readonly firestore: Firestore;

  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any,
    private readonly keyResultsCalculationService: KeyResultsCalculationService,
  ) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  // Verificar existencia de un documento en Firestore
  private async validateDocExists(
    collection: string,
    id: string,
    type: string,
  ) {
    const doc = await this.firestore.collection(collection).doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`${type} with ID ${id} not found`);
    }
    return doc;
  }

  // Crear un nuevo Key Result
  async createKeyResult(createKeyResultDto: CreateKeyResultDto) {
    try {
      const { objectiveId, calculation, goalType, targetValue } =
        createKeyResultDto;

      // Validar existencia de Objective y Calculation
      await this.validateDocExists('objectives', objectiveId, 'Objective');
      await this.validateDocExists('calculations', calculation, 'Calculation');

      // Determinar el rango de fechas del KR
      const { goalStartline, goalEndline } =
        this.keyResultsCalculationService.calculateGoalDates(goalType);

      const newKeyResult = {
        ...createKeyResultDto,
        goalStartline,
        goalEndline,
        createdAt: Timestamp.now(),
        startValue: null, // Se calculará posteriormente
        actualValue: null, // Se calculará posteriormente
        targetValue,
        finalValue: null, // Se calculará posteriormente
        progress: null, // Se calculará posteriormente
        status: 'in_progress',
      };

      // Crear el nuevo Key Result en Firestore
      const krRef = await this.firestore
        .collection('keyResults')
        .add(newKeyResult);

      // Llamar al servicio de cálculos para asignar valores iniciales
      await this.keyResultsCalculationService.updateKeyResultValues(krRef.id);

      // Actualizar el array de keyResults del Objective
      await this.firestore
        .collection('objectives')
        .doc(objectiveId)
        .update({
          keyResults: FieldValue.arrayUnion(krRef.id),
        });

      return { id: krRef.id, ...newKeyResult };
    } catch (error) {
      console.error('Error creating Key Result:', error);
      throw error;
    }
  }

  // Obtener todos los Key Results
  async getKeyResults() {
    try {
      const snapshot = await this.firestore.collection('keyResults').get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new HttpException(
        'Error fetching Key Results',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener un Key Result por ID
  async getKeyResultById(id: string) {
    try {
      const doc = await this.firestore.collection('keyResults').doc(id).get();
      if (!doc.exists) {
        throw new NotFoundException(`Key Result with ID ${id} not found`);
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un Key Result
  async updateKeyResult(id: string, updateKeyResultDto: UpdateKeyResultDto) {
    try {
      const krRef = this.firestore.collection('keyResults').doc(id);
      const krDoc = await krRef.get();

      if (!krDoc.exists) {
        throw new NotFoundException(`Key Result with ID ${id} not found`);
      }

      // Obtener datos actuales del KR
      const existingData = krDoc.data();

      // Validar campos no permitidos para actualización directa
      const restrictedFields = [
        'startValue',
        'actualValue',
        'progress',
        'createdAt',
        'goalStartline',
        'goalEndline',
      ];
      for (const field of restrictedFields) {
        if (field in updateKeyResultDto) {
          throw new HttpException(
            `Field "${field}" cannot be updated manually`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Mezclar los datos existentes con los datos actualizados
      const updatedData = {
        ...krDoc.data(),
        ...updateKeyResultDto,
        updatedAt: Timestamp.now(), // Actualizar el timestamp de modificación
      };

      // Aplicar la actualización en Firestore
      await krRef.update(updatedData);

      // Recalcular valores después de la actualización
      await this.keyResultsCalculationService.updateKeyResultValues(id);

      return {
        id,
        ...updatedData,
      };
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un Key Result
  async removeKeyResult(id: string) {
    try {
      const krRef = this.firestore.collection('keyResults').doc(id);
      const krDoc = await krRef.get();
      if (!krDoc.exists) {
        throw new NotFoundException(`Key Result with ID ${id} not found`);
      }

      const { objectiveId } = krDoc.data();

      // Eliminar el Key Result del array de keyResults del Objective
      await this.firestore
        .collection('objectives')
        .doc(objectiveId)
        .update({
          keyResults: FieldValue.arrayRemove(id),
        });

      // Eliminar el Key Result
      await krRef.delete();

      return {
        message: `Key Result with ID ${id} deleted successfully`,
      };
    } catch (error) {
      throw error;
    }
  }
}
