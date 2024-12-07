import { BranchOffice } from 'src/branch-offices/branch-office.entity';
import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('historicals')
export class Historical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  value: number; // Valor calculado

  @Column()
  method: string; // Método utilizado para calcular el valor

  @Column({ type: 'timestamp' })
  date: Date; // Fecha en que se calculó el valor

  @ManyToOne(() => User, (user) => user.historical, { eager: true })
  user: User; // Usuario al que se le calculó el valor

  @ManyToOne(() => BranchOffice, (branchOffice) => branchOffice.historical, {
    eager: true,
  })
  branchOffice: BranchOffice; // Sucursal a la que pertenece el valor
}
