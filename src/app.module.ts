import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SuppliesModule } from './supplies/supplies.module';
import { BranchOfficesModule } from './branch-offices/branch-offices.module';
import { UsersModule } from './users/users.module';
import { ActivityTypesModule } from './activity-types/activity-types.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { UserTypesModule } from './user-types/user-types.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AssignedSuppliesModule } from './assigned-supplies/assigned-supplies.module';
import { AssignmentDetailsModule } from './assignment-details/assignment-details.module';
import { ActivityTypeSuppliesModule } from './activity-type-supplies/activity-type-supplies.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { DimensionsModule } from './dimensions/dimensions.module';
import { KeyResult } from './key-results/key-result.entity';
import { KeyResultsModule } from './key-results/key-results.module';
import { CalculationModule } from './calculation/calculation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SuppliesModule,
    BranchOfficesModule,
    UsersModule,
    ActivityTypesModule,
    AssignmentsModule,
    UserTypesModule,
    DashboardModule,
    AssignedSuppliesModule,
    AssignmentDetailsModule,
    ActivityTypeSuppliesModule,
    ObjectivesModule,
    DimensionsModule,
    KeyResultsModule,
    CalculationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
