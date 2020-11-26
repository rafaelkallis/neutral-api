import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { InternalUser } from 'user/domain/User';
import { Email } from 'user/domain/value-objects/Email';
import { Name } from 'user/domain/value-objects/Name';
import { LastLoginAt } from 'user/domain/value-objects/LastLoginAt';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { Project } from 'project/domain/project/Project';
import { SelfContributionVisiblity } from 'project/domain/project/value-objects/ContributionVisibility';
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
import { NotificationType } from 'notification/domain/value-objects/NotificationType';
import { Notification } from 'notification/domain/Notification';
import { UserId } from 'user/domain/value-objects/UserId';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { NotificationId } from 'notification/domain/value-objects/NotificationId';
import { ReviewTopicCollection } from 'project/domain/review-topic/ReviewTopicCollection';
import { ActiveState } from 'user/domain/value-objects/states/ActiveState';
import { ContributionCollection } from 'project/domain/contribution/ContributionCollection';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { ReviewTopicTitle } from 'project/domain/review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from 'project/domain/review-topic/value-objects/ReviewTopicDescription';
import { ContinuousReviewTopicInput } from 'project/domain/review-topic/ReviewTopicInput';
import { PeerReviewFlag } from 'project/domain/peer-review/value-objects/PeerReviewFlag';
import { PeerReviewVisibility } from 'project/domain/project/value-objects/PeerReviewVisibility';
import { Organization } from 'organization/domain/Organization';
import { ValueObjectFaker } from './ValueObjectFaker';
import { MilestoneCollection } from 'project/domain/milestone/MilestoneCollection';
import { FormationProjectState } from 'project/domain/project/value-objects/states/FormationProjectState';
import { Milestone } from 'project/domain/milestone/Milestone';
import { MilestoneId } from 'project/domain/milestone/value-objects/MilestoneId';
import { MilestoneTitle } from 'project/domain/milestone/value-objects/MilestoneTitle';
import { MilestoneDescription } from 'project/domain/milestone/value-objects/MilestoneDescription';
import { PeerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/PeerReviewMilestoneState';

export class ModelFaker {
  private readonly primitiveFaker: PrimitiveFaker;
  private readonly valueObjectFaker: ValueObjectFaker;

  public constructor(
    primitiveFaker: PrimitiveFaker = new PrimitiveFaker(),
    valueObjectFaker: ValueObjectFaker = new ValueObjectFaker(),
  ) {
    this.primitiveFaker = primitiveFaker;
    this.valueObjectFaker = valueObjectFaker;
  }

  /**
   * Create fake user
   */
  public user(): InternalUser {
    // TODO User return type
    const id = UserId.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const email = Email.of(this.primitiveFaker.email());
    const name = Name.from(
      this.primitiveFaker.word(),
      this.primitiveFaker.word(),
    );
    const avatar = null;
    const state = ActiveState.getInstance();
    const lastLoginAt = LastLoginAt.from(
      this.primitiveFaker.timestampUnixMillis(),
    );
    return new InternalUser(
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
    const state = FormationProjectState.INSTANCE;
    const contributionVisibility = SelfContributionVisiblity.INSTANCE;
    const peerReviewVisibility = PeerReviewVisibility.MANAGER;
    const skipManagerReview = SkipManagerReview.NO;
    return Project.of(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      {},
      creatorId,
      state,
      contributionVisibility,
      peerReviewVisibility,
      skipManagerReview,
      new RoleCollection([]),
      PeerReviewCollection.empty(),
      new ReviewTopicCollection([]),
      new ContributionCollection([]),
      new MilestoneCollection([]),
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
    return new Role(id, createdAt, updatedAt, assigneeId, title, description);
  }

  public reviewTopic(): ReviewTopic {
    const id = ReviewTopicId.create();
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const title = ReviewTopicTitle.from(this.primitiveFaker.words());
    const description = ReviewTopicDescription.from(
      this.primitiveFaker.paragraph(),
    );
    const input = ContinuousReviewTopicInput.of(1, 10);
    return new ReviewTopic(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      input,
      null,
    );
  }

  public milestone(project: Project): Milestone {
    const id = MilestoneId.create();
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const title = MilestoneTitle.from(this.primitiveFaker.words());
    const description = MilestoneDescription.from(
      this.primitiveFaker.paragraph(),
    );
    const state = PeerReviewMilestoneState.INSTANCE;
    return Milestone.of(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      state,
      project,
    );
  }

  /**
   * Create a fake peer review
   */
  public peerReview(
    senderRoleId: RoleId,
    receiverRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
    milestoneId: MilestoneId,
    project: Project,
  ): PeerReview {
    const id = PeerReviewId.from(this.primitiveFaker.id());
    const createdAt = CreatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const updatedAt = UpdatedAt.from(this.primitiveFaker.timestampUnixMillis());
    const score = PeerReviewScore.of(0);
    return new PeerReview(
      id,
      createdAt,
      updatedAt,
      senderRoleId,
      receiverRoleId,
      reviewTopicId,
      milestoneId,
      score,
      PeerReviewFlag.NONE,
      project,
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

  public organization(ownerId: UserId): Organization {
    const name = this.valueObjectFaker.organization.name();
    return Organization.create({
      name,
      ownerId,
    });
  }
}
