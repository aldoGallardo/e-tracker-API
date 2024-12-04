import { Module } from '@nestjs/common';
import { AssignedSuppliesService } from './assigned-supplies.service';
import { AssignedSuppliesController } from './assigned-supplies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignedSupply } from './assigned-supply.entity';
import { AssignmentsModule } from 'src/assignments/assignments.module';
import { SuppliesModule } from 'src/supplies/supplies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignedSupply]),
    AssignmentsModule,
    SuppliesModule,
  ],
  controllers: [AssignedSuppliesController],
  providers: [AssignedSuppliesService],
})
export class AssignedSuppliesModule {}
