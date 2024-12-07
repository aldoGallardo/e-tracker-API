import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ActivityType } from '../activity-types/activity-type.entity';
import { AssignedSupply } from '../assigned-supplies/assigned-supply.entity';
import { BranchOffice } from 'src/branch-offices/branch-office.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdAt: Date;

  // Usuario asignado (trabajador)
  @ManyToOne(() => User, (user) => user.assignedToAssignments, { eager: true })
  assignTo: User;

  // Usuario asignador
  @ManyToOne(() => User, (user) => user.assignedFromAssignments, {
    eager: true,
  })
  assignFrom: User;

  @Column('enum', {
    enum: ['pending', 'completed', 'inProgress'],
    default: 'pending',
  })
  status: 'pending' | 'completed' | 'inProgress'; // Estado de la asignación

  @Column()
  orderNumber: string;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  latitude: number;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  longitude: number;

  @Column()
  startedAt: Date;

  @Column()
  completedAt: Date;

  @Column('text', { array: true, nullable: true })
  evidence: string[]; // Lista de URLs de evidencia

  @Column('decimal', { precision: 10, scale: 2 })
  duration: number;

  @Column('text')
  description: string;

  @Column('text')
  comment: string;

  @Column('text')
  address: string;

  @ManyToOne(() => ActivityType, (activityType) => activityType.assignments)
  activityType: ActivityType; // Relación con el tipo de actividad

  @ManyToOne(() => BranchOffice, (branchOffice) => branchOffice.assignments)
  branchOffice: BranchOffice; // Relación con la sucursal

  @OneToMany(
    () => AssignedSupply,
    (assignedSupply) => assignedSupply.assignment,
  )
  assignedSupplies: AssignedSupply[]; // Relación con los suministros usados en la asignación
}
