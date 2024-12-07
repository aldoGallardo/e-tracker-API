import { Module } from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { AssistanceController } from './assistance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assistance } from './entities/assistance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assistance])],
  controllers: [AssistanceController],
  providers: [AssistanceService],
  exports: [TypeOrmModule.forFeature([Assistance])],
})
export class AssistanceModule {}
