import { Command } from 'shared/command/Command';
import {
  AbstractCommandHandler,
  CommandHandler,
} from 'shared/command/CommandHandler';
import { UserRepository } from 'user/domain/UserRepository';
import { TokenManager } from 'shared/token/application/TokenManager';
import { UserDto } from 'user/application/dto/UserDto';
import { SessionState } from 'shared/session';
import { AuthenticationResponseDto } from '../dto/AuthenticationResponseDto';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { SignupEvent } from '../events/SignupEvent';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';
import { UserFactory } from 'user/application/UserFactory';

/**
 * Passwordless signup token submit
 *
 * The signup token sent to the email address earlier is submitted here
 * along with other information about the user
 */
export class SubmitSignupCommand extends Command<AuthenticationResponseDto> {
  public readonly signupToken: string;
  public readonly session: SessionState;
  public readonly firstName: string;
  public readonly lastName: string;

  public constructor(
    signupToken: string,
    session: SessionState,
    firstName: string,
    lastName: string,
  ) {
    super();
    this.signupToken = signupToken;
    this.session = session;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

@CommandHandler(SubmitSignupCommand)
export class SubmitSignupCommandHandler extends AbstractCommandHandler<
  AuthenticationResponseDto,
  SubmitSignupCommand
> {
  private readonly userRepository: UserRepository;
  private readonly userFactory: UserFactory;
  private readonly tokenManager: TokenManager;
  private readonly objectMapper: ObjectMapper;
  private readonly domainEventBroker: DomainEventBroker;

  public constructor(
    userRepository: UserRepository,
    userFactory: UserFactory,
    tokenManager: TokenManager,
    objectMapper: ObjectMapper,
    domainEventBroker: DomainEventBroker,
  ) {
    super();
    this.userRepository = userRepository;
    this.userFactory = userFactory;
    this.tokenManager = tokenManager;
    this.objectMapper = objectMapper;
    this.domainEventBroker = domainEventBroker;
  }

  public async handle(
    command: SubmitSignupCommand,
  ): Promise<AuthenticationResponseDto> {
    const payload = this.tokenManager.validateSignupToken(command.signupToken);
    const email = Email.from(payload.sub);
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = this.userFactory.create({ email });
    }
    const name = Name.from(command.firstName, command.lastName);
    user.activate(name);
    await this.userRepository.persist(user);
    await this.domainEventBroker.publish(new SignupEvent(user));

    const sessionToken = this.tokenManager.newSessionToken(user.id.value);
    command.session.set(sessionToken);
    const accessToken = this.tokenManager.newAccessToken(user.id.value);
    const refreshToken = this.tokenManager.newRefreshToken(user.id.value);
    const userDto: UserDto = this.objectMapper.map(user, UserDto, {
      authUser: user,
    });
    return new AuthenticationResponseDto(accessToken, refreshToken, userDto);
  }
}
