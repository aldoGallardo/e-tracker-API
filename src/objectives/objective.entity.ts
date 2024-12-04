import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { KeyResult } from '../key-results/key-result.entity';
import { Dimension } from '../dimensions/dimension.entity';

@Entity('objectives')
export class Objective {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['reduce', 'maintain', 'increase'] })
  action: 'reduce' | 'maintain' | 'increase';

  @ManyToOne(() => Dimension, (dimension) => dimension.objectives, {
    onDelete: 'CASCADE',
  })
  dimension: Dimension;

  @OneToMany(() => KeyResult, (keyResult) => keyResult.objective)
  keyResults: KeyResult[];
}
