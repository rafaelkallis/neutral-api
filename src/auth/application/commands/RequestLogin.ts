import { Command } from 'shared/command/Command';
import {
  AbstractCommandHandler,
  CommandHandler,
} from 'shared/command/CommandHandler';
import { Email } from 'user/domain/value-objects/Email';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Config } from 'shared/config/application/Config';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { LoginRequestedEvent } from '../events/LoginRequestedEvent';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

/**
 * Passwordless login
 *
 * An email with a magic link is sent to the given email address
 */
export class RequestLoginCommand extends Command<void> {
  public readonly email: string;

  public constructor(email: string) {
    super();
    this.email = email;
  }
}

@CommandHandler(RequestLoginCommand)
export class RequestLoginCommandHandler extends AbstractCommandHandler<
  void,
  RequestLoginCommand
> {
  private readonly userRepository: UserRepository;
  private readonly tokenManager: TokenManager;
  private readonly config: Config;
  private readonly domainEventBroker: DomainEventBroker;

  public constructor(
    userRepository: UserRepository,
    tokenManager: TokenManager,
    config: Config,
    domainEventBroker: DomainEventBroker,
  ) {
    super();
    this.userRepository = userRepository;
    this.tokenManager = tokenManager;
    this.config = config;
    this.domainEventBroker = domainEventBroker;
  }

  public async handle(command: RequestLoginCommand): Promise<void> {
    const email = Email.from(command.email);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    const loginToken = this.tokenManager.newLoginToken(
      user.id,
      user.lastLoginAt,
    );
    const magicLoginLink = `${this.config.get(
      'FRONTEND_URL',
    )}/login/callback?token=${encodeURIComponent(loginToken)}`;
    await this.domainEventBroker.publish(
      new LoginRequestedEvent(user, magicLoginLink),
    );
  }
}
