import { User } from 'user/domain/User';
import { PrimitiveFaker, ModelFaker } from 'test';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { UserCreatedEvent } from 'user/domain/events/UserCreatedEvent';
import { EmailChangedEvent } from 'user/domain/events/EmailChangedEvent';
import { UserNameUpdatedEvent } from 'user/domain/events/UserNameUpdatedEvent';
import { UserDeletedEvent } from 'user/domain/events/UserDeletedEvent';

describe('user model', () => {
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
      const user = User.create(email, name);
      expect(user.getDomainEvents()).toEqual([expect.any(UserCreatedEvent)]);
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
      expect(user.getDomainEvents()).toEqual([expect.any(EmailChangedEvent)]);
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
      expect(user.getDomainEvents()).toEqual([
        expect.any(UserNameUpdatedEvent),
      ]);
    });
  });

  describe('delete user', () => {
    test('happy path', () => {
      user.delete();
      expect(user.getDomainEvents()).toEqual([expect.any(UserDeletedEvent)]);
    });
  });
});
