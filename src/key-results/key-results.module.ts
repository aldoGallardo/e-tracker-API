import { Module } from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { KeyResultsController } from './key-results.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyResult } from './key-result.entity';
import { Objective } from 'src/objectives/objective.entity';
import { Dimension } from 'src/dimensions/dimension.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KeyResult, Objective, Dimension])],
  controllers: [KeyResultsController],
  providers: [KeyResultsService],
  exports: [TypeOrmModule.forFeature([KeyResult])],
})
export class KeyResultsModule {}
