import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { UserDto } from 'user/application/dto/UserDto';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { TokenManager } from 'shared/token/application/TokenManager';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { Name } from 'user/domain/value-objects/Name';
import { Config } from 'shared/config/application/Config';
import { TokenAlreadyUsedException } from 'shared/exceptions/token-already-used.exception';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { AvatarUnsupportedContentTypeException } from 'user/application/exceptions/AvatarUnsupportedContentTypeException';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

@Injectable()
export class UserApplicationService {
  private readonly userRepository: UserRepository;
  private readonly modelMapper: ObjectMapper;
  private readonly domainEventBroker: DomainEventBroker;
  private readonly tokenService: TokenManager;
  private readonly config: Config;
  private readonly objectStorage: ObjectStorage;

  public static AVATAR_MIME_TYPES = ['image/png', 'image/jpeg'];

  public constructor(
    userRepository: UserRepository,
    modelMapper: ObjectMapper,
    domainEventBroker: DomainEventBroker,
    tokenManager: TokenManager,
    config: Config,
    objectStorage: ObjectStorage,
  ) {
    this.userRepository = userRepository;
    this.modelMapper = modelMapper;
    this.domainEventBroker = domainEventBroker;
    this.tokenService = tokenManager;
    this.config = config;
    this.objectStorage = objectStorage;
  }

  /**
   * Update the authenticated user
   *
   * If the email address is changed, a email change magic link is sent
   * to verify the new email address.
   */
  public async updateAuthUser(
    authUser: User,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const { email: newEmail } = updateUserDto;
    if (newEmail) {
      const token = this.tokenService.newEmailChangeToken(
        authUser.id.value,
        authUser.email.value,
        newEmail,
      );
      const emailChangeMagicLink = `${this.config.get(
        'FRONTEND_URL',
      )}/email_change/callback?token=${token}`;
      await this.domainEventBroker.publish(
        new EmailChangeRequestedEvent(
          authUser,
          Email.from(newEmail),
          emailChangeMagicLink,
        ),
      );
    }
    const { firstName: newFirstName, lastName: newLastName } = updateUserDto;
    if (newFirstName || newLastName) {
      const newName = Name.from(
        newFirstName || authUser.name.first,
        newLastName || authUser.name.last,
      );
      authUser.updateName(newName);
      await this.userRepository.persist(authUser);
    }
    return this.modelMapper.map(authUser, UserDto, { authUser });
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
    return this.modelMapper.map(authUser, UserDto, { authUser });
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
    return this.modelMapper.map(authUser, UserDto, { authUser });
  }

  /**
   * Submit the email change token to verify a new email address
   */
  public async submitEmailChange(token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const emailFromPayload = Email.from(payload.curEmail);
    const userIdFromPayload = UserId.from(payload.sub);
    const user = await this.userRepository.findById(userIdFromPayload);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!user.email.equals(emailFromPayload)) {
      throw new TokenAlreadyUsedException();
    }
    const newEmail = Email.from(payload.newEmail);
    user.changeEmail(newEmail);
    await this.userRepository.persist(user);
  }

  /**
   * Delete the authenticated user
   */
  public async deleteAuthUser(authUser: User): Promise<void> {
    authUser.delete();
    await this.userRepository.delete(authUser);
  }
}
