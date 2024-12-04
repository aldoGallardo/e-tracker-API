import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ActivityTypeSupply } from '../activity-type-supplies/activity-type-supply.entity';
import { AssignedSupply } from '../assigned-supplies/assigned-supply.entity';

@Entity('supplies')
export class Supply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: ['kg', 'l', 'm', 'm2', 'm3', 'u'] })
  unit: string;

  @OneToMany(
    () => ActivityTypeSupply,
    (activityTypeSupply) => activityTypeSupply.supply,
  )
  activityTypeSupplies: ActivityTypeSupply[]; // Relación con los suministros asignados

  @OneToMany(() => AssignedSupply, (assignedSupply) => assignedSupply.supply)
  assignedSupplies: AssignedSupply[]; // Relación con los suministros asignados
}
