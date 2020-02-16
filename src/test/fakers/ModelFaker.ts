import { RoleModel, PeerReviewModel } from 'role';
import { NotificationModel, NotificationType } from 'notification';
import { PrimitiveFaker } from 'test';
import { UserModel } from 'user/domain/UserModel';
import { Email } from 'user/domain/value-objects/Email';
import { Id } from 'common/domain/value-objects/Id';
import { Name } from 'user/domain/value-objects/Name';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { ProjectModel } from 'project/domain/ProjectModel';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';

export class ModelFaker {
  private readonly primitiveFaker: PrimitiveFaker;

  public constructor(primitiveFaker: PrimitiveFaker = new PrimitiveFaker()) {
    this.primitiveFaker = primitiveFaker;
  }

  /**
   * Create fake user
   */
  public user(): UserModel {
    const id = Id.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const email = Email.from(this.primitiveFaker.email());
    const name = Name.from(
      this.primitiveFaker.word(),
      this.primitiveFaker.word(),
    );
    const lastLoginAt = LastLoginAt.from(
      this.primitiveFaker.timestampUnixMillis(),
    );
    return new UserModel(id, createdAt, updatedAt, email, name, lastLoginAt);
  }

  /**
   * Create fake project
   */
  public project(creatorId: Id): ProjectModel {
    const id = Id.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const title = ProjectTitle.from(this.primitiveFaker.words());
    const description = ProjectDescription.from(
      this.primitiveFaker.paragraph(),
    );
    const state = ProjectState.FORMATION;
    const consensuality = null;
    const contributionVisibility = ContributionVisibility.SELF;
    const skipManagerReview = SkipManagerReview.IF_CONSENSUAL;
    return new ProjectModel(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      creatorId,
      state,
      consensuality,
      contributionVisibility,
      skipManagerReview,
      [],
    );
  }

  /**
   * Create a fake role
   */
  public role(projectId: Id, assigneeId: Id | null = null): RoleModel {
    const id = Id.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const title = this.primitiveFaker.words();
    const description = this.primitiveFaker.paragraph();
    const contribution = null;
    const hasSubmittedPeerReviews = false;
    return new RoleModel(
      id,
      createdAt,
      updatedAt,
      projectId,
      assigneeId,
      title,
      description,
      contribution,
      hasSubmittedPeerReviews,
    );
  }

  /**
   * Create a fake peer review
   */
  public peerReview(senderRoleId: Id, receiverRoleId: Id): PeerReviewModel {
    const id = Id.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const score = this.primitiveFaker.number();
    return new PeerReviewModel(
      id,
      createdAt,
      updatedAt,
      senderRoleId,
      receiverRoleId,
      score,
    );
  }

  /**
   * Create a fake notification
   */
  public notification(ownerId: Id): NotificationModel {
    const id = Id.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const type = NotificationType.NEW_ASSIGNMENT;
    const isRead = NotificationIsRead.from(false);
    const payload = {};
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
