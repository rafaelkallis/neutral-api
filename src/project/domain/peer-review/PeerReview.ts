import { Model, ReadonlyModel } from 'shared/domain/Model';
import { Role, ReadonlyRole } from 'project/domain/role/Role';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { SelfPeerReviewException } from 'project/domain/exceptions/SelfPeerReviewException';
import { PeerReviewId } from 'project/domain/peer-review/value-objects/PeerReviewId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { ReviewTopicId } from 'project/domain/review-topic/value-objects/ReviewTopicId';
import { Class } from 'shared/domain/Class';
import { PeerReviewFlag } from './value-objects/PeerReviewFlag';
import {
  Milestone,
  ReadonlyMilestone,
} from 'project/domain/milestone/Milestone';
import { MilestoneId } from 'project/domain/milestone/value-objects/MilestoneId';
import { Project, ReadonlyProject } from 'project/domain/project/Project';

export interface ReadonlyPeerReview extends ReadonlyModel<PeerReviewId> {
  readonly senderRoleId: RoleId;
  readonly receiverRoleId: RoleId;
  readonly reviewTopicId: ReviewTopicId;
  readonly milestone: ReadonlyMilestone;
  readonly score: PeerReviewScore;
  readonly flag: PeerReviewFlag;

  readonly project: ReadonlyProject;

  isSenderRole(roleOrRoleId: ReadonlyRole | RoleId): boolean;
  isReceiverRole(roleOrRoleId: ReadonlyRole | RoleId): boolean;
}

/**
 * Peer Review
 */
export class PeerReview
  extends Model<PeerReviewId>
  implements ReadonlyPeerReview {
  public senderRoleId: RoleId;
  public receiverRoleId: RoleId;
  public reviewTopicId: ReviewTopicId;
  private readonly milestoneId: MilestoneId;
  public score: PeerReviewScore;
  public flag: PeerReviewFlag;

  public get milestone(): Milestone {
    return this.project.milestones.whereId(this.milestoneId);
  }

  public readonly project: Project;

  public constructor(
    id: PeerReviewId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    senderRoleId: RoleId,
    receiverRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
    milestoneId: MilestoneId,
    score: PeerReviewScore,
    flag: PeerReviewFlag,
    project: Project,
  ) {
    super(id, createdAt, updatedAt);
    this.senderRoleId = senderRoleId;
    this.receiverRoleId = receiverRoleId;
    this.reviewTopicId = reviewTopicId;
    this.milestoneId = milestoneId;
    this.score = score;
    this.flag = flag;
    this.project = project;
    this.assertNoSelfReview();
  }

  public static create(
    senderRoleId: RoleId,
    receiverRoleId: RoleId,
    reviewTopicId: ReviewTopicId,
    milestoneId: MilestoneId,
    score: PeerReviewScore,
    flag: PeerReviewFlag,
    project: Project,
  ): PeerReview {
    const peerReviewId = PeerReviewId.create();
    const peerReviewCreatedAt = CreatedAt.now();
    const peerReviewUpdatedAt = UpdatedAt.now();
    return new PeerReview(
      peerReviewId,
      peerReviewCreatedAt,
      peerReviewUpdatedAt,
      senderRoleId,
      receiverRoleId,
      reviewTopicId,
      milestoneId,
      score,
      flag,
      project,
    );
  }

  public isSenderRole(roleOrRoleId: Role | RoleId): boolean {
    const roleId =
      roleOrRoleId instanceof Role ? roleOrRoleId.id : roleOrRoleId;
    return this.senderRoleId.equals(roleId);
  }

  public isReceiverRole(roleOrRoleId: Role | RoleId): boolean {
    const roleId =
      roleOrRoleId instanceof Role ? roleOrRoleId.id : roleOrRoleId;
    return this.receiverRoleId.equals(roleId);
  }

  protected assertNoSelfReview(): void {
    if (this.senderRoleId.equals(this.receiverRoleId)) {
      throw new SelfPeerReviewException();
    }
  }

  public getClass(): Class<PeerReview> {
    return PeerReview;
  }
}
