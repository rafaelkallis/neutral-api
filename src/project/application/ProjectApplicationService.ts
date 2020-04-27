import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from 'user/domain/UserRepository';
import { ProjectRepository } from 'project/domain/ProjectRepository';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { UpdateProjectDto } from 'project/application/dto/UpdateProjectDto';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import {
  Project,
  CreateProjectOptions,
  ReadonlyProject,
} from 'project/domain/Project';
import { InvalidProjectTypeQueryException } from 'project/application/exceptions/InvalidProjectTypeQueryException';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { NoAssigneeException } from 'project/application/exceptions/NoAssigneeException';
import { Email } from 'user/domain/value-objects/Email';
import { NewUserAssignedEvent } from 'project/domain/events/NewUserAssignedEvent';
import { ExistingUserAssignedEvent } from 'project/domain/events/ExistingUserAssignedEvent';
import { User, ReadonlyUser } from 'user/domain/User';
import { ContributionsComputer } from 'project/domain/ContributionsComputer';
import { ConsensualityComputer } from 'project/domain/ConsensualityComputer';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';
import { InsufficientPermissionsException } from 'shared/exceptions/insufficient-permissions.exception';
import { CreateProjectDto } from 'project/application/dto/CreateProjectDto';
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { ProjectId } from 'project/domain/value-objects/ProjectId';
import { RoleId } from 'project/domain/value-objects/RoleId';
import { UserId } from 'user/domain/value-objects/UserId';
import { ProjectNotFoundException } from 'project/domain/exceptions/ProjectNotFoundException';
import { UserNotFoundException } from 'user/application/exceptions/UserNotFoundException';
import { DomainEventBroker } from 'shared/domain-event/application/DomainEventBroker';

@Injectable()
export class ProjectApplicationService {
  private readonly projectRepository: ProjectRepository;
  private readonly userRepository: UserRepository;
  private readonly objectMapper: ObjectMapper;
  private readonly domainEventBroker: DomainEventBroker;
  private readonly contributionsComputer: ContributionsComputer;
  private readonly consensualityComputer: ConsensualityComputer;

  public constructor(
    projectRepository: ProjectRepository,
    userRepository: UserRepository,
    domainEventBroker: DomainEventBroker,
    modelMapper: ObjectMapper,
    contributionsComputer: ContributionsComputer,
    consensualityComputer: ConsensualityComputer,
  ) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
    this.objectMapper = modelMapper;
    this.domainEventBroker = domainEventBroker;
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
    return projects.map((project) =>
      this.objectMapper.map(project, ProjectDto, { authUser }),
    );
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
   * Create a project
   */
  public async createProject(
    authUser: User,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectDto> {
    const createProjectOptions: CreateProjectOptions = {
      title: ProjectTitle.from(createProjectDto.title),
      description: ProjectDescription.from(createProjectDto.description),
      creator: authUser,
    };
    if (createProjectDto.skipManagerReview) {
      createProjectOptions.skipManagerReview = SkipManagerReview.from(
        createProjectDto.skipManagerReview,
      );
    }
    if (createProjectDto.contributionVisibility) {
      createProjectOptions.contributionVisibility = ContributionVisibility.from(
        createProjectDto.contributionVisibility,
      );
    }
    const project = Project.create(createProjectOptions);
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Update a project
   */
  public async updateProject(
    authUser: User,
    rawProjectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    const title = updateProjectDto.title
      ? ProjectTitle.from(updateProjectDto.title)
      : undefined;
    const description = updateProjectDto.description
      ? ProjectDescription.from(updateProjectDto.description)
      : undefined;
    project.update(title, description);
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

  /**
   * Add a role
   */
  public async addRole(
    authUser: User,
    rawProjectId: string,
    rawTitle: string,
    rawDescription: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    const title = RoleTitle.from(rawTitle);
    const description = RoleDescription.from(rawDescription);
    project.addRole(title, description);
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Update a role
   */
  public async updateRole(
    authUser: User,
    rawProjectId: string,
    rawRoleId: string,
    rawTitle?: string,
    rawDescription?: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const roleId = RoleId.from(rawRoleId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    const title = rawTitle ? RoleTitle.from(rawTitle) : undefined;
    const description = rawDescription
      ? RoleDescription.from(rawDescription)
      : undefined;
    project.updateRole(roleId, title, description);
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Remove a role
   */
  public async removeRole(
    authUser: User,
    rawProjectId: string,
    rawRoleId: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const roleId = RoleId.from(rawRoleId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    project.removeRole(roleId);
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Assign user to a role
   */
  public async assignUserToRole(
    authUser: User,
    rawProjectId: string,
    rawRoleId: string,
    rawAssigneeId?: string | null,
    rawAssigneeEmail?: string | null,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const roleId = RoleId.from(rawRoleId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    const roleToAssign = project.roles.find(roleId);
    if (!rawAssigneeId && !rawAssigneeEmail) {
      throw new NoAssigneeException();
    }
    let userToAssign: ReadonlyUser | undefined = undefined;
    if (rawAssigneeId) {
      const assigneeId = UserId.from(rawAssigneeId);
      const user = await this.userRepository.findById(assigneeId);
      if (!user) {
        throw new UserNotFoundException();
      }
      userToAssign = user;
      await this.domainEventBroker.publish(
        new ExistingUserAssignedEvent(project, roleToAssign),
      );
    } else if (rawAssigneeEmail) {
      const assigneeEmail = Email.from(rawAssigneeEmail);
      const userExists = await this.userRepository.existsByEmail(assigneeEmail);
      if (userExists) {
        userToAssign = await this.userRepository.findByEmail(assigneeEmail);
        if (!userToAssign) {
          throw new UserNotFoundException();
        }
        await this.domainEventBroker.publish(
          new ExistingUserAssignedEvent(project, roleToAssign),
        );
      } else {
        userToAssign = User.createInvited(assigneeEmail);
        await this.userRepository.persist(userToAssign);
        await this.domainEventBroker.publish(
          new NewUserAssignedEvent(project, roleToAssign, assigneeEmail),
        );
      }
    }
    if (!userToAssign) {
      // shouldn't be possible to get here
      throw new InternalServerErrorException();
    }
    project.assignUserToRole(userToAssign, roleToAssign.id);
    await this.projectRepository.persist(project);
    return this.objectMapper.map(project, ProjectDto, { authUser });
  }

  /**
   * Unassign the specified role.
   * @param authUser The authenticated user.
   * @param rawProjectId The raw project id.
   * @param rawRoleId The raw role id.
   */
  public async unassignRole(
    authUser: ReadonlyUser,
    rawProjectId: string,
    rawRoleId: string,
  ): Promise<ProjectDto> {
    const projectId = ProjectId.from(rawProjectId);
    const roleId = RoleId.from(rawRoleId);
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    project.assertCreator(authUser);
    project.unassignRole(roleId);
    await this.projectRepository.persist(project);
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
    project.finishFormation();
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
    const authRole = project.roles.findByAssignee(authUser);
    const peerReviews: [RoleId, PeerReviewScore][] = Object.entries(
      dto.peerReviews,
    ).map(([receiverRoleId, score]) => [
      RoleId.from(receiverRoleId),
      PeerReviewScore.from(score),
    ]);
    project.submitPeerReviews(
      authRole.id,
      peerReviews,
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
}
