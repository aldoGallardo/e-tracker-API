import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { KeyResult } from '../key-results/key-result.entity';

@Entity('assignment_details')
export class AssignmentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 5, scale: 2 })
  calculatedValue: number; // Valor calculado para este detalle (resultado del KeyResult)

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  thresholdValue?: number; // Valor umbral opcional (en caso de que se requiera en ciertos métodos de cálculo)

  @Column({ type: 'timestamp' })
  date: Date; // Fecha del cálculo del detalle (cuando se generó este detalle)

  @ManyToOne(() => KeyResult, (keyResult) => keyResult.assignmentDetails)
  keyResult: KeyResult; // Relación con KeyResult para calcular el resultado

  @ManyToOne(() => Assignment, (assignment) => assignment.assignmentDetails)
  assignment: Assignment; // Relación con la asignación a la que pertenece el detalle
}
