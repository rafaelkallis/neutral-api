import { Model } from 'shared/domain/Model';
import { Project } from 'project/domain/Project';
import { User } from 'user/domain/User';
import { Id } from 'shared/domain/value-objects/Id';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { Contribution } from 'project/domain/value-objects/Contribution';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { PeerReviewsAlreadySubmittedException } from 'project/domain/exceptions/PeerReviewsAlreadySubmittedException';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';

/**
 * Role
 */
export class Role extends Model<RoleId> {
  public projectId: ProjectId;
  public assigneeId: UserId | null;
  public title: RoleTitle;
  public description: RoleDescription;
  public contribution: Contribution | null;
  public hasSubmittedPeerReviews: HasSubmittedPeerReviews;

  public constructor(
    id: RoleId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    projectId: ProjectId,
    assigneeId: UserId | null,
    title: RoleTitle,
    description: RoleDescription,
    contribution: Contribution | null,
    hasSubmittedPeerReviews: HasSubmittedPeerReviews,
  ) {
    super(id, createdAt, updatedAt);
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.title = title;
    this.description = description;
    this.contribution = contribution;
    this.hasSubmittedPeerReviews = hasSubmittedPeerReviews;
  }

  /**
   *
   */
  public static from(
    projectId: ProjectId,
    title: RoleTitle,
    description: RoleDescription,
  ): Role {
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
      projectId,
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

  public assertAssigned(): void {
    if (!this.isAssigned()) {
      throw new RoleNoUserAssignedException();
    }
  }

  public isAssignedToUser(userOrUserId: User | Id): boolean {
    const userId =
      userOrUserId instanceof User ? userOrUserId.id : userOrUserId;
    return this.assigneeId ? this.assigneeId.equals(userId) : false;
  }

  public belongsToProject(project: Project): boolean {
    return this.projectId === project.id;
  }

  public assertHasNotSubmittedPeerReviews(): void {
    if (this.hasSubmittedPeerReviews.value) {
      throw new PeerReviewsAlreadySubmittedException();
    }
  }
}
