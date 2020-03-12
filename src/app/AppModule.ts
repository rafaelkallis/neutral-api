import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppController } from 'app/presentation/AppController';
import { AuthModule } from 'auth/AuthModule';
import { ProjectModule } from 'project/ProjectModule';
import { UserModule } from 'user/UserModule';
import { ConfigModule } from 'config/ConfigModule';
import { DatabaseModule } from 'database/DatabaseModule';
import { EmailModule } from 'email/EmailModule';
import { SessionMiddleware } from 'session';
import { NotificationModule } from 'notification/NotificationModule';
import { ApmModule } from 'apm/ApmModule';
import { ObjectStorageModule } from 'object-storage/ObjectStorageModule';

/**
 * App Module
 */
@Module({
  imports: [
    ConfigModule,
    ApmModule,
    DatabaseModule,
    ObjectStorageModule,
    EmailModule,
    AuthModule,
    UserModule,
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
