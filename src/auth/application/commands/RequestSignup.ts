import { Command } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { Email } from 'user/domain/value-objects/Email';
import { UserRepository } from 'user/domain/UserRepository';
import { EmailAlreadyUsedException } from 'auth/application/exceptions/EmailAlreadyUsedException';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { Type, Injectable } from '@nestjs/common';
import { MagicLinkFactory } from 'shared/magic-link/MagicLinkFactory';
import { MediatorRegistry } from 'shared/mediator/MediatorRegistry';

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

@Injectable()
export class RequestSignupCommandHandler extends CommandHandler<
  void,
  RequestSignupCommand
> {
  private readonly userRepository: UserRepository;
  private readonly domainEventBroker: DomainEventBroker;
  private readonly magicLinkFactory: MagicLinkFactory;

  public constructor(
    mediatorRegistry: MediatorRegistry,
    userRepository: UserRepository,
    domainEventBroker: DomainEventBroker,
    magicLinkFactory: MagicLinkFactory,
  ) {
    super(mediatorRegistry);
    this.userRepository = userRepository;
    this.domainEventBroker = domainEventBroker;
    this.magicLinkFactory = magicLinkFactory;
  }

  public async handle(command: RequestSignupCommand): Promise<void> {
    const email = Email.from(command.email);
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      throw new EmailAlreadyUsedException();
    }
    const magicSignupLink = this.magicLinkFactory.createSignupLink(email);
    await this.domainEventBroker.publish(
      new SignupRequestedEvent(email, magicSignupLink),
    );
  }

  public getCommandType(): Type<RequestSignupCommand> {
    return RequestSignupCommand;
  }
}
