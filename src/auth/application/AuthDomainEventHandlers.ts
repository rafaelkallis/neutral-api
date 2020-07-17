import { Injectable } from '@nestjs/common';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { LoginRequestedEvent } from 'auth/application/events/LoginRequestedEvent';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { HandleDomainEvent } from 'shared/domain-event/application/DomainEventHandler';

/**
 * Auth Domain Event Handlers
 */
@Injectable()
export class AuthDomainEventHandlers {
  private readonly emailManager: EmailManager;

  public constructor(emailManager: EmailManager) {
    this.emailManager = emailManager;
  }

  @HandleDomainEvent(LoginRequestedEvent, 'on_login_requested_send_login_email')
  public async onLoginRequestedSendLoginEmail(
    event: LoginRequestedEvent,
  ): Promise<void> {
    await this.emailManager.sendLoginEmail(event.user.email.value, {
      firstName: event.user.name.first,
      ctaUrl: event.loginLink,
    });
  }

  // TODO consolidate with onLoginRequestedSendLoginEmail
  @HandleDomainEvent(
    SignupRequestedEvent,
    'on_signup_requested_send_signup_email',
  )
  public async onSignupRequestedSendSignupEmail(
    event: SignupRequestedEvent,
  ): Promise<void> {
    await this.emailManager.sendSignupEmail(event.email.value, {
      ctaUrl: event.magicSignupLink,
    });
  }
}
