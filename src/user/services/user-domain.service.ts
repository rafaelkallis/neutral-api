import { Injectable, Inject } from '@nestjs/common';
import { TokenAlreadyUsedException } from 'common';
import { UserEntity } from 'user/entities/user.entity';
import {
  UserRepository,
  USER_REPOSITORY,
} from 'user/repositories/user.repository';
import { Config, CONFIG } from 'config';
import { EmailSender, EMAIL_SENDER } from 'email';
import { TOKEN_SERVICE, TokenService } from 'token';
import { EventBus, EVENT_BUS, Saga } from 'event';
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
  private readonly config: Config;
  private readonly eventBus: EventBus;
  private readonly userRepository: UserRepository;
  private readonly tokenService: TokenService;
  private readonly emailSender: EmailSender;

  public constructor(
    @Inject(CONFIG) config: Config,
    @Inject(EVENT_BUS) eventBus: EventBus,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(TOKEN_SERVICE) tokenService: TokenService,
    @Inject(EMAIL_SENDER) emailSender: EmailSender,
  ) {
    this.config = config;
    this.eventBus = eventBus;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.emailSender = emailSender;
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
      await this.emailSender.sendEmailChangeEmail(email, emailChangeMagicLink);
      await this.eventBus.publish(new EmailChangeRequestedEvent(user, email));
    }
    Object.assign(user, otherChanges);
    await this.userRepository.persist(user);
    await this.eventBus.publish(new UserUpdatedEvent(user));
  }

  /**
   * Submit the email change token to verify a new email address
   */
  public async submitEmailChange(token: string): Promise<void> {
    const payload = this.tokenService.validateEmailChangeToken(token);
    const user = await this.userRepository.findOne(payload.sub);
    if (user.email !== payload.curEmail) {
      throw new TokenAlreadyUsedException();
    }
    user.email = payload.newEmail;
    await this.userRepository.persist(user);
    await this.eventBus.publish(new EmailChangedEvent(user));
  }

  /**
   * Delete a user
   */
  public async deleteUser(user: UserEntity): Promise<void> {
    await this.userRepository.delete(user);
    await this.eventBus.publish(new UserDeletedEvent(user));
  }
}
