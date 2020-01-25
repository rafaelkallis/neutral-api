import { Injectable, Inject } from '@nestjs/common';
import { InsufficientPermissionsException } from 'common';
import { UserEntity } from 'user';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/repositories/project.repository';
import { RoleRepository, ROLE_REPOSITORY } from 'role';

import { UserNotProjectOwnerException } from 'project/exceptions/user-not-project-owner.exception';
import { CreateProjectDto } from 'project/dto/create-project.dto';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/dto/get-projects-query.dto';
import { UpdateProjectDto } from 'project/dto/update-project.dto';
import { ProjectDto } from 'project/dto/project.dto';
import { SubmitPeerReviewsDto } from 'project/dto/submit-peer-reviews.dto';
import { ProjectDomainService } from 'project/services/project-domain.service';
import { ProjectEntity } from 'project/entities/project.entity';
import { InvalidProjectTypeQueryException } from 'project/exceptions/invalid-project-type-query.exception';

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
    authUser: UserEntity,
    query: GetProjectsQueryDto,
  ): Promise<ProjectDto[]> {
    let projects: ProjectEntity[] = [];
    switch (query.type) {
      case GetProjectsType.CREATED: {
        projects = await this.projectRepository.findByOwnerId(authUser.id);
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
    authUser: UserEntity,
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
    authUser: UserEntity,
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
    authUser: UserEntity,
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(id);
    if (!project.isOwner(authUser)) {
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
  public async deleteProject(authUser: UserEntity, id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.projectDomainService.deleteProject(project);
  }

  /**
   * Finish project formation
   */
  public async finishFormation(
    authUser: UserEntity,
    id: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(id);
    if (!project.isOwner(authUser)) {
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
    authUser: UserEntity,
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
    authUser: UserEntity,
    projectId: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(projectId);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.projectDomainService.submitManagerReview(project);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }
}
