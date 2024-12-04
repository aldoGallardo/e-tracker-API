import { Module } from '@nestjs/common';
import { UserTypesService } from './user-types.service';
import { UserTypesController } from './user-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserType } from './user-type.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserType, User])],
  controllers: [UserTypesController],
  providers: [UserTypesService],
  exports: [UserTypesService],
})
export class UserTypesModule {}
