import { Injectable, Inject } from '@nestjs/common';
import { UserModel, UserRepository, USER_REPOSITORY } from 'user';
import { RoleModel } from 'role/domain/RoleModel';
import { RoleRepository, ROLE_REPOSITORY } from 'role/domain/RoleRepository';
import { CreateRoleOutsideFormationStateException } from 'role/domain/exceptions/CreateRoleOutsideFormationStateException';
import { AlreadyAssignedRoleSameProjectException } from 'role/domain/exceptions/AlreadyAssignedRoleSameProjectException';
import { EventPublisherService, InjectEventPublisher } from 'event';
import { RoleCreatedEvent } from 'role/domain/events/RoleCreatedEvent';
import { RoleUpdatedEvent } from 'role/domain/events/RoleUpdatedEvent';
import { ExistingUserAssignedEvent } from 'role/domain/events/ExistingUserAssignedEvent';
import { NewUserAssignedEvent } from 'role/domain/events/NewUserAssignedEvent';
import { RoleDeletedEvent } from 'role/domain/events/RoleDeletedEvent';
import { InvariantViolationException } from 'common';
import { ProjectModel } from 'project';
import { EmailService, EMAIL_SERVICE } from 'email';
import { UserUnassignedEvent } from 'role/domain/events/UserUnassignedEvent';
import { ProjectNotFormationStateException } from 'project/domain/exceptions/ProjectNotFormationStateException';
import { RoleModelFactoryService } from 'role/domain/RoleModelFactoryService';

export interface CreateRoleOptions {
  readonly title: string;
  readonly description: string;
}

export interface UpdateRoleOptions {
  readonly title?: string;
  readonly description?: string;
}

@Injectable()
export class RoleDomainService {
  private readonly eventPublisher: EventPublisherService;
  private readonly userRepository: UserRepository;
  private readonly roleRepository: RoleRepository;
  private readonly emailService: EmailService;
  private readonly roleModelFactory: RoleModelFactoryService;

  public constructor(
    @InjectEventPublisher() eventPublisher: EventPublisherService,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(EMAIL_SERVICE) emailService: EmailService,
    roleModelFactory: RoleModelFactoryService,
  ) {
    this.eventPublisher = eventPublisher;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.emailService = emailService;
    this.roleModelFactory = roleModelFactory;
  }

  /**
   * Create a role
   */
  public async createRole(
    createRoleOptions: CreateRoleOptions,
    project: ProjectModel,
  ): Promise<RoleModel> {
    if (!project.isFormationState()) {
      throw new CreateRoleOutsideFormationStateException();
    }
    const projectId = project.id;
    const title = createRoleOptions.title;
    const description = createRoleOptions.description;
    const role = this.roleModelFactory.createRole({
      projectId,
      title,
      description,
    });
    await this.roleRepository.persist(role);
    await this.eventPublisher.publish(new RoleCreatedEvent(project, role));
    return role;
  }

  /**
   * Update a role
   */
  public async updateRole(
    project: ProjectModel,
    role: RoleModel,
    updateRoleOptions: UpdateRoleOptions,
  ): Promise<void> {
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    Object.assign(role, updateRoleOptions);
    await this.roleRepository.persist(role);
    await this.eventPublisher.publish(new RoleUpdatedEvent(role));
  }

  /**
   * Delete a role
   */
  public async deleteRole(
    project: ProjectModel,
    role: RoleModel,
  ): Promise<void> {
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    await this.roleRepository.delete(role);
    await this.eventPublisher.publish(new RoleDeletedEvent(role));
  }

  /**
   * Assign user to a role
   */
  public async assignUser(
    project: ProjectModel,
    role: RoleModel,
    user: UserModel,
    projectRoles: RoleModel[],
  ): Promise<void> {
    if (!role.belongsToProject(project)) {
      throw new InvariantViolationException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    if (!role.isAssignee(user)) {
      if (projectRoles.some(r => r.isAssignee(user))) {
        throw new AlreadyAssignedRoleSameProjectException();
      }
      if (role.hasAssignee()) {
        await this.eventPublisher.publish(
          new UserUnassignedEvent(project, role),
        );
      }
      role.assigneeId = user.id;
      await this.roleRepository.persist(role);
      await this.eventPublisher.publish(
        new ExistingUserAssignedEvent(project, role),
      );
      await this.emailService.sendNewAssignmentEmail(user.email);
    }
  }

  /**
   * Create and assign a user.
   */
  public async assignUserByEmailAndCreateIfNotExists(
    project: ProjectModel,
    role: RoleModel,
    email: string,
    projectRoles: RoleModel[],
  ): Promise<void> {
    if (!role.belongsToProject(project)) {
      throw new InvariantViolationException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    const userExists = await this.userRepository.existsByEmail(email);
    if (userExists) {
      const user = await this.userRepository.findByEmail(email);
      await this.assignUser(project, role, user, projectRoles);
      return;
    }
    // TODO should this be in here?
    const userId = this.userRepository.createId();
    const createdAt = Date.now();
    const updatedAt = Date.now();
    const firstName = '';
    const lastName = '';
    const lastLoginAt = 0;
    const user = new UserModel(
      userId,
      createdAt,
      updatedAt,
      email,
      firstName,
      lastName,
      lastLoginAt,
    );
    await this.userRepository.persist(user);

    role.assigneeId = user.id;
    await this.roleRepository.persist(role);
    await this.eventPublisher.publish(
      new NewUserAssignedEvent(project, role, email),
    );
    await this.emailService.sendUnregisteredUserNewAssignmentEmail(user.email);
  }
}
