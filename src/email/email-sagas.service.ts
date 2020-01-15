import { Injectable, Inject } from '@nestjs/common';
import { EmailSender, EMAIL_SENDER } from 'email/email-sender';
import { Saga } from 'event';
import { EmailChangeRequestedEvent } from 'user/events/email-change-requested.event';
import { SignupRequestedEvent } from 'auth/events/signup-requested.event';
import { SigninRequestedEvent } from 'auth/events/signin-requested.event';

/**
 * Email Sagas Service
 */
@Injectable()
export class EmailSagasService {
  private readonly emailSender: EmailSender;

  public constructor(@Inject(EMAIL_SENDER) emailSender: EmailSender) {
    this.emailSender = emailSender;
  }

  /**
   *
   */
  @Saga(EmailChangeRequestedEvent)
  public async emailChangeRequested(
    event: EmailChangeRequestedEvent,
  ): Promise<void> {
    await this.emailSender.sendEmailChangeEmail(
      event.email,
      event.magicEmailChangeLink,
    );
  }

  /**
   *
   */
  @Saga(SigninRequestedEvent)
  public async signinRequested(event: SigninRequestedEvent): Promise<void> {
    await this.emailSender.sendLoginEmail(
      event.user.email,
      event.magicSigninLink,
    );
  }

  /**
   *
   */
  @Saga(SignupRequestedEvent)
  public async signupRequested(event: SignupRequestedEvent): Promise<void> {
    await this.emailSender.sendSignupEmail(event.email, event.magicSignupLink);
  }
}
