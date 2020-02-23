import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Project } from 'project/domain/Project';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { Role } from 'project/domain/Role';
import { Id } from 'common/domain/value-objects/Id';
import { Notification } from 'notification/domain/Notification';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';

@Injectable()
export class NotificationFactoryService {
  /**
   *
   */
  public createNewAssignmentNotification(
    project: Project,
    role: Role,
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
    project: Project,
    role: Role,
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
    project: Project,
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
  public createProjectFinishedNotification(
    project: Project,
    projectMemberId: Id,
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
    ownerId: Id,
    type: NotificationType,
    payload: object,
  ): Notification {
    const id = Id.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const isRead = NotificationIsRead.from(false);
    return new Notification(
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
