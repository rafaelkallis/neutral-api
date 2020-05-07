import td from 'testdouble';
import {
  GetUsersQuery,
  GetUsersQueryHandler,
} from 'user/application/queries/GetUsersQuery';
import { UserRepository } from 'user/domain/UserRepository';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { UserDto } from '../dto/UserDto';
import { UserId } from 'user/domain/value-objects/UserId';
import { PrimitiveFaker } from 'test/PrimitiveFaker';

describe(GetUsersQuery.name, () => {
  let query: GetUsersQuery;
  let userRepository: UserRepository;
  let objectMapper: ObjectMapper;
  let authUser: User;
  let users: User[];
  let userDtos: UserDto[];
  let queryHandler: GetUsersQueryHandler;

  beforeEach(() => {
    userRepository = td.object();
    objectMapper = td.object();
    const modelFaker = new ModelFaker();
    authUser = modelFaker.user();
    users = td.object();
    userDtos = td.object();
    query = new GetUsersQuery(authUser);
    queryHandler = new GetUsersQueryHandler(userRepository, objectMapper);
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
