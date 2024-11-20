import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { KpiCalculator } from './kpis-calculation.service';
import { Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class KpisService {
  private readonly firestore: Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  // Crear un KPI
  async createKpi(createKpiDto: CreateKpiDto) {
    try {
      // Convierte el objeto `createKpiDto` en un JSON puro
      const kpiData = { ...createKpiDto };

      const kpiRef = await this.firestore.collection('kpis').add(kpiData);
      return { id: kpiRef.id, ...kpiData };
    } catch (error) {
      console.error('Error details:', error); // Log detallado para depuración
      throw new BadRequestException(`Error al crear el KPI: ${error.message}`);
    }
  }

  // Obtener un KPI por ID
  async getKpiById(kpiId: string) {
    const kpiDoc = await this.firestore.collection('kpis').doc(kpiId).get();
    if (!kpiDoc.exists) {
      throw new NotFoundException(`KPI con ID ${kpiId} no encontrado`);
    }
    return kpiDoc.data();
  }

  // Calcular el valor de un KPI usando el KpiCalculator
  async calculateKpi(
    kpiId: string,
    variables: Record<string, number>,
  ): Promise<number> {
    const kpi = await this.getKpiById(kpiId);
    try {
      return KpiCalculator.calculate(kpi.formula, variables); // Calcula usando el helper
    } catch (error) {
      throw new BadRequestException(
        `Error al calcular el KPI: ${error.message}`,
      );
    }
  }

  // Actualizar el valor actual de un KPI
  async updateKpiValue(id: string, variables: Record<string, number>) {
    const kpiData = await this.getKpiById(id);
    try {
      const newValue = KpiCalculator.calculate(kpiData.formula, variables);
      await this.firestore
        .collection('kpis')
        .doc(id)
        .update({ currentValue: newValue });
      return { id, currentValue: newValue };
    } catch (error) {
      throw new BadRequestException(
        `Error al actualizar el KPI: ${error.message}`,
      );
    }
  }

  // Obtener todos los KPIs
  async getAllKpis(
    filters: {
      name?: string;
      branchOffice?: string;
      startDate?: string;
      endDate?: string;
    } = {},
  ) {
    let query: FirebaseFirestore.Query = this.firestore.collection('kpis');

    if (filters.name) {
      query = query.where('name', '==', filters.name);
    }
    if (filters.branchOffice) {
      query = query.where('branchOffice', '==', filters.branchOffice);
    }
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      query = query
        .where('createdAt', '>=', start)
        .where('createdAt', '<=', end);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
