import { Model, ReadonlyModel } from 'shared/domain/Model';
import { ReadonlyUser } from 'user/domain/User';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { Contribution } from 'project/domain/role/value-objects/Contribution';
import { HasSubmittedPeerReviews } from 'project/domain/role/value-objects/HasSubmittedPeerReviews';
import { PeerReviewsAlreadySubmittedException } from 'project/domain/exceptions/PeerReviewsAlreadySubmittedException';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';

export interface ReadonlyRole extends ReadonlyModel<RoleId> {
  readonly assigneeId: UserId | null;
  readonly title: RoleTitle;
  readonly description: RoleDescription;
  readonly contribution: Contribution | null;
  readonly hasSubmittedPeerReviews: HasSubmittedPeerReviews;
}

/**
 * Role
 */
export class Role extends Model<RoleId> implements ReadonlyRole {
  public assigneeId: UserId | null;
  public title: RoleTitle;
  public description: RoleDescription;
  public contribution: Contribution | null;
  public hasSubmittedPeerReviews: HasSubmittedPeerReviews;

  public constructor(
    id: RoleId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    assigneeId: UserId | null,
    title: RoleTitle,
    description: RoleDescription,
    contribution: Contribution | null,
    hasSubmittedPeerReviews: HasSubmittedPeerReviews,
  ) {
    super(id, createdAt, updatedAt);
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.hasSubmittedPeerReviews = hasSubmittedPeerReviews;
  }

  /**
   *
   */
  public static from(title: RoleTitle, description: RoleDescription): Role {
    const id = RoleId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const assigneeId = null;
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

  public isAssigned(): boolean {
    return Boolean(this.assigneeId);
  }

  public assertAssigned(): UserId {
    if (!this.assigneeId) {
      throw new RoleNoUserAssignedException();
    }
    return this.assigneeId;
  }

  public isAssignedToUser(userOrUserId: ReadonlyUser | UserId): boolean {
    const userId =
      userOrUserId instanceof UserId ? userOrUserId : userOrUserId.id;
    return this.assigneeId ? this.assigneeId.equals(userId) : false;
  }

  public assertHasNotSubmittedPeerReviews(): void {
    if (this.hasSubmittedPeerReviews.value) {
      throw new PeerReviewsAlreadySubmittedException();
    }
  }
}
