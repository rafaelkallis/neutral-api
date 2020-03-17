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
import { ObjectStorageModule } from 'object-storage/ObjectStorageModule';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'common/application/MulterConfigService';
import { UserDtoMapperService } from 'user/application/UserDtoMapperService';

/**
 * User Module
 */
@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({ useClass: MulterConfigService }),
    TokenModule,
    DatabaseModule,
    EventModule,
    ObjectStorageModule,
  ],
  controllers: [UserController],
  providers: [
    UserApplicationService,
    UserDtoMapperService,
    UserTypeOrmEntityMapperService,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
  ],
  exports: [USER_REPOSITORY, UserDtoMapperService],
})
export class UserModule {}
