import td from 'testdouble';
import {
  GetUsersQuery,
  GetUsersQueryHandler,
} from 'user/application/queries/GetUsersQuery';
import { UserRepository } from 'user/domain/UserRepository';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { UserDto } from '../dto/UserDto';
import { UserId } from 'user/domain/value-objects/UserId';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { UnitTestScenario } from 'test/UnitTestScenario';

describe(GetUsersQuery.name, () => {
  let scenario: UnitTestScenario<GetUsersQueryHandler>;
  let query: GetUsersQuery;
  let queryHandler: GetUsersQueryHandler;
  let userRepository: UserRepository;
  let objectMapper: ObjectMapper;
  let authUser: User;
  let users: User[];
  let userDtos: UserDto[];

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(GetUsersQueryHandler)
      .addProviderMock(UserRepository)
      .addProviderMock(ObjectMapper)
      .build();
    queryHandler = scenario.subject;
    userRepository = scenario.module.get(UserRepository);
    objectMapper = scenario.module.get(ObjectMapper);
    authUser = scenario.modelFaker.user();
    users = td.object();
    userDtos = td.object();
    query = new GetUsersQuery(authUser);
    td.when(objectMapper.mapArray(users, UserDto, { authUser })).thenReturn(
      userDtos,
    );
  });

  test('should be defined', () => {
    expect(queryHandler).toBeDefined();
  });

  describe('default', () => {
    beforeEach(() => {
      td.when(userRepository.findPage()).thenResolve(users);
    });

    test('happy path', async () => {
      const actualUserDtos = await queryHandler.handle(query);
      expect(actualUserDtos).toBe(userDtos);
    });
  });

  describe('afterUserId', () => {
    let afterUserId: UserId;

    beforeEach(() => {
      afterUserId = UserId.create();
      query = new GetUsersQuery(authUser, afterUserId.value);
      td.when(userRepository.findPage(afterUserId)).thenResolve(users);
    });

    test('happy path', async () => {
      const actualUserDtos = await queryHandler.handle(query);
      expect(actualUserDtos).toBe(userDtos);
    });
  });

  describe('nameQuery', () => {
    let nameQuery: string;

    beforeEach(() => {
      const primitiveFaker = new PrimitiveFaker();
      nameQuery = primitiveFaker.word();
      query = new GetUsersQuery(authUser, undefined, nameQuery);
      td.when(userRepository.findByName(nameQuery)).thenResolve(users);
    });

    test('happy path', async () => {
      const actualUserDtos = await queryHandler.handle(query);
      expect(actualUserDtos).toBe(userDtos);
    });
  });
});
