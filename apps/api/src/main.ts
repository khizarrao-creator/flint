import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Professional API Standard: Enable CORS and Prefixing
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Flint API is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
