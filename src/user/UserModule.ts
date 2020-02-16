import { Module } from '@nestjs/common';
import { UserController } from './UserController';
import { UserTypeOrmRepository } from 'user/infrastructure/UserTypeOrmRepository';
import { USER_REPOSITORY } from 'user/domain/UserRepository';
import { DatabaseModule } from 'database';
import { ConfigModule } from 'config';
import { EmailModule } from 'email';
import { TokenModule } from 'token';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { EventModule } from 'event';
import { UserTypeOrmEntityMapperService } from 'user/infrastructure/UserTypeOrmEntityMapper';

/**
 * User Module
 */
@Module({
  imports: [
    ConfigModule,
    TokenModule,
    DatabaseModule,
    EventModule,
    EmailModule,
  ],
  controllers: [UserController],
  providers: [
    UserApplicationService,
    UserTypeOrmEntityMapperService,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
