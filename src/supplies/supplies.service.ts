import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { Subject } from 'rxjs';

@Injectable()
export class SuppliesService {
  private readonly firestore: Firestore;
  private suppliesChange$ = new Subject<any[]>(); // Subject para emitir los cambios en tiempo real

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
    this.initSupplyListener(); // Inicializa el listener para cambios en tiempo real
  }

  // Escuchar los cambios en la colección supplies en tiempo real
  private initSupplyListener() {
    this.firestore.collection('supplies').onSnapshot((snapshot) => {
      const supplies = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.suppliesChange$.next(supplies); // Emite los cambios
    });
  }

  // Método para obtener los cambios en tiempo real
  getSupplyChanges() {
    return this.suppliesChange$.asObservable();
  }

  // Obtener el siguiente número de supply (supplyNumber) desde el documento supplyNumberCounter
  private async getNextSupplyNumber(): Promise<number> {
    const counterRef = this.firestore
      .collection('counters')
      .doc('supplyNumberCounter'); // Documento con el contador
    const doc = await counterRef.get();

    if (!doc.exists) {
      // Si no existe el documento, inicializamos el contador en 1
      await counterRef.set({ currentSupplyNumber: 1 });
      return 1;
    }

    const newCount = (doc.data() as any).currentSupplyNumber + 1;
    await counterRef.update({
      currentSupplyNumber: FieldValue.increment(1),
    });
    return newCount;
  }

  // Crear un supply
  async createSupply(name: string, unit: string) {
    try {
      const supplyNumber = await this.getNextSupplyNumber(); // Obtener el siguiente número de supply

      const supplyRef = await this.firestore.collection('supplies').add({
        name,
        unit,
        supplyNumber,
        createdAt: new Date(),
      });

      return { id: supplyRef.id, name, unit, supplyNumber };
    } catch (error) {
      throw new HttpException(
        'Error creando el supply',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Actualizar un supply, solo actualizar los campos enviados
  async updateSupply(id: string, name?: string, unit?: string) {
    try {
      const supplyRef = this.firestore.collection('supplies').doc(id);
      const supplyDoc = await supplyRef.get();

      if (!supplyDoc.exists) {
        throw new NotFoundException('Supply no encontrado');
      }

      const updateData: any = {};

      if (name) {
        updateData.name = name;
      }

      if (unit) {
        updateData.unit = unit;
      }

      await supplyRef.update(updateData);

      return { id, ...updateData };
    } catch (error) {
      throw new HttpException(
        'Error actualizando el supply',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener supply por ID
  async getSupplyById(id: string) {
    try {
      const supplyDoc = await this.firestore
        .collection('supplies')
        .doc(id)
        .get();
      if (!supplyDoc.exists) {
        throw new NotFoundException('Supply no encontrado');
      }
      return { id: supplyDoc.id, ...supplyDoc.data() };
    } catch (error) {
      throw new HttpException(
        'Error obteniendo el supply',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener el total de supplies
  async getTotalSupplies(): Promise<number> {
    try {
      const counterDoc = await this.firestore
        .collection('counters')
        .doc('supplyNumberCounter')
        .get();

      if (!counterDoc.exists) {
        throw new NotFoundException('Contador de supplies no encontrado');
      }

      return counterDoc.data().currentSupplyNumber;
    } catch (error) {
      throw new HttpException(
        'Error obteniendo el total de supplies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener todos los supplies con paginación
  async getAllSupplies(pageSize: number = 10, startAfterSupplyNumber?: number) {
    try {
      let query: FirebaseFirestore.Query = this.firestore
        .collection('supplies')
        .orderBy('supplyNumber') // Ordenar por supplyNumber
        .limit(pageSize);

      if (startAfterSupplyNumber) {
        query = query.startAfter(startAfterSupplyNumber);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new HttpException(
        'Error obteniendo los supplies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Eliminar un supply
  async deleteSupply(id: string) {
    try {
      const supplyRef = this.firestore.collection('supplies').doc(id);
      const supplyDoc = await supplyRef.get();

      if (!supplyDoc.exists) {
        throw new NotFoundException('Supply no encontrado');
      }

      await supplyRef.delete();
      return { message: `Supply con ID ${id} eliminado exitosamente` };
    } catch (error) {
      throw new HttpException(
        'Error eliminando el supply',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
