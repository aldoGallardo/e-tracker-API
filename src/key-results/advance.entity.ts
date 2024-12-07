import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { KeyResult } from './key-result.entity'; // Importamos KeyResult

@Entity('advances')
export class Advance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: string; // Método de cálculo del avance

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  value: number; // Valor calculado o porcentaje de avance

  @Column({ type: 'timestamp' })
  date: Date; // Fecha de creación del avance

  @OneToMany(() => KeyResult, (keyResult) => keyResult.advance) // Relación uno a muchos
  keyResults: KeyResult[]; // Relación con los KeyResults asociados a este Advance
}
