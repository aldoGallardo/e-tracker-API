import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Objective } from '../objectives/objective.entity';
import { Dimension } from '../dimensions/dimension.entity';
import { Advance } from './advance.entity'; // Importamos Advance

@Entity('key_results')
export class KeyResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: string; // Método utilizado para calcular el resultado clave

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  goalValue: number; // Valor objetivo o meta porcentual

  @Column({ type: 'timestamp' })
  initialDate: Date; // Fecha de inicio del objetivo

  @Column({ type: 'timestamp' })
  goalDate: Date; // Fecha en la que se debe alcanzar el objetivo

  @ManyToOne(() => Objective, (objective) => objective.keyResults)
  objective: Objective; // Relación con el objetivo al que pertenece este resultado clave

  @ManyToOne(() => Dimension, (dimension) => dimension.keyResults)
  dimension: Dimension; // Relación con la dimensión de medición

  @ManyToOne(() => Advance, (advance) => advance.keyResults) // Relación con Advance
  advance: Advance; // Relación con el avance asociado

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number; // Progreso calculado basado en el avance
}
