import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
expand(config()); // for dynamic env vars

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');

  const configService = app.get<ConfigService>(ConfigService);
  app.use(cookieParser());

  // CORS configuration with subdomain support
  const publicWebUrl = configService.get<string>('PUBLIC_WEB_URL');
  const baseDomain = configService.get<string>('BASE_DOMAIN') || 'pasal.com';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }

      // Allow main domain and all subdomains
      const isAllowed =
        origin === publicWebUrl ||
        origin.endsWith(`.${baseDomain}`) ||
        origin === `https://${baseDomain}` ||
        origin === `http://${baseDomain}` ||
        // Local development
        origin.includes('localhost') ||
        origin.endsWith('.local');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove unwanted values
      transform: true, // transform to dto objects
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pasal API Documentation')
    .setDescription('Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('BE_PORT') ?? 7000;
  await app.listen(port);

  Logger.log(`Server is running on port ${port}`);
  Logger.log(`Swagger docs available at http://localhost:${port}/docs`);
}
bootstrap().catch((error) => {
  Logger.error(error);
  process.exit(1);
});
