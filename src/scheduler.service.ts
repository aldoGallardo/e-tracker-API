import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
}
