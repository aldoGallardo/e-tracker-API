import { Module } from '@nestjs/common';
import { ActivityTypesService } from './activity-types.service';
import { ActivityTypesController } from './activity-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityType } from './activity-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityType])],
  controllers: [ActivityTypesController],
  providers: [ActivityTypesService],
})
export class ActivityTypesModule {}
