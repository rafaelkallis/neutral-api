import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TelemetryModule } from 'telemetry/TelemetryModule';
import { AppController } from 'app/presentation/AppController';
import { AuthModule } from 'auth/AuthModule';
import compression from 'compression';
import { ConfigModule } from 'config/ConfigModule';
import cookieParser from 'cookie-parser';
import { DatabaseModule } from 'database/DatabaseModule';
import { EmailModule } from 'email/EmailModule';
import helmet from 'helmet';
import { NotificationModule } from 'notification/NotificationModule';
import { ObjectStorageModule } from 'object-storage/ObjectStorageModule';
import { ProjectModule } from 'project/ProjectModule';
import { SessionMiddleware } from 'session';
import { UserModule } from 'user/UserModule';

/**
 * App Module
 */
@Module({
  imports: [
    ConfigModule,
    TelemetryModule,
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
