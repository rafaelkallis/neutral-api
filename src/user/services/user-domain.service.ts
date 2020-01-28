import { Injectable, Inject } from '@nestjs/common';
import { TokenAlreadyUsedException } from 'common';
import { UserEntity } from 'user/entities/user.entity';
import {
  UserRepository,
  USER_REPOSITORY,
} from 'user/repositories/user.repository';
import { ConfigService, InjectConfig } from 'config';
import { TOKEN_SERVICE, TokenService } from 'token';
import { EventPublisherService, InjectEventPublisher } from 'event';
import { UserUpdatedEvent } from 'user/events/user-updated.event';
import { EmailChangedEvent } from 'user/events/email-changed.event';
import { UserDeletedEvent } from 'user/events/user-deleted.event';
import { EmailChangeRequestedEvent } from 'user/events/email-change-requested.event';

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
    user: UserEntity,
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
  public async deleteUser(user: UserEntity): Promise<void> {
    await this.userRepository.delete(user);
    await this.eventPublisher.publish(new UserDeletedEvent(user));
  }
}
