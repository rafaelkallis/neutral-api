import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmailChangeRequestedEvent } from 'user/domain/events/EmailChangeRequestedEvent';
import { SignupRequestedEvent } from 'auth/application/events/SignupRequestedEvent';
import { LoginRequestedEvent } from 'auth/application/events/LoginRequestedEvent';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { InvitedUserAssignedEvent } from 'project/domain/events/InvitedUserAssignedEvent';
import { HandleDomainEvent } from 'shared/domain-event/application/DomainEventHandler';
import { ActiveUserAssignedEvent } from 'project/domain/events/ActiveUserAssignedEvent';
import { Config } from 'shared/config/application/Config';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';

/**
 * Email Domain Event Handlers
 */
@Injectable()
export class EmailDomainEventHandlers {
  private readonly config: Config;
  private readonly emailManager: EmailManager;

  public constructor(config: Config, emailManager: EmailManager) {
    this.config = config;
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
    await this.emailManager.sendLoginEmail(event.email.value, event.loginLink);
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

  @HandleDomainEvent(ActiveUserAssignedEvent, 'send_assignment_email')
  public async handleAssignmentEvent(
    event: ActiveUserAssignedEvent,
  ): Promise<void> {
    await this.emailManager.sendNewAssignmentEmail(event.assignee.email.value, {
      projectTitle: event.project.title.value,
      roleTitle: event.role.title.value,
      projectUrl: this.config.get('FRONTEND_URL'), // TODO any better ideas?
    });
  }

  /**
   *
   */
  @HandleDomainEvent(
    InvitedUserAssignedEvent,
    'send_invited_user_assigned_email',
  )
  public async handleInvitedUserAssignedEvent(
    event: InvitedUserAssignedEvent,
  ): Promise<void> {
    await this.emailManager.sendInvitedUserNewAssignmentEmail(
      event.assignee.email.value,
      {
        projectTitle: event.project.title.value,
        roleTitle: event.role.title.value,
        signupMagicLink: event.signupLink,
      },
    );
  }

  @HandleDomainEvent(
    ProjectPeerReviewStartedEvent,
    'on_project_peer_review_started_send_peer_review_requested_email',
  )
  public async onProjectPeerReviewStartedSendPeerReviewRequestedEmail(
    event: ProjectPeerReviewStartedEvent,
  ): Promise<void> {
    for (const assignee of event.assignees) {
      if (!assignee.isActive()) {
        throw new InternalServerErrorException(
          'assignee is not active anymore',
        );
      }
      await this.emailManager.sendPeerReviewRequestedEmail(
        assignee.email.value,
        {
          projectUrl: this.config.get('FRONTEND_URL'), // TODO any better ideas?
          projectTitle: event.project.title.value,
        },
      );
    }
  }
}
