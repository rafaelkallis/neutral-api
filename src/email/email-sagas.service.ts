import { Injectable, Inject } from '@nestjs/common';
import { Saga } from 'event';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { SignupRequestedEvent } from 'auth/application/exceptions/SignupRequestedEvent';
import { SigninRequestedEvent } from 'auth/application/exceptions/SigninRequestedEvent';
import { EmailService, EMAIL_SERVICE } from 'email/email.service';

/**
 * Email Sagas Service
 */
@Injectable()
export class EmailSagasService {
  private readonly emailService: EmailService;

  public constructor(@Inject(EMAIL_SERVICE) emailService: EmailService) {
    this.emailService = emailService;
  }

  /**
   *
   */
  @Saga(EmailChangeRequestedEvent)
  public async emailChangeRequested(
    event: EmailChangeRequestedEvent,
  ): Promise<void> {
    await this.emailService.sendEmailChangeEmail(
      event.email,
      event.magicEmailChangeLink,
    );
  }

  /**
   *
   */
  @Saga(SigninRequestedEvent)
  public async signinRequested(event: SigninRequestedEvent): Promise<void> {
    await this.emailService.sendLoginEmail(
      event.user.email,
      event.magicSigninLink,
    );
  }

  /**
   *
   */
  @Saga(SignupRequestedEvent)
  public async signupRequested(event: SignupRequestedEvent): Promise<void> {
    await this.emailService.sendSignupEmail(event.email, event.magicSignupLink);
  }
}
