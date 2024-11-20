import * as math from 'mathjs';

export class KpiCalculator {
  // Método de cálculo
  static calculate(formula: string, variables: Record<string, number>): number {
    try {
      const compiledFormula = math.compile(formula);
      return compiledFormula.evaluate(variables);
    } catch (error) {
      throw new Error('Error al evaluar la fórmula del KPI');
    }
  }

  // Método de validación
  static validateFormula(formula: string, variables: Record<string, number>) {
    try {
      const compiledFormula = math.compile(formula);
      compiledFormula.evaluate(variables);
      return { message: 'Fórmula válida' };
    } catch (error) {
      throw new Error(`Fórmula inválida: ${error.message}`);
    }
  }
}
