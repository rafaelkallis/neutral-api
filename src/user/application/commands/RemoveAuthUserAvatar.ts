import { User } from 'user/domain/User';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { Inject, NotFoundException, Type } from '@nestjs/common';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';

/**
 * Remove the authenticated user's avatar.
 */
export class RemoveAuthUserAvatarCommand extends UserCommand {}

export class RemoveAuthUserAvatarCommandHandler extends AbstractUserCommandHandler<
  RemoveAuthUserAvatarCommand
> {
  @Inject()
  private readonly objectStorage!: ObjectStorage;

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

  public getCommandType(): Type<RemoveAuthUserAvatarCommand> {
    return RemoveAuthUserAvatarCommand;
  }
}
