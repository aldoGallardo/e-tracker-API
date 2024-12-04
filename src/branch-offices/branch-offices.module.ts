// src/branchOffices/branch-offices.module.ts
import { Module } from '@nestjs/common';
import { BranchOfficesService } from './branch-offices.service';
import { BranchOfficesController } from './branch-offices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { BranchOffice } from './branch-office.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchOffice, User])],
  controllers: [BranchOfficesController],
  providers: [BranchOfficesService],
  exports: [BranchOfficesService],
})
export class BranchOfficesModule {}
