import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');

  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: configService.get<string>('PUBLIC_WEB_URL'),
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

  const config = new DocumentBuilder()
    .setTitle('Pasal API Documentation')
    .setDescription('Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
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
