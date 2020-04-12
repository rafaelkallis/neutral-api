import { Query } from 'shared/query/Query';
import { UserDto } from 'user/application/dto/UserDto';
import { AbstractQueryHandler, QueryHandler } from 'shared/query/QueryHandler';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';

export class GetAuthUserQuery extends Query<UserDto> {
  public readonly authUser: User;

  public constructor(authUser: User) {
    super();
    this.authUser = authUser;
  }
}

@QueryHandler(GetAuthUserQuery)
export class GetAuthUserQueryHandler extends AbstractQueryHandler<
  UserDto,
  GetAuthUserQuery
> {
  private readonly objectMapper: ObjectMapper;

  public constructor(objectMapper: ObjectMapper) {
    super();
    this.objectMapper = objectMapper;
  }

  public async handle(query: GetAuthUserQuery): Promise<UserDto> {
    return this.objectMapper.map(query.authUser, UserDto, {
      authUser: query.authUser,
    });
  }
}
