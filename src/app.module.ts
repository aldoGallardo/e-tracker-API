import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SuppliesModule } from './supplies/supplies.module';
import { BranchOfficesModule } from './branch-offices/branch-offices.module';
import { UsersModule } from './users/users.module';
import { ActivityTypesModule } from './activity-types/activity-types.module';
import { ActivitiesModule } from './activities/activities.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { KpisModule } from './kpis/kpis.module';
import { UserTypesModule } from './user-types/user-types.module';
import { TestsModule } from './tests/tests.module';
import { OkrsModule } from './okrs/okrs.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SuppliesModule,
    BranchOfficesModule,
    UsersModule,
    ActivityTypesModule,
    ActivitiesModule,
    AssignmentsModule,
    UserTypesModule,
    KpisModule,
    TestsModule,
    OkrsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
