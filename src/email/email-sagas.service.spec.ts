import { EntityFaker, PrimitiveFaker } from 'test';
import { MockEmailSender } from 'email/mock-email-sender';
import { EmailSagasService } from 'email/email-sagas.service';
import { EmailChangeRequestedEvent } from 'user/events/email-change-requested.event';
import { SignupRequestedEvent } from 'auth/events/signup-requested.event';
import { SigninRequestedEvent } from 'auth/events/signin-requested.event';

describe('email sagas', () => {
  let primitiveFaker: PrimitiveFaker;
  let entityFaker: EntityFaker;
  let emailSender: MockEmailSender;
  let emailSagas: EmailSagasService;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    entityFaker = new EntityFaker();
    emailSender = new MockEmailSender();
    emailSagas = new EmailSagasService(emailSender);
  });

  test('should be defined', () => {
    expect(emailSagas).toBeDefined();
  });

  test('email change requested', async () => {
    jest.spyOn(emailSender, 'sendEmailChangeEmail');
    const user = entityFaker.user();
    const email = primitiveFaker.email();
    const emailChangeMagicLink = '';
    const event = new EmailChangeRequestedEvent(
      user,
      email,
      emailChangeMagicLink,
    );

    await emailSagas.emailChangeRequested(event);

    expect(emailSender.sendEmailChangeEmail).toHaveBeenCalledWith(
      email,
      emailChangeMagicLink,
    );
  });

  test('login requested', async () => {
    jest.spyOn(emailSender, 'sendLoginEmail');
    const user = entityFaker.user();
    const signinMagicLink = '';
    const event = new SigninRequestedEvent(user, signinMagicLink);

    await emailSagas.signinRequested(event);

    expect(emailSender.sendLoginEmail).toHaveBeenCalledWith(
      user.email,
      signinMagicLink,
    );
  });

  test('signup requested', async () => {
    jest.spyOn(emailSender, 'sendSignupEmail');
    const email = primitiveFaker.email();
    const signupMagicLink = '';
    const event = new SignupRequestedEvent(email, signupMagicLink);

    await emailSagas.signupRequested(event);

    expect(emailSender.sendSignupEmail).toHaveBeenCalledWith(
      email,
      signupMagicLink,
    );
  });
});
