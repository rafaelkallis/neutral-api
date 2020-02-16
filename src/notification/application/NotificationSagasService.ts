import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  NotificationRepository,
  NOTIFICATION_REPOSITORY,
} from 'notification/domain/NotificationRepository';
import { ExistingUserAssignedEvent } from 'project/domain/events/ExistingUserAssignedEvent';
import { NotificationFactoryService } from 'notification/domain/NotificationFactoryService';
import { Saga } from 'event';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';

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
    await this.notificationRepository.persist(notification);
  }

  /**
   *
   */
  @Saga(ProjectPeerReviewStartedEvent)
  public async peerReviewStarted(
    event: ProjectPeerReviewStartedEvent,
  ): Promise<void> {
    const notifications: NotificationModel[] = [];
    for (const role of event.roles) {
      const notification = this.notificationFactory.createPeerReviewRequestedNotification(
        event.project,
        role,
      );
      notifications.push(notification);
    }
    await this.notificationRepository.persist(...notifications);
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
    await this.notificationRepository.persist(notification);
  }

  /**
   *
   */
  @Saga(ProjectFinishedEvent)
  public async projectFinished(event: ProjectFinishedEvent): Promise<void> {
    const notifications: NotificationModel[] = [
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
    await this.notificationRepository.persist(...notifications);
  }
}
