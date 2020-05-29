import { UnitTestScenario } from 'test/UnitTestScenario';
import { UserFactory } from 'user/application/UserFactory';
import { Email } from 'user/domain/value-objects/Email';
import { UserCreatedEvent } from 'user/domain/events/UserCreatedEvent';
import { PendingState } from 'user/domain/value-objects/states/PendingState';

describe(UserFactory.name, () => {
  let scenario: UnitTestScenario<UserFactory>;
  let userFactory: UserFactory;

  let email: Email;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(UserFactory).build();
    userFactory = scenario.subject;
    email = Email.from(scenario.primitiveFaker.email());
  });

  test('create user', () => {
    const createdUser = userFactory.create({ email });
    expect(createdUser.state).toBe(PendingState.getInstance());
    expect(createdUser.domainEvents).toContainEqual(
      expect.any(UserCreatedEvent),
    );
  });
});
