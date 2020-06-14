import { User } from 'user/domain/User';
import {
  UserCommand,
  UserCommandHandler,
} from 'user/application/commands/UserCommand';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { AvatarStore } from 'user/application/AvatarStore';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserRepository } from 'user/domain/UserRepository';
import { Injectable } from '@nestjs/common';
import { QueryHandler } from 'shared/query/QueryHandler';

/**
 * Update the authenticated user's avatar.
 */
export class UpdateAuthUserAvatarCommand extends UserCommand {
  public readonly avatarFile: string;
  public readonly contentType: string;

  public constructor(authUser: User, avatarFile: string, contentType: string) {
    super(authUser);
    this.avatarFile = avatarFile;
    this.contentType = contentType;
  }
}

@Injectable()
@QueryHandler.register(UpdateAuthUserAvatarCommand)
export class UpdateAuthUserAvatarCommandHandler extends UserCommandHandler<
  UpdateAuthUserAvatarCommand
> {
  private readonly avatarStore: AvatarStore;

  public constructor(
    objectMapper: ObjectMapper,
    userRepository: UserRepository,
    avatarStore: AvatarStore,
  ) {
    super(objectMapper, userRepository);
    this.avatarStore = avatarStore;
  }

  protected async doHandle(
    command: UpdateAuthUserAvatarCommand,
  ): Promise<User> {
    const { authUser, avatarFile, contentType } = command;
    const newAvatar = Avatar.create();
    await this.avatarStore.put(newAvatar, avatarFile, contentType);
    const oldAvatar = authUser.avatar;
    if (oldAvatar) {
      await this.avatarStore.delete(oldAvatar);
    }
    authUser.updateAvatar(newAvatar);
    return authUser;
  }
}
