import { Module } from '@nestjs/common';
import { UserController } from 'user/presentation/UserController';
import { UserRepository } from 'user/domain/UserRepository';
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
import { GetAuthUserQueryHandler } from 'user/application/queries/GetAuthUserQuery';
import { ForgetAuthUserCommandHandler } from 'user/application/commands/ForgetAuthUser';
import { UpdateAuthUserCommandHandler } from 'user/application/commands/UpdateAuthUser';
import { SubmitEmailChangeCommandHandler } from 'user/application/commands/SubmitEmailChange';
import { UpdateAuthUserAvatarCommandHandler } from 'user/application/commands/UpdateAuthUserAvatar';
import { RemoveAuthUserAvatarCommandHandler } from 'user/application/commands/RemoveAuthUserAvatar';
import { GetUserAvatarQueryHandler } from 'user/application/queries/GetUserAvatarQuery';
import { UserFactory } from 'user/application/UserFactory';
import { GetAuthUserDataZipQueryHandler } from 'user/application/queries/GetAuthUserDataZipQuery';

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
    UserDtoMap,
    UserTypeOrmEntityMap,
    ReverseUserTypeOrmEntityMap,
    { provide: UserRepository, useClass: TypeOrmUserRepository },
    UserFactory,
    // query handlers
    GetUsersQueryHandler,
    GetUserQueryHandler,
    GetAuthUserQueryHandler,
    GetUserAvatarQueryHandler,
    GetAuthUserDataZipQueryHandler,
    // command handlers
    UpdateAuthUserCommandHandler,
    ForgetAuthUserCommandHandler,
    SubmitEmailChangeCommandHandler,
    UpdateAuthUserAvatarCommandHandler,
    RemoveAuthUserAvatarCommandHandler,
  ],
  exports: [UserRepository, UserFactory],
})
export class UserModule {}
