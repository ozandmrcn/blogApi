import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // The API sits behind a reverse proxy on Render, so `trust proxy` has to be
  // enabled for `req.ip` / secure request detection to resolve correctly.
  app.set('trust proxy', 1);

  // Baseline security headers (CSP, HSTS, clickjacking and sniffing guards).
  app.use(helmet());

  // Required for reading the JWT cookies issued by the auth controller.
  app.use(cookieParser());

  // Only the configured frontend origins may send credentialed requests.
  // `FRONTEND_URL` accepts one origin or a comma-separated list, which keeps
  // preview deployments working without weakening the allow-list.
  const allowedOrigins = (
    config.get<string>('FRONTEND_URL') || 'http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Every route shares one strict validation pipe: unknown properties are
  // stripped and rejected, and payloads are coerced to their DTO types.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // All feature routes live under /api, keeping the root free for health checks.
  app.setGlobalPrefix('api');

  // Close the HTTP server and drain connections before the process exits.
  app.enableShutdownHooks();

  // `PORT` arrives from the environment as a string, so it is parsed before
  // being handed to `listen`, which would otherwise treat it as a pipe name.
  const port = Number(config.get<string>('PORT')) || 3000;
  await app.listen(port);

  console.log(`API is running on http://localhost:${port}/api`);
}

void bootstrap();
