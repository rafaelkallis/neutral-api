import td from 'testdouble';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { UserDto } from 'user/application/dto/UserDto';
import {
  GetAuthUserQuery,
  GetAuthUserQueryHandler,
} from 'user/application/queries/GetAuthUserQuery';

describe(GetAuthUserQuery.name, () => {
  let query: GetAuthUserQuery;
  let objectMapper: ObjectMapper;
  let authUser: User;
  let userDto: UserDto;
  let queryHandler: GetAuthUserQueryHandler;

  beforeEach(() => {
    objectMapper = td.object();
    authUser = td.object();
    userDto = td.object();
    query = new GetAuthUserQuery(authUser);
    queryHandler = new GetAuthUserQueryHandler(objectMapper);
    td.when(objectMapper.map(authUser, UserDto, { authUser })).thenResolve(
      userDto,
    );
  });

  test('should be defined', () => {
    expect(queryHandler).toBeDefined();
  });

  test('happy path', async () => {
    const actualUserDto = await queryHandler.handle(query);
    expect(actualUserDto).toBe(userDto);
  });
});
