import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { InsufficientPermissionsException } from 'common';
import { UserModel, UserRepository, USER_REPOSITORY } from 'user';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';
import {
  RoleRepository,
  ROLE_REPOSITORY,
  PeerReviewRepository,
  PEER_REVIEW_REPOSITORY,
  RoleModel,
} from 'role';

import { UserNotProjectOwnerException } from 'project/application/exceptions/UserNotProjectOwnerException';
import { CreateProjectDto } from 'project/application/dto/CreateProjectDto';
import {
  GetProjectsQueryDto,
  GetProjectsType,
} from 'project/application/dto/GetProjectsQueryDto';
import { UpdateProjectDto } from 'project/application/dto/UpdateProjectDto';
import { ProjectDto } from 'project/application/dto/ProjectDto';
import { SubmitPeerReviewsDto } from 'project/application/dto/SubmitPeerReviewsDto';
import {
  ProjectModel,
  CreateProjectOptions,
} from 'project/domain/ProjectModel';
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
import { GetRolesQueryDto } from 'project/application/GetRolesQueryDto';
import { ExistingUserAssignedEvent } from 'project/domain/events/ExistingUserAssignedEvent';

@Injectable()
export class ProjectApplicationService {
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly userRepository: UserRepository;
  private readonly peerReviewRepository: PeerReviewRepository;
  private readonly eventPublisher: EventPublisherService;

  public constructor(
    @Inject(PROJECT_REPOSITORY) projectRepository: ProjectRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(PEER_REVIEW_REPOSITORY) peerReviewRepository: PeerReviewRepository,
    @InjectEventPublisher() eventPublisher: EventPublisherService,
  ) {
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.userRepository = userRepository;
    this.peerReviewRepository = peerReviewRepository;
    this.eventPublisher = eventPublisher;
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
    authUser: UserModel,
    query: GetRolesQueryDto,
  ): Promise<RoleDto[]> {
    const project = await this.projectRepository.findById(
      Id.from(query.projectId),
    );
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    return Promise.all(
      projectRoles.map(async role =>
        RoleDto.builder()
          .role(role)
          .project(project)
          .projectRoles(projectRoles)
          .authUser(authUser)
          .build(),
      ),
    );
  }

  /**
   * Get the role with the given id
   */
  public async getRole(authUser: UserModel, roleId: string): Promise<RoleDto> {
    const role = await this.roleRepository.findById(Id.from(roleId));
    const project = await this.projectRepository.findById(role.projectId);
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    return RoleDto.builder()
      .role(role)
      .project(project)
      .projectRoles(projectRoles)
      .authUser(authUser)
      .addSubmittedPeerReviews(async () =>
        this.peerReviewRepository.findBySenderRoleId(role.id),
      )
      .build();
  }

  /**
   * Create a project
   */
  public async createProject(
    authUser: UserModel,
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
    const project = ProjectModel.create(createProjectOptions);
    await this.eventPublisher.publish(...project.getDomainEvents());
    await this.projectRepository.persist(project);
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
  public async deleteProject(authUser: UserModel, id: string): Promise<void> {
    const project = await this.projectRepository.findById(Id.from(id));
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
    authUser: UserModel,
    projectId: string,
    title: string,
    description: string,
  ): Promise<RoleDto> {
    const project = await this.projectRepository.findById(Id.from(projectId));
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const roles = await this.roleRepository.findByProjectId(project.id);
    const role = project.addRole(title, description, roles);
    await this.roleRepository.persist(role);
    await this.eventPublisher.publish(...project.getDomainEvents());
    return RoleDto.builder()
      .role(role)
      .project(project)
      .projectRoles(roles)
      .authUser(authUser)
      .build();
  }

  /**
   * Update a role
   */
  public async updateRole(
    authUser: UserModel,
    roleId: string,
    title?: string,
    description?: string,
  ): Promise<RoleDto> {
    const project = await this.projectRepository.findByRoleId(Id.from(roleId));
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const roles = await this.roleRepository.findByProjectId(project.id);
    let roleToUpdate: RoleModel | undefined = undefined;
    for (const role of roles) {
      if (role.id.value === roleId) {
        roleToUpdate = role;
        break;
      }
    }
    if (!roleToUpdate) {
      throw new InternalServerErrorException();
    }
    project.updateRole(roleToUpdate, title, description);
    await this.projectRepository.persist(project);
    await this.roleRepository.persist(roleToUpdate);
    await this.eventPublisher.publish(...project.getDomainEvents());
    return RoleDto.builder()
      .role(roleToUpdate)
      .project(project)
      .projectRoles(roles)
      .authUser(authUser)
      .build();
  }

  /**
   * Remove a role
   */
  public async removeRole(authUser: UserModel, roleId: string): Promise<void> {
    const project = await this.projectRepository.findByRoleId(Id.from(roleId));
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const roles = await this.roleRepository.findByProjectId(project.id);
    let roleToRemove: RoleModel | undefined = undefined;
    for (const role of roles) {
      if (role.id.value === roleId) {
        roleToRemove = role;
        break;
      }
    }
    if (!roleToRemove) {
      throw new InternalServerErrorException();
    }
    project.removeRole(project, roleToRemove, roles);
    await this.projectRepository.persist(project);
    await this.roleRepository.delete(roleToRemove);
    await this.eventPublisher.publish(...project.getDomainEvents());
  }

  /**
   * Assign user to a role
   */
  public async assignUserToRole(
    authUser: UserModel,
    rawRoleId: string,
    rawAssigneeId?: string | null,
    rawAssigneeEmail?: string | null,
  ): Promise<RoleDto> {
    const roleId = Id.from(rawRoleId);
    const project = await this.projectRepository.findByRoleId(roleId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const roles = await this.roleRepository.findByProjectId(project.id);
    let roleToAssign: RoleModel | undefined = undefined;
    for (const role of roles) {
      if (role.id.equals(roleId)) {
        roleToAssign = role;
        break;
      }
    }
    if (!roleToAssign) {
      throw new InternalServerErrorException();
    }
    if (!rawAssigneeId && !rawAssigneeEmail) {
      throw new NoAssigneeException();
    }
    let userToAssign: UserModel | undefined = undefined;
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
        const user = UserModel.createEmpty(assigneeEmail);
        await this.userRepository.persist(user);
        await this.eventPublisher.publish(
          ...user.getDomainEvents(),
          new NewUserAssignedEvent(project, roleToAssign, assigneeEmail),
        );
      }
    }
    if (!userToAssign) {
      throw new InternalServerErrorException();
    }
    project.assignUserToRole(userToAssign, roleToAssign, roles);
    await this.projectRepository.persist(project);
    await this.roleRepository.persist(roleToAssign);
    await this.eventPublisher.publish(...project.getDomainEvents());
    return RoleDto.builder()
      .role(roleToAssign)
      .project(project)
      .projectRoles(roles)
      .authUser(authUser)
      .build();
  }

  /**
   * Finish project formation
   */
  public async finishFormation(
    authUser: UserModel,
    id: string,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(Id.from(id));
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const roles = await this.roleRepository.findByProjectId(project.id);
    project.finishFormation(roles);
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
    authUser: UserModel,
    projectId: string,
    dto: SubmitPeerReviewsDto,
  ): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(Id.from(projectId));
    const roles = await this.roleRepository.findByProjectId(project.id);
    const authRole = roles.find(role => role.isAssignee(authUser));
    if (!authRole) {
      throw new InsufficientPermissionsException();
    }
    const peerReviewMap = new Map();
    for (const [receiverId, score] of Object.entries(dto.peerReviews)) {
      peerReviewMap.set(Id.from(receiverId), score);
    }
    const peerReviews = project.submitPeerReviews(
      authRole,
      peerReviewMap,
      roles,
    );
    await this.eventPublisher.publish(...project.getDomainEvents());
    await this.projectRepository.persist(project);
    await this.roleRepository.persist(...roles);
    await this.peerReviewRepository.persist(...peerReviews);
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
    const project = await this.projectRepository.findById(Id.from(projectId));
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const roles = await this.roleRepository.findByProjectId(project.id);
    project.submitManagerReview(roles);
    await this.eventPublisher.publish(...project.getDomainEvents());
    await this.projectRepository.persist(project);
    return ProjectDto.builder()
      .project(project)
      .authUser(authUser)
      .build();
  }
}
