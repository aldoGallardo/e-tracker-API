import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { Firestore, Timestamp } from '@google-cloud/firestore';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterAssistanceDto } from './dto/register-assistance.dto';
import { Subject } from 'rxjs';

@Injectable()
export class UsersService {
  private readonly firestore: Firestore;

  // Subject para emitir cambios en tiempo real
  private usersChange$ = new Subject<any[]>();

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
    this.initUserListener(); // Inicializa el listener para cambios en tiempo real
  }

  // Escuchar los cambios en la colección users en tiempo real
  private initUserListener() {
    this.firestore.collection('users').onSnapshot((snapshot) => {
      const changes = snapshot.docChanges().map((change) => {
        if (change.type === 'added') {
          return { event: 'added', data: change.doc.data() };
        }
        if (change.type === 'modified') {
          return { event: 'modified', data: change.doc.data() };
        }
        if (change.type === 'removed') {
          return { event: 'removed', data: change.doc.id };
        }
      });
      this.usersChange$.next(changes); // Emitir el array de cambios
    });
  }

  // Método para obtener los cambios en tiempo real
  getUserChanges() {
    return this.usersChange$.asObservable();
  }

  //Método de creación de usuarios, campos validados
  async createUser(createUserDto: CreateUserDto) {
    try {
      const { email, password, userType, birthDate, dni, ...userData } =
        createUserDto;

      // Verificar si ya existe un usuario con el mismo DNI
      const existingUserWithDni = await this.firestore
        .collection('users')
        .where('dni', '==', dni)
        .get();

      if (!existingUserWithDni.empty) {
        throw new BadRequestException(
          `El DNI ${dni} ya está en uso por otro usuario`,
        );
      }

      // Verificar si el tipo de usuario existe en la colección 'userTypes' usando el ID del documento
      const userTypeRef = await this.firestore
        .collection('userTypes')
        .doc(userType) // Verificamos si el ID del documento (userAdmin, userTechnician) es válido
        .get();

      if (!userTypeRef.exists) {
        throw new BadRequestException(
          `Tipo de usuario ${userType} no es válido. Debe ser "userAdmin" o "userTechnician".`,
        );
      }

      // Crear el usuario en Firebase Auth
      const userRecord = await this.firebaseAdmin.auth().createUser({
        email,
        password,
      });

      // Asignar el rol en Firebase Auth como claim personalizado
      await this.firebaseAdmin
        .auth()
        .setCustomUserClaims(userRecord.uid, { role: userType });

      // Convertir birthDate a objeto Date
      const birthDateTimestamp = new Date(birthDate);

      // Obtener el valor actual del contador de usuarios
      const counterRef = this.firestore
        .collection('counters')
        .doc('userNumberCounter');
      const counterDoc = await counterRef.get();

      let currentUserNumber = 1; // Si el contador no existe, empezamos en 1
      if (counterDoc.exists) {
        currentUserNumber = counterDoc.data().currentUserNumber + 1; // Incrementamos el valor actual
      }

      // Actualizar el contador en Firestore
      await counterRef.set({ currentUserNumber });

      // Inicializar campos por defecto y agregar createdAt, dni y userNumber
      const userRef = await this.firestore.collection('users').add({
        ...userData,
        email,
        userType,
        dni, // Guardamos el DNI del usuario
        birthDate: birthDateTimestamp,
        dailyAssistance: [], // Inicializamos el campo como array vacío
        contract: true, // Lógica por defecto para el contrato
        journey: false, // Lógica por defecto para la jornada
        createdAt: new Date(), // Agregamos el campo createdAt
        userNumber: currentUserNumber, // Agregamos el userNumber incremental
      });

      return {
        id: userRef.id,
        ...userData,
        email,
        userType,
        dni,
        userNumber: currentUserNumber,
      };
    } catch (error) {
      console.error('Error al crear el usuario:', error);

      if (error.code === 'auth/email-already-exists') {
        throw new BadRequestException('El correo electrónico ya está en uso');
      }
      throw new BadRequestException(
        'Error creando el usuario: ' + error.message,
      );
    }
  }

  async getTotalUsers(): Promise<number> {
    try {
      const counterDoc = await this.firestore
        .collection('counters')
        .doc('userNumberCounter') // Aquí cambias por el nombre exacto de tu documento
        .get();

      if (!counterDoc.exists) {
        throw new NotFoundException('Contador no encontrado');
      }

      return counterDoc.data().currentUserNumber;
    } catch (error) {
      throw new HttpException(
        'Error obteniendo el total de usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUsers(
    name?: string,
    userType?: string,
    branchOffice?: string,
    pageSize: number = 10,
    startAfterUserNumber?: number, // Paginación con userNumber
  ) {
    try {
      let query: FirebaseFirestore.Query = this.firestore
        .collection('users')
        .select('dailyAssistance', 'userNumber');

      if (name) {
        query = query.where('name', '==', name);
      }
      if (userType) {
        query = query.where('userType', '==', userType);
      }
      if (branchOffice) {
        query = query.where('branchOffice', '==', branchOffice);
      }

      // Ordenar por userNumber (ya que es un campo incremental y único)
      query = query.orderBy('userNumber').limit(pageSize);

      // Si se proporciona un punto de inicio (startAfterUserNumber), lo usamos para paginar
      if (startAfterUserNumber) {
        query = query.startAfter(startAfterUserNumber);
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();

        // // Convertir createdAt si es necesario
        // if (data.createdAt && data.createdAt._seconds) {
        //   data.createdAt = this.convertTimestampToISO(data.createdAt);
        // }

        return { id: doc.id, ...data };
      });
    } catch (error) {
      throw new BadRequestException('Error al obtener los usuarios');
    }
  }

  // Servicio para obtener todos los usuarios pero excluyendo el campo dailyAssistance
  async getAllUsersWithoutDailyAssistance(
    name?: string,
    userType?: string,
    branchOffice?: string,
    pageSize: number = 10,
    startAfterUserNumber?: number, // Paginación con userNumber
  ) {
    try {
      let query: FirebaseFirestore.Query = this.firestore.collection('users');

      if (name) {
        query = query.where('name', '==', name);
      }
      if (userType) {
        query = query.where('userType', '==', userType);
      }
      if (branchOffice) {
        query = query.where('branchOffice', '==', branchOffice);
      }

      // Ordenar por userNumber (ya que es un campo incremental y único)
      query = query.orderBy('userNumber').limit(pageSize);

      // Si se proporciona un punto de inicio (startAfterUserNumber), lo usamos para paginar
      if (startAfterUserNumber) {
        query = query.startAfter(startAfterUserNumber);
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => {
        const data = doc.data();

        // Convertir createdAt si es necesario
        if (data.createdAt && data.createdAt._seconds) {
          data.createdAt = this.convertTimestampToISO(data.createdAt);
        }

        // Excluir el campo dailyAssistance si está presente
        const { dailyAssistance, ...filteredData } = data;

        return { id: doc.id, ...filteredData };
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al obtener los usuarios sin dailyAssistance',
      );
    }
  }

  // Obtener un usuario por ID
  async getUserById(id: string) {
    try {
      const userDoc = await this.firestore.collection('users').doc(id).get();
      if (!userDoc.exists) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const userData = userDoc.data();

      if (userData.createdAt && userData.createdAt._seconds) {
        userData.createdAt = this.convertTimestampToISO(userData.createdAt);
      }

      return { id: userDoc.id, ...userData };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Error al obtener el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para actualizar la asistencia de un usuario
  // Método para actualizar la asistencia de un usuario sin try-catch
  async updateAssistance(
    userId: string,
    registerAssistanceDto: RegisterAssistanceDto,
  ): Promise<{
    message: string;
    dailyAssistance: {
      date: string;
      intervals: { checkIn: Timestamp; checkOut?: Timestamp }[];
    }[];
  }> {
    console.log('Datos recibidos:', registerAssistanceDto);

    const userRef = this.firestore.collection('users').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      console.error('Usuario no encontrado:', userId);
      throw new NotFoundException('Usuario no encontrado');
    }

    const userData = userSnapshot.data();
    const dailyAssistance = userData.dailyAssistance || [];
    const today = new Date().toISOString().split('T')[0];

    const branchOfficeRef = await this.firestore
      .collection('branchOffices')
      .doc(userData.branchOffice)
      .get();

    if (!branchOfficeRef.exists) {
      console.error('Sucursal no encontrada:', userData.branchOffice);
      throw new NotFoundException('Sucursal no encontrada');
    }

    const branchLocation = branchOfficeRef.data().location;
    const isSameLocation = this.checkProximity(
      registerAssistanceDto.currentLocation,
      branchLocation,
    );

    console.log(
      'Ubicación del usuario:',
      registerAssistanceDto.currentLocation,
    );
    console.log('Ubicación de la sucursal:', branchLocation);

    if (!isSameLocation) {
      console.error('Ubicación no válida para marcar asistencia');
      throw new HttpException(
        'Ubicación no válida para marcar asistencia',
        HttpStatus.FORBIDDEN,
      );
    }

    const timestamp = Timestamp.fromDate(
      new Date(registerAssistanceDto.currentTime),
    );
    console.log('Timestamp:', timestamp);

    let assistanceForToday = dailyAssistance.find(
      (assistance) => assistance.date === today,
    );

    if (!assistanceForToday) {
      assistanceForToday = {
        date: today,
        intervals: [{ checkIn: timestamp }],
      };
      dailyAssistance.push(assistanceForToday);
    } else {
      const lastInterval =
        assistanceForToday.intervals[assistanceForToday.intervals.length - 1];

      if (!lastInterval.checkOut) {
        lastInterval.checkOut = timestamp;
      } else {
        assistanceForToday.intervals.push({ checkIn: timestamp });
      }
    }

    console.log(
      'Asistencia actualizada:',
      JSON.stringify(dailyAssistance, null, 2),
    );

    await userRef.update({ dailyAssistance });

    return {
      message: 'Asistencia actualizada correctamente',
      dailyAssistance,
    };
  }

  // Método para actualizar un usuario específico
  async updateUser(id: string, updateData: Partial<CreateUserDto>) {
    try {
      const userRef = this.firestore.collection('users').doc(id);
      const userSnapshot = await userRef.get();

      if (!userSnapshot.exists) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await userRef.update(updateData);
      const updatedUser = await userRef.get();

      const updatedData = updatedUser.data();

      if (updatedData.createdAt && updatedData.createdAt._seconds) {
        updatedData.createdAt = this.convertTimestampToISO(
          updatedData.createdAt,
        );
      }

      return { id: updatedUser.id, ...updatedData };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Error actualizando el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para eliminar un usuario específico
  async deleteUser(id: string) {
    try {
      const userRef = this.firestore.collection('users').doc(id);
      const userSnapshot = await userRef.get();

      if (!userSnapshot.exists) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await userRef.delete();
      return { message: `Usuario con ID ${id} eliminado` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Error eliminando el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para convertir un timestamp de Firebase a formato ISO 8601
  private convertTimestampToISO(timestamp: any): string {
    const seconds = timestamp._seconds;
    const nanoseconds = timestamp._nanoseconds;
    const date = new Date(seconds * 1000 + nanoseconds / 1000000);
    return date.toISOString(); // Formato ISO 8601
  }

  // Verificar si la ubicación está dentro de la sucursal
  private checkProximity(
    currentLocation: { latitude: number; longitude: number },
    branchLocation: { latitude: number; longitude: number },
  ): boolean {
    const distance = this.calculateDistance(currentLocation, branchLocation);
    return distance <= 50.0; // 50 metros
  }

  // Calcular la distancia entre dos ubicaciones geográficas
  private calculateDistance(
    location1: { latitude: number; longitude: number },
    location2: { latitude: number; longitude: number },
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const lat1 = (location1.latitude * Math.PI) / 180;
    const lat2 = (location2.latitude * Math.PI) / 180;
    const deltaLat =
      ((location2.latitude - location1.latitude) * Math.PI) / 180;
    const deltaLng =
      ((location2.longitude - location1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }
}
