import { User } from 'user/domain/User';
import { AggregateRoot } from 'common/domain/AggregateRoot';
import { RoleCreatedEvent } from 'project/domain/events/RoleCreatedEvent';
import { PeerReviewsAlreadySubmittedException } from 'project/domain/exceptions/PeerReviewsAlreadySubmittedException';
import { PeerReviewRoleMismatchException } from 'project/domain/exceptions/PeerReviewRoleMismatchException';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { MultipleAssignmentsWithinProjectException } from 'project/domain/exceptions/MultipleAssignmentsWithinProjectException';
import { UserUnassignedEvent } from 'project/domain/events/UserUnassignedEvent';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { ProjectPeerReviewFinishedEvent } from 'project/domain/events/ProjectPeerReviewFinishedEvent';
import { ProjectManagerReviewSkippedEvent } from 'project/domain/events/ProjectManagerReviewSkippedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { Id } from 'common/domain/value-objects/Id';
import { CreatedAt } from 'common/domain/value-objects/CreatedAt';
import { UpdatedAt } from 'common/domain/value-objects/UpdatedAt';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { ProjectDeletedEvent } from 'project/domain/events/ProjectDeletedEvent';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';
import { RoleUpdatedEvent } from 'project/domain/events/RoleUpdatedEvent';
import { RoleDeletedEvent } from 'project/domain/events/RoleDeletedEvent';
import { Role } from 'project/domain/Role';
import { PeerReview } from 'project/domain/PeerReview';
import { RoleCollection } from 'project/domain/RoleCollection';
import { PeerReviewCollection } from 'project/domain/PeerReviewCollection';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { HasSubmittedPeerReviews } from 'project/domain/value-objects/HasSubmittedPeerReviews';

export interface CreateProjectOptions {
  title: ProjectTitle;
  description: ProjectDescription;
  creator: User;
  contributionVisibility?: ContributionVisibility;
  skipManagerReview?: SkipManagerReview;
}

/**
 * Project Model
 */
export class Project extends AggregateRoot {
  public title: ProjectTitle;
  public description: ProjectDescription;
  public creatorId: Id;
  public state: ProjectState;
  public consensuality: Consensuality | null;
  public contributionVisibility: ContributionVisibility;
  public skipManagerReview: SkipManagerReview;
  public roles: RoleCollection;
  public peerReviews: PeerReviewCollection;

  public constructor(
    id: Id,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
    title: ProjectTitle,
    description: ProjectDescription,
    creatorId: Id,
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
  public static create(createProjectOptions: CreateProjectOptions): Project {
    const projectId = Id.create();
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
    const roles = RoleCollection.empty();
    const peerReviews = PeerReviewCollection.empty();
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
    project.apply(new ProjectCreatedEvent(project, creator));
    project.apply(new ProjectFormationStartedEvent(project));
    return project;
  }

  /**
   *
   */
  public update(title?: ProjectTitle, description?: ProjectDescription): void {
    this.state.assertFormation();
    if (title) {
      this.title = title;
    }
    if (description) {
      this.description = description;
    }
    this.apply(new ProjectUpdatedEvent(this));
  }

  /**
   *
   */
  public delete(): void {
    this.state.assertFormation();
    this.apply(new ProjectDeletedEvent(this));
  }

  /**
   *
   */
  public addRole(title: RoleTitle, description: RoleDescription): Role {
    this.state.assertFormation();
    const role = Role.from(this.id, title, description);
    this.roles.add(role);
    this.apply(new RoleCreatedEvent(this, role));
    return role;
  }

  /**
   * Update a role
   */
  public updateRole(
    roleId: Id,
    title?: RoleTitle,
    description?: RoleDescription,
  ): void {
    this.state.assertFormation();
    const roleToUpdate = this.roles.find(roleId);
    if (title) {
      roleToUpdate.title = title;
    }
    if (description) {
      roleToUpdate.description = description;
    }
    if (title || description) {
      this.apply(new RoleUpdatedEvent(roleToUpdate));
    }
  }

  /**
   * Remove a role
   */
  public removeRole(roleId: Id): void {
    this.state.assertFormation();
    const roleToRemove = this.roles.find(roleId);
    this.roles.remove(roleToRemove);
    this.apply(new RoleDeletedEvent(roleToRemove));
  }

  /**
   * Assigns a user to a role
   */
  public assignUserToRole(assignee: User, role: Role): void {
    this.state.assertFormation();
    if (this.roles.anyAssignedToUser(assignee)) {
      throw new MultipleAssignmentsWithinProjectException();
    }
    if (role.assigneeId) {
      this.apply(new UserUnassignedEvent(this, role, role.assigneeId));
    }
    role.assigneeId = assignee.id;
    this.apply(new UserAssignedEvent(this, role, assignee));
  }

  /**
   * Finish project formation
   */
  public finishFormation(): void {
    this.state.assertFormation();
    if (!this.roles.allAreAssigned()) {
      throw new RoleNoUserAssignedException();
    }
    this.state = ProjectState.PEER_REVIEW;
    this.apply(new ProjectFormationFinishedEvent(this));
    this.apply(new ProjectPeerReviewStartedEvent(this));
  }

  /**
   *
   */
  public submitPeerReviews(
    senderRole: Role,
    submittedPeerReviews: [Id, PeerReviewScore][],
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.state.assertPeerReview();
    if (senderRole.hasSubmittedPeerReviews.value) {
      throw new PeerReviewsAlreadySubmittedException();
    }
    for (const otherRole of this.roles.excluding(senderRole)) {
      let isOtherRoleIncluded = false;
      for (const [receiverRoleId] of submittedPeerReviews) {
        if (receiverRoleId.equals(otherRole.id)) {
          isOtherRoleIncluded = true;
          break;
        }
      }
      if (!isOtherRoleIncluded) {
        throw new PeerReviewRoleMismatchException();
      }
    }
    senderRole.hasSubmittedPeerReviews = HasSubmittedPeerReviews.TRUE;
    const peerReviews: PeerReview[] = [];
    for (const [receiverRoleId, score] of submittedPeerReviews) {
      const peerReview = PeerReview.from(senderRole.id, receiverRoleId, score);
      peerReviews.push(peerReview);
      this.peerReviews.add(peerReview);
    }
    this.apply(new PeerReviewsSubmittedEvent(this, senderRole, peerReviews));
    if (this.roles.allHaveSubmittedPeerReviews()) {
      this.apply(new FinalPeerReviewSubmittedEvent(this));
      this.finishPeerReview(contributionsComputer, consensualityComputer);
    }
  }

  /**
   * Gets called when final peer review is submitted for a team.
   */
  private finishPeerReview(
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ): void {
    this.state.assertPeerReview();
    const contributions = contributionsComputer.compute(this.peerReviews);
    for (const role of this.roles) {
      role.contribution = contributions[role.id.value];
    }
    this.consensuality = consensualityComputer.compute(this.peerReviews);

    if (this.skipManagerReview.shouldSkipManagerReview(this)) {
      this.state = ProjectState.FINISHED;
      this.apply(new ProjectPeerReviewFinishedEvent(this));
      this.apply(new ProjectManagerReviewSkippedEvent(this));
      this.apply(new ProjectFinishedEvent(this));
    } else {
      this.state = ProjectState.MANAGER_REVIEW;
      this.apply(new ProjectPeerReviewFinishedEvent(this));
      this.apply(new ProjectManagerReviewStartedEvent(this));
    }
  }

  /**
   * Submit the manager review.
   */
  public submitManagerReview(): void {
    this.state.assertManagerReview();
    this.state = ProjectState.FINISHED;
    this.apply(new ProjectManagerReviewFinishedEvent(this));
    this.apply(new ProjectFinishedEvent(this));
  }

  public isCreator(user: User): boolean {
    return this.creatorId.equals(user.id);
  }
}
