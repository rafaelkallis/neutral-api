import { Command } from 'shared/command/Command';
import { UserDto } from 'user/application/dto/UserDto';
import { User } from 'user/domain/User';
import { AbstractCommandHandler } from 'shared/command/CommandHandler';
import { TokenManager } from 'shared/token/application/TokenManager';
import { Config } from 'shared/config/application/Config';
import { EventPublisher } from 'shared/event/publisher/EventPublisher';
import { UserRepository } from 'user/domain/UserRepository';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import {
  UserCommand,
  AbstractUserCommandHandler,
} from 'user/application/commands/UserCommand';

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
  private readonly tokenManager: TokenManager;
  private readonly config: Config;

  public constructor(
    tokenManager: TokenManager,
    config: Config,
    eventPublisher: EventPublisher,
    userRepository: UserRepository,
    objectMapper: ObjectMapper,
  ) {
    super(objectMapper, userRepository, eventPublisher);
    this.tokenManager = tokenManager;
    this.config = config;
  }

  public async handleInner(command: UpdateAuthUserCommand): Promise<User> {
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
      await this.eventPublisher.publish(
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
