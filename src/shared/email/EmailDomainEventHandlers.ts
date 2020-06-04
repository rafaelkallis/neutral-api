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
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { UserId } from 'user/domain/value-objects/UserId';
import {
  ReadonlyUserCollection,
  UserCollection,
} from 'user/domain/UserCollection';
import { User } from 'user/domain/User';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';

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
    for (const assignee of event.assignees) {
      if (!assignee.email.isPresent()) {
        continue;
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

  @HandleDomainEvent(
    ProjectManagerReviewStartedEvent,
    'on_project_manager_review_started_send_manager_review_requested_email',
  )
  public async onProjectManagerReviewStartedSendManagerReviewRequestedEmail(
    event: ProjectManagerReviewStartedEvent,
  ): Promise<void> {
    const manager = await this.userRepository.findById(event.project.creatorId);
    if (!manager) {
      throw new InternalServerErrorException('manager does not exist');
    }
    if (!manager.isActive()) {
      throw new InternalServerErrorException('manager is not active anymore');
    }
    await this.emailManager.sendManagerReviewRequestedEmail(
      manager.email.value,
      {
        projectUrl: this.config.get('FRONTEND_URL'), // TODO any better ideas?
        projectTitle: event.project.title.value,
      },
    );
  }

  @HandleDomainEvent(
    ProjectFinishedEvent,
    'on_project_finished_send_project_finished_email',
  )
  public async onProjectFinishedSendProjectFinishedEmail(
    event: ProjectFinishedEvent,
  ): Promise<void> {
    const nullableAssigneeIds = event.project.roles
      .toArray()
      .map((r) => r.assigneeId);
    const assigneeIds: UserId[] = nullableAssigneeIds.filter(
      Boolean,
    ) as UserId[];
    if (nullableAssigneeIds.length !== assigneeIds.length) {
      throw new InternalServerErrorException('some roles have null assigneeId');
    }
    const nullableAssignees = await this.userRepository.findByIds(assigneeIds);
    const assignees: ReadonlyUserCollection = new UserCollection(
      nullableAssignees.filter(Boolean) as User[],
    );
    for (const assignee of assignees) {
      if (!assignee.email.isPresent()) {
        continue;
      }
      await this.emailManager.sendProjectFinishedEmail(assignee.email.value, {
        projectUrl: this.config.get('FRONTEND_URL'), // TODO any better ideas?
        projectTitle: event.project.title.value,
      });
    }
  }
}
