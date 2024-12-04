import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('branch_offices')
export class BranchOffice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  latitude: number;

  @Column({ type: 'decimal', precision: 18, scale: 15 })
  longitude: number;

  @OneToMany(() => User, (user) => user.branchOffice)
  users: User[];
}
