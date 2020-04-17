import { User } from 'user/domain/User';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Config } from 'shared/config/application/Config';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';
import { Inject } from '@nestjs/common';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

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

export class UpdateAuthUserCommandHandler extends AbstractUserCommandHandler<
  UpdateAuthUserCommand
> {
  @Inject()
  private readonly tokenManager!: TokenManager;
  @Inject()
  private readonly config!: Config;
  @Inject()
  private readonly domainEventBroker!: DomainEventBroker;

  protected async doHandle(command: UpdateAuthUserCommand): Promise<User> {
    const { authUser, email: newEmail } = command;
    if (newEmail) {
      const token = this.tokenManager.newEmailChangeToken(
        authUser.id.value,
        authUser.email.value,
        newEmail,
      );
      const emailChangeMagicLink = `${this.config.get(
        'FRONTEND_URL',
      )}/email_change/callback?token=${token}`;
      await this.domainEventBroker.publish(
        new EmailChangeRequestedEvent(
          authUser,
          Email.from(newEmail),
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
