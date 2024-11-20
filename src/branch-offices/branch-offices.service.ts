import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Firestore, GeoPoint, FieldValue } from '@google-cloud/firestore';
import { Subject } from 'rxjs';

@Injectable()
export class BranchOfficesService {
  private readonly firestore: Firestore;
  private branchOfficeChanges$ = new Subject<any[]>(); // Subject para emitir los cambios en tiempo real

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
    this.initBranchOfficeListener(); // Inicializa el listener para cambios en tiempo real
  }

  // Escuchar los cambios en la colección branchOffices en tiempo real
  private initBranchOfficeListener() {
    this.firestore.collection('branchOffices').onSnapshot((snapshot) => {
      const branchOffices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.branchOfficeChanges$.next(branchOffices); // Emite los cambios
    });
  }

  // Método para obtener los cambios en tiempo real
  getBranchOfficeChanges() {
    return this.branchOfficeChanges$.asObservable();
  }

  // Obtener el siguiente número de sucursal (branchOfficeNumber) desde el documento branchOfficeNumberCounter
  private async getNextBranchOfficeNumber(): Promise<number> {
    const counterRef = this.firestore
      .collection('counters')
      .doc('branchOfficeNumberCounter'); // Documento con el contador
    const doc = await counterRef.get();

    if (!doc.exists) {
      // Si no existe el documento, inicializamos el contador en 1
      await counterRef.set({ currentBranchOfficeNumber: 1 });
      return 1;
    }

    const newCount = (doc.data() as any).currentBranchOfficeNumber + 1;
    await counterRef.update({
      currentBranchOfficeNumber: FieldValue.increment(1),
    });
    return newCount;
  }

  // Crear una sucursal con el campo location como GeoPoint
  async createBranchOffice(
    name: string,
    location: { latitude: number; longitude: number },
  ) {
    try {
      const branchOfficeNumber = await this.getNextBranchOfficeNumber(); // Obtener el siguiente número de sucursal

      const branchOfficeRef = await this.firestore
        .collection('branchOffices')
        .add({
          name,
          location: new GeoPoint(location.latitude, location.longitude), // Guardar como GeoPoint
          branchOfficeNumber,
          createdAt: new Date(),
        });

      return { id: branchOfficeRef.id, name, location, branchOfficeNumber };
    } catch (error) {
      throw new HttpException(
        'Error creando la sucursal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Actualizar la sucursal, solo actualizar los campos enviados
  async updateBranchOffice(
    id: string,
    name?: string,
    location?: { latitude: number; longitude: number },
  ) {
    try {
      const branchOfficeRef = this.firestore
        .collection('branchOffices')
        .doc(id);
      const branchOfficeDoc = await branchOfficeRef.get();

      if (!branchOfficeDoc.exists) {
        throw new NotFoundException('Sucursal no encontrada');
      }

      const updateData: any = {};

      if (name) {
        updateData.name = name;
      }

      if (location) {
        updateData.location = new GeoPoint(
          location.latitude,
          location.longitude,
        );
      }

      await branchOfficeRef.update(updateData);

      return { id, ...updateData };
    } catch (error) {
      throw new HttpException(
        'Error actualizando la sucursal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener sucursal por ID
  async getBranchOfficeById(id: string) {
    try {
      const branchOfficeDoc = await this.firestore
        .collection('branchOffices')
        .doc(id)
        .get();
      if (!branchOfficeDoc.exists) {
        throw new NotFoundException('Sucursal no encontrada');
      }
      return { id: branchOfficeDoc.id, ...branchOfficeDoc.data() };
    } catch (error) {
      throw new HttpException(
        'Error obteniendo la sucursal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTotalBranchOffices(): Promise<number> {
    try {
      const counterDoc = await this.firestore
        .collection('counters')
        .doc('branchOfficeNumberCounter') // Nombre del documento en counters para branchOffices
        .get();

      if (!counterDoc.exists) {
        throw new NotFoundException('Contador de sucursales no encontrado');
      }

      return counterDoc.data().currentBranchOfficeNumber;
    } catch (error) {
      throw new HttpException(
        'Error obteniendo el total de sucursales',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para obtener todas las sucursales con paginación
  async getAllBranchOffices(
    pageSize: number = 10,
    startAfterBranchOfficeNumber?: number,
  ) {
    try {
      let query: FirebaseFirestore.Query = this.firestore
        .collection('branchOffices')
        .orderBy('branchOfficeNumber') // Ordenar por branchOfficeNumber
        .limit(pageSize);

      if (startAfterBranchOfficeNumber) {
        query = query.startAfter(startAfterBranchOfficeNumber);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new HttpException(
        'Error obteniendo sucursales',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para eliminar una sucursal
  async deleteBranchOffice(id: string) {
    try {
      const branchOfficeRef = this.firestore
        .collection('branchOffices')
        .doc(id);
      const branchOfficeDoc = await branchOfficeRef.get();

      if (!branchOfficeDoc.exists) {
        throw new NotFoundException('Sucursal no encontrada');
      }

      await branchOfficeRef.delete();
      return { message: `Sucursal con ID ${id} eliminada exitosamente` };
    } catch (error) {
      throw new HttpException(
        'Error eliminando la sucursal',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
