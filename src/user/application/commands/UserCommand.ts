import { AuthenticatedCommand } from 'shared/command/Command';
import { AbstractCommandHandler } from 'shared/command/CommandHandler';
import { UserDto } from 'user/application/dto/UserDto';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { UserRepository } from 'user/domain/UserRepository';
import { EventPublisher } from 'shared/event/publisher/EventPublisher';

export abstract class UserCommand extends AuthenticatedCommand<UserDto> {}

export abstract class AbstractUserCommandHandler<
  TCommand extends UserCommand
> extends AbstractCommandHandler<UserDto, TCommand> {
  protected readonly objectMapper: ObjectMapper;
  protected readonly userRepository: UserRepository;
  protected readonly eventPublisher: EventPublisher;

  public constructor(
    objectMapper: ObjectMapper,
    userRepository: UserRepository,
    eventPublisher: EventPublisher,
  ) {
    super();
    this.objectMapper = objectMapper;
    this.userRepository = userRepository;
    this.eventPublisher = eventPublisher;
  }

  public async handle(command: TCommand): Promise<UserDto> {
    const user = await this.getUser(command);
    await this.handleInner(user, command);
    await this.userRepository.persist(user);
    await this.eventPublisher.publish(...user.getDomainEvents());
    return this.objectMapper.map(user, UserDto, { authUser: command.authUser });
  }

  protected abstract getUser(command: TCommand): Promise<User>;

  protected abstract handleInner(user: User, command: TCommand): Promise<void>;
}
