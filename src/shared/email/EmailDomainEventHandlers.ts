import { Injectable } from '@nestjs/common';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { LoginRequestedEvent } from 'auth/application/events/LoginRequestedEvent';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { NewUserAssignedEvent } from 'project/domain/events/NewUserAssignedEvent';
import { HandleDomainEvent } from 'shared/domain-event/application/DomainEventHandler';

/**
 * Email Domain Event Handlers
 */
@Injectable()
export class EmailDomainEventHandlers {
  private readonly emailManager: EmailManager;

  public constructor(emailManager: EmailManager) {
    this.emailManager = emailManager;
  }

  /**
   *
   */
  @HandleDomainEvent(EmailChangeRequestedEvent, 'send_email_change_email')
  public async emailChangeRequested(
    event: EmailChangeRequestedEvent,
  ): Promise<void> {
    await this.emailManager.sendEmailChangeEmail(
      event.email.value,
      event.magicEmailChangeLink,
    );
  }

  /**
   *
   */
  @HandleDomainEvent(LoginRequestedEvent, 'send_login_email')
  public async signinRequested(event: LoginRequestedEvent): Promise<void> {
    await this.emailManager.sendLoginEmail(
      event.user.email.value,
      event.magicSigninLink,
    );
  }

  /**
   *
   */
  @HandleDomainEvent(SignupRequestedEvent, 'send_signup_email')
  public async signupRequested(event: SignupRequestedEvent): Promise<void> {
    await this.emailManager.sendSignupEmail(
      event.email.value,
      event.magicSignupLink,
    );
  }

  /**
   *
   */
  @HandleDomainEvent(
    NewUserAssignedEvent,
    'send_invited_user_new_assignment_email',
  )
  public async handleNewUserAssignedEvent(
    event: NewUserAssignedEvent,
  ): Promise<void> {
    await this.emailManager.sendInvitedUserNewAssignmentEmail(
      event.assigneeEmail.value,
      {
        projectTitle: event.project.title.value,
        roleTitle: event.role.title.value,
        signupMagicLink: event.signupLink,
      },
    );
  }
}
