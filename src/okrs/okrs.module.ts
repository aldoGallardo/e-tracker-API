import { Module } from '@nestjs/common';
import { OkrsService } from './okrs.service';
import { OkrsController } from './okrs.controller';
import { FirebaseAdminModule } from '../firebase-admin.module';

@Module({
  imports: [FirebaseAdminModule], // Asegúrate de que esto esté aquí
  controllers: [OkrsController],
  providers: [OkrsService],
})
export class OkrsModule {}
