import { IntegrationTestScenario } from 'test/IntegrationTestScenario';
import { Name } from 'user/domain/value-objects/Name';
import { User } from 'user/domain/User';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { Email } from 'user/domain/value-objects/Email';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { HttpStatus } from '@nestjs/common';
import { ForgottenState } from 'user/domain/value-objects/states/ForgottenState';
import { getUserStateValue } from 'user/domain/value-objects/states/UserStateValue';

describe('user (e2e)', () => {
  let scenario: IntegrationTestScenario;
  let user: User;

  beforeEach(async () => {
    scenario = await IntegrationTestScenario.create();
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
      expect(response.body).not.toContainEqual(
        expect.objectContaining({ id: user.id.value }),
      );
      for (const responseUser of response.body) {
        expect(responseUser.id > user.id.value).toBeTruthy();
      }
    });

    test('happy path, text search', async () => {
      const user1 = scenario.modelFaker.user();
      user1.updateName(Name.from('Anna', 'Smith'));
      const user2 = scenario.modelFaker.user();
      user2.updateName(Name.from('Hannah', 'Fitzgerald'));
      const user3 = scenario.modelFaker.user();
      user3.updateName(Name.from('Nanna', 'Thompson'));
      await scenario.userRepository.persist(user1, user2, user3);
      const response = await scenario.session.get('/users').query({ q: 'ann' });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      for (const queryUser of [user1, user2, user3]) {
        expect(response.body).toContainEqual({
          id: queryUser.id.value,
          email: queryUser.email.value,
          firstName: queryUser.name.first,
          lastName: queryUser.name.last,
          avatarUrl: null,
          state: getUserStateValue(queryUser.state),
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

  describe('/users/me (PATCH)', () => {
    let emailManager: EmailManager;
    let firstName: string;
    let email: string;

    beforeEach(() => {
      emailManager = scenario.module.get(EmailManager);
      firstName = scenario.primitiveFaker.word();
      email = scenario.primitiveFaker.email();
      jest.spyOn(emailManager, 'sendEmailChangeEmail');
    });

    test('happy path', async () => {
      const response = await scenario.session
        .patch('/users/me')
        .send({ firstName, email });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.firstName).toEqual(firstName);
      expect(response.body.email).not.toEqual(email);
      expect(emailManager.sendEmailChangeEmail).toHaveBeenCalled();
    });
  });

  describe('/users/me/avatar (PUT)', () => {
    test('happy path', async () => {
      const response = await scenario.session
        .put('/users/me/avatar')
        .attach('avatar', __dirname + '/avatar.jpeg');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.avatarUrl).toEqual(expect.any(String));
    });

    test('should fail if upload is not a jpeg or png', async () => {
      const response = await scenario.session
        .put('/users/me/avatar')
        .attach('avatar', __dirname + '/text.txt');
      expect(response.status).toBe(400);
    });
  });

  describe('/users/me/avatar (DELETE)', () => {
    let avatarKey: string;

    beforeEach(async () => {
      const putResult = await scenario.objectStorage.put({
        containerName: 'avatars',
        file: __dirname + '/avatar.jpeg',
        contentType: 'image/jpeg',
      });
      avatarKey = putResult.key;
      user.updateAvatar(Avatar.from(avatarKey));
      await scenario.userRepository.persist(user);
      jest.spyOn(scenario.objectStorage, 'delete');
    });

    test('happy path', async () => {
      const response = await scenario.session.delete('/users/me/avatar');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.avatarUrl).toBeNull();

      const updatedUser = await scenario.userRepository.findById(user.id);
      if (!updatedUser) {
        throw new Error();
      }
      expect(updatedUser.avatar).toBeNull();
      expect(scenario.objectStorage.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          key: avatarKey,
        }),
      );
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
      const updatedUser = await scenario.userRepository.findById(user.id);
      if (!updatedUser) {
        throw new Error();
      }
      expect(updatedUser.email.equals(Email.redacted())).toBeTruthy();
      expect(updatedUser.name.equals(Name.redacted())).toBeTruthy();
      expect(
        updatedUser.state.equals(ForgottenState.getInstance()),
      ).toBeTruthy();
    });
  });

  describe('/users/me/forget (POST)', () => {
    test('happy path', async () => {
      const response = await scenario.session.post('/users/me/forget');
      expect(response.status).toBe(200);
      const updatedUser = await scenario.userRepository.findById(user.id);
      if (!updatedUser) {
        throw new Error();
      }
      expect(updatedUser.email.equals(Email.redacted())).toBeTruthy();
      expect(updatedUser.name.equals(Name.redacted())).toBeTruthy();
      expect(
        updatedUser.state.equals(ForgottenState.getInstance()),
      ).toBeTruthy();
      const meResponse = await scenario.session.get('/users/me');
      expect(meResponse.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  // TODO "/users/:id/avatar (GET)"
});
