import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOkrDto } from 'src/okrs/dto/create-okr.dto';
import { Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class OkrsService {
  private readonly firestore: Firestore;
  private okrs = []; // Simulación de base de datos

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async createOkr(createOkrDto: CreateOkrDto) {
    const okrRef = await this.firestore.collection('okrs').add(createOkrDto);
    return { id: okrRef.id, ...createOkrDto };
  }

  async getOkrById(id: string) {
    const okrDoc = await this.firestore.collection('okrs').doc(id).get();
    if (!okrDoc.exists) {
      throw new NotFoundException(`OKR con ID ${id} no encontrado`);
    }
    return { id: okrDoc.id, ...okrDoc.data() };
  }

  async getAllOkrs() {
    const snapshot = await this.firestore.collection('okrs').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getOkrWithKpis(okrId: string) {
    const okrDoc = await this.firestore.collection('okrs').doc(okrId).get();
    if (!okrDoc.exists)
      throw new NotFoundException(`OKR con ID ${okrId} no encontrado`);

    const okrData = okrDoc.data();
    const kpis = await Promise.all(
      okrData.kpis.map(async (kpiId: string) => {
        const kpiDoc = await this.firestore.collection('kpis').doc(kpiId).get();
        return { id: kpiDoc.id, ...kpiDoc.data() };
      }),
    );

    return { ...okrData, kpis };
  }
}
