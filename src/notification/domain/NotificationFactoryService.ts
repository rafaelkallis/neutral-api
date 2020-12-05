import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ReadonlyProject } from 'project/domain/project/Project';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { ReadonlyRole } from 'project/domain/role/Role';
import { Notification } from 'notification/domain/Notification';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { UserId } from 'user/domain/value-objects/UserId';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';

@Injectable()
export class NotificationFactoryService {
  /**
   *
   */
  public createNewAssignmentNotification(
    project: ReadonlyProject,
    role: ReadonlyRole,
  ): Notification {
    if (!role.assigneeId) {
      throw new Error('role has no assignment');
    }
    const ownerId = role.assigneeId;
    const type = NotificationType.NEW_ASSIGNMENT;
    const payload = {
      role: {
        id: role.id.value,
        title: role.title,
      },
      project: {
        id: project.id.value,
        title: project.title.value,
      },
    };
    return this.createNotification(ownerId, type, payload);
  }

  /**
   *
   */
  public createPeerReviewRequestedNotification(
    project: ReadonlyProject,
    role: ReadonlyRole,
  ): Notification {
    if (!role.assigneeId) {
      throw new InternalServerErrorException();
    }
    const ownerId = role.assigneeId;
    const type = NotificationType.PEER_REVIEW_REQUESTED;
    const payload = {
      role: {
        id: role.id.value,
        title: role.title,
      },
      project: {
        id: project.id.value,
        title: project.title.value,
      },
    };
    return this.createNotification(ownerId, type, payload);
  }

  /**
   *
   */
  public createManagerReviewRequestedNotification(
    project: ReadonlyProject,
  ): Notification {
    const ownerId = project.creatorId;
    const type = NotificationType.MANAGER_REVIEW_REQUESTED;
    const payload = {
      project: {
        id: project.id.value,
        title: project.title.value,
      },
    };
    return this.createNotification(ownerId, type, payload);
  }

  /**
   *
   */
  public createMilestoneFinishedNotification(
    project: ReadonlyProject,
    projectMemberId: UserId,
  ): Notification {
    const ownerId = projectMemberId;
    const type = NotificationType.PROJECT_FINISHED;
    const payload = {
      project: {
        id: project.id.value,
        title: project.title.value,
      },
    };
    return this.createNotification(ownerId, type, payload);
  }

  private createNotification(
    ownerId: UserId,
    type: NotificationType,
    payload: object,
  ): Notification {
    const id = NotificationId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const isRead = NotificationIsRead.from(false);
    return Notification.of(
      id,
      createdAt,
      updatedAt,
      ownerId,
      type,
      isRead,
      payload,
    );
  }
}
