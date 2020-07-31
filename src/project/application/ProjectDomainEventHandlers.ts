import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmailManager } from 'shared/email/manager/EmailManager';
import { HandleDomainEvent } from 'shared/domain-event/application/DomainEventHandler';
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
import { CtaUrlFactory } from 'shared/urls/CtaUrlFactory';

@Injectable()
export class ProjectDomainEventHandlers {
  private readonly emailManager: EmailManager;
  private readonly userRepository: UserRepository;
  private readonly ctaUrlFactory: CtaUrlFactory;

  public constructor(
    emailManager: EmailManager,
    userRepository: UserRepository,
    ctaUrlFactory: CtaUrlFactory,
  ) {
    this.emailManager = emailManager;
    this.userRepository = userRepository;
    this.ctaUrlFactory = ctaUrlFactory;
  }

  @HandleDomainEvent(
    UserAssignedEvent,
    'on_user_assigned_send_assignment_email',
  )
  public async onUserAssignedSendAssignmentEmail(
    event: UserAssignedEvent,
  ): Promise<void> {
    const newAssignmentCtaUrl = this.ctaUrlFactory.createNewAssignmentCtaUrl({
      user: event.assignee,
      projectId: event.project.id,
    });
    await this.emailManager.sendNewAssignmentEmail(event.assignee.email.value, {
      firstName: event.assignee.name.first,
      projectTitle: event.project.title.value,
      roleTitle: event.role.title.value,
      ctaUrl: newAssignmentCtaUrl,
    });
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
      const peerReviewRequestedCtaUrl = this.ctaUrlFactory.createPeerReviewRequestedCtaUrl(
        { user: assignee, projectId: event.project.id },
      );
      await this.emailManager.sendPeerReviewRequestedEmail(
        assignee.email.value,
        {
          ctaUrl: peerReviewRequestedCtaUrl,
          firstName: assignee.name.first,
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
      // TODO handle
      throw new InternalServerErrorException('manager does not exist');
    }
    if (!manager.isActive()) {
      // TODO handle
      throw new InternalServerErrorException('manager is not active anymore');
    }
    const managerReviewRequestedCtaUrl = this.ctaUrlFactory.createManagerReviewRequestedCtaUrl(
      {
        user: manager,
        projectId: event.project.id,
      },
    );
    await this.emailManager.sendManagerReviewRequestedEmail(
      manager.email.value,
      {
        ctaUrl: managerReviewRequestedCtaUrl,
        firstName: manager.name.first,
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
      const projectFinishedCtaUrl = this.ctaUrlFactory.createProjectFinishedCtaUrl(
        {
          user: assignee,
          projectId: event.project.id,
        },
      );
      await this.emailManager.sendProjectFinishedEmail(assignee.email.value, {
        ctaUrl: projectFinishedCtaUrl,
        firstName: assignee.name.first,
        projectTitle: event.project.title.value,
      });
    }
  }
}
