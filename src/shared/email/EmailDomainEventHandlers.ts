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
import { UserRepository } from 'user/domain/UserRepository';
import { UserId } from 'user/domain/value-objects/UserId';
import { ReadonlyUser } from 'user/domain/User';

/**
 * Email Domain Event Handlers
 */
@Injectable()
export class EmailDomainEventHandlers {
  private readonly config: Config;
  private readonly emailManager: EmailManager;
  private readonly userRepository: UserRepository;

  public constructor(
    config: Config,
    emailManager: EmailManager,
    userRepository: UserRepository,
  ) {
    this.config = config;
    this.emailManager = emailManager;
    this.userRepository = userRepository;
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
    const optionalAssigneeIds = event.project.roles
      .toArray()
      .map((role) => role.assigneeId);
    const assigneeIds: UserId[] = [];
    for (const optionalAssigneeId of optionalAssigneeIds) {
      if (!optionalAssigneeId) {
        throw new InternalServerErrorException("shouldn't be possible");
      }
      assigneeIds.push(optionalAssigneeId);
    }
    const optionalAssignees = await this.userRepository.findByIds(assigneeIds);
    const assignees: ReadonlyUser[] = [];
    for (const optionalAssignee of optionalAssignees) {
      if (!optionalAssignee) {
        throw new InternalServerErrorException('user does not exist anymore');
      }
      assignees.push(optionalAssignee);
    }
    for (const assignee of assignees) {
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
