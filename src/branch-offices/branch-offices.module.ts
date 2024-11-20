// src/branchOffices/branch-offices.module.ts
import { Module } from '@nestjs/common';
import { BranchOfficesService } from './branch-offices.service';
import { BranchOfficesController } from './branch-offices.controller';

@Module({
  controllers: [BranchOfficesController],
  providers: [BranchOfficesService],
})
export class BranchOfficesModule {}
