import { Command } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { Email } from 'user/domain/value-objects/Email';
import { UserRepository } from 'user/domain/UserRepository';
import { LoginRequestedEvent } from '../events/LoginRequestedEvent';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { SignupRequestedEvent } from '../events/SignupRequestedEvent';
import { Injectable } from '@nestjs/common';
import { CtaUrlFactory } from 'shared/urls/CtaUrlFactory';
import { User } from 'user/domain/User';

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

@Injectable()
@CommandHandler.register(RequestLoginCommand)
export class RequestLoginCommandHandler extends CommandHandler<
  void,
  RequestLoginCommand
> {
  private readonly userRepository: UserRepository;
  private readonly domainEventBroker: DomainEventBroker;
  private readonly ctaUrlFactory: CtaUrlFactory;

  public constructor(
    userRepository: UserRepository,
    domainEventBroker: DomainEventBroker,
    ctaUrlFactory: CtaUrlFactory,
  ) {
    super();
    this.userRepository = userRepository;
    this.domainEventBroker = domainEventBroker;
    this.ctaUrlFactory = ctaUrlFactory;
  }

  public async handle(command: RequestLoginCommand): Promise<void> {
    const email = Email.of(command.email);
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = User.ofPending(email);
    }
    const ctaUrl = this.ctaUrlFactory.createProjectsCtaUrl({ user });
    await this.domainEventBroker.publish(
      user
        ? new LoginRequestedEvent(user, ctaUrl)
        : new SignupRequestedEvent(email, ctaUrl),
    );
  }
}
