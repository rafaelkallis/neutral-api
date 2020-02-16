import { Injectable, Inject } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { UserDto } from 'user/application/dto/UserDto';
import { GetUsersQueryDto } from 'user/application/dto/GetUsersQueryDto';
import { UpdateUserDto } from 'user/application/dto/UpdateUserDto';
import { UserModel } from 'user/domain/UserModel';
import { EventPublisherService, InjectEventPublisher } from 'event';
import { Id } from 'common/domain/value-objects/Id';
import { Email } from 'user/domain/value-objects/Email';
import { TokenService, TOKEN_SERVICE } from 'token';
import { ConfigService, InjectConfig } from 'config';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { Name } from 'user/domain/value-objects/Name';
import { TokenAlreadyUsedException } from 'common';

@Injectable()
export class UserApplicationService {
  private readonly userRepository: UserRepository;
  private readonly eventPublisher: EventPublisherService;
  private readonly tokenService: TokenService;
  private readonly config: ConfigService;

  public constructor(
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @InjectEventPublisher() eventPublisher: EventPublisherService,
    @Inject(TOKEN_SERVICE) tokenService: TokenService,
    @InjectConfig() config: ConfigService,
  ) {
    this.userRepository = userRepository;
    this.eventPublisher = eventPublisher;
    this.tokenService = tokenService;
    this.config = config;
  }

  /**
   * Get users
   */
  public async getUsers(
    authUser: UserModel,
    query: GetUsersQueryDto,
  ): Promise<UserDto[]> {
    let users: UserModel[] = [];
    if (query.q) {
      users = await this.userRepository.findByName(query.q);
    } else if (query.after) {
      users = await this.userRepository.findPage(Id.from(query.after));
    } else {
      users = await this.userRepository.findPage();
    }
    return users.map(user =>
      UserDto.builder()
        .user(user)
        .authUser(authUser)
        .build(),
    );
  }

  /**
   * Get the user with the given id
   */
  public async getUser(authUser: UserModel, id: string): Promise<UserDto> {
    const user = await this.userRepository.findById(Id.from(id));
    return UserDto.builder()
      .user(user)
      .authUser(authUser)
      .build();
  }

  /**
   * Get the authenticated user
   */
  public async getAuthUser(authUser: UserModel): Promise<UserDto> {
    return UserDto.builder()
      .user(authUser)
      .authUser(authUser)
      .build();
  }

  /**
   * Update the authenticated user
   *
   * If the email address is changed, a email change magic link is sent
   * to verify the new email address.
   */
  public async updateAuthUser(
    authUser: UserModel,
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
    return UserDto.builder()
      .user(authUser)
      .authUser(authUser)
      .build();
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
  public async deleteAuthUser(authUser: UserModel): Promise<void> {
    authUser.delete();
    this.eventPublisher.publish(...authUser.getDomainEvents());
    await this.userRepository.delete(authUser);
  }
}
