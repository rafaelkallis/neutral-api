import { ObjectFaker } from 'test/fakers/object-faker';
import { ProjectEntity } from 'project';
import { UserEntity } from 'user';
import { RoleEntity, PeerReviewEntity } from 'role';
import { NotificationEntity } from 'notification';

export class EntityFaker {
  private readonly objectFaker: ObjectFaker;

  public constructor(objectFaker: ObjectFaker = new ObjectFaker()) {
    this.objectFaker = objectFaker;
  }

  /**
   * Create fake user
   */
  public user(): UserEntity {
    return UserEntity.fromUser(this.objectFaker.user());
  }

  /**
   * Create fake project
   */
  public project(ownerId: string): ProjectEntity {
    return ProjectEntity.fromProject(this.objectFaker.project(ownerId));
  }

  /**
   * Create a fake role
   */
  public role(projectId: string, assigneeId: string | null = null): RoleEntity {
    return RoleEntity.fromRole(this.objectFaker.role(projectId, assigneeId));
  }

  /**
   * Create a fake peer review
   */
  public peerReview(
    senderRoleId: string,
    receiverRoleId: string,
  ): PeerReviewEntity {
    return PeerReviewEntity.fromPeerReview(
      this.objectFaker.peerReview(senderRoleId, receiverRoleId),
    );
  }

  /**
   * Create a fake notification
   */
  public notification(ownerId: string): NotificationEntity {
    return NotificationEntity.fromNotification(
      this.objectFaker.notification(ownerId),
    );
  }
}
