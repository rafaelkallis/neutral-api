import { User } from 'user/domain/User';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { Type, Injectable } from '@nestjs/common';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { AvatarStore } from 'user/application/AvatarStore';

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
export class UpdateAuthUserAvatarCommandHandler extends AbstractUserCommandHandler<
  UpdateAuthUserAvatarCommand
> {
  private readonly avatarStore: AvatarStore;

  public constructor(avatarStore: AvatarStore) {
    super();
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

  public getCommandType(): Type<UpdateAuthUserAvatarCommand> {
    return UpdateAuthUserAvatarCommand;
  }
}
