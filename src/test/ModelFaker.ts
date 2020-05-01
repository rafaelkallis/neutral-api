import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { User } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Project } from 'project/domain/project/Project';
import { ContributionVisibility } from 'project/domain/project/value-objects/ContributionVisibility';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { NotificationIsRead } from 'notification/domain/value-objects/NotificationIsRead';
import { Role } from 'project/domain/role/Role';
import { PeerReview } from 'project/domain/peer-review/PeerReview';
import { RoleCollection } from 'project/domain/role/RoleCollection';
import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { HasSubmittedPeerReviews } from 'project/domain/role/value-objects/HasSubmittedPeerReviews';
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { Notification } from 'notification/domain/Notification';
import { UserId } from 'user/domain/value-objects/UserId';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { ProjectFormation } from 'project/domain/project/value-objects/states/ProjectFormation';
import { ReviewTopicCollection } from 'project/domain/review-topic/ReviewTopicCollection';
import { ActiveState } from 'user/domain/value-objects/states/ActiveState';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';

export class ModelFaker {
  private readonly primitiveFaker: PrimitiveFaker;

  public constructor(primitiveFaker: PrimitiveFaker = new PrimitiveFaker()) {
    this.primitiveFaker = primitiveFaker;
  }

  /**
   * Create fake user
   */
  public user(): User {
    const id = UserId.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const email = Email.from(this.primitiveFaker.email());
    const name = Name.from(
      this.primitiveFaker.word(),
      this.primitiveFaker.word(),
    );
    const avatar = null;
    const state = ActiveState.getInstance();
    const lastLoginAt = LastLoginAt.from(
      this.primitiveFaker.timestampUnixMillis(),
    );
    return new User(
      id,
      createdAt,
      updatedAt,
      email,
      name,
      avatar,
      state,
      lastLoginAt,
    );
  }

  /**
   * Create fake project
   */
  public project(creatorId: UserId): Project {
    const id = ProjectId.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const title = ProjectTitle.from(this.primitiveFaker.words());
    const description = ProjectDescription.from(
      this.primitiveFaker.paragraph(),
    );
    const state = ProjectFormation.INSTANCE;
    const consensuality = null;
    const contributionVisibility = ContributionVisibility.SELF;
    const skipManagerReview = SkipManagerReview.NO;
    return new Project(
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
      new RoleCollection([]),
      new PeerReviewCollection([]),
      new ReviewTopicCollection([]),
      new ContributionCollection([]),
    );
  }

  /**
   * Create a fake role
   */
  public role(assigneeId: UserId | null = null): Role {
    const id = RoleId.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const title = RoleTitle.from(this.primitiveFaker.words());
    const description = RoleDescription.from(this.primitiveFaker.paragraph());
    const contribution = null;
    const hasSubmittedPeerReviews = HasSubmittedPeerReviews.from(false);
    return new Role(
      id,
      createdAt,
      updatedAt,
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
  public peerReview(senderRoleId: RoleId, receiverRoleId: RoleId): PeerReview {
    const id = PeerReviewId.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const score = PeerReviewScore.from(PeerReviewScore.EPSILON);
    return new PeerReview(
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
  public notification(ownerId: UserId): Notification {
    const id = NotificationId.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const type = NotificationType.NEW_ASSIGNMENT;
    const isRead = NotificationIsRead.from(false);
    const payload = {};
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
