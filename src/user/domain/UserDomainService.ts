import { Injectable, Inject } from '@nestjs/common';
import { TokenAlreadyUsedException } from 'common';
import { UserRepository, USER_REPOSITORY } from 'user/domain/UserRepository';
import { ConfigService, InjectConfig } from 'config';
import { TOKEN_SERVICE, TokenService } from 'token';
import { EventPublisherService, InjectEventPublisher } from 'event';
import { UserUpdatedEvent } from 'user/domain/events/UserUpdatedEvent';
import { EmailChangedEvent } from 'user/domain/events/EmailChangedEvent';
import { UserDeletedEvent } from 'user/domain/events/UserDeletedEvent';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { UserModel } from 'user/domain/UserModel';

export interface UpdateUserOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class UserDomainService {
  private readonly config: ConfigService;
  private readonly eventPublisher: EventPublisherService;
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenService;

  public constructor(
    @InjectConfig() config: ConfigService,
    @InjectEventPublisher() eventPublisher: EventPublisherService,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(TOKEN_SERVICE) tokenService: TokenService,
  ) {
    this.config = config;
    this.eventPublisher = eventPublisher;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  /**
   * Update a user
   *
   * If the email address is changed, a email change magic link is sent
   * to verify the new email address.
   */
  public async updateUser(
    user: UserModel,
    updateUserOptions: UpdateUserOptions,
  ): Promise<void> {
    const { email, ...otherChanges } = updateUserOptions;
    if (email) {
      const token = this.tokenService.newEmailChangeToken(
        user.id,
        user.email,
        email,
      );
      const emailChangeMagicLink = `${this.config.get(
        'FRONTEND_URL',
      )}/email_change/callback?token=${token}`;
      await this.eventPublisher.publish(
        new EmailChangeRequestedEvent(user, email, emailChangeMagicLink),
      );
    }
    Object.assign(user, otherChanges);
    await this.userRepository.persist(user);
    await this.eventPublisher.publish(new UserUpdatedEvent(user));
  }

  /**
   * Submit the email change token to verify a new email address
   */
  public async submitEmailChange(token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findById(payload.sub);
    if (user.email !== payload.curEmail) {
      throw new TokenAlreadyUsedException();
    }
    user.email = payload.newEmail;
    await this.userRepository.persist(user);
    await this.eventPublisher.publish(new EmailChangedEvent(user));
  }

  /**
   * Delete a user
   */
  public async deleteUser(user: UserModel): Promise<void> {
    await this.userRepository.delete(user);
    await this.eventPublisher.publish(new UserDeletedEvent(user));
  }
}
