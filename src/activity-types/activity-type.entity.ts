import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { ActivityTypeSupply } from 'src/activity-type-supplies/activity-type-supply.entity';

@Entity('activity_types')
export class ActivityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimate: number | null;

  @Column('boolean')
  regular: boolean;

  @OneToMany(
    () => ActivityTypeSupply,
    (activityTypeSupply) => activityTypeSupply.activityType,
  )
  activityTypeSupplies: ActivityTypeSupply[]; // Relación con los suministros asignados

  @OneToMany(() => Assignment, (assignment) => assignment.activityType)
  assignments: Assignment[]; // Relación con Asignaciones
}
