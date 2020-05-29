import { Command } from 'shared/command/Command';
import {
  AbstractCommandHandler,
  CommandHandler,
} from 'shared/command/CommandHandler';
import { Email } from 'user/domain/value-objects/Email';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { LoginRequestedEvent } from '../events/LoginRequestedEvent';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { SignupRequestedEvent } from '../events/SignupRequestedEvent';
import { MagicLinkFactory } from 'shared/magic-link/MagicLinkFactory';

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
  private readonly magicLinkFactory: MagicLinkFactory;
  private readonly domainEventBroker: DomainEventBroker;

  public constructor(
    userRepository: UserRepository,
    tokenManager: TokenManager,
    magicLinkFactory: MagicLinkFactory,
    domainEventBroker: DomainEventBroker,
  ) {
    super();
    this.userRepository = userRepository;
    this.tokenManager = tokenManager;
    this.magicLinkFactory = magicLinkFactory;
    this.domainEventBroker = domainEventBroker;
  }

  public async handle(command: RequestLoginCommand): Promise<void> {
    const email = Email.from(command.email);
    const user = await this.userRepository.findByEmail(email);
    const loginToken = this.tokenManager.newLoginToken(
      email,
      user ? user.lastLoginAt : LastLoginAt.never(),
    );
    const loginLink = this.magicLinkFactory.createLoginLink({
      loginToken,
      email,
      isNew: !user,
    });
    await this.domainEventBroker.publish(
      user
        ? new LoginRequestedEvent(email, loginLink)
        : new SignupRequestedEvent(email, loginLink),
    );
  }
}
