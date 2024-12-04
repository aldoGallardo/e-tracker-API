import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BranchOffice } from '../branch-offices/branch-office.entity';
import { UserType } from '../user-types/user-type.entity';
import { Assignment } from '../assignments/assignment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  surname: string;

  @Column({ type: 'varchar', length: 8, unique: true })
  dni: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 9, unique: true, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage: string;

  @Column('enum', { enum: ['active', 'inactive'], default: 'active' })
  contractStatus: 'active' | 'inactive';

  @Column({ type: 'boolean', default: false })
  journey: boolean;

  @ManyToOne(() => UserType, (userType) => userType.users, { eager: true })
  userType: UserType;

  @ManyToOne(() => BranchOffice, (branchOffice) => branchOffice.users, {
    eager: true,
  })
  branchOffice: BranchOffice;

  // Relación inversa para asignaciones donde el usuario es el asignado
  @OneToMany(() => Assignment, (assignment) => assignment.assignTo)
  assignedToAssignments: Assignment[];

  // Relación inversa para asignaciones donde el usuario es el asignador
  @OneToMany(() => Assignment, (assignment) => assignment.assignFrom)
  assignedFromAssignments: Assignment[];
}
