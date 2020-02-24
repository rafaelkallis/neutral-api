import { Injectable, Inject } from '@nestjs/common';
import { HandleDomainEvent } from 'event/domain/HandleDomainEvent';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { LoginRequestedEvent } from 'auth/application/events/LoginRequestedEvent';
import { EmailManager, EMAIL_MANAGER } from 'email/EmailManager';
import { NewUserAssignedEvent } from 'project/domain/events/NewUserAssignedEvent';

/**
 * Email Sagas Service
 */
@Injectable()
export class EmailSagasService {
  private readonly emailService: EmailManager;

  public constructor(@Inject(EMAIL_MANAGER) emailService: EmailManager) {
    this.emailService = emailService;
  }

  /**
   *
   */
  @HandleDomainEvent(EmailChangeRequestedEvent)
  public async emailChangeRequested(
    event: EmailChangeRequestedEvent,
  ): Promise<void> {
    await this.emailService.sendEmailChangeEmail(
      event.email.value,
      event.magicEmailChangeLink,
    );
  }

  /**
   *
   */
  @HandleDomainEvent(LoginRequestedEvent)
  public async signinRequested(event: LoginRequestedEvent): Promise<void> {
    await this.emailService.sendLoginEmail(
      event.user.email.value,
      event.magicSigninLink,
    );
  }

  /**
   *
   */
  @HandleDomainEvent(SignupRequestedEvent)
  public async signupRequested(event: SignupRequestedEvent): Promise<void> {
    await this.emailService.sendSignupEmail(
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
    await this.emailService.sendUnregisteredUserNewAssignmentEmail(
      event.assigneeEmail.value,
    );
  }
}
