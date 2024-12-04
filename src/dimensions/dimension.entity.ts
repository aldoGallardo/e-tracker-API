import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { KeyResult } from '../key-results/key-result.entity';
import { Objective } from '../objectives/objective.entity';

@Entity('dimensions')
export class Dimension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @OneToMany(() => Objective, (objective) => objective.dimension)
  objectives: Objective[];

  @OneToMany(() => KeyResult, (keyResult) => keyResult.dimension)
  keyResults: KeyResult[];
}
