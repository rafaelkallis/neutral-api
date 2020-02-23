import { ModelFaker, PrimitiveFaker } from 'test';
import { MockEmailService } from 'email/mock-email.service';
import { EmailSagasService } from 'email/email-sagas.service';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { SignupRequestedEvent } from 'auth/application/exceptions/SignupRequestedEvent';
import { SigninRequestedEvent } from 'auth/application/exceptions/SigninRequestedEvent';
import { Email } from 'user/domain/value-objects/Email';

describe('email sagas', () => {
  let primitiveFaker: PrimitiveFaker;
  let modelFaker: ModelFaker;
  let emailService: MockEmailService;
  let emailSagas: EmailSagasService;

  beforeEach(() => {
    primitiveFaker = new PrimitiveFaker();
    modelFaker = new ModelFaker();
    emailService = new MockEmailService();
    emailSagas = new EmailSagasService(emailService);
  });

  test('should be defined', () => {
    expect(emailSagas).toBeDefined();
  });

  test('email change requested', async () => {
    jest.spyOn(emailService, 'sendEmailChangeEmail');
    const user = modelFaker.user();
    const email = Email.from(primitiveFaker.email());
    const emailChangeMagicLink = '';
    const event = new EmailChangeRequestedEvent(
      user,
      email,
      emailChangeMagicLink,
    );

    await emailSagas.emailChangeRequested(event);

    expect(emailService.sendEmailChangeEmail).toHaveBeenCalledWith(
      email.value,
      emailChangeMagicLink,
    );
  });

  test('login requested', async () => {
    jest.spyOn(emailService, 'sendLoginEmail');
    const user = modelFaker.user();
    const signinMagicLink = '';
    const event = new SigninRequestedEvent(user, signinMagicLink);

    await emailSagas.signinRequested(event);

    expect(emailService.sendLoginEmail).toHaveBeenCalledWith(
      user.email.value,
      signinMagicLink,
    );
  });

  test('signup requested', async () => {
    jest.spyOn(emailService, 'sendSignupEmail');
    const email = primitiveFaker.email();
    const signupMagicLink = '';
    const event = new SignupRequestedEvent(Email.from(email), signupMagicLink);

    await emailSagas.signupRequested(event);

    expect(emailService.sendSignupEmail).toHaveBeenCalledWith(
      email,
      signupMagicLink,
    );
  });
});
