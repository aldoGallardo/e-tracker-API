// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserType } from '../user-types/user-type.entity';
import { BranchOffice } from '../branch-offices/branch-office.entity';
import { Assignment } from '../assignments/assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserType, BranchOffice, Assignment]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [
    TypeOrmModule.forFeature([User, UserType, BranchOffice, Assignment]),
  ],
})
export class UsersModule {}
