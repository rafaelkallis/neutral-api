import td from 'testdouble';
import { GetUsersQuery } from 'user/application/queries/GetUsersQuery';
import { UserRepository } from 'user/domain/UserRepository';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { UserDto } from '../dto/UserDto';
import { UserId } from 'user/domain/value-objects/UserId';
import { GetUserQueryHandler, GetUserQuery } from './GetUserQuery';

describe(GetUsersQuery.name, () => {
  let query: GetUserQuery;
  let userRepository: UserRepository;
  let objectMapper: ObjectMapper;
  let authUser: User;
  let userId: UserId;
  let user: User;
  let userDto: UserDto;
  let queryHandler: GetUserQueryHandler;

  beforeEach(async () => {
    userRepository = td.object();
    objectMapper = td.object();
    authUser = td.object();
    userId = UserId.create();
    user = td.object();
    userDto = td.object();
    query = new GetUserQuery(authUser, userId.value);
    queryHandler = new GetUserQueryHandler(userRepository, objectMapper);
    td.when(userRepository.findById(userId)).thenResolve(user);
    td.when(objectMapper.map(user, UserDto, { authUser })).thenReturn(userDto);
  });

  test('should be defined', () => {
    expect(queryHandler).toBeDefined();
  });

  test('happy path', async () => {
    const actualUserDto = await queryHandler.handle(query);
    expect(actualUserDto).toBe(userDto);
  });
});
