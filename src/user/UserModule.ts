import { Module } from '@nestjs/common';
import { UserController } from './UserController';
import { TypeOrmUserRepository } from 'user/infrastructure/UserTypeOrmRepository';
import { USER_REPOSITORY } from 'user/domain/UserRepository';
import { DatabaseModule } from 'database';
import { ConfigModule } from 'config';
import { EmailModule } from 'email';
import { TokenModule } from 'token';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { UserDomainService } from 'user/domain/UserDomainService';
import { EventModule } from 'event';
import { UserTypeOrmEntityMapperService } from 'user/infrastructure/UserTypeOrmEntityMapper';
import { UserModelFactoryService } from 'user/domain/UserModelFactoryService';

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
    UserDomainService,
    UserModelFactoryService,
    UserApplicationService,
    UserTypeOrmEntityMapperService,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
  exports: [USER_REPOSITORY, UserModelFactoryService],
})
export class UserModule {}
