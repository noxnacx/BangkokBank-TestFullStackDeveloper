import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // The frontend (Vite dev server) runs on a different origin, and it sends
  // the Bearer token via a custom Authorization header, which the browser
  // will not attach cross-origin without this.
  app.enableCors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
