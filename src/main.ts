import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilitar CORS para todas las rutas

  // Usar una ValidationPipe para validar automáticamente los DTOs en las peticiones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades que no estén en los DTOs
      forbidNonWhitelisted: true, // Lanzar un error si hay propiedades no permitidas
      transform: true, // Transforma los payloads a sus tipos adecuados
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('e-Tracker API')
    .setDescription(
      'Manage your employees performance based on your OKR and KPI with this API.',
    )
    .setVersion('1.0')
    .addTag('Users')
    .addTag('Auth')
    .addTag('Activities')
    .addTag('Activity Types')
    .addTag('Assignments')
    .addTag('Branch Offices')
    .addTag('Supplies')
    .addTag('KPIs')
    .addTag('OKRs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.getHttpAdapter().get('/swagger-json', (req, res) => {
    res.json(document);
  });

  await app.listen(3000);
}
bootstrap();
