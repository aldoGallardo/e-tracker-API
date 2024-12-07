import { Module } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from 'src/assignments/assignment.entity';
import { CalculationController } from './calculation.controller';
import { User } from 'src/users/user.entity';
import { Assistance } from 'src/assistance/entities/assistance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, User, Assistance])],
  controllers: [CalculationController],
  providers: [CalculationService],
  exports: [CalculationService],
})
export class CalculationModule {}
