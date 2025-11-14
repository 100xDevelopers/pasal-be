import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');

  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: configService.get<string>('PUBLIC_WEB_URL'),
    credentials: true,
  });

  const port = configService.get<number>('BE_PORT') ?? 7000;
  await app.listen(port);
  Logger.log(`Server is running on port ${port}`);
}
bootstrap().catch((error) => {
  Logger.error(error);
  process.exit(1);
});
