import { Query } from 'shared/query/Query';
import { UserDto } from 'user/application/dto/UserDto';
import { QueryHandler } from 'shared/query/QueryHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserRepository } from 'user/domain/UserRepository';
import { User, ReadonlyUser } from 'user/domain/User';
import { UserId } from 'user/domain/value-objects/UserId';
import { Type, Injectable } from '@nestjs/common';

export class GetUsersQuery extends Query<UserDto[]> {
  public readonly authUser: User;
  public readonly afterUserId?: string;
  public readonly nameQuery?: string;

  public constructor(authUser: User, afterUserId?: string, nameQuery?: string) {
    super();
    this.authUser = authUser;
    this.afterUserId = afterUserId;
    this.nameQuery = nameQuery;
  }
}

@Injectable()
export class GetUsersQueryHandler extends QueryHandler<
  UserDto[],
  GetUsersQuery
> {
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

  public async handle(query: GetUsersQuery): Promise<UserDto[]> {
    let users: ReadonlyUser[] = [];
    if (query.nameQuery) {
      users = await this.userRepository.findByName(query.nameQuery);
    } else if (query.afterUserId) {
      const afterUserId = UserId.from(query.afterUserId);
      users = await this.userRepository.findPage(afterUserId);
    } else {
      users = await this.userRepository.findPage();
    }
    return this.objectMapper.mapArray(users, UserDto, {
      authUser: query.authUser,
    });
  }

  public getQueryType(): Type<GetUsersQuery> {
    return GetUsersQuery;
  }
}
