import { MockEmailManager } from 'shared/email/MockEmailManager';
import { EmailDomainEventHandlers } from 'shared/email/EmailDomainEventHandlers';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { LoginRequestedEvent } from 'auth/application/events/LoginRequestedEvent';
import { Email } from 'user/domain/value-objects/Email';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { ModelFaker } from 'test/ModelFaker';

describe('email domain event handlers', () => {
  let primitiveFaker: PrimitiveFaker;
  let modelFaker: ModelFaker;
  let emailManager: MockEmailManager;
  let emailSagas: EmailDomainEventHandlers;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    emailManager = new MockEmailManager();
    emailSagas = new EmailDomainEventHandlers(emailManager);
  });

  test('should be defined', () => {
    expect(emailSagas).toBeDefined();
  });

  test('email change requested', async () => {
    jest.spyOn(emailManager, 'sendEmailChangeEmail');
    const user = modelFaker.user();
    const email = Email.from(primitiveFaker.email());
    const emailChangeMagicLink = '';
    const event = new EmailChangeRequestedEvent(
      user,
      email,
      emailChangeMagicLink,
    );

    await emailSagas.emailChangeRequested(event);

    expect(emailManager.sendEmailChangeEmail).toHaveBeenCalledWith(
      email.value,
      emailChangeMagicLink,
    );
  });

  test('login requested', async () => {
    jest.spyOn(emailManager, 'sendLoginEmail');
    const user = modelFaker.user();
    const signinMagicLink = '';
    const event = new LoginRequestedEvent(user, signinMagicLink);

    await emailSagas.signinRequested(event);

    expect(emailManager.sendLoginEmail).toHaveBeenCalledWith(
      user.email.value,
      signinMagicLink,
    );
  });

  test('signup requested', async () => {
    jest.spyOn(emailManager, 'sendSignupEmail');
    const email = primitiveFaker.email();
    const signupMagicLink = '';
    const event = new SignupRequestedEvent(Email.from(email), signupMagicLink);

    await emailSagas.signupRequested(event);

    expect(emailManager.sendSignupEmail).toHaveBeenCalledWith(
      email,
      signupMagicLink,
    );
  });
});
