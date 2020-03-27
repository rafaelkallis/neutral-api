import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UserRepository,
  InjectUserRepository,
} from 'user/domain/UserRepository';
import { UserDto } from 'user/application/dto/UserDto';
import { GetUsersQueryDto } from 'user/application/dto/GetUsersQueryDto';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { User } from 'user/domain/User';
import { Id } from 'shared/domain/value-objects/Id';
import { Email } from 'user/domain/value-objects/Email';
import { TokenManager } from 'shared/token/application/TokenManager';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { Name } from 'user/domain/value-objects/Name';
import { Config } from 'shared/config/application/Config';
import { TokenAlreadyUsedException } from 'shared/exceptions/token-already-used.exception';
import {
  EventPublisher,
  InjectEventPublisher,
} from 'shared/event/publisher/EventPublisher';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { AvatarUnsupportedContentTypeException } from 'user/application/exceptions/AvatarUnsupportedContentTypeException';
import { UserModelMap } from 'user/application/UserDtoMapperService';

@Injectable()
export class UserApplicationService {
  private readonly userRepository: UserRepository;
  private readonly userDtoMapper: UserModelMap;
  private readonly eventPublisher: EventPublisher;
  private readonly tokenService: TokenManager;
  private readonly config: Config;
  private readonly objectStorage: ObjectStorage;

  public constructor(
    @InjectUserRepository() userRepository: UserRepository,
    userDtoMapper: UserModelMap,
    @InjectEventPublisher() eventPublisher: EventPublisher,
    tokenManager: TokenManager,
    config: Config,
    objectStorage: ObjectStorage,
  ) {
    this.userRepository = userRepository;
    this.userDtoMapper = userDtoMapper;
    this.eventPublisher = eventPublisher;
    this.tokenService = tokenManager;
    this.config = config;
    this.objectStorage = objectStorage;
  }

  /**
   * Get users
   */
  public async getUsers(
    authUser: User,
    query: GetUsersQueryDto,
  ): Promise<UserDto[]> {
    let users: User[] = [];
    if (query.q) {
      users = await this.userRepository.findByName(query.q);
    } else if (query.after) {
      users = await this.userRepository.findPage(Id.from(query.after));
    } else {
      users = await this.userRepository.findPage();
    }
    return users.map((user) => this.userDtoMapper.toDto(user, { authUser }));
  }

  /**
   * Get the user with the given id
   */
  public async getUser(authUser: User, id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(Id.from(id));
    return this.userDtoMapper.toDto(user, { authUser });
  }

  /**
   * Get the authenticated user
   */
  public async getAuthUser(authUser: User): Promise<UserDto> {
    return this.userDtoMapper.toDto(authUser, { authUser });
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
      await this.eventPublisher.publish(
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
      await this.eventPublisher.publish(...authUser.getDomainEvents());
      await this.userRepository.persist(authUser);
    }
    return this.userDtoMapper.toDto(authUser, { authUser });
  }

  public async getUserAvatar(
    _authUser: User,
    rawUserId: string,
  ): Promise<{ file: string; contentType: string }> {
    const userId = Id.from(rawUserId);
    const user = await this.userRepository.findById(userId);
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
    if (!['image/jpeg', 'image/png'].includes(contentType)) {
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
    await this.eventPublisher.publish(...authUser.getDomainEvents());
    await this.userRepository.persist(authUser);
    return this.userDtoMapper.toDto(authUser, { authUser });
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
    await this.eventPublisher.publish(...authUser.getDomainEvents());
    await this.userRepository.persist(authUser);
    return this.userDtoMapper.toDto(authUser, { authUser });
  }

  /**
   * Submit the email change token to verify a new email address
   */
  public async submitEmailChange(token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findById(Id.from(payload.sub));
    if (!user.email.equals(Email.from(payload.curEmail))) {
      throw new TokenAlreadyUsedException();
    }
    const newEmail = Email.from(payload.newEmail);
    user.changeEmail(newEmail);
    await this.userRepository.persist(user);
    await this.eventPublisher.publish(...user.getDomainEvents());
  }

  /**
   * Delete the authenticated user
   */
  public async deleteAuthUser(authUser: User): Promise<void> {
    authUser.delete();
    await this.eventPublisher.publish(...authUser.getDomainEvents());
    await this.userRepository.delete(authUser);
  }
}
