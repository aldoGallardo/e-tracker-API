import { Module } from '@nestjs/common';
import { ActivityTypesService } from './activity-types.service';
import { ActivityTypesController } from './activity-types.controller';

@Module({
  controllers: [ActivityTypesController],
  providers: [ActivityTypesService],
})
export class ActivityTypesModule {}
