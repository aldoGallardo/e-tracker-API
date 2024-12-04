import { Module } from '@nestjs/common';
import { ActivityTypeSuppliesService } from './activity-type-supplies.service';
import { ActivityTypeSuppliesController } from './activity-type-supplies.controller';

@Module({
  controllers: [ActivityTypeSuppliesController],
  providers: [ActivityTypeSuppliesService],
})
export class ActivityTypeSuppliesModule {}
