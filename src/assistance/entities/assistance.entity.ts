import { User } from './../../users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('assistances')
export class Assistance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'enum', enum: ['IN', 'OUT'] })
  type: string;

  @ManyToOne(() => User, (user) => user.assistance, { eager: true })
  user: User;
}
