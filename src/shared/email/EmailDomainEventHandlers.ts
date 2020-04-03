import { Injectable } from '@nestjs/common';
import { HandleDomainEvent } from 'shared/event/domain/HandleDomainEvent';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { LoginRequestedEvent } from 'auth/application/events/LoginRequestedEvent';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { NewUserAssignedEvent } from 'project/domain/events/NewUserAssignedEvent';

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
  @HandleDomainEvent(EmailChangeRequestedEvent)
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
  @HandleDomainEvent(LoginRequestedEvent)
  public async signinRequested(event: LoginRequestedEvent): Promise<void> {
    await this.emailManager.sendLoginEmail(
      event.user.email.value,
      event.magicSigninLink,
    );
  }

  /**
   *
   */
  @HandleDomainEvent(SignupRequestedEvent)
  public async signupRequested(event: SignupRequestedEvent): Promise<void> {
    await this.emailManager.sendSignupEmail(
      event.email.value,
      event.magicSignupLink,
    );
  }

  /**
   *
   */
  @HandleDomainEvent(NewUserAssignedEvent)
  public async handleNewUserAssignedEvent(
    event: NewUserAssignedEvent,
  ): Promise<void> {
    await this.emailManager.sendUnregisteredUserNewAssignmentEmail(
      event.assigneeEmail.value,
    );
  }
}
