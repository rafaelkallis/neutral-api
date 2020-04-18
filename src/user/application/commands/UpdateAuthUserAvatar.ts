import { User } from 'user/domain/User';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { Inject } from '@nestjs/common';
import { CommandHandler } from 'shared/command/CommandHandler';
import { AvatarUnsupportedContentTypeException } from 'user/application/exceptions/AvatarUnsupportedContentTypeException';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';

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

@CommandHandler(UpdateAuthUserAvatarCommand)
export class UpdateAuthUserAvatarCommandHandler extends AbstractUserCommandHandler<
  UpdateAuthUserAvatarCommand
> {
  public static AVATAR_MIME_TYPES = ['image/png', 'image/jpeg'];
  @Inject()
  private readonly objectStorage!: ObjectStorage;

  protected async doHandle(
    command: UpdateAuthUserAvatarCommand,
  ): Promise<User> {
    const { authUser, avatarFile, contentType } = command;
    if (
      !UpdateAuthUserAvatarCommandHandler.AVATAR_MIME_TYPES.includes(
        contentType,
      )
    ) {
      throw new AvatarUnsupportedContentTypeException();
    }
    const { key } = await this.objectStorage.put({
      containerName: 'avatars',
      file: avatarFile,
      contentType,
    });
    const oldAvatar = authUser.avatar;
    if (oldAvatar) {
      await this.objectStorage.delete({
        containerName: 'avatars',
        key: oldAvatar.value,
      });
    }
    const newAvatar = Avatar.from(key);
    authUser.updateAvatar(newAvatar);
    return authUser;
  }
}
