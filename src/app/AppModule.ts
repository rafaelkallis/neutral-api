import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from 'app/presentation/AppController';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NotificationModule } from 'notification/NotificationModule';
import { ProjectModule } from 'project/ProjectModule';
import { SessionMiddleware } from 'shared/session';
import { UserModule } from 'user/UserModule';
import { SharedModule } from 'shared/SharedModule';
import { AuthModule } from 'auth/AuthModule';

/**
 * App Module
 */
@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    ProjectModule,
    NotificationModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware for this module.
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(helmet(), compression(), cookieParser(), SessionMiddleware)
      .forRoutes('*');
  }
}
