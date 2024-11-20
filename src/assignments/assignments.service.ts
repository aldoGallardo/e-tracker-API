import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Subject } from 'rxjs';

@Injectable()
export class AssignmentsService {
  private readonly firestore: Firestore;
  private assignmentChanges$ = new Subject<any>();

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
    this.initAssignmentListener();
  }

  // Método para escuchar cambios en tiempo real en la colección de asignaciones
  private initAssignmentListener() {
    this.firestore.collection('assignments').onSnapshot((snapshot) => {
      const assignments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.assignmentChanges$.next(assignments); // Emitir cambios
    });
  }

  // Obtener los cambios de asignaciones en tiempo real
  getAssignmentChanges() {
    return this.assignmentChanges$.asObservable();
  }

  // Crear una asignación
  async createAssignment(createAssignmentDto: CreateAssignmentDto) {
    const { assignFrom, assignTo, orderNumber } = createAssignmentDto;

    // Verificar que quien asigna (assignFrom) exista y sea de tipo 'userAdmin'
    await this.verifyUserExistence(assignFrom, 'userAdmin');

    // Verificar que quien recibe la asignación (assignTo) exista y sea de tipo 'userTechnician'
    await this.verifyUserExistence(assignTo, 'userTechnician');

    // Verificar que el orderNumber no esté ya siendo utilizado en otra asignación
    const assignmentExists = await this.checkAssignmentExists(orderNumber);
    if (assignmentExists) {
      throw new BadRequestException(
        `Ya existe una asignación para el número de orden ${orderNumber}`,
      );
    }

    // Verificar que la actividad con el orderNumber exista
    const activitySnapshot = await this.firestore
      .collection('activities')
      .where('orderNumber', '==', orderNumber)
      .get();

    if (activitySnapshot.empty) {
      throw new NotFoundException(
        `No se encontró ninguna actividad con el número de orden ${orderNumber}`,
      );
    }

    // Obtener el branchOffice del técnico (quien realiza la actividad)
    const branchOffice = (
      await this.verifyUserExistence(assignTo, 'userTechnician')
    ).branchOffice;

    // Obtener el siguiente número incremental de la asignación
    const counterRef = this.firestore
      .collection('counters')
      .doc('assignmentNumberCounter');
    const counterDoc = await counterRef.get();
    let newAssignmentNumber = 1;

    if (counterDoc.exists) {
      newAssignmentNumber = counterDoc.data().currentAssignmentNumber + 1;
      await counterRef.update({
        currentAssignmentNumber: FieldValue.increment(1),
      });
    } else {
      await counterRef.set({ currentAssignmentNumber: 1 });
    }

    // Crear la asignación
    const assignmentData = {
      assignFrom,
      assignTo,
      orderNumber,
      assignmentDate: FieldValue.serverTimestamp(), // Guardamos la fecha como Timestamp
      branchOffice, // Usamos el branchOffice del técnico
      assignmentNumber: newAssignmentNumber, // Usamos el número incremental
    };

    // Guardar la asignación en Firestore
    const assignmentRef = await this.firestore
      .collection('assignments')
      .add(assignmentData);

    return { id: assignmentRef.id, ...assignmentData };
  }
  // Función para verificar que un usuario exista y tenga el tipo de usuario esperado (userAdmin o userTechnician)
  private async verifyUserExistence(userId: string, expectedUserType: string) {
    const userSnapshot = await this.firestore
      .collection('users')
      .doc(userId)
      .get();

    if (!userSnapshot.exists) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const userData = userSnapshot.data();
    if (userData?.userType !== expectedUserType) {
      throw new BadRequestException(
        `El usuario con ID ${userId} debe ser de tipo ${expectedUserType}`,
      );
    }

    return userData;
  }

  // Función para verificar si ya existe una asignación para un número de orden dado
  private async checkAssignmentExists(orderNumber: string): Promise<boolean> {
    const assignmentSnapshot = await this.firestore
      .collection('assignments')
      .where('orderNumber', '==', orderNumber)
      .get();

    return !assignmentSnapshot.empty;
  }

  // Eliminar asignación
  async delete(id: string) {
    const assignmentRef = this.firestore.collection('assignments').doc(id);
    const assignment = await assignmentRef.get();

    if (!assignment.exists) {
      throw new NotFoundException('Assignment not found');
    }

    await assignmentRef.delete();
    return { id };
  }

  // Obtener todas las asignaciones con paginación usando el número incremental
  async getAllAssignments(
    pageSize: number = 10,
    startAfterAssignmentNumber?: number,
  ) {
    try {
      let query: FirebaseFirestore.Query = this.firestore
        .collection('assignments')
        .orderBy('assignmentNumber') // Usamos el número incremental
        .limit(pageSize);

      // Paginación usando `startAfterAssignmentNumber` si se proporciona
      if (startAfterAssignmentNumber) {
        query = query.startAfter(startAfterAssignmentNumber);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new BadRequestException('Error fetching assignments');
    }
  }
  async getTotalAssignments(): Promise<number> {
    try {
      const counterDoc = await this.firestore
        .collection('counters')
        .doc('assignmentNumberCounter') // Aquí cambias por el nombre exacto de tu documento
        .get();

      if (!counterDoc.exists) {
        throw new NotFoundException('Contador no encontrado');
      }

      return counterDoc.data().currentAssignmentNumber;
    } catch (error) {
      throw new HttpException(
        'Error obteniendo el total de asignaciones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Obtener asignaciones por branchOffice con filtros
  async getAllAssignmentsByBranchOffice(
    branchOfficeId: string,
    startDate?: string,
    endDate?: string,
    userId?: string,
  ) {
    const activitiesSnapshot = await this.firestore
      .collection('activities')
      .where('branchOffice', '==', branchOfficeId)
      .get();
    const activityOrderNumbers = activitiesSnapshot.docs.map(
      (doc) => doc.data().orderNumber,
    );

    let assignmentsQuery = this.firestore
      .collection('assignments')
      .where('orderNumber', 'in', activityOrderNumbers);

    if (startDate) {
      assignmentsQuery = assignmentsQuery.where(
        'assignmentDate',
        '>=',
        startDate,
      );
    }
    if (endDate) {
      assignmentsQuery = assignmentsQuery.where(
        'assignmentDate',
        '<=',
        endDate,
      );
    }
    if (userId) {
      assignmentsQuery = assignmentsQuery.where('assignTo', '==', userId);
    }

    const snapshot = await assignmentsQuery.get();
    if (snapshot.empty) {
      throw new NotFoundException(
        `No assignments found for branch office ${branchOfficeId} within the specified criteria`,
      );
    }

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // Buscar asignaciones con filtros personalizados
  async getAllAssignmentsByFilters(
    identifier: string,
    isGlobal?: boolean,
    isBranch?: boolean,
    isUser?: boolean,
    isAssignment?: boolean,
    startDate?: Date,
    endDate?: Date,
  ) {
    let assignmentsQuery: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      this.firestore.collection('assignments');

    if (isGlobal) {
      // No filtrar por identifier, global assignments
    } else if (isBranch) {
      const activitiesSnapshot = await this.firestore
        .collection('activities')
        .where('branchOffice', '==', identifier)
        .get();
      const orderNumbers = activitiesSnapshot.docs.map(
        (doc) => doc.data().orderNumber,
      );

      assignmentsQuery = assignmentsQuery.where(
        'orderNumber',
        'in',
        orderNumbers,
      );
    } else if (isUser) {
      assignmentsQuery = assignmentsQuery.where('assignTo', '==', identifier);
    } else if (isAssignment) {
      assignmentsQuery = assignmentsQuery.where('id', '==', identifier);
    }

    if (startDate) {
      assignmentsQuery = assignmentsQuery.where('createdAt', '>=', startDate);
    }

    if (endDate) {
      assignmentsQuery = assignmentsQuery.where('createdAt', '<=', endDate);
    }

    const assignmentsSnapshot = await assignmentsQuery.get();

    if (assignmentsSnapshot.empty) {
      throw new NotFoundException(
        'No assignments found for the specified criteria',
      );
    }

    return assignmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // Método para obtener una asignación por ID
  async getAssignmentById(id: string) {
    try {
      const assignmentRef = this.firestore.collection('assignments').doc(id);
      const assignmentSnapshot = await assignmentRef.get();

      if (!assignmentSnapshot.exists) {
        throw new NotFoundException('Assignment not found');
      }

      return { id: assignmentSnapshot.id, ...assignmentSnapshot.data() };
    } catch (error) {
      throw new BadRequestException(
        'Error fetching assignment: ' + error.message,
      );
    }
  }

  async updateAssignment(id: string, updateAssignmentDto: UpdateAssignmentDto) {
    const assignmentRef = this.firestore.collection('assignments').doc(id);
    const assignmentSnapshot = await assignmentRef.get();

    // Verificar si la asignación existe
    if (!assignmentSnapshot.exists) {
      throw new NotFoundException('Assignment not found');
    }

    const existingAssignment = assignmentSnapshot.data();

    const { assignFrom, assignTo, orderNumber } = updateAssignmentDto;

    // Si se va a actualizar `assignFrom`, verificar que exista y sea de tipo `userAdmin`
    if (assignFrom && assignFrom !== existingAssignment.assignFrom) {
      await this.verifyUserExistence(assignFrom, 'userAdmin');
    }

    // Si se va a actualizar `assignTo`, verificar que exista y sea de tipo `userTechnician`
    if (assignTo && assignTo !== existingAssignment.assignTo) {
      await this.verifyUserExistence(assignTo, 'userTechnician');
    }

    // Si se va a actualizar `orderNumber`, verificar que no esté ya asignado
    if (orderNumber && orderNumber !== existingAssignment.orderNumber) {
      const assignmentExists = await this.checkAssignmentExists(orderNumber);
      if (assignmentExists) {
        throw new BadRequestException(
          `Ya existe una asignación para el número de orden ${orderNumber}`,
        );
      }

      // También verificar que la actividad correspondiente exista
      const activitySnapshot = await this.firestore
        .collection('activities')
        .where('orderNumber', '==', orderNumber)
        .get();

      if (activitySnapshot.empty) {
        throw new NotFoundException(
          `No se encontró ninguna actividad con el número de orden ${orderNumber}`,
        );
      }
    }

    // Actualizar la asignación en Firestore
    await assignmentRef.update({
      ...updateAssignmentDto,
      assignmentDate: FieldValue.serverTimestamp(), // Opcional, puedes actualizar la fecha si es necesario
    });

    return { id, ...updateAssignmentDto };
  }
}
