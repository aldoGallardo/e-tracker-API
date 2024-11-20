import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { KpisModule } from './kpis/kpis.module';

@Module({
  imports: [KpisModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
