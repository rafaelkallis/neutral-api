import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InsufficientPermissionsException } from 'common';
import {
  UserRepository,
  InjectUserRepository,
} from 'user/domain/UserRepository';
import {
  ProjectRepository,
  InjectProjectRepository,
} from 'project/domain/ProjectRepository';

import { UserNotProjectOwnerException } from 'project/application/exceptions/UserNotProjectOwnerException';
import { CreateProjectDto } from 'project/application/dto/CreateProjectDto';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { UpdateProjectDto } from 'project/application/dto/UpdateProjectDto';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import { Project, CreateProjectOptions } from 'project/domain/Project';
import { InvalidProjectTypeQueryException } from 'project/application/exceptions/InvalidProjectTypeQueryException';
import { Id } from 'common/domain/value-objects/Id';
import { ProjectTitle } from 'project/domain/value-objects/ProjectTitle';
import { ProjectDescription } from 'project/domain/value-objects/ProjectDescription';
import { SkipManagerReview } from 'project/domain/value-objects/SkipManagerReview';
import { ContributionVisibility } from 'project/domain/value-objects/ContributionVisibility';
import { EventPublisherService, InjectEventPublisher } from 'event';
import { RoleDto } from 'project/application/dto/RoleDto';
import { NoAssigneeException } from 'project/application/exceptions/NoAssigneeException';
import { Email } from 'user/domain/value-objects/Email';
import { NewUserAssignedEvent } from 'project/domain/events/NewUserAssignedEvent';
import { GetRolesQueryDto } from 'project/application/dto/GetRolesQueryDto';
import { ExistingUserAssignedEvent } from 'project/domain/events/ExistingUserAssignedEvent';
import { User } from 'user/domain/User';
import {
  ContributionsComputer,
  InjectContributionsComputer,
} from 'project/domain/ContributionsComputer';
import {
  ConsensualityComputer,
  InjectConsensualityComputer,
} from 'project/domain/ConsensualityComputer';
import { RoleTitle } from 'project/domain/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/value-objects/RoleDescription';
import { PeerReviewScore } from 'project/domain/value-objects/PeerReviewScore';

@Injectable()
export class ProjectApplicationService {
  private readonly projectRepository: ProjectRepository;
  private readonly userRepository: UserRepository;
  private readonly eventPublisher: EventPublisherService;
  private readonly contributionsComputer: ContributionsComputer;
  private readonly consensualityComputer: ConsensualityComputer;

  public constructor(
    @InjectProjectRepository() projectRepository: ProjectRepository,
    @InjectUserRepository() userRepository: UserRepository,
    @InjectEventPublisher() eventPublisher: EventPublisherService,
    @InjectContributionsComputer() contributionsComputer: ContributionsComputer,
    @InjectConsensualityComputer() consensualityComputer: ConsensualityComputer,
  ) {
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
    this.eventPublisher = eventPublisher;
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
    let projects: Project[] = [];
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
  public async getProject(authUser: User, id: string): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(Id.from(id));
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Get roles of a particular project
   */
  public async getRoles(
    authUser: User,
    query: GetRolesQueryDto,
  ): Promise<RoleDto[]> {
    const projectId = Id.from(query.projectId);
    const project = await this.projectRepository.findById(projectId);
    return Promise.all(
      project.roles.toArray().map(async role =>
        RoleDto.builder()
          .role(role)
          .project(project)
          .projectRoles([...project.roles.toArray()])
          .authUser(authUser)
          .build(),
      ),
    );
  }

  /**
   * Get the role with the given id
   */
  public async getRole(authUser: User, rawRoleId: string): Promise<RoleDto> {
    const roleId = Id.from(rawRoleId);
    const project = await this.projectRepository.findByRoleId(roleId);
    const role = project.roles.find(roleId);
    return RoleDto.builder()
      .role(role)
      .project(project)
      .projectRoles([...project.roles.toArray()])
      .authUser(authUser)
      .addSubmittedPeerReviews(async () => [
        ...project.peerReviews.findBySenderRole(role.id),
      ])
      .build();
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
    await this.eventPublisher.publish(...project.getDomainEvents());
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Update a project
   */
  public async updateProject(
    authUser: User,
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(Id.from(id));
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const title = updateProjectDto.title
      ? ProjectTitle.from(updateProjectDto.title)
      : undefined;
    const description = updateProjectDto.description
      ? ProjectDescription.from(updateProjectDto.description)
      : undefined;
    project.update(title, description);
    await this.eventPublisher.publish(...project.getDomainEvents());
    await this.projectRepository.persist(project);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Delete a project
   */
  public async deleteProject(
    authUser: User,
    rawProjectId: string,
  ): Promise<void> {
    const projectId = Id.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    project.delete();
    await this.eventPublisher.publish(...project.getDomainEvents());
    await this.projectRepository.delete(project);
  }

  /**
   * Add a role
   */
  public async addRole(
    authUser: User,
    projectId: string,
    rawTitle: string,
    rawDescription: string,
  ): Promise<RoleDto> {
    const project = await this.projectRepository.findById(Id.from(projectId));
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const title = RoleTitle.from(rawTitle);
    const description = RoleDescription.from(rawDescription);
    const role = project.addRole(title, description);
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(...project.getDomainEvents());
    return RoleDto.builder()
      .role(role)
      .project(project)
      .projectRoles([...project.roles.toArray()])
      .authUser(authUser)
      .build();
  }

  /**
   * Update a role
   */
  public async updateRole(
    authUser: User,
    rawRoleId: string,
    rawTitle?: string,
    rawDescription?: string,
  ): Promise<RoleDto> {
    const roleId = Id.from(rawRoleId);
    const project = await this.projectRepository.findByRoleId(roleId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const roleToUpdate = project.roles.find(roleId);
    const title = rawTitle ? RoleTitle.from(rawTitle) : undefined;
    const description = rawDescription
      ? RoleDescription.from(rawDescription)
      : undefined;
    project.updateRole(roleId, title, description);
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(...project.getDomainEvents());
    return RoleDto.builder()
      .role(roleToUpdate)
      .project(project)
      .projectRoles([...project.roles.toArray()])
      .authUser(authUser)
      .build();
  }

  /**
   * Remove a role
   */
  public async removeRole(authUser: User, rawRoleId: string): Promise<void> {
    const roleId = Id.from(rawRoleId);
    const project = await this.projectRepository.findByRoleId(roleId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    project.removeRole(roleId);
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(...project.getDomainEvents());
  }

  /**
   * Assign user to a role
   */
  public async assignUserToRole(
    authUser: User,
    rawRoleId: string,
    rawAssigneeId?: string | null,
    rawAssigneeEmail?: string | null,
  ): Promise<RoleDto> {
    const roleId = Id.from(rawRoleId);
    const project = await this.projectRepository.findByRoleId(roleId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const roleToAssign = project.roles.find(roleId);
    if (!rawAssigneeId && !rawAssigneeEmail) {
      throw new NoAssigneeException();
    }
    let userToAssign: User | undefined = undefined;
    if (rawAssigneeId) {
      const assigneeId = Id.from(rawAssigneeId);
      userToAssign = await this.userRepository.findById(assigneeId);
      await this.eventPublisher.publish(
        new ExistingUserAssignedEvent(project, roleToAssign),
      );
    } else if (rawAssigneeEmail) {
      const assigneeEmail = Email.from(rawAssigneeEmail);
      const userExists = await this.userRepository.existsByEmail(assigneeEmail);
      if (userExists) {
        userToAssign = await this.userRepository.findByEmail(assigneeEmail);
        await this.eventPublisher.publish(
          new ExistingUserAssignedEvent(project, roleToAssign),
        );
      } else {
        const user = User.createEmpty(assigneeEmail);
        await this.userRepository.persist(user);
        await this.eventPublisher.publish(
          ...user.getDomainEvents(),
          new NewUserAssignedEvent(project, roleToAssign, assigneeEmail),
        );
        userToAssign = user;
      }
    }
    if (!userToAssign) {
      throw new InternalServerErrorException();
    }
    project.assignUserToRole(userToAssign, roleToAssign);
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(...project.getDomainEvents());
    return RoleDto.builder()
      .role(roleToAssign)
      .project(project)
      .projectRoles([...project.roles.toArray()])
      .authUser(authUser)
      .build();
  }

  /**
   * Finish project formation
   */
  public async finishFormation(
    authUser: User,
    rawProjectId: string,
  ): Promise<ProjectDto> {
    const projectId = Id.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    project.finishFormation();
    await this.eventPublisher.publish(...project.getDomainEvents());
    await this.projectRepository.persist(project);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Call to submit reviews over one's project peers.
   */
  public async submitPeerReviews(
    authUser: User,
    rawProjectId: string,
    dto: SubmitPeerReviewsDto,
  ): Promise<ProjectDto> {
    const projectId = Id.from(rawProjectId);
    const project = await this.projectRepository.findById(projectId);
    if (!project.roles.anyAssignedToUser(authUser)) {
      throw new InsufficientPermissionsException();
    }
    const authRole = project.roles.findByAssignee(authUser);
    const peerReviews: [Id, PeerReviewScore][] = Object.entries(
      dto.peerReviews,
    ).map(([receiverRoleId, score]) => [
      Id.from(receiverRoleId),
      PeerReviewScore.from(score),
    ]);
    project.submitPeerReviews(
      authRole,
      peerReviews,
      this.contributionsComputer,
      this.consensualityComputer,
    );
    await this.projectRepository.persist(project);
    await this.eventPublisher.publish(...project.getDomainEvents());
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }

  /**
   * Call to submit the manager review.
   */
  public async submitManagerReview(
    authUser: User,
    projectId: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(Id.from(projectId));
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    project.submitManagerReview();
    await this.eventPublisher.publish(...project.getDomainEvents());
    await this.projectRepository.persist(project);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }
}
