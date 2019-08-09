import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { SessionMiddleware, CommonModule, ConfigService } from './common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { RoleModule } from './role/role.module';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

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
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        helmet(),
        compression(),
        cookieParser(),
        SessionMiddleware,
      )
      .forRoutes('*');
  }
}
