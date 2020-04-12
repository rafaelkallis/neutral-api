import { Module } from '@nestjs/common';
import { UserController } from 'user/presentation/UserController';
import { UserRepository } from 'user/domain/UserRepository';
import { UserApplicationService } from 'user/application/UserApplicationService';
import {
  UserTypeOrmEntityMap,
  ReverseUserTypeOrmEntityMap,
} from 'user/infrastructure/UserTypeOrmEntityMap';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'shared/application/MulterConfigService';
import { UserDtoMap } from 'user/application/UserDtoMap';
import { SharedModule } from 'shared/SharedModule';
import { TypeOrmUserRepository } from 'user/infrastructure/TypeOrmUserRepository';
import { GetUsersQueryHandler } from 'user/application/queries/GetUsersQuery';
import { GetUserQueryHandler } from 'user/application/queries/GetUserQuery';

/**
 * User Module
 */
@Module({
  imports: [
    SharedModule,
    MulterModule.registerAsync({ useClass: MulterConfigService }),
  ],
  controllers: [UserController],
  providers: [
    UserApplicationService,
    UserDtoMap,
    UserTypeOrmEntityMap,
    ReverseUserTypeOrmEntityMap,
    { provide: UserRepository, useClass: TypeOrmUserRepository },
    GetUsersQueryHandler,
    GetUserQueryHandler,
  ],
  exports: [UserRepository],
})
export class UserModule {}
