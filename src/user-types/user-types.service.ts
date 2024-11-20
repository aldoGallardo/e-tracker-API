import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class UserTypesService {
  private readonly firestore: Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async createUserType(createUserTypeDto: { name: string }) {
    const userTypeRef = await this.firestore.collection('userTypes').add({
      name: createUserTypeDto.name,
    });
    return { id: userTypeRef.id, name: createUserTypeDto.name };
  }

  async getAllUserTypes() {
    const snapshot = await this.firestore.collection('userTypes').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async deleteUserType(id: string) {
    const userTypeRef = this.firestore.collection('userTypes').doc(id);
    const userType = await userTypeRef.get();

    if (!userType.exists) {
      throw new BadRequestException('Tipo de usuario no encontrado');
    }

    await userTypeRef.delete();
    return { id };
  }
}
