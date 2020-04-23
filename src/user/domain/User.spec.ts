import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { UserCreatedEvent } from 'user/domain/events/UserCreatedEvent';
import { EmailChangedEvent } from 'user/domain/events/EmailChangedEvent';
import { UserNameUpdatedEvent } from 'user/domain/events/UserNameUpdatedEvent';
import { UserForgottenEvent } from 'user/domain/events/UserForgottenEvent';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { UserState } from './value-objects/UserState';
import { LoginEvent } from './events/LoginEvent';

describe(User.name, () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let user: User;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    user = modelFaker.user();
  });

  describe('create user', () => {
    let email: Email;
    let name: Name;

    beforeEach(() => {
      email = Email.from(primitiveFaker.email());
      const firstName = primitiveFaker.word();
      const lastName = primitiveFaker.word();
      name = Name.from(firstName, lastName);
    });

    test('happy path', () => {
      const user = User.createActive(email, name);
      expect(user.domainEvents).toContainEqual(expect.any(UserCreatedEvent));
    });
  });

  describe('update email', () => {
    let newEmail: Email;

    beforeEach(() => {
      newEmail = Email.from(primitiveFaker.email());
    });

    test('happy path', () => {
      user.changeEmail(newEmail);
      expect(user.email.value).toEqual(newEmail.value);
      expect(user.domainEvents).toContainEqual(expect.any(EmailChangedEvent));
    });

    test('when user not active should fail', () => {
      user.forget();
      expect(() => user.changeEmail(newEmail)).toThrowError();
      expect(user.email.equals(newEmail)).toBeFalsy();
    });
  });

  describe('update name', () => {
    let newName: Name;

    beforeEach(() => {
      const firstName = primitiveFaker.word();
      const lastName = primitiveFaker.word();
      newName = Name.from(firstName, lastName);
    });

    test('happy path', () => {
      user.updateName(newName);
      expect(user.name.equals(newName)).toBeTruthy();
      expect(user.domainEvents).toContainEqual(
        expect.any(UserNameUpdatedEvent),
      );
    });

    test('when user not active should fail', () => {
      user.forget();
      expect(() => user.updateName(newName)).toThrowError();
      expect(user.name.equals(newName)).toBeFalsy();
    });
  });

  describe('login user', () => {
    test('happy path', () => {
      const oldLastLoginAt = user.lastLoginAt;
      user.login();
      expect(user.lastLoginAt.equals(oldLastLoginAt)).toBeFalsy();
      expect(user.domainEvents).toContainEqual(expect.any(LoginEvent));
    });

    test('when user not active should fail', () => {
      user.forget();
      expect(() => user.forget()).toThrowError();
    });
  });

  describe('forget user', () => {
    test('happy path', () => {
      user.forget();
      expect(user.state.equals(UserState.FORGOTTEN)).toBeTruthy();
      expect(user.domainEvents).toContainEqual(expect.any(UserForgottenEvent));
    });

    test('when user not active should fail', () => {
      user.forget();
      expect(() => user.forget()).toThrowError();
    });
  });
});
