import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CommonModule, ConfigService } from './common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';

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
      }),
    }),
    AuthModule,
    UserModule,
    CommonModule,
    ProjectModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
