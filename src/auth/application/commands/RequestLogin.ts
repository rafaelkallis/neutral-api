import { Command } from 'shared/command/Command';
import {
  AbstractCommandHandler,
  CommandHandler,
} from 'shared/command/CommandHandler';
import { Email } from 'user/domain/value-objects/Email';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Config } from 'shared/config/application/Config';
import {
  EventPublisher,
  InjectEventPublisher,
} from 'shared/event/publisher/EventPublisher';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { LoginRequestedEvent } from '../events/LoginRequestedEvent';

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
  private readonly eventPublisher: EventPublisher;

  public constructor(
    userRepository: UserRepository,
    tokenManager: TokenManager,
    config: Config,
    @InjectEventPublisher() eventPublisher: EventPublisher,
  ) {
    super();
    this.userRepository = userRepository;
    this.tokenManager = tokenManager;
    this.config = config;
    this.eventPublisher = eventPublisher;
  }

  public async handle(command: RequestLoginCommand): Promise<void> {
    const email = Email.from(command.email);
    const optionalUser = await this.userRepository.findByEmail(email);
    const user = optionalUser.orElseThrow(UserNotFoundException);
    const loginToken = this.tokenManager.newLoginToken(
      user.id,
      user.lastLoginAt,
    );
    const magicLoginLink = `${this.config.get(
      'FRONTEND_URL',
    )}/login/callback?token=${encodeURIComponent(loginToken)}`;
    await this.eventPublisher.publish(
      new LoginRequestedEvent(user, magicLoginLink),
    );
  }
}
