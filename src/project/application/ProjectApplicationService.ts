import { Injectable, Inject } from '@nestjs/common';
import { InsufficientPermissionsException } from 'common';
import { UserModel } from 'user';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import { RoleRepository, ROLE_REPOSITORY } from 'role';

import { UserNotProjectOwnerException } from 'project/application/exceptions/UserNotProjectOwnerException';
import { CreateProjectDto } from 'project/application/dto/CreateProjectDto';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { UpdateProjectDto } from 'project/application/dto/UpdateProjectDto';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { ProjectDomainService } from 'project/domain/ProjectDomainService';
import { ProjectModel } from 'project/domain/ProjectModel';
import { InvalidProjectTypeQueryException } from 'project/application/exceptions/InvalidProjectTypeQueryException';

@Injectable()
export class ProjectApplicationService {
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly projectDomainService: ProjectDomainService;

  public constructor(
    @Inject(PROJECT_REPOSITORY) projectRepository: ProjectRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    projectDomainService: ProjectDomainService,
  ) {
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.projectDomainService = projectDomainService;
  }

  /**
   * Get projects
   */
  public async getProjects(
    authUser: UserModel,
    query: GetProjectsQueryDto,
  ): Promise<ProjectDto[]> {
    let projects: ProjectModel[] = [];
    switch (query.type) {
      case GetProjectsType.CREATED: {
        projects = await this.projectRepository.findByCreatorId(authUser.id);
        break;
      }
      case GetProjectsType.ASSIGNED: {
        const assignedRoles = await this.roleRepository.findByAssigneeId(
          authUser.id,
        );
        projects = await this.projectRepository.findByIds(
          assignedRoles.map(role => role.projectId),
        );
        break;
      }
      default: {
        throw new InvalidProjectTypeQueryException();
      }
    }
    return projects.map(project =>
      ProjectDto.builder()
        .project(project)
        .authUser(authUser)
        .build(),
    );
  }

  /**
   * Get a project
   */
  public async getProject(
    authUser: UserModel,
    id: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(id);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Create a project
   */
  public async createProject(
    authUser: UserModel,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectDto> {
    const project = await this.projectDomainService.createProject(
      createProjectDto,
      authUser,
    );
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Update a project
   */
  public async updateProject(
    authUser: UserModel,
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(id);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.projectDomainService.updateProject(project, updateProjectDto);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Delete a project
   */
  public async deleteProject(authUser: UserModel, id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.projectDomainService.deleteProject(project);
  }

  /**
   * Finish project formation
   */
  public async finishFormation(
    authUser: UserModel,
    id: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(id);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.projectDomainService.finishFormation(project);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Call to submit reviews over one's project peers.
   */
  public async submitPeerReviews(
    authUser: UserModel,
    projectId: string,
    dto: SubmitPeerReviewsDto,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(projectId);
    const roles = await this.roleRepository.findByProjectId(project.id);
    const authRole = roles.find(role => role.isAssignee(authUser));
    if (!authRole) {
      throw new InsufficientPermissionsException();
    }
    const peerReviewMap = new Map(Object.entries(dto.peerReviews));
    await this.projectDomainService.submitPeerReviews(
      project,
      roles,
      authRole,
      peerReviewMap,
    );
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Call to submit the manager review.
   */
  public async submitManagerReview(
    authUser: UserModel,
    projectId: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(projectId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.projectDomainService.submitManagerReview(project);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }
}
