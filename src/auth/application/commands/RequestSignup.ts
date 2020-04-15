import { Command } from 'shared/command/Command';
import {
  AbstractCommandHandler,
  CommandHandler,
} from 'shared/command/CommandHandler';
import { Email } from 'user/domain/value-objects/Email';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Config } from 'shared/config/application/Config';
import { EmailAlreadyUsedException } from 'auth/application/exceptions/EmailAlreadyUsedException';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

/**
 * Passwordless signup
 *
 * A magic link is sent to the given email address
 */
export class RequestSignupCommand extends Command<void> {
  public readonly email: string;

  public constructor(email: string) {
    super();
    this.email = email;
  }
}

@CommandHandler(RequestSignupCommand)
export class RequestSignupCommandHandler extends AbstractCommandHandler<
  void,
  RequestSignupCommand
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

  public async handle(command: RequestSignupCommand): Promise<void> {
    const email = Email.from(command.email);
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }
    const magicSignupLink = this.createMagicSignupLink(email);
    await this.domainEventBroker.publish(
      new SignupRequestedEvent(email, magicSignupLink),
    );
  }

  private createMagicSignupLink(email: Email): string {
    const signupToken = this.tokenManager.newSignupToken(email.value);
    const uriSafeSignupToken = encodeURIComponent(signupToken);
    const frontendUrl = this.config.get('FRONTEND_URL');
    const magicSignupLink = `${frontendUrl}/signup/callback?token=${uriSafeSignupToken}`;
    return magicSignupLink;
  }
}
