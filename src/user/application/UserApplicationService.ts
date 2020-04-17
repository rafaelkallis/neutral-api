import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';

@Injectable()
export class UserApplicationService {
  private readonly userRepository: UserRepository;
  private readonly objectStorage: ObjectStorage;

  public static AVATAR_MIME_TYPES = ['image/png', 'image/jpeg'];

  public constructor(
    userRepository: UserRepository,
    objectStorage: ObjectStorage,
  ) {
    this.userRepository = userRepository;
    this.objectStorage = objectStorage;
  }

  public async getUserAvatar(
    _authUser: User,
    rawUserId: string,
  ): Promise<{ file: string; contentType: string }> {
    const userId = UserId.from(rawUserId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!user.avatar) {
      throw new NotFoundException();
    }
    const userAvatar = await this.objectStorage.get({
      containerName: 'avatars',
      key: user.avatar.value,
    });
    return userAvatar;
  }
}
