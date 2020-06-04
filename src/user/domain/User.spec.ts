import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { EmailChangedEvent } from 'user/domain/events/EmailChangedEvent';
import { UserNameUpdatedEvent } from 'user/domain/events/UserNameUpdatedEvent';
import { UserForgottenEvent } from 'user/domain/events/UserForgottenEvent';
import { ModelFaker } from 'test/ModelFaker';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { LoginEvent } from 'user/domain/events/LoginEvent';
import { ForgottenState } from 'user/domain/value-objects/states/ForgottenState';

describe(User.name, () => {
  let modelFaker: ModelFaker;
  let primitiveFaker: PrimitiveFaker;
  let user: User;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    user = modelFaker.user();
  });

  describe('update email', () => {
    let newEmail: Email;

    beforeEach(() => {
      newEmail = Email.of(primitiveFaker.email());
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
      expect(user.state.equals(ForgottenState.getInstance())).toBeTruthy();
      expect(user.domainEvents).toContainEqual(expect.any(UserForgottenEvent));
    });

    test('when user not active should fail', () => {
      user.forget();
      expect(() => user.forget()).toThrowError();
    });
  });
});
