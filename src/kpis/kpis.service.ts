import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class KpisService {
  private readonly firestore: Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  // Método principal para actualizar valores diarios y sus agregados progresivos
  async updateDailyValue(
    calculationId: string,
    employeeId: string,
    branchOfficeId: string,
    date: Date,
    value: number,
  ): Promise<void> {
    const dailyKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    // Nivel empleado
    await this.updateAggregate(
      calculationId,
      `employees/${employeeId}/daily`,
      dailyKey,
      value,
    );

    // Nivel sucursal
    await this.recalculateAggregate(
      calculationId,
      `employees`,
      `branchOffice/${branchOfficeId}/daily`,
      dailyKey,
      (employeeDoc) => employeeDoc.average,
    );

    // Nivel global
    await this.recalculateAggregate(
      calculationId,
      `branchOffice`,
      `global/daily`,
      dailyKey,
      (branchDoc) => branchDoc.average,
    );

    // Actualizar los demás niveles (semanal, mensual, etc.) en cascada
    const weeklyKey = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
    const monthlyKey = date.toISOString().slice(0, 7); // YYYY-MM
    const quarterlyKey = `${date.getFullYear()}-Q${this.getQuarter(date)}`;
    const semesterlyKey = `${date.getFullYear()}-S${this.getSemester(date)}`;
    const yearlyKey = `${date.getFullYear()}`;

    await this.recalculatePeriodAggregate(
      calculationId,
      'daily',
      'weekly',
      weeklyKey,
    );
    await this.recalculatePeriodAggregate(
      calculationId,
      'weekly',
      'monthly',
      monthlyKey,
    );
    await this.recalculatePeriodAggregate(
      calculationId,
      'monthly',
      'trimesterly',
      quarterlyKey,
    );
    await this.recalculatePeriodAggregate(
      calculationId,
      'trimesterly',
      'semesterly',
      semesterlyKey,
    );
    await this.recalculatePeriodAggregate(
      calculationId,
      'semesterly',
      'yearly',
      yearlyKey,
    );
  }

  // Actualiza un valor y lo agrega al periodo correspondiente
  private async updateAggregate(
    calculationId: string,
    collectionName: string,
    periodKey: string,
    value: number,
  ): Promise<void> {
    const ref = this.firestore
      .collection('calculations')
      .doc(calculationId)
      .collection(collectionName)
      .doc(periodKey);

    await this.firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(ref);

      if (!doc.exists) {
        transaction.set(ref, {
          periodStart: periodKey,
          total: value,
          count: 1,
          average: value,
        });
      } else {
        const data = doc.data();
        const currentTotal = data?.total || 0;
        const currentCount = data?.count || 0;

        const newTotal = currentTotal + value;
        const newCount = currentCount + 1;
        const newAverage = newTotal / newCount;

        transaction.update(ref, {
          total: newTotal,
          count: newCount,
          average: newAverage,
        });
      }
    });
  }

  private async recalculateAggregate(
    calculationId: string,
    sourceCollection: string,
    targetCollection: string,
    targetKey: string,
    getValue: (doc: any) => number, // Función para extraer el valor relevante
  ): Promise<void> {
    const sourceRef = this.firestore
      .collection('calculations')
      .doc(calculationId)
      .collection(sourceCollection);

    const snapshot = await sourceRef.get();
    if (snapshot.empty) return;

    const values = snapshot.docs.map((doc) => getValue(doc.data()));

    const total = values.reduce((sum, value) => sum + value, 0);
    const count = values.length;
    const average = count > 0 ? total / count : 0;

    await this.updateAggregate(
      calculationId,
      targetCollection,
      targetKey,
      average,
    );
  }

  // Recalcula el promedio para un periodo basado en la subcolección anterior
  private async recalculatePeriodAggregate(
    calculationId: string,
    sourceCollection: string,
    targetCollection: string,
    targetKey: string,
  ): Promise<void> {
    const ref = this.firestore
      .collection('calculations')
      .doc(calculationId)
      .collection(sourceCollection);

    const snapshot = await ref.get();
    if (snapshot.empty) return;

    const sourceValues = snapshot.docs.map((doc) => doc.data().average || 0);

    const total = sourceValues.reduce((sum, value) => sum + value, 0);
    const count = sourceValues.length;
    const average = count > 0 ? total / count : 0;

    await this.updateAggregate(
      calculationId,
      targetCollection,
      targetKey,
      average,
    );
  }

  // Obtiene la semana inicial de un año
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000);
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Obtiene el trimestre basado en el mes
  private getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
  }

  // Obtiene el semestre basado en el mes
  private getSemester(date: Date): number {
    return date.getMonth() < 6 ? 1 : 2;
  }
}
