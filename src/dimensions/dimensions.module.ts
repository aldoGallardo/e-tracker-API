import { Module } from '@nestjs/common';
import { DimensionsService } from './dimensions.service';
import { DimensionsController } from './dimensions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dimension } from './dimension.entity';
import { Objective } from 'src/objectives/objective.entity';
import { KeyResult } from 'src/key-results/key-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dimension, Objective, KeyResult])],
  controllers: [DimensionsController],
  providers: [DimensionsService],
  exports: [TypeOrmModule.forFeature([Dimension])],
})
export class DimensionsModule {}
