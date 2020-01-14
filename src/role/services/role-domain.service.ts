import { Injectable, Inject } from '@nestjs/common';
import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import { RoleEntity } from 'role/entities/role.entity';
import {
  RoleRepository,
  ROLE_REPOSITORY,
} from 'role/repositories/role.repository';
import { ProjectNotFormationStateException } from 'role/exceptions/project-not-formation-state.exception';
import { CreateRoleOutsideFormationStateException } from 'role/exceptions/create-role-outside-formation-state.exception';
import { AlreadyAssignedRoleSameProjectException } from 'role/exceptions/already-assigned-role-same-project.exception';
import { EmailSender, EMAIL_SENDER } from 'email';
import { EventPublisher, InjectEventPublisher } from 'event';
import { RoleCreatedEvent } from 'role/events/role-created.event';
import { RoleUpdatedEvent } from 'role/events/role-updated.event';
import { ExistingUserAssignedEvent } from 'role/events/existing-user-assigned.event';
import { NewUserAssignedEvent } from 'role/events/new-user-assigned.event';
import { RoleDeletedEvent } from 'role/events/role-deleted.event';
import { InvariantViolationException } from 'common';
import { UserUnassignedEvent } from 'role/events/user-unassigned.event';
import { ProjectEntity } from 'project';

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
  private readonly eventPublisher: EventPublisher;
  private readonly userRepository: UserRepository;
  private readonly roleRepository: RoleRepository;
  private readonly emailSender: EmailSender;

  public constructor(
    @InjectEventPublisher() eventPublisher: EventPublisher,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(EMAIL_SENDER) emailSender: EmailSender,
  ) {
    this.eventPublisher = eventPublisher;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.emailSender = emailSender;
  }

  /**
   * Create a role
   */
  public async createRole(
    createRoleOptions: CreateRoleOptions,
    project: ProjectEntity,
  ): Promise<RoleEntity> {
    if (!project.isFormationState()) {
      throw new CreateRoleOutsideFormationStateException();
    }
    const roleId = this.roleRepository.createId();
    const role = RoleEntity.fromRole({
      id: roleId,
      projectId: project.id,
      assigneeId: null,
      title: createRoleOptions.title,
      description: createRoleOptions.description,
      contribution: null,
      hasSubmittedPeerReviews: false,
    });
    await this.roleRepository.persist(role);
    await this.eventPublisher.publish(new RoleCreatedEvent(project, role));
    return role;
  }

  /**
   * Update a role
   */
  public async updateRole(
    project: ProjectEntity,
    role: RoleEntity,
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
    project: ProjectEntity,
    role: RoleEntity,
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
    project: ProjectEntity,
    role: RoleEntity,
    user: UserEntity,
    projectRoles: RoleEntity[],
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
      await this.emailSender.sendNewAssignmentEmail(user.email);
    }
  }

  /**
   * Create and assign a user.
   */
  public async assignUserByEmailAndCreateIfNotExists(
    project: ProjectEntity,
    role: RoleEntity,
    email: string,
    projectRoles: RoleEntity[],
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
    const user = UserEntity.fromUser({
      id: userId,
      email,
      firstName: '',
      lastName: '',
      lastLoginAt: 0,
    });
    await this.userRepository.persist(user);

    role.assigneeId = user.id;
    await this.roleRepository.persist(role);
    await this.eventPublisher.publish(
      new NewUserAssignedEvent(project, role, email),
    );
    await this.emailSender.sendUnregisteredUserNewAssignmentEmail(user.email);
  }
}
