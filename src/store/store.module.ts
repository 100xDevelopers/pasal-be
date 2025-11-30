import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { SubdomainMiddleware } from '@src/common/middleware';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SubdomainMiddleware).forRoutes('*');
  }
}
