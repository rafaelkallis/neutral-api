import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmUserRepository } from 'user/repositories/typeorm-user.repository';
import { USER_REPOSITORY } from 'user/repositories/user.repository';
import { DatabaseModule } from 'database';
import { ConfigModule } from 'config';
import { EmailModule } from 'email';
import { TokenModule } from 'token';
import { UserApplicationService } from 'user/services/user-application.service';
import { UserDomainService } from 'user/services/user-domain.service';
import { EventModule } from 'event';

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
    UserDomainService,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
