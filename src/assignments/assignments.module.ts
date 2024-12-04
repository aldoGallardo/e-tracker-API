// src/assignments/assignments.module.ts
import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Assignment } from './assignment.entity';
import { ActivityType } from 'src/activity-types/activity-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, ActivityType]), UsersModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [TypeOrmModule.forFeature([Assignment])],
})
export class AssignmentsModule {}
