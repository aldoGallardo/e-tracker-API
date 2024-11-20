// src/supplies/supplies.module.ts
import { Module } from '@nestjs/common';
import { SuppliesService } from './supplies.service';
import { SuppliesController } from './supplies.controller';
import { FirebaseAdminModule } from '../firebase-admin.module';

@Module({
  imports: [FirebaseAdminModule], // Asegúrate de que esto esté aquí
  controllers: [SuppliesController],
  providers: [SuppliesService],
})
export class SuppliesModule {}
