import { EmailDomainEventHandlers } from 'shared/email/EmailDomainEventHandlers';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { LoginRequestedEvent } from 'auth/application/events/LoginRequestedEvent';
import { Email } from 'user/domain/value-objects/Email';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Config } from 'shared/config/application/Config';
import { UserRepository } from 'user/domain/UserRepository';

describe('email domain event handlers', () => {
  let scenario: UnitTestScenario<EmailDomainEventHandlers>;
  let emailDomainEventHandlers: EmailDomainEventHandlers;
  let emailManager: EmailManager;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(EmailDomainEventHandlers)
      .addProviderMock(UserRepository)
      .addProviderMock(EmailManager)
      .addProviderMock(Config)
      .build();
    emailDomainEventHandlers = scenario.subject;
    emailManager = scenario.module.get(EmailManager);
  });

  test('should be defined', () => {
    expect(emailDomainEventHandlers).toBeDefined();
  });

  test('email change requested', async () => {
    jest.spyOn(emailManager, 'sendEmailChangeEmail');
    const user = scenario.modelFaker.user();
    const email = Email.of(scenario.primitiveFaker.email());
    const emailChangeMagicLink = '';
    const event = new EmailChangeRequestedEvent(
      user,
      email,
      emailChangeMagicLink,
    );

    await emailDomainEventHandlers.emailChangeRequested(event);

    expect(emailManager.sendEmailChangeEmail).toHaveBeenCalledWith(
      email.value,
      emailChangeMagicLink,
    );
  });

  test('login requested', async () => {
    jest.spyOn(emailManager, 'sendLoginEmail');
    const email = scenario.valueObjectFaker.user.email();
    const signinMagicLink = '';
    const event = new LoginRequestedEvent(email, signinMagicLink);

    await emailDomainEventHandlers.signinRequested(event);

    expect(emailManager.sendLoginEmail).toHaveBeenCalledWith(
      email.value,
      signinMagicLink,
    );
  });

  test('signup requested', async () => {
    jest.spyOn(emailManager, 'sendSignupEmail');
    const email = scenario.primitiveFaker.email();
    const signupMagicLink = '';
    const event = new SignupRequestedEvent(Email.of(email), signupMagicLink);

    await emailDomainEventHandlers.signupRequested(event);

    expect(emailManager.sendSignupEmail).toHaveBeenCalledWith(
      email,
      signupMagicLink,
    );
  });
});
