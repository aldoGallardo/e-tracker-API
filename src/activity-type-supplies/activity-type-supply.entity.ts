import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ActivityType } from '../activity-types/activity-type.entity';
import { Supply } from '../supplies/supply.entity';

@Entity('activity_type_supplies')
export class ActivityTypeSupply {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => ActivityType,
    (activityType) => activityType.activityTypeSupplies,
  )
  activityType: ActivityType;

  @ManyToOne(() => Supply, (supply) => supply.activityTypeSupplies)
  supply: Supply;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedQuantity: number; // Cantidad estimada de suministro
}
