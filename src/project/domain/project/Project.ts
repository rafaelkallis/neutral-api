import { User, ReadonlyUser } from 'user/domain/User';
import {
  AggregateRoot,
  ReadonlyAggregateRoot,
} from 'shared/domain/AggregateRoot';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';
import { ContributionVisibility } from 'project/domain/project/value-objects/ContributionVisibility';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { ProjectTitle } from 'project/domain/project/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/project/value-objects/ProjectDescription';
import { ReadonlyRole } from 'project/domain/role/Role';
import {
  RoleCollection,
  ReadonlyRoleCollection,
} from 'project/domain/role/RoleCollection';
import {
  PeerReviewCollection,
  ReadonlyPeerReviewCollection,
} from 'project/domain/peer-review/PeerReviewCollection';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { PeerReviewScore } from 'project/domain/peer-review/value-objects/PeerReviewScore';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';
import { UserNotProjectCreatorException } from 'project/domain/exceptions/UserNotProjectCreatorException';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { RoleId } from 'project/domain/role/value-objects/RoleId';
import {
  ReadonlyReviewTopicCollection,
  ReviewTopicCollection,
} from 'project/domain/review-topic/ReviewTopicCollection';
import {
  ReadonlyContributionCollection,
  ContributionCollection,
} from 'project/domain/contribution/ContributionCollection';

export interface CreateProjectOptions {
  title: ProjectTitle;
  description: ProjectDescription;
  creator: User;
  contributionVisibility?: ContributionVisibility;
  skipManagerReview?: SkipManagerReview;
}

export interface ReadonlyProject extends ReadonlyAggregateRoot<ProjectId> {
  readonly title: ProjectTitle;
  readonly description: ProjectDescription;
  readonly creatorId: UserId;
  readonly state: ProjectState;
  readonly consensuality: Consensuality | null;
  readonly contributionVisibility: ContributionVisibility;
  readonly skipManagerReview: SkipManagerReview;
  readonly roles: ReadonlyRoleCollection;
  readonly peerReviews: ReadonlyPeerReviewCollection;
  readonly reviewTopics: ReadonlyReviewTopicCollection;
  readonly contributions: ReadonlyContributionCollection;

  update(title?: ProjectTitle, description?: ProjectDescription): void;

  addRole(title: RoleTitle, description: RoleDescription): ReadonlyRole;
  updateRole(
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void;
  removeRole(roleId: RoleId): void;
  assignUserToRole(userToAssign: ReadonlyUser, roleId: RoleId): void;
  unassignRole(roleId: RoleId): void;

  finishFormation(): void;
  submitPeerReviews(
    senderRoleId: RoleId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void;
  submitManagerReview(): void;
  archive(): void;
  cancel(): void;
  isCreator(user: ReadonlyUser): boolean;
  assertCreator(user: ReadonlyUser): void;
}

/**
 * Project Model
 */
export class Project extends AggregateRoot<ProjectId>
  implements ReadonlyProject {
  public title: ProjectTitle;
  public description: ProjectDescription;
  public readonly creatorId: UserId;
  public state: ProjectState;
  public consensuality: Consensuality | null;
  public contributionVisibility: ContributionVisibility;
  public skipManagerReview: SkipManagerReview;
  public roles: RoleCollection;
  public peerReviews: PeerReviewCollection;
  public reviewTopics: ReviewTopicCollection;
  public contributions: ContributionCollection;

  public constructor(
    id: ProjectId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ProjectTitle,
    description: ProjectDescription,
    creatorId: UserId,
    state: ProjectState,
    consensuality: Consensuality | null,
    contributionVisibility: ContributionVisibility,
    skipManagerReview: SkipManagerReview,
    roles: RoleCollection,
    peerReviews: PeerReviewCollection,
    reviewTopics: ReviewTopicCollection,
    contributions: ContributionCollection,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.creatorId = creatorId;
    this.state = state;
    this.consensuality = consensuality;
    this.contributionVisibility = contributionVisibility;
    this.skipManagerReview = skipManagerReview;
    this.roles = roles;
    this.peerReviews = peerReviews;
    this.reviewTopics = reviewTopics;
    this.contributions = contributions;
  }

  /**
   *
   */
  public update(title?: ProjectTitle, description?: ProjectDescription): void {
    this.state.update(this, title, description);
  }

  /**
   *
   */
  public addRole(title: RoleTitle, description: RoleDescription): ReadonlyRole {
    return this.state.addRole(this, title, description);
  }

  /**
   * Update a role
   */
  public updateRole(
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    this.state.updateRole(this, roleId, title, description);
  }

  /**
   * Remove a role
   */
  public removeRole(roleId: RoleId): void {
    this.state.removeRole(this, roleId);
  }

  /**
   * Assigns a user to a role
   */
  public assignUserToRole(userToAssign: ReadonlyUser, roleId: RoleId): void {
    this.state.assignUserToRole(this, userToAssign, roleId);
  }

  /**
   * Unassign a role.
   * @param roleId The roleId to unassign.
   */
  public unassignRole(roleId: RoleId): void {
    this.state.unassign(this, roleId);
  }

  /**
   * Finish project formation
   */
  public finishFormation(): void {
    this.state.finishFormation(this);
  }

  /**
   * Cancel the project.
   */
  public cancel(): void {
    this.state.cancel(this);
  }

  /**
   *
   */
  public submitPeerReviews(
    senderRoleId: RoleId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.state.submitPeerReviews(
      this,
      senderRoleId,
      submittedPeerReviews,
      contributionsComputer,
      consensualityComputer,
    );
  }

  /**
   *
   */
  public archive(): void {
    this.state.archive(this);
  }

  /**
   * Submit the manager review.
   */
  public submitManagerReview(): void {
    this.state.submitManagerReview(this);
  }

  public isCreator(user: ReadonlyUser): boolean {
    return this.creatorId.equals(user.id);
  }

  public assertCreator(user: ReadonlyUser): void {
    if (!this.isCreator(user)) {
      throw new UserNotProjectCreatorException();
    }
  }
}
