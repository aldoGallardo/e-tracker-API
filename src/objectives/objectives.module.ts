import { Module } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { ObjectivesController } from './objectives.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from './objective.entity';
import { Dimension } from 'src/dimensions/dimension.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Objective, Dimension])],
  controllers: [ObjectivesController],
  providers: [ObjectivesService],
  exports: [TypeOrmModule.forFeature([Objective])],
})
export class ObjectivesModule {}
