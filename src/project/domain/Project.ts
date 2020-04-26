import { User, ReadonlyUser } from 'user/domain/User';
import {
  AggregateRoot,
  ReadonlyAggregateRoot,
} from 'shared/domain/AggregateRoot';
import { RoleCreatedEvent } from 'project/domain/events/RoleCreatedEvent';
import { PeerReviewRoleMismatchException } from 'project/domain/exceptions/PeerReviewRoleMismatchException';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { UserUnassignedEvent } from 'project/domain/events/UserUnassignedEvent';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { ProjectPeerReviewFinishedEvent } from 'project/domain/events/ProjectPeerReviewFinishedEvent';
import { ProjectManagerReviewSkippedEvent } from 'project/domain/events/ProjectManagerReviewSkippedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { CreatedAt } from 'shared/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'shared/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { ProjectArchivedEvent } from 'project/domain/events/ProjectArchivedEvent';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';
import { RoleUpdatedEvent } from 'project/domain/events/RoleUpdatedEvent';
import { RoleDeletedEvent } from 'project/domain/events/RoleDeletedEvent';
import { Role } from 'project/domain/Role';
import {
  RoleCollection,
  ReadonlyRoleCollection,
} from 'project/domain/RoleCollection';
import {
  PeerReviewCollection,
  ReadonlyPeerReviewCollection,
} from 'project/domain/PeerReviewCollection';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';
import { UserNotProjectCreatorException } from 'project/domain/exceptions/UserNotProjectCreatorException';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { RoleId } from 'project/domain/value-objects/RoleId';

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

  update(title?: ProjectTitle, description?: ProjectDescription): void;
  archive(): void;
  addRole(title: RoleTitle, description: RoleDescription): Role;
  updateRole(
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void;
  removeRole(roleId: RoleId): void;
  assignUserToRole(userToAssign: ReadonlyUser, roleId: RoleId): void;
  unassign(roleId: RoleId): void;
  finishFormation(): void;
  submitPeerReviews(
    senderRoleId: RoleId,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void;
  submitManagerReview(): void;
  isCreator(user: User): boolean;
  assertCreator(user: User): void;
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
  }

  /**
   *
   */
  public static create(
    createProjectOptions: CreateProjectOptions,
  ): ReadonlyProject {
    const projectId = ProjectId.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const {
      title,
      description,
      creator,
      contributionVisibility,
      skipManagerReview,
    } = createProjectOptions;
    const state = ProjectState.FORMATION;
    const consensuality = null;
    const roles = new RoleCollection([]);
    const peerReviews = new PeerReviewCollection([]);
    const project = new Project(
      projectId,
      createdAt,
      updatedAt,
      title,
      description,
      creator.id,
      state,
      consensuality,
      contributionVisibility
        ? contributionVisibility
        : ContributionVisibility.SELF,
      skipManagerReview ? skipManagerReview : SkipManagerReview.IF_CONSENSUAL,
      roles,
      peerReviews,
    );
    project.raise(new ProjectCreatedEvent(project, creator));
    project.raise(new ProjectFormationStartedEvent(project));
    return project;
  }

  /**
   *
   */
  public update(title?: ProjectTitle, description?: ProjectDescription): void {
    this.state.assertEquals(ProjectState.FORMATION);
    if (title) {
      this.title = title;
    }
    if (description) {
      this.description = description;
    }
    this.raise(new ProjectUpdatedEvent(this));
  }

  /**
   *
   */
  public archive(): void {
    this.state.assertEquals(ProjectState.FORMATION);
    this.state = ProjectState.ARCHIVED;
    this.raise(new ProjectArchivedEvent(this));
  }

  /**
   *
   */
  public addRole(title: RoleTitle, description: RoleDescription): Role {
    this.state.assertEquals(ProjectState.FORMATION);
    const role = Role.from(this.id, title, description);
    this.roles.add(role);
    this.raise(new RoleCreatedEvent(this.id, role.id));
    return role;
  }

  /**
   * Update a role
   */
  public updateRole(
    roleId: RoleId,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    this.state.assertEquals(ProjectState.FORMATION);
    const roleToUpdate = this.roles.find(roleId);
    if (title) {
      roleToUpdate.title = title;
    }
    if (description) {
      roleToUpdate.description = description;
    }
    if (title || description) {
      this.raise(new RoleUpdatedEvent(roleToUpdate));
    }
  }

  /**
   * Remove a role
   */
  public removeRole(roleId: RoleId): void {
    this.state.assertEquals(ProjectState.FORMATION);
    const roleToRemove = this.roles.find(roleId);
    this.roles.remove(roleToRemove);
    this.raise(new RoleDeletedEvent(roleToRemove));
  }

  /**
   * Assigns a user to a role
   */
  public assignUserToRole(userToAssign: ReadonlyUser, roleId: RoleId): void {
    const roleToBeAssigned = this.roles.find(roleId);
    this.state.assertEquals(ProjectState.FORMATION);
    if (roleToBeAssigned.isAssignedToUser(userToAssign)) {
      return;
    }
    if (roleToBeAssigned.isAssigned()) {
      this.unassign(roleToBeAssigned.id);
    }
    if (this.roles.isAnyAssignedToUser(userToAssign)) {
      const currentAssignedRole = this.roles.findByAssignee(userToAssign);
      this.unassign(currentAssignedRole.id);
    }
    roleToBeAssigned.assigneeId = userToAssign.id;
    this.roles.assertSingleAssignmentPerUser();
    this.raise(new UserAssignedEvent(this, roleToBeAssigned, userToAssign));
  }

  /**
   * Unassign a role.
   * @param roleId The roleId to unassign.
   */
  public unassign(roleId: RoleId): void {
    const role = this.roles.find(roleId);
    this.state.assertEquals(ProjectState.FORMATION);
    role.assertAssigned();
    const previousAssigneeId = role.assigneeId as UserId;
    role.assigneeId = null;
    this.raise(new UserUnassignedEvent(this, role, previousAssigneeId));
  }

  /**
   * Finish project formation
   */
  public finishFormation(): void {
    this.state.assertEquals(ProjectState.FORMATION);
    this.roles.assertSufficientAmount();
    this.roles.assertAllAreAssigned();
    this.state = ProjectState.PEER_REVIEW;
    this.raise(new ProjectFormationFinishedEvent(this));
    this.raise(new ProjectPeerReviewStartedEvent(this));
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
    const senderRole = this.roles.find(senderRoleId);
    this.state.assertEquals(ProjectState.PEER_REVIEW);
    senderRole.assertHasNotSubmittedPeerReviews();
    this.assertSubmittedPeerReviewsMatchRoles(senderRole, submittedPeerReviews);
    const addedPeerReviews = this.peerReviews.addForSender(
      senderRole.id,
      submittedPeerReviews,
    );
    senderRole.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    this.raise(
      new PeerReviewsSubmittedEvent(this, senderRole, addedPeerReviews),
    );
    if (this.roles.allHaveSubmittedPeerReviews()) {
      this.raise(new FinalPeerReviewSubmittedEvent(this));
      this.finishPeerReview(contributionsComputer, consensualityComputer);
    }
  }

  /**
   * Asserts that the submitted peer reviews match the project's roles.
   * @param senderRole Role of peer review sender.
   * @param submittedPeerReviews Submitted peer reviews
   */
  private assertSubmittedPeerReviewsMatchRoles(
    senderRole: Role,
    submittedPeerReviews: [RoleId, PeerReviewScore][],
  ): void {
    const expectedIds: RoleId[] = Array.from(
      this.roles.excluding(senderRole),
    ).map((role) => role.id);
    const actualIds: RoleId[] = submittedPeerReviews.map(
      ([receiverRoleId]) => receiverRoleId,
    );
    for (const expectedId of expectedIds) {
      const matchCount = actualIds.filter((actualId) =>
        actualId.equals(expectedId),
      ).length;
      if (matchCount !== 1) {
        throw new PeerReviewRoleMismatchException();
      }
    }
    for (const actualId of actualIds) {
      const matchCount = expectedIds.filter((expectedId) =>
        expectedId.equals(actualId),
      ).length;
      if (matchCount !== 1) {
        throw new PeerReviewRoleMismatchException();
      }
    }
  }

  /**
   * Gets called when final peer review is submitted for a team.
   */
  private finishPeerReview(
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.state.assertEquals(ProjectState.PEER_REVIEW);
    const contributions = contributionsComputer.compute(this.peerReviews);
    this.roles.applyContributions(contributions);
    this.consensuality = consensualityComputer.compute(this.peerReviews);

    if (this.skipManagerReview.shouldSkipManagerReview(this)) {
      this.state = ProjectState.FINISHED;
      this.raise(new ProjectPeerReviewFinishedEvent(this.id));
      this.raise(new ProjectManagerReviewSkippedEvent(this.id));
      this.raise(new ProjectFinishedEvent(this));
    } else {
      this.state = ProjectState.MANAGER_REVIEW;
      this.raise(new ProjectPeerReviewFinishedEvent(this.id));
      this.raise(new ProjectManagerReviewStartedEvent(this));
    }
  }

  /**
   * Submit the manager review.
   */
  public submitManagerReview(): void {
    this.state.assertEquals(ProjectState.MANAGER_REVIEW);
    this.state = ProjectState.FINISHED;
    this.raise(new ProjectManagerReviewFinishedEvent(this.id));
    this.raise(new ProjectFinishedEvent(this));
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
