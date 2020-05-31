import { AuthenticatedCommand } from 'shared/command/Command';
import { CommandHandler } from 'shared/command/CommandHandler';
import { UserDto } from 'user/application/dto/UserDto';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { UserRepository } from 'user/domain/UserRepository';
import { Injectable } from '@nestjs/common';

export abstract class UserCommand extends AuthenticatedCommand<UserDto> {}

@Injectable()
export abstract class UserCommandHandler<
  TCommand extends UserCommand
> extends CommandHandler<UserDto, TCommand> {
  protected readonly objectMapper: ObjectMapper;
  protected readonly userRepository: UserRepository;

  public constructor(
    objectMapper: ObjectMapper,
    userRepository: UserRepository,
  ) {
    super();
    this.objectMapper = objectMapper;
    this.userRepository = userRepository;
  }

  public async handle(command: TCommand): Promise<UserDto> {
    const user = await this.doHandle(command);
    await this.userRepository.persist(user);
    return this.objectMapper.map(user, UserDto, { authUser: command.authUser });
  }

  protected abstract doHandle(command: TCommand): User | Promise<User>;
}
