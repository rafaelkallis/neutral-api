import { ReadonlyUser } from 'user/domain/User';
import {
  AggregateRoot,
  ReadonlyAggregateRoot,
} from 'shared/domain/AggregateRoot';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/project/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/project/value-objects/states/ProjectState';
import { ContributionVisibility } from 'project/domain/project/value-objects/ContributionVisibility';
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
import { ReviewTopicTitle } from '../review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from '../review-topic/value-objects/ReviewTopicDescription';
import { ReadonlyReviewTopic } from '../review-topic/ReviewTopic';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { ReadonlyUserCollection } from 'user/domain/UserCollection';
import { Class } from 'shared/domain/Class';
import { ReviewTopicInput } from '../review-topic/ReviewTopicInput';

export interface ReadonlyProject extends ReadonlyAggregateRoot<ProjectId> {
  readonly title: ProjectTitle;
  readonly description: ProjectDescription;
  readonly creatorId: UserId;
  readonly state: ProjectState;
  readonly contributionVisibility: ContributionVisibility;
  readonly skipManagerReview: SkipManagerReview;
  readonly roles: ReadonlyRoleCollection;
  readonly peerReviews: ReadonlyPeerReviewCollection;
  readonly reviewTopics: ReadonlyReviewTopicCollection;
  readonly contributions: ReadonlyContributionCollection;

  isConsensual(): boolean;

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

  addReviewTopic(
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
    input: ReviewTopicInput,
  ): ReadonlyReviewTopic;
  updateReviewTopic(
    reviewTopicId: ReviewTopicId,
    title?: ReviewTopicTitle,
    description?: ReviewTopicDescription,
    input?: ReviewTopicInput,
  ): void;
  removeReviewTopic(reviewTopicId: ReviewTopicId): void;

  finishFormation(assignees: ReadonlyUserCollection): void;
  submitPeerReviews(
    peerReviews: ReadonlyPeerReviewCollection,
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
export abstract class Project extends AggregateRoot<ProjectId>
  implements ReadonlyProject {
  public abstract readonly title: ProjectTitle;
  public abstract readonly description: ProjectDescription;
  public abstract readonly creatorId: UserId;
  public abstract readonly state: ProjectState;
  public abstract readonly contributionVisibility: ContributionVisibility;
  public abstract readonly skipManagerReview: SkipManagerReview;
  public abstract readonly roles: RoleCollection;
  public abstract readonly peerReviews: PeerReviewCollection;
  public abstract readonly reviewTopics: ReviewTopicCollection;
  public abstract readonly contributions: ContributionCollection;

  public static of(
    id: ProjectId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ProjectTitle,
    description: ProjectDescription,
    creatorId: UserId,
    state: ProjectState,
    contributionVisibility: ContributionVisibility,
    skipManagerReview: SkipManagerReview,
    roles: RoleCollection,
    peerReviews: PeerReviewCollection,
    reviewTopics: ReviewTopicCollection,
    contributions: ContributionCollection,
  ): Project {
    return new InternalProject(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      creatorId,
      state,
      contributionVisibility,
      skipManagerReview,
      roles,
      peerReviews,
      reviewTopics,
      contributions,
    );
  }

  public isConsensual(): boolean {
    return this.reviewTopics.areAll((topic) => topic.isConsensual());
  }

  /**
   *
   */
  public abstract update(
    title?: ProjectTitle,
    description?: ProjectDescription,
  ): void;

  /**
   *
   */
  public abstract addRole(
    title: RoleTitle,
    description: RoleDescription,
  ): ReadonlyRole;

  /**
   * Update a role
   */
  public abstract updateRole(
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void;

  /**
   * Remove a role
   */
  public abstract removeRole(roleId: RoleId): void;

  /**
   * Assigns a user to a role
   */
  public abstract assignUserToRole(
    userToAssign: ReadonlyUser,
    roleId: RoleId,
  ): void;

  /**
   * Unassign a role.
   * @param roleId The roleId to unassign.
   */
  public abstract unassignRole(roleId: RoleId): void;

  public abstract addReviewTopic(
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
    input: ReviewTopicInput,
  ): ReadonlyReviewTopic;

  public abstract updateReviewTopic(
    reviewTopicId: ReviewTopicId,
    title?: ReviewTopicTitle,
    description?: ReviewTopicDescription,
    input?: ReviewTopicInput,
  ): void;

  public abstract removeReviewTopic(reviewTopicId: ReviewTopicId): void;

  /**
   * Finish project formation
   */
  public abstract finishFormation(assignees: ReadonlyUserCollection): void;

  /**
   * Cancel the project.
   */
  public abstract cancel(): void;

  /**
   *
   */
  public abstract submitPeerReviews(
    peerReviews: ReadonlyPeerReviewCollection,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void;

  public abstract complete(
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void;

  /**
   *
   */
  public abstract archive(): void;

  /**
   * Submit the manager review.
   */
  public abstract submitManagerReview(): void;

  public isCreator(user: ReadonlyUser): boolean {
    return this.creatorId.equals(user.id);
  }

  public assertCreator(user: ReadonlyUser): void {
    if (!this.isCreator(user)) {
      throw new UserNotProjectCreatorException();
    }
  }

  public getClass(): Class<Project> {
    return Project;
  }
}

export class InternalProject extends Project {
  public title: ProjectTitle;
  public description: ProjectDescription;
  public readonly creatorId: UserId;
  public state: ProjectState;
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

  public addReviewTopic(
    title: ReviewTopicTitle,
    description: ReviewTopicDescription,
    input: ReviewTopicInput,
  ): ReadonlyReviewTopic {
    return this.state.addReviewTopic(this, title, description, input);
  }

  public updateReviewTopic(
    reviewTopicId: ReviewTopicId,
    title?: ReviewTopicTitle,
    description?: ReviewTopicDescription,
    input?: ReviewTopicInput,
  ): void {
    this.state.updateReviewTopic(
      this,
      reviewTopicId,
      title,
      description,
      input,
    );
  }

  public removeReviewTopic(reviewTopicId: ReviewTopicId): void {
    this.state.removeReviewTopic(this, reviewTopicId);
  }

  /**
   * Finish project formation
   */
  public finishFormation(assignees: ReadonlyUserCollection): void {
    this.state.finishFormation(this, assignees);
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
    peerReviews: ReadonlyPeerReviewCollection,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.state.submitPeerReviews(
      this,
      peerReviews,
      contributionsComputer,
      consensualityComputer,
    );
  }

  public complete(
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.state.complete(this, contributionsComputer, consensualityComputer);
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

  public getClass(): Class<Project> {
    return Project;
  }
}
