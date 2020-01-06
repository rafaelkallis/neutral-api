import { Injectable, Inject } from '@nestjs/common';
import { UserEntity } from 'user';
import {
  ProjectState,
  SkipManagerReview,
  ContributionVisibility,
} from 'project/project';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/repositories/project.repository';
import {
  RoleEntity,
  RoleRepository,
  PeerReviewEntity,
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
import { ProjectEntity } from 'project';
import { FinalPeerReviewSubmittedEvent } from 'project/events/final-peer-review-submitted.event';
import { RandomService, InvariantViolationException } from 'common';
import { EventBus, EVENT_BUS } from 'event';

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
  private readonly eventBus: EventBus;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly peerReviewRepository: PeerReviewRepository;
  private readonly randomService: RandomService;
  private readonly contributionsModelService: ContributionsModelService;
  private readonly consensualityModelService: ConsensualityModelService;

  public constructor(
    @Inject(EVENT_BUS) eventBus: EventBus,
    @Inject(PROJECT_REPOSITORY) projectRepository: ProjectRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(PEER_REVIEW_REPOSITORY) peerReviewRepository: PeerReviewRepository,
    randomService: RandomService,
    contributionsModelService: ContributionsModelService,
    consensualityModelService: ConsensualityModelService,
  ) {
    this.eventBus = eventBus;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.peerReviewRepository = peerReviewRepository;
    this.randomService = randomService;
    this.contributionsModelService = contributionsModelService;
    this.consensualityModelService = consensualityModelService;
  }

  /**
   * Create a project
   */
  public async createProject(
    projectOptions: CreateProjectOptions,
    owner: UserEntity,
  ): Promise<ProjectEntity> {
    const project = this.projectRepository.createEntity({
      id: this.randomService.id(),
      ownerId: owner.id,
      title: projectOptions.title,
      description: projectOptions.description,
      state: ProjectState.FORMATION,
      consensuality: null,
      contributionVisibility:
        projectOptions.contributionVisibility || ContributionVisibility.SELF,
      skipManagerReview:
        projectOptions.skipManagerReview || SkipManagerReview.NO,
    });
    await project.persist();
    await this.eventBus.publish(
      new ProjectCreatedEvent(project, owner),
      new ProjectFormationStartedEvent(project),
    );
    return project;
  }

  /**
   * Update a project
   */
  public async updateProject(
    project: ProjectEntity,
    updateOptions: UpdateProjectOptions,
  ): Promise<ProjectEntity> {
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    Object.assign(project, updateOptions);
    await project.persist();
    await this.eventBus.publish(new ProjectUpdatedEvent(project));
    return project;
  }

  /**
   * Delete a project
   */
  public async deleteProject(project: ProjectEntity): Promise<void> {
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    await this.projectRepository.delete(project);
    await this.eventBus.publish(new ProjectDeletedEvent(project));
  }

  /**
   * Finish project formation
   */
  public async finishFormation(project: ProjectEntity): Promise<ProjectEntity> {
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    const roles = await this.roleRepository.findByProjectId(project.id);
    if (!roles.every(role => role.hasAssignee())) {
      throw new RoleNoUserAssignedException();
    }
    project.state = ProjectState.PEER_REVIEW;
    await project.persist();
    await this.eventBus.publish(
      new ProjectFormationFinishedEvent(project),
      new ProjectPeerReviewStartedEvent(project),
    );
    return project;
  }

  /**
   * Call to submit reviews over one's project peers.
   */
  public async submitPeerReviews(
    project: ProjectEntity,
    roles: RoleEntity[],
    senderRole: RoleEntity,
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
    const peerReviews: PeerReviewEntity[] = [];
    for (const [receiverRoleId, score] of peerReviewMap.entries()) {
      peerReviews.push(
        this.peerReviewRepository.createEntity({
          id: this.randomService.id(),
          senderRoleId: senderRole.id,
          receiverRoleId,
          score,
        }),
      );
    }
    await Promise.all(
      peerReviews.map(async peerReview => peerReview.persist()),
    );
    await this.eventBus.publish(
      new PeerReviewsSubmittedEvent(project, senderRole, peerReviews),
    );

    /* is final peer review? */
    if (roles.every(role => role.hasSubmittedPeerReviews)) {
      await this.finishPeerReview(project, roles);
      await this.eventBus.publish(
        new FinalPeerReviewSubmittedEvent(project, roles),
      );
    }
  }

  private isValidPeerReviewMap(
    peerReviewMap: ReadonlyMap<string, number>,
    senderRole: RoleEntity,
    roles: RoleEntity[],
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
    project: ProjectEntity,
    roles: RoleEntity[],
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
    const consensuality = this.consensualityModelService.computeConsensuality(
      projectPeerReviews,
    );
    project.consensuality = consensuality;

    if (this.shouldSkipManagerReview(project, consensuality)) {
      project.state = ProjectState.FINISHED;
      await project.persist();
      await this.eventBus.publish(
        new ProjectPeerReviewFinishedEvent(project, roles),
        new ProjectManagerReviewSkippedEvent(project),
        new ProjectFinishedEvent(project),
      );
    } else {
      project.state = ProjectState.MANAGER_REVIEW;
      await project.persist();
      await this.eventBus.publish(
        new ProjectPeerReviewFinishedEvent(project, roles),
        new ProjectManagerReviewStartedEvent(project),
      );
    }
  }

  private shouldSkipManagerReview(
    project: ProjectEntity,
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
  public async submitManagerReview(project: ProjectEntity): Promise<void> {
    if (!project.isManagerReviewState()) {
      throw new ProjectNotManagerReviewStateException();
    }
    project.state = ProjectState.FINISHED;
    await project.persist();
    await this.eventBus.publish(
      new ProjectManagerReviewFinishedEvent(project),
      new ProjectFinishedEvent(project),
    );
  }
}
