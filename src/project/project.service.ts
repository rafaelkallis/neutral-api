import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import {
  InsufficientPermissionsException,
  ProjectEntity,
  ProjectState,
  ProjectRepository,
  RoleEntity,
  RoleRepository,
  PeerReviews,
  RandomService,
  UserEntity,
  ContributionsModelService,
  TeamSpiritModelService,
} from '../common';

import { ForbiddenProjectStateChangeException } from './exceptions/forbidden-project-state-change.exception';
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
        .exposeContributions(this.isProjectOwner(project, authUser))
        .exposeTeamSpirit(this.isProjectOwner(project, authUser))
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
      .exposeContributions(this.isProjectOwner(project, authUser))
      .exposeTeamSpirit(this.isProjectOwner(project, authUser))
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
    if (!this.isProjectOwner(project, authUser)) {
      throw new InsufficientPermissionsException();
    }
    if (dto.state) {
      const roles = await this.roleRepository.find({ projectId: project.id });
      if (!this.isValidProjectStateChange(project, roles, dto.state)) {
        throw new ForbiddenProjectStateChangeException();
      }
      if (this.isFromPeerReviewToFinished(project.state, dto.state)) {
        const peerReviews: Record<string, Record<string, number>> = {};
        for (const role of roles) {
          if (!role.peerReviews) {
            throw new Error();
          }
          peerReviews[role.id] = role.peerReviews;
          peerReviews[role.id][role.id] = 0;
        }
        project.contributions = this.contributionsModelService.computeContributions(
          peerReviews,
        );
      }
    }
    project.update(dto);
    await this.projectRepository.save(project);
    const projectDto = new ProjectDtoBuilder(project)
      .exposeContributions()
      .exposeTeamSpirit()
      .build();
    return projectDto;
  }

  private isValidProjectStateChange(
    project: ProjectEntity,
    roles: RoleEntity[],
    nextState: ProjectState,
  ): boolean {
    const curState = project.state;
    if (curState === nextState) {
      return true;
    }
    if (this.isFromFormationToPeerReview(curState, nextState)) {
      for (const role of roles) {
        if (!role.assigneeId) {
          throw new ForbiddenProjectStateChangeException();
        }
      }
      return true;
    }
    if (this.isFromPeerReviewToFinished(curState, nextState)) {
      for (const role of roles) {
        if (!role.peerReviews) {
          throw new ForbiddenProjectStateChangeException();
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Delete a project
   */
  public async deleteProject(authUser: UserEntity, id: string): Promise<void> {
    const project = await this.projectRepository.findOneOrFail({ id });
    if (!this.isProjectOwner(project, authUser)) {
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
    if (project.state !== ProjectState.PEER_REVIEW) {
      throw new InvalidPeerReviewsException();
    }

    const authUserRole = await this.roleRepository.findOne({
      projectId,
      assigneeId: authUser.id,
    });
    if (!authUserRole) {
      throw new InsufficientPermissionsException();
    }
    if (this.hasPeerReviews(authUserRole)) {
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
    if (otherRoles.every(this.hasPeerReviews)) {
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

  private isProjectOwner(project: ProjectEntity, user: UserEntity): boolean {
    return project.ownerId === user.id;
  }

  private hasPeerReviews(role: RoleEntity): boolean {
    return Boolean(role.peerReviews);
  }

  private isFromFormationToPeerReview(
    from: ProjectState,
    to: ProjectState,
  ): boolean {
    return from === ProjectState.FORMATION && to === ProjectState.PEER_REVIEW;
  }

  private isFromPeerReviewToFinished(
    from: ProjectState,
    to: ProjectState,
  ): boolean {
    return from === ProjectState.PEER_REVIEW && to === ProjectState.FINISHED;
  }
}
