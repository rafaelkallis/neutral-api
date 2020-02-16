import { Injectable, Inject } from '@nestjs/common';
import { UserModel } from 'user';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import {
  RoleModel,
  RoleRepository,
  PeerReviewModel,
  PeerReviewRepository,
  ROLE_REPOSITORY,
  PEER_REVIEW_REPOSITORY,
} from 'role';
import { ContributionsModelService } from 'project/domain/ContributionsModelService';
import { ConsensualityModelService } from 'project/domain/ConsensualityModelService';

import { ProjectNotFormationStateException } from 'project/domain/exceptions/ProjectNotFormationStateException';
import { ProjectNotPeerReviewStateException } from 'project/domain/exceptions/ProjectNotPeerReviewStateException';
import { ProjectNotManagerReviewStateException } from 'project/domain/exceptions/ProjectNotManagerReviewStateException';
import { RoleNoUserAssignedException } from 'project/domain/exceptions/RoleNoUserAssignedException';
import { InvalidPeerReviewsException } from 'project/domain/exceptions/InvalidPeerReviewsException';
import { PeerReviewsAlreadySubmittedException } from 'project/domain/exceptions/PeerReviewsAlreadySubmittedException';
import { ProjectModel } from 'project/domain/ProjectModel';
import { FinalPeerReviewSubmittedEvent } from 'project/domain/events/FinalPeerReviewSubmittedEvent';
import { InvariantViolationException } from 'common';
import { EventPublisherService, InjectEventPublisher } from 'event';
import { ProjectCreatedEvent } from 'project/domain/events/ProjectCreatedEvent';
import { ProjectFormationStartedEvent } from 'project/domain/events/ProjectFormationStartedEvent';
import { ProjectUpdatedEvent } from 'project/domain/events/ProjectUpdatedEvent';
import { ProjectDeletedEvent } from 'project/domain/events/ProjectDeletedEvent';
import { ProjectFormationFinishedEvent } from 'project/domain/events/ProjectFormationFinishedEvent';
import { ProjectPeerReviewStartedEvent } from 'project/domain/events/ProjectPeerReviewStartedEvent';
import { PeerReviewsSubmittedEvent } from 'project/domain/events/PeerReviewsSubmittedEvent';
import { ProjectPeerReviewFinishedEvent } from 'project/domain/events/ProjectPeerReviewFinishedEvent';
import { ProjectManagerReviewSkippedEvent } from 'project/domain/events/ProjectManagerReviewSkippedEvent';
import { ProjectFinishedEvent } from 'project/domain/events/ProjectFinishedEvent';
import { ProjectManagerReviewStartedEvent } from 'project/domain/events/ProjectManagerReviewStartedEvent';
import { ProjectManagerReviewFinishedEvent } from 'project/domain/events/ProjectManagerReviewFinishedEvent';
import { PeerReviewModelFactoryService } from 'role/domain/PeerReviewModelFactoryService';
import { Id } from 'common/domain/value-objects/Id';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ProjectState } from 'project/domain/value-objects/ProjectState';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { Consensuality } from 'project/domain/value-objects/Consensuality';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';

export interface CreateProjectOptions {
  title: ProjectTitle;
  description: ProjectDescription;
  contributionVisibility?: ContributionVisibility;
  skipManagerReview?: SkipManagerReview;
}

export interface UpdateProjectOptions {
  title?: string;
  description?: string;
}

@Injectable()
export class ProjectDomainService {
  private readonly eventPublisher: EventPublisherService;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly peerReviewRepository: PeerReviewRepository;
  private readonly contributionsModelService: ContributionsModelService;
  private readonly consensualityModelService: ConsensualityModelService;
  private readonly peerReviewModelFactory: PeerReviewModelFactoryService;

  public constructor(
    @InjectEventPublisher() eventPublisher: EventPublisherService,
    @Inject(PROJECT_REPOSITORY) projectRepository: ProjectRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(PEER_REVIEW_REPOSITORY) peerReviewRepository: PeerReviewRepository,
    contributionsModelService: ContributionsModelService,
    consensualityModelService: ConsensualityModelService,
    peerReviewModelFactory: PeerReviewModelFactoryService,
  ) {
    this.eventPublisher = eventPublisher;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.peerReviewRepository = peerReviewRepository;
    this.contributionsModelService = contributionsModelService;
    this.consensualityModelService = consensualityModelService;
    this.peerReviewModelFactory = peerReviewModelFactory;
  }

  /**
   * Create a project
   */
  public async createProject(
    projectOptions: CreateProjectOptions,
    creator: UserModel,
  ): Promise<ProjectModel> {
    const project = ProjectModel.create({
      ...projectOptions,
      creator,
    });
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(
      new ProjectCreatedEvent(project, creator),
      new ProjectFormationStartedEvent(project),
    );
    return project;
  }

  /**
   * Update a project
   */
  public async updateProject(
    project: ProjectModel,
    updateOptions: UpdateProjectOptions,
  ): Promise<ProjectModel> {
    if (!project.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    Object.assign(project, updateOptions);
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(new ProjectUpdatedEvent(project));
    return project;
  }

  /**
   * Delete a project
   */
  public async deleteProject(project: ProjectModel): Promise<void> {
    if (!project.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    await this.projectRepository.delete(project);
    await this.eventPublisher.publish(new ProjectDeletedEvent(project));
  }

  /**
   * Finish project formation
   */
  public async finishFormation(project: ProjectModel): Promise<ProjectModel> {
    if (!project.state.isFormation()) {
      throw new ProjectNotFormationStateException();
    }
    const roles = await this.roleRepository.findByProjectId(project.id);
    if (!roles.every(role => role.hasAssignee())) {
      throw new RoleNoUserAssignedException();
    }
    project.state = ProjectState.PEER_REVIEW;
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(
      new ProjectFormationFinishedEvent(project),
      new ProjectPeerReviewStartedEvent(project, roles),
    );
    return project;
  }

  /**
   * Call to submit reviews over one's project peers.
   */
  public async submitPeerReviews(
    project: ProjectModel,
    roles: RoleModel[],
    senderRole: RoleModel,
    peerReviewMap: ReadonlyMap<string, number>,
  ): Promise<void> {
    if (!project.state.isPeerReview()) {
      throw new ProjectNotPeerReviewStateException();
    }
    if (senderRole.hasSubmittedPeerReviews) {
      throw new PeerReviewsAlreadySubmittedException();
    }
    if (!this.isValidPeerReviewMap(peerReviewMap, senderRole, roles)) {
      throw new InvalidPeerReviewsException();
    }

    senderRole.hasSubmittedPeerReviews = true;
    const peerReviews: PeerReviewModel[] = [];
    for (const [receiverRoleId, score] of peerReviewMap.entries()) {
      const peerReview = this.peerReviewModelFactory.createPeerReview({
        senderRoleId: senderRole.id,
        receiverRoleId: Id.from(receiverRoleId),
        score,
      });
      peerReviews.push(peerReview);
    }
    await Promise.all(
      peerReviews.map(async peerReview =>
        this.peerReviewRepository.persist(peerReview),
      ),
    );
    await this.eventPublisher.publish(
      new PeerReviewsSubmittedEvent(project, senderRole, peerReviews),
    );

    /* is final peer review? */
    if (roles.every(role => role.hasSubmittedPeerReviews)) {
      await this.finishPeerReview(project, roles);
      await this.eventPublisher.publish(
        new FinalPeerReviewSubmittedEvent(project, roles),
      );
    }
  }

  private isValidPeerReviewMap(
    peerReviewMap: ReadonlyMap<string, number>,
    senderRole: RoleModel,
    roles: RoleModel[],
  ): boolean {
    /* no self review */
    if (peerReviewMap.has(senderRole.id.value)) {
      return false;
    }
    const otherRoles = roles.filter(role => !senderRole.equals(role));

    /* check if peer review ids match other role ids */
    for (const otherRole of otherRoles) {
      if (!peerReviewMap.has(otherRole.id.value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets called when final peer review is submitted for a team.
   */
  private async finishPeerReview(
    project: ProjectModel,
    roles: RoleModel[],
  ): Promise<void> {
    if (!project.state.isPeerReview()) {
      throw new InvariantViolationException();
    }
    /* build peer review index */
    const projectPeerReviews: Record<string, Record<string, number>> = {};
    for (const role of roles) {
      projectPeerReviews[role.id.value] = {};
      for (const peerReview of await this.peerReviewRepository.findBySenderRoleId(
        role.id,
      )) {
        const { receiverRoleId, score } = peerReview;
        projectPeerReviews[role.id.value][receiverRoleId.value] = score;
      }
    }
    const contributions = this.contributionsModelService.computeContributions(
      projectPeerReviews,
    );
    for (const role of roles) {
      role.contribution = contributions[role.id.value];
    }
    await this.roleRepository.persist(...roles);
    const consensuality = this.consensualityModelService.computeConsensuality(
      projectPeerReviews,
    );
    project.consensuality = Consensuality.from(consensuality);

    if (
      project.skipManagerReview.shouldSkipManagerReview(
        project,
        this.consensualityModelService,
      )
    ) {
      project.state = ProjectState.FINISHED;
      await this.projectRepository.persist(project);
      await this.eventPublisher.publish(
        new ProjectPeerReviewFinishedEvent(project, roles),
        new ProjectManagerReviewSkippedEvent(project),
        new ProjectFinishedEvent(project, roles),
      );
    } else {
      project.state = ProjectState.MANAGER_REVIEW;
      await this.projectRepository.persist(project);
      await this.eventPublisher.publish(
        new ProjectPeerReviewFinishedEvent(project, roles),
        new ProjectManagerReviewStartedEvent(project),
      );
    }
  }

  /**
   * Call to submit the manager review.
   */
  public async submitManagerReview(project: ProjectModel): Promise<void> {
    if (!project.state.isManagerReview()) {
      throw new ProjectNotManagerReviewStateException();
    }
    project.state = ProjectState.FINISHED;
    const roles = await this.roleRepository.findByProjectId(project.id);
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(
      new ProjectManagerReviewFinishedEvent(project),
      new ProjectFinishedEvent(project, roles),
    );
  }
}
