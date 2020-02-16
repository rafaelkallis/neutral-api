import { UserModel } from 'user/domain/UserModel';
import { RoleModel, PeerReviewModel } from 'role';
import { AggregateRoot } from 'common/domain/AggregateRoot';
import { RoleCreatedEvent } from 'project/domain/events/RoleCreatedEvent';
import { ProjectNotPeerReviewStateException } from 'project/domain/exceptions/ProjectNotPeerReviewStateException';
import { PeerReviewsAlreadySubmittedException } from 'project/domain/exceptions/PeerReviewsAlreadySubmittedException';
import { SelfPeerReviewException } from 'project/domain/exceptions/SelfPeerReviewException';
import { PeerReviewRoleMismatchException } from 'project/domain/exceptions/PeerReviewRoleMismatchException';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { RoleNotBelongToProjectException } from 'project/domain/exceptions/RoleNotBelongToProjectException';
import { ProjectNotFormationStateException } from 'project/domain/exceptions/ProjectNotFormationStateException';
import { MultipleAssignmentsWithinProjectException } from 'project/domain/exceptions/MultipleAssignmentsWithinProjectException';
import { UserUnassignedEvent } from 'project/domain/events/UserUnassignedEvent';
import { UserAssignedEvent } from 'project/domain/events/UserAssignedEvent';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { ContributionsModelService } from 'project/domain/ContributionsModelService';
import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';
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
import { ProjectNotManagerReviewStateException } from 'project/domain/exceptions/ProjectNotManagerReviewStateException';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';
import { RoleUpdatedEvent } from 'project/domain/RoleUpdatedEvent';
import { RoleDeletedEvent } from 'project/domain/events/RoleDeletedEvent';
import { RoleNotFoundException } from 'project/domain/exceptions/RoleNotFoundException';

export interface CreateProjectOptions {
  title: ProjectTitle;
  description: ProjectDescription;
  creator: UserModel;
  contributionVisibility?: ContributionVisibility;
  skipManagerReview?: SkipManagerReview;
}

/**
 * Project Model
 */
export class ProjectModel extends AggregateRoot {
  public title: ProjectTitle;
  public description: ProjectDescription;
  public creatorId: Id;
  public state: ProjectState;
  public consensuality: Consensuality | null;
  public contributionVisibility: ContributionVisibility;
  public skipManagerReview: SkipManagerReview;
  public roles: RoleModel[];

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
    roles: RoleModel[],
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
  }

  /**
   *
   */
  public static create(
    createProjectOptions: CreateProjectOptions,
  ): ProjectModel {
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
    const roles: RoleModel[] = [];
    const project = new ProjectModel(
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
    );
    project.apply(new ProjectCreatedEvent(project, creator));
    project.apply(new ProjectFormationStartedEvent(project));
    return project;
  }

  /**
   *
   */
  public update(title?: ProjectTitle, description?: ProjectDescription): void {
    if (!this.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
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
    if (!this.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    this.apply(new ProjectDeletedEvent(this));
  }

  /**
   *
   */
  public addRole(
    title: string,
    description: string,
    roles: RoleModel[],
  ): RoleModel {
    if (!this.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    const roleId = Id.create();
    const createdAt = CreatedAt.now();
    const updatedAt = UpdatedAt.now();
    const projectId = this.id;
    const assigneeId = null;
    const contribution = null;
    const hasSubmittedPeerReviews = false;
    const role = new RoleModel(
      roleId,
      createdAt,
      updatedAt,
      projectId,
      assigneeId,
      title,
      description,
      contribution,
      hasSubmittedPeerReviews,
    );
    roles.push(role);
    this.apply(new RoleCreatedEvent(this, role));
    return role;
  }

  /**
   * Update a role
   */
  public async updateRole(
    role: RoleModel,
    title?: string,
    description?: string,
  ): Promise<void> {
    if (!this.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    if (title) {
      role.title = title;
    }
    if (description) {
      role.description = description;
    }
    if (title || description) {
      this.apply(new RoleUpdatedEvent(role));
    }
  }

  /**
   * Remove a role
   */
  public async removeRole(
    project: ProjectModel,
    roleToRemove: RoleModel,
    roles: RoleModel[],
  ): Promise<void> {
    if (!project.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    let isRoleRemoved = false;
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].equals(roleToRemove)) {
        roles.splice(i, 1);
        isRoleRemoved = true;
        break;
      }
    }
    if (!isRoleRemoved) {
      throw new RoleNotFoundException();
    }
    this.apply(new RoleDeletedEvent(roleToRemove));
  }

  /**
   * Assigns a user to a role
   */
  public assignUserToRole(
    assignee: UserModel,
    role: RoleModel,
    roles: RoleModel[],
  ): void {
    if (roles.every(projectRole => !projectRole.equals(role))) {
      throw new RoleNotBelongToProjectException();
    }
    if (!this.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    if (roles.some(r => r.isAssignee(assignee))) {
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
  public finishFormation(roles: RoleModel[]): void {
    if (!this.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    if (!roles.every(role => role.hasAssignee())) {
      throw new RoleNoUserAssignedException();
    }
    this.state = ProjectState.PEER_REVIEW;
    this.apply(new ProjectFormationFinishedEvent(this));
    this.apply(new ProjectPeerReviewStartedEvent(this, roles));
  }

  /**
   *
   */
  public submitPeerReviews(
    senderRole: RoleModel,
    peerReviewMap: ReadonlyMap<Id, number>,
    roles: RoleModel[],
  ): PeerReviewModel[] {
    if (!this.state.isPeerReview()) {
      throw new ProjectNotPeerReviewStateException();
    }
    if (senderRole.hasSubmittedPeerReviews) {
      throw new PeerReviewsAlreadySubmittedException();
    }
    if (peerReviewMap.has(senderRole.id)) {
      throw new SelfPeerReviewException();
    }
    const otherRoles = roles.filter(role => !role.equals(senderRole));
    for (const otherRole of otherRoles) {
      if (!peerReviewMap.has(otherRole.id)) {
        throw new PeerReviewRoleMismatchException();
      }
    }
    senderRole.hasSubmittedPeerReviews = true;
    const peerReviews: PeerReviewModel[] = [];
    for (const [receiverRoleId, score] of peerReviewMap.entries()) {
      const peerReviewId = Id.create();
      const peerReviewCreatedAt = CreatedAt.now();
      const peerReviewUpdatedAt = UpdatedAt.now();
      const peerReview = new PeerReviewModel(
        peerReviewId,
        peerReviewCreatedAt,
        peerReviewUpdatedAt,
        senderRole.id,
        receiverRoleId,
        score,
      );
      peerReviews.push(peerReview);
    }
    this.apply(new PeerReviewsSubmittedEvent(this, senderRole, peerReviews));
    if (roles.every(role => role.hasSubmittedPeerReviews)) {
      this.apply(new FinalPeerReviewSubmittedEvent(this, roles));
      // TODO call finishPeerReview()
    }
    return peerReviews;
  }

  /**
   * Gets called when final peer review is submitted for a team.
   */
  public finishPeerReview(
    roles: RoleModel[],
    peerReviews: PeerReviewModel[],
    contributionsModelService: ContributionsModelService,
    consensualityModelService: ConsensualityModelService,
  ): void {
    if (!this.state.isPeerReview()) {
      throw new ProjectNotPeerReviewStateException();
    }
    const peerReviewMap = this.createPeerReviewMap(peerReviews);
    const contributions = contributionsModelService.computeContributions(
      peerReviewMap,
    );
    for (const role of roles) {
      role.contribution = contributions[role.id.value];
    }
    const consensuality = consensualityModelService.computeConsensuality(
      peerReviewMap,
    );
    this.consensuality = Consensuality.from(consensuality);

    // TODO value object strategy pattern
    if (
      this.skipManagerReview.shouldSkipManagerReview(
        this,
        consensualityModelService,
      )
    ) {
      this.state = ProjectState.FINISHED;
      this.apply(new ProjectPeerReviewFinishedEvent(this, roles));
      this.apply(new ProjectManagerReviewSkippedEvent(this));
      this.apply(new ProjectFinishedEvent(this, roles));
    } else {
      this.state = ProjectState.MANAGER_REVIEW;
      this.apply(new ProjectPeerReviewFinishedEvent(this, roles));
      this.apply(new ProjectManagerReviewStartedEvent(this));
    }
  }

  /**
   * Submit the manager review.
   */
  public submitManagerReview(roles: RoleModel[]): void {
    if (!this.state.isManagerReview()) {
      throw new ProjectNotManagerReviewStateException();
    }
    this.state = ProjectState.FINISHED;
    this.apply(new ProjectManagerReviewFinishedEvent(this));
    this.apply(new ProjectFinishedEvent(this, roles));
  }

  /**
   *
   */
  private createPeerReviewMap(
    peerReviews: PeerReviewModel[],
  ): Record<string, Record<string, number>> {
    const peerReviewMap: Record<string, Record<string, number>> = {};
    for (const { senderRoleId, receiverRoleId, score } of peerReviews) {
      if (!peerReviewMap[senderRoleId.value]) {
        peerReviewMap[senderRoleId.value] = {};
      }
      peerReviewMap[senderRoleId.value][receiverRoleId.value] = score;
    }
    return peerReviewMap;
  }

  public isCreator(user: UserModel): boolean {
    return this.creatorId === user.id;
  }
}

// TODO use?
export class PeerReviews {
  private readonly peerReviews: Array<[string, string, number]>;

  public constructor(peerReviews: Array<[string, string, number]>) {
    this.peerReviews = peerReviews;
    this.assertNoDuplicatePeerReviews();
  }

  public static fromMap(
    peerReviewMap: Record<string, Record<string, number>>,
  ): PeerReviews {
    const peerReviews: Array<[string, string, number]> = [];
    for (const sender of Object.keys(peerReviewMap)) {
      for (const [receiver, score] of Object.entries(peerReviewMap[sender])) {
        peerReviews.push([sender, receiver, score]);
      }
    }
    return new PeerReviews(peerReviews);
  }

  /**
   *
   */
  public toMap(): Record<string, Record<string, number>> {
    const peerReviewMap: Record<string, Record<string, number>> = {};
    for (const [sender, receiver, score] of this.peerReviews) {
      if (!peerReviewMap[sender]) {
        peerReviewMap[sender] = {};
      }
      peerReviewMap[sender][receiver] = score;
    }
    return peerReviewMap;
  }

  /**
   *
   */
  public applyUnion(otherPeerReviews: PeerReviews): void {
    this.peerReviews.push(...otherPeerReviews.peerReviews);
    this.assertNoDuplicatePeerReviews();
  }

  /**
   *
   */
  public computeContributions(
    contributionsModel: ContributionsModelService,
  ): Array<[string, number]> {
    const contributionMap = contributionsModel.computeContributions(
      this.toMap(),
    );
    return Object.entries(contributionMap);
  }

  /**
   *
   */
  private assertNoDuplicatePeerReviews(): void {
    const edges = new Set<string>();
    for (const [sender, receiver] of this.peerReviews) {
      const edge = `${sender} -> ${receiver}`;
      if (edges.has(edge)) {
        throw new Error(`duplicate edge: ${edge}`);
      }
      edges.add(edge);
    }
  }
}
