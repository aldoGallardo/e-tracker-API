// src/supplies/supplies.module.ts
import { Module } from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { SuppliesController } from './supplies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supply } from './supply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supply])],
  controllers: [SuppliesController],
  providers: [SuppliesService],
  exports: [TypeOrmModule.forFeature([Supply])],
})
export class SuppliesModule {}
