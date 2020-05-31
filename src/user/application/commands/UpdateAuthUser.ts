import { User } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Config } from 'shared/config/application/Config';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import {
  UserCommand,
  UserCommandHandler,
} from 'user/application/commands/UserCommand';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { EmailAlreadyUsedException } from 'auth/application/exceptions/EmailAlreadyUsedException';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserRepository } from 'user/domain/UserRepository';
import { Injectable } from '@nestjs/common';
import { AssociatedRequest } from 'shared/mediator/RequestHandler';

/**
 * Update the authenticated user
 *
 * If the email address is changed, a email change magic link is sent
 * to verify the new email address.
 */
export class UpdateAuthUserCommand extends UserCommand {
  public readonly email?: string;
  public readonly firstName?: string;
  public readonly lastName?: string;

  public constructor(
    authUser: User,
    email?: string,
    firstName?: string,
    lastName?: string,
  ) {
    super(authUser);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

@Injectable()
@AssociatedRequest.d(UpdateAuthUserCommand)
export class UpdateAuthUserCommandHandler extends UserCommandHandler<
  UpdateAuthUserCommand
> {
  private readonly tokenManager: TokenManager;
  private readonly config: Config;
  private readonly domainEventBroker: DomainEventBroker;

  public constructor(
    objectMapper: ObjectMapper,
    userRepository: UserRepository,
    tokenManager: TokenManager,
    config: Config,
    domainEventBroker: DomainEventBroker,
  ) {
    super(objectMapper, userRepository);
    this.tokenManager = tokenManager;
    this.config = config;
    this.domainEventBroker = domainEventBroker;
  }

  protected async doHandle(command: UpdateAuthUserCommand): Promise<User> {
    const { authUser, email: rawNewEmail } = command;
    if (rawNewEmail) {
      const newEmail = Email.from(rawNewEmail);
      const emailAlreadyUsed = await this.userRepository.existsByEmail(
        newEmail,
      );
      if (emailAlreadyUsed) {
        throw new EmailAlreadyUsedException();
      }
      const token = this.tokenManager.newEmailChangeToken(
        authUser.id.value,
        authUser.email.value,
        rawNewEmail,
      );
      const emailChangeMagicLink = `${this.config.get(
        'FRONTEND_URL',
      )}/email_change/callback?token=${token}`;
      await this.domainEventBroker.publish(
        new EmailChangeRequestedEvent(
          authUser,
          Email.from(rawNewEmail),
          emailChangeMagicLink,
        ),
      );
    }
    const { firstName: newFirstName, lastName: newLastName } = command;
    if (newFirstName || newLastName) {
      const newName = Name.from(
        newFirstName || authUser.name.first,
        newLastName || authUser.name.last,
      );
      authUser.updateName(newName);
    }
    return authUser;
  }
}
