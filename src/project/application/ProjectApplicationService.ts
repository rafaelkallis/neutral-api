import { Injectable } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { ReadonlyProject } from 'project/domain/project/Project';
import { InvalidProjectTypeQueryException } from 'project/application/exceptions/InvalidProjectTypeQueryException';
import { User } from 'user/domain/User';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { UserCollection } from 'user/domain/UserCollection';

@Injectable()
export class ProjectApplicationService {
  private readonly projectRepository: ProjectRepository;
  private readonly userRepository: UserRepository;
  private readonly objectMapper: ObjectMapper;

  public constructor(
    projectRepository: ProjectRepository,
    userRepository: UserRepository,
    objectMapper: ObjectMapper,
  ) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
    this.objectMapper = objectMapper;
  }

  /**
   * Get projects
   */
  public async getProjects(
    authUser: User,
    query: GetProjectsQueryDto,
  ): Promise<ProjectDto[]> {
    let projects: ReadonlyProject[] = [];
    switch (query.type) {
      case GetProjectsType.CREATED: {
        projects = await this.projectRepository.findByCreatorId(authUser.id);
        break;
      }
      case GetProjectsType.ASSIGNED: {
        projects = await this.projectRepository.findByRoleAssigneeId(
          authUser.id,
        );
        break;
      }
      default: {
        throw new InvalidProjectTypeQueryException();
      }
    }
    return this.objectMapper.mapArray(projects, ProjectDto, { authUser });
  }

  /**
   * Get a project
   */
  public async getProject(
    authUser: User,
    rawProjectId: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Finish project formation
   */
  public async finishFormation(
    authUser: User,
    rawProjectId: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    const assigneeIds = project.roles
      .toArray()
      .map((role) => role.assigneeId)
      .filter(Boolean) as UserId[];
    const assignees = await this.userRepository.findByIds(assigneeIds);
    project.finishFormation(
      new UserCollection(assignees.filter(Boolean) as User[]),
    );
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Call to submit the manager review.
   */
  public async submitManagerReview(
    authUser: User,
    rawProjectId: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    project.submitManagerReview();
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Cancel a project
   */
  public async cancelProject(
    authUser: User,
    rawProjectId: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    project.cancel();
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Archive a project
   */
  public async archiveProject(
    authUser: User,
    rawProjectId: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    project.archive();
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }
}
