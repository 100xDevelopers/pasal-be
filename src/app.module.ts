import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@src/prisma/prisma.module';
import { AuthModule } from '@src/auth/auth.module';
import { ProductModule } from '@src/product/product.module';
import { StoreModule } from '@src/store/store.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    PrismaModule,
    AuthModule,
    ProductModule,
    StoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
