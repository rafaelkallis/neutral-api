import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppController } from 'app.controller';
import { AuthModule } from 'auth/AuthModule';
import { ProjectModule } from 'project/ProjectModule';
import { RoleModule } from 'role/RoleModule';
import { UserModule } from 'user/UserModule';
import { ConfigModule } from 'config';
import { DatabaseModule } from 'database';
import { EmailModule } from 'email';
import { SessionMiddleware } from 'session';
import { NotificationModule } from 'notification/NotificationModule';
import { ApmModule } from 'apm';

/**
 * App Module
 */
@Module({
  imports: [
    ConfigModule,
    ApmModule,
    DatabaseModule,
    EmailModule,
    AuthModule,
    UserModule,
    ProjectModule,
    RoleModule,
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
