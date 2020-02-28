import { TestScenario } from 'test/TestScenario';
import { Name } from 'user/domain/value-objects/Name';
import { UserDto } from 'user/application/dto/UserDto';
import { User } from 'user/domain/User';

describe('user (e2e)', () => {
  let scenario: TestScenario;
  let user: User;

  beforeEach(async () => {
    scenario = await TestScenario.create();
    user = await scenario.createUser();
    await scenario.authenticateUser(user);
  });

  afterEach(async () => {
    await scenario.teardown();
  });

  describe('/users (GET)', () => {
    test('happy path', async () => {
      const response = await scenario.session
        .get('/users')
        .query({ after: user.id.value });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      const userDto = UserDto.builder()
        .user(user)
        .authUser(user)
        .build();
      expect(response.body).not.toContainEqual(userDto);
      for (const responseUser of response.body) {
        expect(responseUser.id > user.id).toBeTruthy();
      }
    });

    test('happy path, text search', async () => {
      const user1 = scenario.modelFaker.user();
      user1.name = Name.from('Anna', 'Smith');
      const user2 = scenario.modelFaker.user();
      user2.name = Name.from('Hannah', 'Fitzgerald');
      const user3 = scenario.modelFaker.user();
      user3.name = Name.from('Nanna', 'Thompson');
      await scenario.userRepository.persist(user1, user2, user3);
      const response = await scenario.session.get('/users').query({ q: 'ann' });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      for (const queryUser of [user1, user2, user3]) {
        expect(response.body).toContainEqual({
          id: queryUser.id.value,
          email: null,
          firstName: queryUser.name.first,
          lastName: queryUser.name.last,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        });
      }
    });
  });

  describe('/users/me (GET)', () => {
    test('happy path', async () => {
      const response = await scenario.session.get('/users/me');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.lastLoginAt).toBeFalsy();
    });
  });

  describe('/users/:id (GET)', () => {
    test('happy path', async () => {
      const response = await scenario.session.get(`/users/${user.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('/users/me (DELETE)', () => {
    test('happy path', async () => {
      const response = await scenario.session.delete('/users/me');
      expect(response.status).toBe(204);
      expect(response.body).toBeDefined();
      await expect(
        scenario.userRepository.exists(user.id),
      ).resolves.toBeFalsy();
    });
  });
});
