import { Module } from '@nestjs/common';
import { AssignmentDetailsService } from './assignment-details.service';
import { AssignmentDetailsController } from './assignment-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentDetail } from './assignment-detail.entity';
import { Assignment } from 'src/assignments/assignment.entity';
import { KeyResult } from 'src/key-results/key-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignmentDetail, Assignment, KeyResult]),
  ],
  controllers: [AssignmentDetailsController],
  providers: [AssignmentDetailsService],
  exports: [TypeOrmModule.forFeature([AssignmentDetail])],
})
export class AssignmentDetailsModule {}
