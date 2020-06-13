import { Query } from 'shared/query/Query';
import { UserDto } from 'user/application/dto/UserDto';
import { QueryHandler } from 'shared/query/QueryHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserRepository } from 'user/domain/UserRepository';
import { User } from 'user/domain/User';
import { UserId } from 'user/domain/value-objects/UserId';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { Injectable } from '@nestjs/common';

export class GetUserQuery extends Query<UserDto> {
  public readonly authUser: User;
  public readonly userId: string;

  public constructor(authUser: User, userId: string) {
    super();
    this.authUser = authUser;
    this.userId = userId;
  }
}

@Injectable()
@QueryHandler.ofQuery(GetUserQuery)
export class GetUserQueryHandler extends QueryHandler<UserDto, GetUserQuery> {
  private readonly userRepository: UserRepository;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    userRepository: UserRepository,
    objectMapper: ObjectMapper,
  ) {
    super();
    this.userRepository = userRepository;
    this.objectMapper = objectMapper;
  }

  public async handle(query: GetUserQuery): Promise<UserDto> {
    const id = UserId.from(query.userId);
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return this.objectMapper.map(user, UserDto, { authUser: query.authUser });
  }
}
