import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Objective } from '../objectives/objective.entity';
import { Dimension } from '../dimensions/dimension.entity';
import { AssignmentDetail } from '../assignment-details/assignment-detail.entity';
@Entity('key_results')
export class KeyResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  target: number; // Meta porcentual

  @Column({ type: 'timestamp' })
  date: Date;

  @ManyToOne(() => Objective, (objective) => objective.keyResults)
  objective: Objective; // Relación con el objetivo al que pertenece este resultado clave

  @ManyToOne(() => Dimension, (dimension) => dimension.keyResults)
  dimension: Dimension;

  @OneToMany(
    () => AssignmentDetail,
    (assignmentDetail) => assignmentDetail.keyResult,
  )
  assignmentDetails: AssignmentDetail[]; // Relación con los detalles de asignación que lo calculan
}
