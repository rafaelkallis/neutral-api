import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  NotificationRepository,
  NOTIFICATION_REPOSITORY,
} from 'notification/repositories/notification.repository';
import {
  PeerReviewRequestedNotification,
  ProjectFinishedNotification,
} from 'notification/notification';
import { ExistingUserAssignedEvent } from 'role/events/existing-user-assigned.event';
import { NotificationFactoryService } from 'notification/services/notification-factory.service';
import { Saga } from 'event';
import { NotificationModel } from 'notification/notification.model';
import {
  ProjectPeerReviewStartedEvent,
  ProjectManagerReviewStartedEvent,
  ProjectFinishedEvent,
} from 'project/events';

@Injectable()
export class NotificationSagasService {
  private readonly notificationRepository: NotificationRepository;
  private readonly notificationFactory: NotificationFactoryService;

  public constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    notificationRepository: NotificationRepository,
    notificationFactory: NotificationFactoryService,
  ) {
    this.notificationRepository = notificationRepository;
    this.notificationFactory = notificationFactory;
  }

  /**
   *
   */
  @Saga(ExistingUserAssignedEvent)
  public async existingUserAssigned(
    event: ExistingUserAssignedEvent,
  ): Promise<void> {
    const notification = this.notificationFactory.createNewAssignmentNotification(
      event.project,
      event.role,
    );
    const notificationEntity = NotificationModel.fromNotification(notification);
    await this.notificationRepository.persist(notificationEntity);
  }

  /**
   *
   */
  @Saga(ProjectPeerReviewStartedEvent)
  public async peerReviewStarted(
    event: ProjectPeerReviewStartedEvent,
  ): Promise<void> {
    const notifications: PeerReviewRequestedNotification[] = [];
    for (const role of event.roles) {
      const notification = this.notificationFactory.createPeerReviewRequestedNotification(
        event.project,
        role,
      );
      notifications.push(notification);
    }
    const notificationEntities = notifications.map(n =>
      NotificationModel.fromNotification(n),
    );
    await this.notificationRepository.persist(...notificationEntities);
  }

  /**
   *
   */
  @Saga(ProjectManagerReviewStartedEvent)
  public async managerReviewStarted(
    event: ProjectManagerReviewStartedEvent,
  ): Promise<void> {
    const notification = this.notificationFactory.createManagerReviewRequestedNotification(
      event.project,
    );
    const notificationEntity = NotificationModel.fromNotification(notification);
    await this.notificationRepository.persist(notificationEntity);
  }

  /**
   *
   */
  @Saga(ProjectFinishedEvent)
  public async projectFinished(event: ProjectFinishedEvent): Promise<void> {
    const notifications: ProjectFinishedNotification[] = [
      this.notificationFactory.createProjectFinishedNotification(
        event.project,
        event.project.creatorId,
      ),
    ];
    for (const role of event.roles) {
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
    const notificationEntities = notifications.map(n =>
      NotificationModel.fromNotification(n),
    );
    await this.notificationRepository.persist(...notificationEntities);
  }
}
