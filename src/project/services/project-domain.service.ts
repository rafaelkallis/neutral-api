import { Injectable, Inject } from '@nestjs/common';
import { UserModel } from 'user';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/repositories/project.repository';
import {
  RoleModel,
  RoleRepository,
  PeerReviewModel,
  PeerReviewRepository,
  ROLE_REPOSITORY,
  PEER_REVIEW_REPOSITORY,
} from 'role';
import { ContributionsModelService } from './contributions-model.service';
import { ConsensualityModelService } from './consensuality-model.service';

import { ProjectNotFormationStateException } from 'project/exceptions/project-not-formation-state.exception';
import { ProjectNotPeerReviewStateException } from 'project/exceptions/project-not-peer-review-state.exception';
import { ProjectNotManagerReviewStateException } from 'project/exceptions/project-not-manager-review-state.exception';
import { RoleNoUserAssignedException } from 'project/exceptions/role-no-user-assigned.exception';
import { InvalidPeerReviewsException } from 'project/exceptions/invalid-peer-reviews.exception';
import { PeerReviewsAlreadySubmittedException } from 'project/exceptions/peer-reviews-already-submitted.exception';
import {
  ProjectCreatedEvent,
  ProjectUpdatedEvent,
  ProjectDeletedEvent,
  PeerReviewsSubmittedEvent,
  ProjectFormationStartedEvent,
  ProjectFormationFinishedEvent,
  ProjectPeerReviewStartedEvent,
  ProjectPeerReviewFinishedEvent,
  ProjectManagerReviewStartedEvent,
  ProjectManagerReviewSkippedEvent,
  ProjectManagerReviewFinishedEvent,
  ProjectFinishedEvent,
} from 'project/events';
import {
  ProjectModel,
  ProjectState,
  SkipManagerReview,
  ContributionVisibility,
} from 'project/project.model';
import { FinalPeerReviewSubmittedEvent } from 'project/events/final-peer-review-submitted.event';
import { InvariantViolationException } from 'common';
import { EventPublisherService, InjectEventPublisher } from 'event';

export interface CreateProjectOptions {
  title: string;
  description: string;
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

  public constructor(
    @InjectEventPublisher() eventPublisher: EventPublisherService,
    @Inject(PROJECT_REPOSITORY) projectRepository: ProjectRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(PEER_REVIEW_REPOSITORY) peerReviewRepository: PeerReviewRepository,
    contributionsModelService: ContributionsModelService,
    consensualityModelService: ConsensualityModelService,
  ) {
    this.eventPublisher = eventPublisher;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.peerReviewRepository = peerReviewRepository;
    this.contributionsModelService = contributionsModelService;
    this.consensualityModelService = consensualityModelService;
  }

  /**
   * Create a project
   */
  public async createProject(
    projectOptions: CreateProjectOptions,
    creator: UserModel,
  ): Promise<ProjectModel> {
    // TODO needs factory!
    const projectId = this.projectRepository.createId();
    const createdAt = Date.now();
    const updatedAt = Date.now();
    const title = projectOptions.title;
    const description = projectOptions.description;
    const creatorId = creator.id;
    const state = ProjectState.FORMATION;
    const consensuality = null;
    const contributionVisibility =
      projectOptions.contributionVisibility || ContributionVisibility.SELF;
    const skipManagerReview =
      projectOptions.skipManagerReview || SkipManagerReview.NO;
    const project = new ProjectModel(
      projectId,
      createdAt,
      updatedAt,
      title,
      description,
      creatorId,
      state,
      consensuality,
      contributionVisibility,
      skipManagerReview,
    );
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
    if (!project.isFormationState()) {
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
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    await this.projectRepository.delete(project);
    await this.eventPublisher.publish(new ProjectDeletedEvent(project));
  }

  /**
   * Finish project formation
   */
  public async finishFormation(project: ProjectModel): Promise<ProjectModel> {
    if (!project.isFormationState()) {
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
    if (!project.isPeerReviewState()) {
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
      const peerReviewId = this.peerReviewRepository.createId();
      const createdAt = Date.now();
      const updatedAt = Date.now();
      const peerReview = new PeerReviewModel(
        peerReviewId,
        createdAt,
        updatedAt,
        senderRole.id,
        receiverRoleId,
        score,
      );
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
    if (peerReviewMap.has(senderRole.id)) {
      return false;
    }
    const otherRoles = roles.filter(role => !senderRole.equals(role));

    /* check if peer review ids match other role ids */
    for (const otherRole of otherRoles) {
      if (!peerReviewMap.has(otherRole.id)) {
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
    if (!project.isPeerReviewState()) {
      throw new InvariantViolationException();
    }
    /* build peer review index */
    const projectPeerReviews: Record<string, Record<string, number>> = {};
    for (const role of roles) {
      projectPeerReviews[role.id] = {};
      for (const peerReview of await this.peerReviewRepository.findBySenderRoleId(
        role.id,
      )) {
        const { receiverRoleId, score } = peerReview;
        projectPeerReviews[role.id][receiverRoleId] = score;
      }
    }
    const contributions = this.contributionsModelService.computeContributions(
      projectPeerReviews,
    );
    for (const role of roles) {
      role.contribution = contributions[role.id];
    }
    await this.roleRepository.persist(...roles);
    const consensuality = this.consensualityModelService.computeConsensuality(
      projectPeerReviews,
    );
    project.consensuality = consensuality;

    if (this.shouldSkipManagerReview(project, consensuality)) {
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

  private shouldSkipManagerReview(
    project: ProjectModel,
    consensuality: number,
  ): boolean {
    switch (project.skipManagerReview) {
      case SkipManagerReview.YES: {
        return true;
      }
      case SkipManagerReview.IF_CONSENSUAL: {
        const isConsensual = this.consensualityModelService.isConsensual(
          consensuality,
        );
        return isConsensual;
      }
      case SkipManagerReview.NO: {
        return false;
      }
      default: {
        return false;
      }
    }
  }

  /**
   * Call to submit the manager review.
   */
  public async submitManagerReview(project: ProjectModel): Promise<void> {
    if (!project.isManagerReviewState()) {
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
