import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  // Use PORT from env (GCP) or fallback to 3000 (Local)
  const port = process.env.PORT || 3000;

  logger.log(`🚀 Release Guard is starting on port ${port}...`);
  
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Cloud Run / Docker Resilience
  const usePort = Number(process.env.PORT) || 3000;
  const useHost = process.env.PORT ? '0.0.0.0' : 'localhost';

  await app.listen(usePort, useHost);
  
  logger.log(`🚀 Release Guard is LIVE on ${useHost}:${usePort}`);
}

bootstrap().catch((err) => {
  console.error('💥 STARTUP FAILED:', err);
  process.exit(1);
});
