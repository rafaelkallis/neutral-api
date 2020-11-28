import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationRepository } from 'notification/domain/NotificationRepository';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { Notification } from 'notification/domain/Notification';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { HandleDomainEvent } from 'shared/domain-event/application/DomainEventHandler';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { ManagerReviewStartedEvent } from 'project/domain/milestone/events/ManagerReviewStartedEvent';
import { PeerReviewStartedEvent } from 'project/domain/milestone/events/PeerReviewStartedEvent';

@Injectable()
export class NotificationDomainEventHandlers {
  private readonly notificationRepository: NotificationRepository;
  private readonly notificationFactory: NotificationFactoryService;

  public constructor(
    notificationRepository: NotificationRepository,
    notificationFactory: NotificationFactoryService,
  ) {
    this.notificationRepository = notificationRepository;
    this.notificationFactory = notificationFactory;
  }

  @HandleDomainEvent(
    UserAssignedEvent,
    'notification.create_new_assignment_notification',
  )
  public async onUserAssignedCreateNewAssignmentNotification(
    event: UserAssignedEvent,
  ): Promise<void> {
    const notification = this.notificationFactory.createNewAssignmentNotification(
      event.project,
      event.role,
    );
    await this.notificationRepository.persist(notification);
  }

  @HandleDomainEvent(
    PeerReviewStartedEvent,
    'notification.create_peer_review_requested_notification',
  )
  public async onPeerReviewStartedCreatePeerReviewRequestedNotifications(
    event: PeerReviewStartedEvent,
  ): Promise<void> {
    const notifications: Notification[] = [];
    for (const role of event.milestone.project.roles) {
      const notification = this.notificationFactory.createPeerReviewRequestedNotification(
        event.milestone.project,
        role,
      );
      notifications.push(notification);
    }
    await this.notificationRepository.persist(...notifications);
  }

  @HandleDomainEvent(
    ManagerReviewStartedEvent,
    'notification.create_manager_review_requested_notification',
  )
  public async onManagerReviewStartedCreateManagerReviewRequestedNotification(
    event: ManagerReviewStartedEvent,
  ): Promise<void> {
    const notification = this.notificationFactory.createManagerReviewRequestedNotification(
      event.milestone.project,
    );
    await this.notificationRepository.persist(notification);
  }

  @HandleDomainEvent(
    ProjectFinishedEvent,
    'notification.create_project_finished_notification',
  )
  public async onProjectFinishedCreateProjectFinishedNotification(
    event: ProjectFinishedEvent,
  ): Promise<void> {
    const notifications: Notification[] = [
      this.notificationFactory.createProjectFinishedNotification(
        event.project,
        event.project.creatorId,
      ),
    ];
    for (const role of event.project.roles.toArray()) {
      if (!role.assigneeId) {
        throw new InternalServerErrorException();
      }
      if (event.project.creatorId === role.assigneeId) {
        continue;
      }
      const notification = this.notificationFactory.createProjectFinishedNotification(
        event.project,
        role.assigneeId,
      );
      notifications.push(notification);
    }
    await this.notificationRepository.persist(...notifications);
  }
}
