import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Firestore, Timestamp } from '@google-cloud/firestore';

@Injectable()
export class KeyResultsCalculationService {
  private readonly firestore: Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any) {
    this.firestore = this.firebaseAdmin.firestore();
  }
  // Obtener el valor más reciente o por rango de fechas
  async getCalculationValue(
    calculationId: string,
    startDate: Date,
    endDate?: Date,
  ): Promise<number> {
    const collection = this.firestore
      .collection('calculations')
      .doc(calculationId)
      .collection('dailyResults');

    const startKey = startDate.toISOString().split('T')[0];
    const endKey = endDate ? endDate.toISOString().split('T')[0] : startKey;

    const query = collection
      .where('date', '>=', startKey)
      .where('date', '<=', endKey);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return 0;
    }

    return snapshot.docs.reduce((sum, doc) => sum + (doc.data().value || 0), 0);
  }

  // Calcular progreso dinámico
  async calculateProgress({
    startValue,
    actualValue,
    targetValue,
    targetAction,
    calculationId,
    goalStartline,
    goalEndline,
  }: {
    startValue: number;
    actualValue: number;
    targetValue: number;
    targetAction: string;
    calculationId?: string;
    goalStartline?: Date;
    goalEndline?: Date;
  }): Promise<number> {
    if (targetAction === 'increase') {
      return targetValue > startValue
        ? ((actualValue - startValue) / (targetValue - startValue)) * 100
        : 0;
    } else if (targetAction === 'reduce') {
      return startValue > targetValue
        ? ((startValue - actualValue) / (startValue - targetValue)) * 100
        : 0;
    } else if (targetAction === 'keep') {
      // Delegar el cálculo para metas tipo "keep" al nuevo submétodo
      if (calculationId && goalStartline && goalEndline) {
        const { progress } = await this.calculateProgressKeep({
          calculationId,
          startDate: goalStartline,
          endDate: goalEndline,
          targetValue,
        });
        return progress;
      }
      // Si no hay suficientes datos, retornar 0
      return 0;
    }
    return 0;
  }

  async calculateProgressKeep({
    calculationId,
    startDate,
    endDate,
    targetValue,
  }: {
    calculationId: string;
    startDate: Date;
    endDate: Date;
    targetValue: number; // Porcentaje de tolerancia
  }): Promise<{ progress: number; actualValue: number }> {
    const now = new Date();
    const adjustedEndDate = now > endDate ? endDate : now; // Usar la fecha actual si aún no termina el periodo
    const totalDays = Math.ceil(
      (adjustedEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Obtener valores diarios de la colección
    const ref = this.firestore
      .collection('calculations')
      .doc(calculationId)
      .collection('daily');

    const snapshot = await ref
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .where('date', '<=', adjustedEndDate.toISOString().split('T')[0])
      .get();

    if (snapshot.empty) {
      return { progress: 0, actualValue: 0 }; // Si no hay datos, progreso y actualValue son 0
    }

    const dailyValues = snapshot.docs.map((doc) => doc.data());
    const startValue = dailyValues[0]?.average || 0;

    // Calcular rango aceptable
    const minValue = startValue * (1 - targetValue / 100);
    const maxValue = startValue * (1 + targetValue / 100);

    // Calcular actualValue como promedio de valores disponibles
    const totalValues = dailyValues.reduce(
      (acc, data) => acc + (data.average || 0),
      0,
    );
    const actualValue =
      dailyValues.length > 0 ? totalValues / dailyValues.length : 0;

    // Contar días cumplidos
    let daysMet = 0;
    dailyValues.forEach((data) => {
      if (data.average >= minValue && data.average <= maxValue) {
        daysMet++;
      }
    });

    // Calcular progreso parcial
    const progress = (daysMet / totalDays) * 100;

    return {
      progress: parseFloat(progress.toFixed(2)), // Progreso parcial redondeado
      actualValue: parseFloat(actualValue.toFixed(2)), // Valor promedio real redondeado
    };
  }

  // Actualizar valores de un Key Result
  async updateKeyResultValues(keyResultId: string): Promise<void> {
    const krRef = this.firestore.collection('keyResults').doc(keyResultId);
    const krDoc = await krRef.get();

    if (!krDoc.exists) {
      throw new NotFoundException(
        `Key Result with ID ${keyResultId} not found`,
      );
    }

    const { calculation, goalStartline, targetValue, targetAction } =
      krDoc.data();

    const actualValue = await this.getCalculationValue(
      calculation,
      goalStartline,
      new Date(),
    );

    const progress = this.calculateProgress({
      startValue: krDoc.data().startValue,
      actualValue,
      targetValue,
      targetAction,
    });

    await krRef.update({
      actualValue,
      progress,
      updatedAt: Timestamp.now(),
    });
  }

  // Actualizar todos los Key Results
  async updateAllKeyResults(): Promise<void> {
    const snapshot = await this.firestore.collection('keyResults').get();

    if (snapshot.empty) {
      console.log('No Key Results to update.');
      return;
    }

    const promises = snapshot.docs.map((doc) =>
      this.updateKeyResultValues(doc.id),
    );

    await Promise.all(promises);
    console.log('All Key Results updated successfully.');
  }

  // Calcular fechas iniciales y finales para un KR
  calculateGoalDates(goalType: string): {
    goalStartline: Date;
    goalEndline: Date;
  } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Año, Mes, Día (ignorando hora)

    let goalStartline: Date;
    let goalEndline: Date;

    switch (goalType) {
      case 'daily':
        // Inicio y fin son el mismo día
        goalStartline = new Date(start);
        goalEndline = new Date(start);
        break;

      case 'weekly':
        // Calcular el lunes de la semana actual
        const dayOfWeek = start.getDay(); // Día de la semana (0=domingo, 1=lunes, ...)
        goalStartline = new Date(start);
        goalStartline.setDate(
          start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1),
        ); // Ajustar al lunes
        goalEndline = new Date(goalStartline);
        goalEndline.setDate(goalStartline.getDate() + 6); // Ajustar al domingo
        break;

      case 'monthly':
        // Primer día y último día del mes actual
        goalStartline = new Date(start.getFullYear(), start.getMonth(), 1); // Primer día del mes
        goalEndline = new Date(start.getFullYear(), start.getMonth() + 1, 0); // Último día del mes
        break;

      case 'quarterly':
        // Primer día y último día del trimestre actual
        const quarter = Math.floor(start.getMonth() / 3); // Trimestre (0=Q1, 1=Q2, ...)
        goalStartline = new Date(start.getFullYear(), quarter * 3, 1); // Primer día del trimestre
        goalEndline = new Date(start.getFullYear(), (quarter + 1) * 3, 0); // Último día del trimestre
        break;

      case 'semesterly':
        // Primer día y último día del semestre actual
        const semester = start.getMonth() < 6 ? 0 : 1; // Primer semestre (0) o segundo (1)
        goalStartline = new Date(start.getFullYear(), semester * 6, 1); // Primer día del semestre
        goalEndline = new Date(start.getFullYear(), (semester + 1) * 6, 0); // Último día del semestre
        break;

      case 'yearly':
        // Primer día y último día del año actual
        goalStartline = new Date(start.getFullYear(), 0, 1); // 1 de enero
        goalEndline = new Date(start.getFullYear(), 11, 31); // 31 de diciembre
        break;

      default:
        throw new Error(`Unsupported goalType: ${goalType}`);
    }

    return { goalStartline, goalEndline };
  }
}
