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
import { ReviewTopicTitle } from '../review-topic/value-objects/ReviewTopicTitle';
import { ReviewTopicDescription } from '../review-topic/value-objects/ReviewTopicDescription';
import { ReadonlyReviewTopic } from '../review-topic/ReviewTopic';
import { ReviewTopicId } from '../review-topic/value-objects/ReviewTopicId';
import { Class } from 'shared/domain/Class';
import { ReviewTopicInput } from '../review-topic/ReviewTopicInput';
import { PeerReviewVisibility } from './value-objects/PeerReviewVisibility';
import {
  MilestoneCollection,
  ReadonlyMilestoneCollection,
} from '../milestone/MilestoneCollection';
import { MilestoneTitle } from '../milestone/value-objects/MilestoneTitle';
import { MilestoneDescription } from '../milestone/value-objects/MilestoneDescription';
import { Milestone, ReadonlyMilestone } from '../milestone/Milestone';
import { ProjectAnalyzer } from '../ProjectAnalyzer';
import {
  RoleMetricCollection,
  ReadonlyRoleMetricCollection,
} from '../role-metric/RoleMetricCollection';
import { DomainException } from 'shared/domain/exceptions/DomainException';
import {
  MilestoneMetricCollection,
  ReadonlyMilestoneMetricCollection,
} from '../milestone-metric/MilestoneMetricCollection';

export interface ReadonlyProject extends ReadonlyAggregateRoot<ProjectId> {
  readonly title: ProjectTitle;
  readonly description: ProjectDescription;
  readonly meta: Record<string, unknown>;
  readonly creatorId: UserId;
  readonly state: ProjectState;
  readonly contributionVisibility: ContributionVisibility;
  readonly peerReviewVisibility: PeerReviewVisibility;
  readonly skipManagerReview: SkipManagerReview;
  readonly roles: ReadonlyRoleCollection;
  readonly peerReviews: ReadonlyPeerReviewCollection;
  readonly reviewTopics: ReadonlyReviewTopicCollection;
  readonly milestones: ReadonlyMilestoneCollection;
  readonly latestMilestone: ReadonlyMilestone;
  readonly roleMetrics: ReadonlyRoleMetricCollection;
  readonly milestoneMetrics: ReadonlyMilestoneMetricCollection;

  isConsensual(): boolean;
  isCreator(user: ReadonlyUser): boolean;
  assertCreator(user: ReadonlyUser): void;
}

export interface UpdateProjectContext {
  readonly title?: ProjectTitle;
  readonly description?: ProjectDescription;
  readonly meta?: Record<string, unknown>;
  readonly contributionVisibility?: ContributionVisibility;
  readonly peerReviewVisibility?: PeerReviewVisibility;
  readonly skipManagerReview?: SkipManagerReview;
}

/**
 * Project Model
 */
export abstract class Project
  extends AggregateRoot<ProjectId>
  implements ReadonlyProject {
  public abstract readonly title: ProjectTitle;
  public abstract readonly description: ProjectDescription;
  public abstract readonly meta: Record<string, unknown>;
  public abstract readonly creatorId: UserId;
  public abstract readonly state: ProjectState;
  public abstract readonly contributionVisibility: ContributionVisibility;
  public abstract readonly peerReviewVisibility: PeerReviewVisibility;
  public abstract readonly skipManagerReview: SkipManagerReview;
  public abstract readonly roles: RoleCollection;
  public abstract readonly peerReviews: PeerReviewCollection;
  public abstract readonly reviewTopics: ReviewTopicCollection;
  public abstract readonly milestones: MilestoneCollection;
  public abstract readonly roleMetrics: RoleMetricCollection;
  public abstract readonly milestoneMetrics: MilestoneMetricCollection;

  public get latestMilestone(): Milestone {
    return this.milestones.whereLatest();
  }

  public static of(
    id: ProjectId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ProjectTitle,
    description: ProjectDescription,
    meta: Record<string, unknown>,
    creatorId: UserId,
    state: ProjectState,
    contributionVisibility: ContributionVisibility,
    peerReviewVisibility: PeerReviewVisibility,
    skipManagerReview: SkipManagerReview,
    roles: RoleCollection,
    peerReviews: PeerReviewCollection,
    reviewTopics: ReviewTopicCollection,
    milestones: MilestoneCollection,
    roleMetrics: RoleMetricCollection,
    milestoneMetrics: MilestoneMetricCollection,
  ): Project {
    return new InternalProject(
      id,
      createdAt,
      updatedAt,
      title,
      description,
      meta,
      creatorId,
      state,
      contributionVisibility,
      peerReviewVisibility,
      skipManagerReview,
      roles,
      peerReviews,
      reviewTopics,
      milestones,
      roleMetrics,
      milestoneMetrics,
    );
  }

  public isConsensual(): boolean {
    return this.reviewTopics.areAll((topic) => topic.isConsensual());
  }

  /**
   *
   */
  public abstract update(context: UpdateProjectContext): void;

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

  public abstract addMilestone(
    title: MilestoneTitle,
    description: MilestoneDescription,
  ): ReadonlyMilestone;

  /**
   * Finish project formation
   */
  public abstract finishFormation(): void;

  /**
   * Cancel the project.
   */
  public abstract cancel(): void;

  /**
   *
   */
  public abstract submitPeerReviews(
    peerReviews: ReadonlyPeerReviewCollection,
    projectAnalyzer: ProjectAnalyzer,
  ): Promise<void>;

  public abstract completePeerReviews(
    projectAnalyzer: ProjectAnalyzer,
  ): Promise<void>;

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
  public meta: Record<string, unknown>;
  public readonly creatorId: UserId;
  public state: ProjectState;
  public contributionVisibility: ContributionVisibility;
  public peerReviewVisibility: PeerReviewVisibility;
  public skipManagerReview: SkipManagerReview;
  public roles: RoleCollection;
  public peerReviews: PeerReviewCollection;
  public reviewTopics: ReviewTopicCollection;
  public milestones: MilestoneCollection;
  public roleMetrics: RoleMetricCollection;
  public milestoneMetrics: MilestoneMetricCollection;

  public constructor(
    id: ProjectId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ProjectTitle,
    description: ProjectDescription,
    meta: Record<string, unknown>,
    creatorId: UserId,
    state: ProjectState,
    contributionVisibility: ContributionVisibility,
    peerReviewVisibility: PeerReviewVisibility,
    skipManagerReview: SkipManagerReview,
    roles: RoleCollection,
    peerReviews: PeerReviewCollection,
    reviewTopics: ReviewTopicCollection,
    milestones: MilestoneCollection,
    roleMetrics: RoleMetricCollection,
    milestoneMetrics: MilestoneMetricCollection,
  ) {
    super(id, createdAt, updatedAt);
    this.title = title;
    this.description = description;
    this.meta = meta;
    this.creatorId = creatorId;
    this.state = state;
    this.contributionVisibility = contributionVisibility;
    this.peerReviewVisibility = peerReviewVisibility;
    this.skipManagerReview = skipManagerReview;
    this.roles = roles;
    this.peerReviews = peerReviews;
    this.reviewTopics = reviewTopics;
    this.milestones = milestones;
    this.roleMetrics = roleMetrics;
    this.milestoneMetrics = milestoneMetrics;
  }

  /**
   *
   */
  public update(context: UpdateProjectContext): void {
    this.state.update(this, context);
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

  public addMilestone(
    title: MilestoneTitle,
    description: MilestoneDescription,
  ): ReadonlyMilestone {
    if (
      !this.milestones.isEmpty() &&
      !this.milestones.whereLatest().isTerminal()
    ) {
      throw new DomainException(
        'latest_milestone_not_terminal',
        'The latest milestone is not in a terminal state, either finish or cancel.',
      );
    }
    return this.state.addMilestone(this, title, description);
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
    // TODO cancel milestone?
    this.state.cancel(this);
  }

  /**
   *
   */
  public async submitPeerReviews(
    peerReviews: ReadonlyPeerReviewCollection,
    projectAnalyzer: ProjectAnalyzer,
  ): Promise<void> {
    await this.state.submitPeerReviews(this, peerReviews, projectAnalyzer);
  }

  public async completePeerReviews(
    projectAnalyzer: ProjectAnalyzer,
  ): Promise<void> {
    await this.state.completePeerReviews(this, projectAnalyzer);
  }

  /**
   * Submit the manager review.
   */
  public submitManagerReview(): void {
    this.state.submitManagerReview(this);
  }

  /**
   *
   */
  public archive(): void {
    this.state.archive(this);
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
