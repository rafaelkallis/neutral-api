import { Injectable } from '@nestjs/common';
import {
  ObjectStorage,
  GetReturn,
} from 'shared/object-storage/application/ObjectStorage';
import { AvatarUnsupportedContentTypeException } from 'user/application/exceptions/AvatarUnsupportedContentTypeException';
import { Avatar } from 'user/domain/value-objects/Avatar';

@Injectable()
export class AvatarStore {
  public static AVATAR_MIME_TYPES = ['image/png', 'image/jpeg'];
  public static AVATAR_CONTAINER = 'avatars';

  private readonly objectStorage: ObjectStorage;

  public constructor(objectStorage: ObjectStorage) {
    this.objectStorage = objectStorage;
  }

  public get(avatar: Avatar): Promise<GetReturn> {
    return this.objectStorage.get({
      containerName: AvatarStore.AVATAR_CONTAINER,
      key: avatar.value,
    });
  }

  public async put(
    avatar: Avatar,
    avatarFile: string,
    contentType: string,
  ): Promise<void> {
    if (!AvatarStore.AVATAR_MIME_TYPES.includes(contentType)) {
      throw new AvatarUnsupportedContentTypeException();
    }
    await this.objectStorage.put({
      containerName: AvatarStore.AVATAR_CONTAINER,
      file: avatarFile,
      contentType,
      key: avatar.value,
    });
  }

  public delete(avatar: Avatar): Promise<void> {
    return this.objectStorage.delete({
      containerName: AvatarStore.AVATAR_CONTAINER,
      key: avatar.value,
    });
  }
}
