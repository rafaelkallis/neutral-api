import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from 'app/presentation/AppController';
import compression from 'compression';
import helmet from 'helmet';
import { NotificationModule } from 'notification/NotificationModule';
import { ProjectModule } from 'project/ProjectModule';
import { UserModule } from 'user/UserModule';
import { SharedModule } from 'shared/SharedModule';
import { AuthModule } from 'auth/AuthModule';
import { OrganizationModule } from 'organization/OrganizationModule';

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
    OrganizationModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware for this module.
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(helmet(), compression()).forRoutes('*');
  }
}
