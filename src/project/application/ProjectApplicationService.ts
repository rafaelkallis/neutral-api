import { Injectable } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { ProjectRepository } from 'project/domain/project/ProjectRepository';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { ReadonlyProject } from 'project/domain/project/Project';
import { InvalidProjectTypeQueryException } from 'project/application/exceptions/InvalidProjectTypeQueryException';
import { User } from 'user/domain/User';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { InsufficientPermissionsException } from 'shared/exceptions/insufficient-permissions.exception';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectId } from 'project/domain/project/value-objects/ProjectId';
import { UserId } from 'user/domain/value-objects/UserId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { UserFactory } from 'user/application/UserFactory';
import { UserCollection } from 'user/domain/UserCollection';

@Injectable()
export class ProjectApplicationService {
  private readonly projectRepository: ProjectRepository;
  private readonly userRepository: UserRepository;
  private readonly objectMapper: ObjectMapper;
  private readonly contributionsComputer: ContributionsComputer;
  private readonly consensualityComputer: ConsensualityComputer;

  public constructor(
    projectRepository: ProjectRepository,
    userRepository: UserRepository,
    userFactory: UserFactory,
    objectMapper: ObjectMapper,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
    this.objectMapper = objectMapper;
    this.contributionsComputer = contributionsComputer;
    this.consensualityComputer = consensualityComputer;
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
   * Call to submit reviews over one's project peers.
   */
  public async submitPeerReviews(
    authUser: User,
    rawProjectId: string,
    dto: SubmitPeerReviewsDto,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    if (!project.roles.isAnyAssignedToUser(authUser)) {
      throw new InsufficientPermissionsException();
    }
    const authRole = project.roles.whereAssignee(authUser);
    const submittedPeerReviews = dto.asPeerReviewCollection(authRole.id);
    project.submitPeerReviews(
      submittedPeerReviews,
      this.contributionsComputer,
      this.consensualityComputer,
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
