import td from 'testdouble';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { UserDto } from 'user/application/dto/UserDto';
import {
  GetAuthUserQuery,
  GetAuthUserQueryHandler,
} from 'user/application/queries/GetAuthUserQuery';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { MediatorRegistry } from 'shared/mediator/MediatorRegistry';

describe(GetAuthUserQuery.name, () => {
  let scenario: UnitTestScenario<GetAuthUserQueryHandler>;
  let getAuthUserQueryHandler: GetAuthUserQueryHandler;
  let getAuthUserQuery: GetAuthUserQuery;
  let authUser: User;
  let userDto: UserDto;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(GetAuthUserQueryHandler)
      .addProviderMock(MediatorRegistry)
      .addProviderMock(ObjectMapper)
      .build();
    getAuthUserQueryHandler = scenario.subject;
    const objectMapper = scenario.module.get(ObjectMapper);
    authUser = td.object();
    userDto = td.object();
    getAuthUserQuery = new GetAuthUserQuery(authUser);
    td.when(objectMapper.map(authUser, UserDto, { authUser })).thenReturn(
      userDto,
    );
  });

  test('should be defined', () => {
    expect(getAuthUserQueryHandler).toBeDefined();
  });

  test('happy path', async () => {
    const actualUserDto = await getAuthUserQueryHandler.handle(
      getAuthUserQuery,
    );
    expect(actualUserDto).toBe(userDto);
  });
});
