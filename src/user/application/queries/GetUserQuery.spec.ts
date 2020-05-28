import td from 'testdouble';
import { GetUsersQuery } from 'user/application/queries/GetUsersQuery';
import { UserRepository } from 'user/domain/UserRepository';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { UserDto } from '../dto/UserDto';
import { UserId } from 'user/domain/value-objects/UserId';
import { GetUserQueryHandler, GetUserQuery } from './GetUserQuery';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { MediatorRegistry } from 'shared/mediator/MediatorRegistry';

describe(GetUsersQuery.name, () => {
  let scenario: UnitTestScenario<GetUserQueryHandler>;
  let getUserQueryHandler: GetUserQueryHandler;
  let getUserQuery: GetUserQuery;
  let authUser: User;
  let userId: UserId;
  let user: User;
  let userDto: UserDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(GetUserQueryHandler)
      .addProviderMock(MediatorRegistry)
      .addProviderMock(UserRepository)
      .addProviderMock(ObjectMapper)
      .build();
    getUserQueryHandler = scenario.subject;
    authUser = td.object();
    userId = UserId.create();
    user = td.object();
    userDto = td.object();
    getUserQuery = new GetUserQuery(authUser, userId.value);
    const userRepository = scenario.module.get(UserRepository);
    const objectMapper = scenario.module.get(ObjectMapper);
    td.when(userRepository.findById(userId)).thenResolve(user);
    td.when(objectMapper.map(user, UserDto, { authUser })).thenReturn(userDto);
  });

  test('should be defined', () => {
    expect(getUserQueryHandler).toBeDefined();
  });

  test('happy path', async () => {
    const actualUserDto = await getUserQueryHandler.handle(getUserQuery);
    expect(actualUserDto).toBe(userDto);
  });
});
