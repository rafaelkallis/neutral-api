import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role } from 'role';
import { ProjectModel } from 'project';
import {
  NotificationRepository,
  NOTIFICATION_REPOSITORY,
} from 'notification/repositories/notification.repository';
import {
  NewAssignmentNotification,
  NotificationType,
  PeerReviewRequestedNotification,
  ManagerReviewRequestedNotification,
  ProjectFinishedNotification,
} from 'notification/notification';

@Injectable()
export class NotificationFactoryService {
  private readonly notificationRepository: NotificationRepository;

  public constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    notificationRepository: NotificationRepository,
  ) {
    this.notificationRepository = notificationRepository;
  }

  /**
   *
   */
  public createNewAssignmentNotification(
    project: ProjectModel,
    role: Role,
  ): NewAssignmentNotification {
    if (!role.assigneeId) {
      throw new InternalServerErrorException();
    }
    return {
      id: this.notificationRepository.createId(),
      ownerId: role.assigneeId,
      type: NotificationType.NEW_ASSIGNMENT,
      isRead: false,
      payload: {
        role: {
          id: role.id,
          title: role.title,
        },
        project: {
          id: project.id,
          title: project.title,
        },
      },
    };
  }

  /**
   *
   */
  public createPeerReviewRequestedNotification(
    project: ProjectModel,
    role: Role,
  ): PeerReviewRequestedNotification {
    if (!role.assigneeId) {
      throw new InternalServerErrorException();
    }
    return {
      id: this.notificationRepository.createId(),
      ownerId: role.assigneeId,
      type: NotificationType.PEER_REVIEW_REQUESTED,
      isRead: false,
      payload: {
        role: {
          id: role.id,
          title: role.title,
        },
        project: {
          id: project.id,
          title: project.title,
        },
      },
    };
  }

  /**
   *
   */
  public createManagerReviewRequestedNotification(
    project: ProjectModel,
  ): ManagerReviewRequestedNotification {
    return {
      id: this.notificationRepository.createId(),
      ownerId: project.creatorId,
      type: NotificationType.MANAGER_REVIEW_REQUESTED,
      isRead: false,
      payload: {
        project: {
          id: project.id,
          title: project.title,
        },
      },
    };
  }

  /**
   *
   */
  public createProjectFinishedNotification(
    project: ProjectModel,
    projectMemberId: string,
  ): ProjectFinishedNotification {
    return {
      id: this.notificationRepository.createId(),
      ownerId: projectMemberId,
      type: NotificationType.PROJECT_FINISHED,
      isRead: false,
      payload: {
        project: {
          id: project.id,
          title: project.title,
        },
      },
    };
  }
}
