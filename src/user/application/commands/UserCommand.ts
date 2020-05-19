import { AuthenticatedCommand } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { UserDto } from 'user/application/dto/UserDto';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { UserRepository } from 'user/domain/UserRepository';
import { Inject } from '@nestjs/common';

export abstract class UserCommand extends AuthenticatedCommand<UserDto> {}

export abstract class AbstractUserCommandHandler<
  TCommand extends UserCommand
> extends CommandHandler<UserDto, TCommand> {
  @Inject()
  protected readonly objectMapper!: ObjectMapper;
  @Inject()
  protected readonly userRepository!: UserRepository;

  public async handle(command: TCommand): Promise<UserDto> {
    const user = await this.doHandle(command);
    await this.userRepository.persist(user);
    return this.objectMapper.map(user, UserDto, { authUser: command.authUser });
  }

  protected abstract doHandle(command: TCommand): User | Promise<User>;
}
