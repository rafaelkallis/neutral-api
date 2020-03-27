import { Module } from '@nestjs/common';
import { UserController } from 'user/presentation/UserController';
import { UserTypeOrmRepository } from 'user/infrastructure/UserTypeOrmRepository';
import { USER_REPOSITORY } from 'user/domain/UserRepository';
import { DatabaseModule } from 'shared/database/DatabaseModule';
import { TokenModule } from 'shared/token/TokenModule';
import { UserApplicationService } from 'user/application/UserApplicationService';
import { EventModule } from 'shared/event/EventModule';
import { UserTypeOrmEntityMapperService } from 'user/infrastructure/UserTypeOrmEntityMapper';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'shared/application/MulterConfigService';
import { UserModelMap } from 'user/application/UserDtoMapperService';
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
    UserModelMap,
    UserTypeOrmEntityMapperService,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
