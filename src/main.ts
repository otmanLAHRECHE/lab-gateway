import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // DEV: allow Flutter Web dev server
  app.enableCors({
    origin: true,           // allow all origins (dev only)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept','secret-app-key',],
  });

  await app.listen(3000);
}
bootstrap();