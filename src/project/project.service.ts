import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import {
  InsufficientPermissionsException,
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  RoleRepository,
  PeerReviews,
  RandomService,
  UserEntity,
  ContributionsModelService,
  TeamSpiritModelService,
} from '../common';

import { ProjectNotFormationStateException } from './exceptions/project-not-formation-state.exception';
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
  private readonly teamSpiritModelService: TeamSpiritModelService;

  public constructor(
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
    randomService: RandomService,
    contributionsModelService: ContributionsModelService,
    teamSpiritModelService: TeamSpiritModelService,
  ) {
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.randomService = randomService;
    this.contributionsModelService = contributionsModelService;
    this.teamSpiritModelService = teamSpiritModelService;
  }

  /**
   * Get projects
   */
  public async getProjects(
    authUser: UserEntity,
    query: GetProjectsQueryDto,
  ): Promise<ProjectDto[]> {
    const projects = await this.projectRepository.findPage(query);
    const projectDtos = projects.map(project =>
      new ProjectDtoBuilder(project)
        .exposeContributions(project.isOwner(authUser))
        .exposeTeamSpirit(project.isOwner(authUser))
        .build(),
    );
    return projectDtos;
  }

  /**
   * Get a project
   */
  public async getProject(
    authUser: UserEntity,
    id: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findOneOrFail({ id });
    const projectDto = new ProjectDtoBuilder(project)
      .exposeContributions(project.isOwner(authUser))
      .exposeTeamSpirit(project.isOwner(authUser))
      .build();
    return projectDto;
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
      contributions: null,
      teamSpirit: null,
    });
    await this.projectRepository.save(project);
    const projectDto = new ProjectDtoBuilder(project)
      .exposeContributions()
      .exposeTeamSpirit()
      .build();
    return projectDto;
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
    return new ProjectDtoBuilder(project)
      .exposeContributions()
      .exposeTeamSpirit()
      .build();
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
    return new ProjectDtoBuilder(project)
      .exposeContributions()
      .exposeTeamSpirit()
      .build();
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
      throw new InvalidPeerReviewsException();
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

    /* self review must be 0 */
    if (dto.peerReviews[authUserRole.id] !== 0) {
      throw new InvalidPeerReviewsException();
    }
    let otherRoles = await this.roleRepository.find({
      id: Not(authUserRole.id),
      projectId,
    });

    /* check if number of peer reviews matches the number of roles */
    if (otherRoles.length + 1 !== Object.values(dto.peerReviews).length) {
      throw new InvalidPeerReviewsException();
    }

    /* check if peer review ids match other role ids */
    for (const otherRole of otherRoles) {
      if (!dto.peerReviews[otherRole.id]) {
        throw new InvalidPeerReviewsException();
      }
    }

    authUserRole.peerReviews = dto.peerReviews;
    await this.roleRepository.save(authUserRole);

    /* is final peer review? */
    if (otherRoles.every(otherRole => otherRole.hasPeerReviews())) {
      /* compute relative contributions */
      const peerReviews: Record<string, PeerReviews> = {
        [authUserRole.id]: authUserRole.peerReviews,
      };
      for (const otherRole of otherRoles) {
        peerReviews[otherRole.id] = otherRole.peerReviews as PeerReviews;
        peerReviews[otherRole.id][otherRole.id] = 0;
      }
      project.contributions = this.contributionsModelService.computeContributions(
        peerReviews,
      );
      project.teamSpirit = this.teamSpiritModelService.computeTeamSpirit(
        peerReviews,
      );
      project.state = ProjectState.FINISHED;
      await this.projectRepository.save(project);
    }
  }
}
