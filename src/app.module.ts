import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth';
import { UserModule, User } from './user';
import { CommonModule, ConfigService } from './common';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [CommonModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [`${__dirname}/**/*.entity.js`],
        migrations: [`${__dirname}/migration/*.js`],
        migrationsRun: true,
      }),
    }),
    AuthModule,
    UserModule,
    CommonModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
