import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { CreateOkrDto } from './dto/create-okr.dto';
import { Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { KpisService } from '../kpis/kpis.service';
import { Query } from '@nestjs/common';

@Injectable()
export class OkrsService {
  private readonly firestore: Firestore;
  private okrs = []; // Simulación de base de datos

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async getDimension(id: string) {
    const dimensionDoc = await this.firestore
      .collection('dimensions')
      .doc(id)
      .get();
    if (!dimensionDoc.exists) {
      throw new NotFoundException(`Dimensión con ID ${id} no encontrada`);
    }
    return { id: dimensionDoc.id, ...dimensionDoc.data() };
  }

  async getAllDimensionsWithCalculations() {
    const snapshot = await this.firestore.collection('dimensions').get();
    const calculationsSnapshot = await this.firestore
      .collection('calculations')
      .get();
    const calculationsByDimension = calculationsSnapshot.docs.reduce(
      (acc, doc) => {
        const data = doc.data();
        if (!acc[data.dimension]) {
          acc[data.dimension] = [];
        }
        acc[data.dimension].push({ id: doc.id, ...data });
        return acc;
      },
      {},
    );

    const dimensionsWithCalculations = snapshot.docs.map((doc) => {
      const dimensionData = { id: doc.id, ...doc.data() };
      return {
        ...dimensionData,
        calculations: calculationsByDimension[dimensionData.id] || [],
      };
    });

    return dimensionsWithCalculations;
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getCalculationsByDimension(dimensionId: string) {
    const snapshot = await this.firestore
      .collection('calculations')
      .where('dimension', '==', dimensionId)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // async createOkr(dto: CreateOkrDto) {
  //   // Lógica de creación de OKR
  //   const dimension = dto.dimension;
  //   // Llamar a la generación de KPIs según la dimensión
  //   await this.kpisService.generateKpisForOkr(dimension);
  // }

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
