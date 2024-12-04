import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user-types')
export class UserType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @OneToMany(() => User, (user) => user.userType)
  users: User[];
}
