import { Module } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { KpisController } from './kpis.controller';
import { FirebaseAdminModule } from '../firebase-admin.module';
import { KpiLibraryController } from './kpis-library.controller';
import { KpiLibraryService } from './kpis-library.service';

@Module({
  imports: [FirebaseAdminModule], // Asegúrate de que esto esté aquí
  controllers: [KpisController, KpiLibraryController],
  providers: [KpisService, KpiLibraryService],
})
export class KpisModule {}
