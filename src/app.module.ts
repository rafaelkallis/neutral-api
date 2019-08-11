import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommonModule, ConfigService, SessionMiddleware } from './common';
import { ProjectModule } from './project/project.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';

/**
 * App Module
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [CommonModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [`${__dirname}/common/entities/*`],
        migrations: [`${__dirname}/migration/*.js`],
        migrationsRun: true,
        keepConnectionAlive: true,
      }),
    }),
    AuthModule,
    UserModule,
    CommonModule,
    ProjectModule,
    RoleModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware for this module.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet(), compression(), cookieParser(), SessionMiddleware)
      .forRoutes('*');
  }
}
