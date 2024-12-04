import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { Supply } from '../supplies/supply.entity';

@Entity('assigned_supplies')
export class AssignedSupply {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.assignedSupplies)
  assignment: Assignment;

  @ManyToOne(() => Supply, (supply) => supply.assignedSupplies)
  supply: Supply;

  @Column('decimal', { precision: 10, scale: 2 })
  quantityUsed: number;
}
