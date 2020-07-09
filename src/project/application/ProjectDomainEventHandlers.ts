import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { HandleDomainEvent } from 'shared/domain-event/application/DomainEventHandler';
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
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { TokenManager } from 'shared/token/application/TokenManager';
import { MagicLinkFactory } from 'shared/magic-link/MagicLinkFactory';

@Injectable()
export class ProjectDomainEventHandlers {
  private readonly config: Config;
  private readonly emailManager: EmailManager;
  private readonly userRepository: UserRepository;
  private readonly tokenManager: TokenManager;
  private readonly magicLinkFactory: MagicLinkFactory;

  public constructor(
    config: Config,
    emailManager: EmailManager,
    userRepository: UserRepository,
    tokenManager: TokenManager,
    magicLinkFactory: MagicLinkFactory,
  ) {
    this.config = config;
    this.emailManager = emailManager;
    this.userRepository = userRepository;
    this.tokenManager = tokenManager;
    this.magicLinkFactory = magicLinkFactory;
  }

  @HandleDomainEvent(
    UserAssignedEvent,
    'on_user_assigned_send_assignment_email',
  )
  public async onUserAssignedSendAssignmentEmail(
    event: UserAssignedEvent,
  ): Promise<void> {
    if (event.assignee.isPending()) {
      const loginToken = this.tokenManager.newLoginToken(
        event.assignee.email,
        event.assignee.lastLoginAt,
      );
      const loginLink = this.magicLinkFactory.createLoginLink({
        loginToken,
        email: event.assignee.email,
        isNew: true,
      });
      await this.emailManager.sendPendingUserNewAssignmentEmail(
        event.assignee.email.value,
        {
          projectTitle: event.project.title.value,
          roleTitle: event.role.title.value,
          ctaActionUrl: loginLink,
        },
      );
    } else if (event.assignee.isActive()) {
      await this.emailManager.sendNewAssignmentEmail(
        event.assignee.email.value,
        {
          projectTitle: event.project.title.value,
          roleTitle: event.role.title.value,
          ctaActionUrl: this.config.get('FRONTEND_URL'), // TODO any better ideas?
        },
      );
    }
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
          ctaActionUrl: this.config.get('FRONTEND_URL'), // TODO any better ideas?
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
        ctaActionUrl: this.config.get('FRONTEND_URL'), // TODO any better ideas?
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
        ctaActionUrl: this.config.get('FRONTEND_URL'), // TODO any better ideas?
        projectTitle: event.project.title.value,
      });
    }
  }
}
