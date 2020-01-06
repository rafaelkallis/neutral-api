import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ProjectModule } from './project/project.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from 'config';
import { DatabaseModule } from 'database';
import { EmailModule } from 'email';
import { LoggerModule } from 'logger';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SessionInterceptor } from 'session';

/**
 * App Module
 */
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CommonModule,
    DatabaseModule,
    EmailModule,
    AuthModule,
    UserModule,
    ProjectModule,
    RoleModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SessionInterceptor,
    },
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware for this module.
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(helmet(), compression(), cookieParser()).forRoutes('*');
  }
}
