import { User } from 'user/domain/User';
import {
  UserCommand,
  UserCommandHandler,
} from 'user/application/commands/UserCommand';
import { NotFoundException } from '@nestjs/common';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserRepository } from 'user/domain/UserRepository';
import { CommandHandler } from 'shared/command/CommandHandler';

/**
 * Remove the authenticated user's avatar.
 */
export class RemoveAuthUserAvatarCommand extends UserCommand {}

@CommandHandler(RemoveAuthUserAvatarCommand)
export class RemoveAuthUserAvatarCommandHandler extends UserCommandHandler<
  RemoveAuthUserAvatarCommand
> {
  private readonly objectStorage: ObjectStorage;

  public constructor(
    objectMapper: ObjectMapper,
    userRepository: UserRepository,
    objectStorage: ObjectStorage,
  ) {
    super(objectMapper, userRepository);
    this.objectStorage = objectStorage;
  }

  protected async doHandle(
    command: RemoveAuthUserAvatarCommand,
  ): Promise<User> {
    const { authUser } = command;
    if (!authUser.avatar) {
      // TODO better handling
      throw new NotFoundException();
    }
    await this.objectStorage.delete({
      containerName: 'avatars',
      key: authUser.avatar.value,
    });
    authUser.removeAvatar();
    return authUser;
  }
}
