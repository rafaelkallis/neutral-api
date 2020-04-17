import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { UserDto } from 'user/application/dto/UserDto';
import { User } from 'user/domain/User';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { AvatarUnsupportedContentTypeException } from 'user/application/exceptions/AvatarUnsupportedContentTypeException';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';

@Injectable()
export class UserApplicationService {
  private readonly userRepository: UserRepository;
  private readonly objectMapper: ObjectMapper;
  private readonly objectStorage: ObjectStorage;

  public static AVATAR_MIME_TYPES = ['image/png', 'image/jpeg'];

  public constructor(
    userRepository: UserRepository,
    modelMapper: ObjectMapper,
    objectStorage: ObjectStorage,
  ) {
    this.userRepository = userRepository;
    this.objectMapper = modelMapper;
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

  public async updateAuthUserAvatar(
    authUser: User,
    avatarFile: string,
    contentType: string,
  ): Promise<UserDto> {
    if (!UserApplicationService.AVATAR_MIME_TYPES.includes(contentType)) {
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
    await this.userRepository.persist(authUser);
    return this.objectMapper.map(authUser, UserDto, { authUser });
  }

  public async removeAuthUserAvatar(authUser: User): Promise<UserDto> {
    if (!authUser.avatar) {
      throw new NotFoundException();
    }
    await this.objectStorage.delete({
      containerName: 'avatars',
      key: authUser.avatar.value,
    });
    authUser.removeAvatar();
    await this.userRepository.persist(authUser);
    return this.objectMapper.map(authUser, UserDto, { authUser });
  }
}
