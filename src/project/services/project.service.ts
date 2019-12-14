import { Injectable } from '@nestjs/common';
import { InsufficientPermissionsException, RandomService } from 'common';
import { UserEntity } from 'user';
import {
  ProjectEntity,
  ProjectState,
  ContributionVisibility,
  PeerReviewVisibility,
  SkipManagerReview,
} from 'project/entities/project.entity';
import { ProjectRepository } from 'project/repositories/project.repository';
import {
  RoleEntity,
  RoleRepository,
  PeerReviewEntity,
  PeerReviewRepository,
} from 'role';
import { ContributionsModelService } from './contributions-model.service';
import { ConsensualityModelService } from './consensuality-model.service';

import { UserNotProjectOwnerException } from 'project/exceptions/user-not-project-owner.exception';
import { ProjectNotFormationStateException } from 'project/exceptions/project-not-formation-state.exception';
import { ProjectNotPeerReviewStateException } from 'project/exceptions/project-not-peer-review-state.exception';
import { ProjectNotManagerReviewStateException } from 'project/exceptions/project-not-manager-review-state.exception';
import { RoleNoUserAssignedException } from 'project/exceptions/role-no-user-assigned.exception';
import { InvalidPeerReviewsException } from 'project/exceptions/invalid-peer-reviews.exception';
import { PeerReviewsAlreadySubmittedException } from 'project/exceptions/peer-reviews-already-submitted.exception';
import { CreateProjectDto } from 'project/dto/create-project.dto';
import { GetProjectsQueryDto } from 'project/dto/get-projects-query.dto';
import { UpdateProjectDto } from 'project/dto/update-project.dto';
import { ProjectDto, ProjectDtoBuilder } from 'project/dto/project.dto';
import { SubmitPeerReviewsDto } from 'project/dto/submit-peer-reviews.dto';

@Injectable()
export class ProjectService {
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly peerReviewRepository: PeerReviewRepository;
  private readonly randomService: RandomService;
  private readonly contributionsModelService: ContributionsModelService;
  private readonly consensualityModelService: ConsensualityModelService;

  public constructor(
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
    peerReviewRepository: PeerReviewRepository,
    randomService: RandomService,
    contributionsModelService: ContributionsModelService,
    consensualityModelService: ConsensualityModelService,
  ) {
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.peerReviewRepository = peerReviewRepository;
    this.randomService = randomService;
    this.contributionsModelService = contributionsModelService;
    this.consensualityModelService = consensualityModelService;
  }

  /**
   * Get projects
   */
  public async getProjects(
    authUser: UserEntity,
    query: GetProjectsQueryDto,
  ): Promise<ProjectDto[]> {
    const projects = await this.projectRepository.findPage(query);
    return projects.map(project =>
      new ProjectDtoBuilder(project, authUser).build(),
    );
  }

  /**
   * Get a project
   */
  public async getProject(
    authUser: UserEntity,
    id: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({ id });
    return new ProjectDtoBuilder(project, authUser).build();
  }

  /**
   * Create a project
   */
  public async createProject(
    authUser: UserEntity,
    dto: CreateProjectDto,
  ): Promise<ProjectDto> {
    const project = ProjectEntity.from({
      id: this.randomService.id(),
      ownerId: authUser.id,
      title: dto.title,
      description: dto.description,
      state: ProjectState.FORMATION,
      consensuality: null,
      contributionVisibility:
        dto.contributionVisibility || ContributionVisibility.SELF,
      peerReviewVisibility:
        dto.peerReviewVisibility || PeerReviewVisibility.SENT,
      skipManagerReview: dto.skipManagerReview || SkipManagerReview.NO,
    });
    await this.projectRepository.insert(project);
    return new ProjectDtoBuilder(project, authUser).build();
  }

  /**
   * Update a project
   */
  public async updateProject(
    authUser: UserEntity,
    id: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({ id });
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    project.update(dto);
    await this.projectRepository.update(project);
    return new ProjectDtoBuilder(project, authUser).build();
  }

  /**
   * Finish project formation
   */
  public async finishFormation(
    authUser: UserEntity,
    id: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({ id });
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    const roles = await project.getRoles();
    for (const role of roles) {
      if (!role.hasAssignee()) {
        throw new RoleNoUserAssignedException();
      }
    }
    project.state = ProjectState.PEER_REVIEW;
    await this.projectRepository.update(project);
    return new ProjectDtoBuilder(project, authUser).build();
  }

  /**
   * Delete a project
   */
  public async deleteProject(authUser: UserEntity, id: string): Promise<void> {
    const project = await this.projectRepository.findOne({ id });
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.projectRepository.delete(project);
  }

  /**
   * Call to submit reviews over one's project peers.
   */
  public async submitPeerReviews(
    authUser: UserEntity,
    projectId: string,
    dto: SubmitPeerReviewsDto,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({
      id: projectId,
    });
    if (!project.isPeerReviewState()) {
      throw new ProjectNotPeerReviewStateException();
    }

    const roles = await project.getRoles();
    const [authUserRole] = roles.filter(role => role.isAssignee(authUser));
    if (!authUserRole) {
      throw new InsufficientPermissionsException();
    }
    const authUserRoleSentPeerReviews = await this.peerReviewRepository.findBySenderRoleId(
      authUserRole.id,
    );
    if (authUserRoleSentPeerReviews.length > 0) {
      throw new PeerReviewsAlreadySubmittedException();
    }

    /* no self review */
    if (dto.peerReviews[authUserRole.id] !== undefined) {
      throw new InvalidPeerReviewsException();
    }
    const otherRoles = roles.filter(role => !role.isAssignee(authUser));

    /* check if number of peer reviews matches the number of roles */
    if (otherRoles.length !== Object.values(dto.peerReviews).length) {
      throw new InvalidPeerReviewsException();
    }

    /* check if peer review ids match other role ids */
    for (const otherRole of otherRoles) {
      if (!dto.peerReviews[otherRole.id]) {
        throw new InvalidPeerReviewsException();
      }
    }

    for (const [receiverRoleId, score] of Object.entries(dto.peerReviews)) {
      const peerReview = PeerReviewEntity.from({
        id: this.randomService.id(),
        senderRoleId: authUserRole.id,
        receiverRoleId,
        score,
      });
      authUserRoleSentPeerReviews.push(peerReview);
    }
    await this.peerReviewRepository.insert(authUserRoleSentPeerReviews);

    /* is final peer review? */
    if (await this.isFinalPeerReview(otherRoles)) {
      await this.onFinalPeerReview(project, roles);
    }
  }

  /**
   * Checks whether or not the given roles have finished peer review.
   */
  private async isFinalPeerReview(roles: RoleEntity[]): Promise<boolean> {
    let haveAllSentPeerReviews = true;
    for (const role of roles) {
      haveAllSentPeerReviews =
        // TODO replace by boolean field "did_submit_peer_review"
        haveAllSentPeerReviews &&
        (await this.peerReviewRepository.existsBySenderRoleId(role.id));
    }
    return haveAllSentPeerReviews;
  }

  /**
   * Gets called when final peer review is submitted for a team.
   */
  private async onFinalPeerReview(
    project: ProjectEntity,
    roles: RoleEntity[],
  ): Promise<void> {
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
      await this.roleRepository.update(role);
    }
    project.consensuality = this.consensualityModelService.computeConsensuality(
      projectPeerReviews,
    );
    switch (project.skipManagerReview) {
      case SkipManagerReview.YES: {
        project.state = ProjectState.FINISHED;
        break;
      }
      case SkipManagerReview.IF_CONSENSUAL: {
        project.state = this.consensualityModelService.isConsensual(
          project.consensuality,
        )
          ? ProjectState.FINISHED
          : ProjectState.MANAGER_REVIEW;
        break;
      }
      case SkipManagerReview.NO: {
        project.state = ProjectState.MANAGER_REVIEW;
        break;
      }
    }
    await this.projectRepository.update(project);
  }

  /**
   * Call to submit the manager review.
   */
  public async submitManagerReview(
    authUser: UserEntity,
    projectId: string,
  ): Promise<void> {
    const project = await this.projectRepository.findOne({
      id: projectId,
    });
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!project.isManagerReviewState()) {
      throw new ProjectNotManagerReviewStateException();
    }
    project.state = ProjectState.FINISHED;
    await this.projectRepository.update(project);
  }
}
