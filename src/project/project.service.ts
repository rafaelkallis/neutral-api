import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import {
  InsufficientPermissionsException,
  ProjectEntity,
  ProjectState,
  ContributionVisibility,
  SkipManagerReview,
  ProjectRepository,
  RoleEntity,
  RoleRepository,
  PeerReviewEntity,
  RandomService,
  UserEntity,
  ContributionsModelService,
  ConsensualityModelService,
} from '../common';

import { ProjectNotFormationStateException } from './exceptions/project-not-formation-state.exception';
import { ProjectNotPeerReviewStateException } from './exceptions/project-not-peer-review-state.exception';
import { ProjectNotManagerReviewStateException } from './exceptions/project-not-manager-review-state.exception';
import { RoleNoUserAssignedException } from './exceptions/role-no-user-assigned.exception';
import { InvalidPeerReviewsException } from './exceptions/invalid-peer-reviews.exception';
import { PeerReviewsAlreadySubmittedException } from './exceptions/peer-reviews-already-submitted.exception';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetProjectsQueryDto } from './dto/get-projects-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectDto, ProjectDtoBuilder } from './dto/project.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';

@Injectable()
export class ProjectService {
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly randomService: RandomService;
  private readonly contributionsModelService: ContributionsModelService;
  private readonly consensualityModelService: ConsensualityModelService;

  public constructor(
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
    randomService: RandomService,
    contributionsModelService: ContributionsModelService,
    consensualityModelService: ConsensualityModelService,
  ) {
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
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
    const project = await this.projectRepository.findOneOrFail({ id });
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
      skipManagerReview: dto.skipManagerReview || SkipManagerReview.NO,
    });
    await this.projectRepository.save(project);
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
    const project = await this.projectRepository.findOneOrFail({ id });
    if (!project.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    project.update(dto);
    await this.projectRepository.save(project);
    return new ProjectDtoBuilder(project, authUser).build();
  }

  /**
   * Finish project formation
   */
  public async finishFormation(
    authUser: UserEntity,
    id: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (!project.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    const roles = await this.roleRepository.find({ projectId: project.id });
    for (const role of roles) {
      if (!role.hasAssignee()) {
        throw new RoleNoUserAssignedException();
      }
    }
    project.state = ProjectState.PEER_REVIEW;
    await this.projectRepository.save(project);
    return new ProjectDtoBuilder(project, authUser).build();
  }

  /**
   * Delete a project
   */
  public async deleteProject(authUser: UserEntity, id: string): Promise<void> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (!project.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    await this.projectRepository.remove(project);
  }

  /**
   * Call to submit reviews over one's project peers.
   */
  public async submitPeerReviews(
    authUser: UserEntity,
    projectId: string,
    dto: SubmitPeerReviewsDto,
  ): Promise<void> {
    const project = await this.projectRepository.findOneOrFail({
      id: projectId,
    });
    if (!project.isPeerReviewState()) {
      throw new ProjectNotPeerReviewStateException();
    }

    const authUserRole = await this.roleRepository.findOne({
      projectId,
      assigneeId: authUser.id,
    });
    if (!authUserRole) {
      throw new InsufficientPermissionsException();
    }
    if (authUserRole.hasPeerReviews()) {
      throw new PeerReviewsAlreadySubmittedException();
    }

    /* no self review */
    if (dto.peerReviews[authUserRole.id] !== undefined) {
      throw new InvalidPeerReviewsException();
    }
    const otherRoles = await this.roleRepository.find({
      id: Not(authUserRole.id),
      projectId,
    });

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

    for (const [revieweeRoleId, score] of Object.entries(dto.peerReviews)) {
      const peerReview = PeerReviewEntity.from({
        id: this.randomService.id(),
        reviewerRole: authUserRole,
        revieweeRoleId,
        score,
      });
      authUserRole.peerReviews.push(peerReview);
    }
    await this.roleRepository.save(authUserRole);

    const roles = [authUserRole, ...otherRoles];

    /* is final peer review? */
    if (roles.every(role => role.hasPeerReviews())) {
      await this.onFinalPeerReview(project, roles);
    }
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
      for (const peerReview of role.peerReviews) {
        const { revieweeRoleId, score } = peerReview;
        projectPeerReviews[role.id][revieweeRoleId] = score;
      }
    }
    const contributions = this.contributionsModelService.computeContributions(
      projectPeerReviews,
    );
    for (const role of roles) {
      role.contribution = contributions[role.id];
      await this.roleRepository.save(role);
    }
    project.consensuality = this.consensualityModelService.computeConsensuality(
      projectPeerReviews,
    );
    project.state = ProjectState.MANAGER_REVIEW;
    await this.projectRepository.save(project);
  }

  /**
   * Call to submit the manager review.
   */
  public async submitManagerReview(
    authUser: UserEntity,
    projectId: string,
  ): Promise<void> {
    const project = await this.projectRepository.findOneOrFail({
      id: projectId,
    });
    if (!project.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    if (!project.isManagerReviewState()) {
      throw new ProjectNotManagerReviewStateException();
    }
    project.state = ProjectState.FINISHED;
    await this.projectRepository.save(project);
  }
}
