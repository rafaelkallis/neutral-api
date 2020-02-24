import { Module } from '@nestjs/common';
import { UserController } from 'user/presentation/UserController';
import { UserTypeOrmRepository } from 'user/infrastructure/UserTypeOrmRepository';
import { USER_REPOSITORY } from 'user/domain/UserRepository';
import { DatabaseModule } from 'database/DatabaseModule';
import { TokenModule } from 'token/TokenModule';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { EventModule } from 'event/EventModule';
import { UserTypeOrmEntityMapperService } from 'user/infrastructure/UserTypeOrmEntityMapper';
import { ConfigModule } from 'config/ConfigModule';

/**
 * User Module
 */
@Module({
  imports: [ConfigModule, TokenModule, DatabaseModule, EventModule],
  controllers: [UserController],
  providers: [
    UserApplicationService,
    UserTypeOrmEntityMapperService,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
