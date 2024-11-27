import { Module } from '@nestjs/common';
import { ObjectivesController } from './objectives.controller';
import { KeyResultsController } from './key-results.controller';
import { FirebaseAdminModule } from '../firebase-admin.module';
import { ObjectivesService } from './objectives.service';
import { KeyResultsService } from './key-results.service';
import { KeyResultsCalculationService } from './key-results-calculation.service';

@Module({
  imports: [FirebaseAdminModule], // Asegúrate de que esto esté aquí
  controllers: [ObjectivesController, KeyResultsController],
  providers: [
    ObjectivesService,
    KeyResultsService,
    KeyResultsCalculationService,
  ],
})
export class OkrsModule {}
