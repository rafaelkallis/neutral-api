import { Module } from '@nestjs/common';
import { UserController } from 'user/presentation/UserController';
import { UserTypeOrmRepository } from 'user/infrastructure/UserTypeOrmRepository';
import { USER_REPOSITORY } from 'user/domain/UserRepository';
import { DatabaseModule } from 'shared/database/DatabaseModule';
import { TokenModule } from 'shared/token/TokenModule';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { EventModule } from 'shared/event/EventModule';
import {
  UserTypeOrmEntityMap,
  ReverseUserTypeOrmEntityMap,
} from 'user/infrastructure/UserTypeOrmEntityMap';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'shared/application/MulterConfigService';
import { UserDtoMap } from 'user/application/UserDtoMap';
import { SharedModule } from 'shared/SharedModule';

/**
 * User Module
 */
@Module({
  imports: [
    SharedModule,
    MulterModule.registerAsync({ useClass: MulterConfigService }),
    TokenModule,
    DatabaseModule,
    EventModule,
  ],
  controllers: [UserController],
  providers: [
    UserApplicationService,
    UserDtoMap,
    UserTypeOrmEntityMap,
    ReverseUserTypeOrmEntityMap,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
