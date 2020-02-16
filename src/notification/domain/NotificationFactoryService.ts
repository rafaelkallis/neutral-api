import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProjectModel } from 'project/domain/ProjectModel';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { RoleModel } from 'role/domain/RoleModel';
import { Id } from 'common/domain/value-objects/Id';
import { NotificationModel } from 'notification/domain/NotificationModel';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';

@Injectable()
export class NotificationFactoryService {
  /**
   *
   */
  public createNewAssignmentNotification(
    project: ProjectModel,
    role: RoleModel,
  ): NotificationModel {
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
    project: ProjectModel,
    role: RoleModel,
  ): NotificationModel {
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
    project: ProjectModel,
  ): NotificationModel {
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
    project: ProjectModel,
    projectMemberId: Id,
  ): NotificationModel {
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
  ): NotificationModel {
    const id = Id.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const isRead = NotificationIsRead.from(false);
    return new NotificationModel(
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
