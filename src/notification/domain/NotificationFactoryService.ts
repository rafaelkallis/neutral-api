import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Project } from 'project/domain/project/Project';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { Role } from 'project/domain/role/Role';
import {
  Notification,
  ReadonlyNotification,
} from 'notification/domain/Notification';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { UserId } from 'user/domain/value-objects/UserId';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { AggregateRootFactory } from 'shared/application/AggregateRootFactory';

export interface CreateNotificationContext {
  readonly ownerId: UserId;
  readonly type: NotificationType;
  readonly payload: object;
}

@Injectable()
export class NotificationFactoryService extends AggregateRootFactory<
  CreateNotificationContext,
  NotificationId,
  ReadonlyNotification
> {
  /**
   *
   */
  public createNewAssignmentNotification(
    project: Project,
    role: Role,
  ): ReadonlyNotification {
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
    return this.create({ ownerId, type, payload });
  }

  /**
   *
   */
  public createPeerReviewRequestedNotification(
    project: Project,
    role: Role,
  ): ReadonlyNotification {
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
    return this.create({ ownerId, type, payload });
  }

  /**
   *
   */
  public createManagerReviewRequestedNotification(
    project: Project,
  ): ReadonlyNotification {
    const ownerId = project.creatorId;
    const type = NotificationType.MANAGER_REVIEW_REQUESTED;
    const payload = {
      project: {
        id: project.id.value,
        title: project.title.value,
      },
    };
    return this.create({ ownerId, type, payload });
  }

  /**
   *
   */
  public createProjectFinishedNotification(
    project: Project,
    projectMemberId: UserId,
  ): ReadonlyNotification {
    const ownerId = projectMemberId;
    const type = NotificationType.PROJECT_FINISHED;
    const payload = {
      project: {
        id: project.id.value,
        title: project.title.value,
      },
    };
    return this.create({ ownerId, type, payload });
  }

  protected doCreate({
    ownerId,
    type,
    payload,
  }: CreateNotificationContext): ReadonlyNotification {
    const id = NotificationId.create();
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
