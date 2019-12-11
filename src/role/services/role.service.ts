import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';

import {
  InsufficientPermissionsException,
  RandomService,
  EmailService,
} from '../../common';
import { UserEntity, UserRepository } from '../../user';
import { ProjectEntity, ProjectRepository } from '../../project';
import { RoleEntity } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { RoleDto, RoleDtoBuilder } from '../dto/role.dto';
import { GetRolesQueryDto } from '../dto/get-roles-query.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignmentDto } from '../dto/assignment.dto';
import { ProjectNotFormationStateException } from '../exceptions/project-not-formation-state.exception';
import { ProjectOwnerAssignmentException } from '../exceptions/project-owner-assignment.exception';
import { CreateRoleOutsideFormationStateException } from '../exceptions/create-role-outside-formation-state.exception';
import { UserNotRoleProjectOwnerException } from '../exceptions/user-not-role-project-owner.exception';
import { AlreadyAssignedRoleSameProjectException } from '../exceptions/already-assigned-role-same-project.exception';
import { NoAssigneeException } from '../exceptions/no-assignee.exception';

@Injectable()
export class RoleService {
  private readonly userRepository: UserRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly randomService: RandomService;
  private readonly emailService: EmailService;

  public constructor(
    userRepository: UserRepository,
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
    randomService: RandomService,
    emailService: EmailService,
  ) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.randomService = randomService;
    this.emailService = emailService;
  }

  /**
   * Get roles of a particular project
   */
  public async getRoles(
    authUser: UserEntity,
    query: GetRolesQueryDto,
  ): Promise<RoleDto[]> {
    const project = await this.projectRepository.findOneOrFail({
      id: query.projectId,
    });
    const roles = await this.roleRepository.find(query);
    return roles.map(role =>
      new RoleDtoBuilder(role, project, roles, authUser).build(),
    );
  }

  /**
   * Get the role with the given id
   */
  public async getRole(authUser: UserEntity, id: string): Promise<RoleDto> {
    const role = await this.roleRepository.findOneOrFail(id);
    const project = await this.projectRepository.findOneOrFail(role.projectId);
    // TODO: should not need another query
    const roles = await this.roleRepository.find({ projectId: project.id });
    return new RoleDtoBuilder(role, project, roles, authUser).build();
  }

  /**
   * Create a role
   */
  public async createRole(
    authUser: UserEntity,
    dto: CreateRoleDto,
  ): Promise<RoleDto> {
    const project = await this.projectRepository.findOneOrFail({
      id: dto.projectId,
    });
    if (!project.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    if (!project.isFormationState()) {
      throw new CreateRoleOutsideFormationStateException();
    }
    if (dto.assigneeId) {
      if (dto.assigneeId === authUser.id) {
        throw new ProjectOwnerAssignmentException();
      }
      await this.userRepository.findOneOrFail({ id: dto.assigneeId });
    }
    const role = RoleEntity.from({
      id: this.randomService.id(),
      projectId: dto.projectId,
      assigneeId: dto.assigneeId || null,
      title: dto.title,
      description: dto.description,
      contribution: null,
      peerReviews: [],
    });
    await this.roleRepository.save(role);
    // TODO: should not need another query
    const roles = await this.roleRepository.find({ projectId: project.id });
    return new RoleDtoBuilder(role, project, roles, authUser).build();
  }

  /**
   * Update a role
   */
  public async updateRole(
    authUser: UserEntity,
    id: string,
    body: UpdateRoleDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findOneOrFail({ id });
    const project = await this.projectRepository.findOneOrFail({
      id: role.projectId,
    });
    if (!project.isOwner(authUser)) {
      throw new UserNotRoleProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    role.update(body);
    await this.roleRepository.save(role);
    // TODO: should not need another query
    const roles = await this.roleRepository.find({ projectId: project.id });
    return new RoleDtoBuilder(role, project, roles, authUser).build();
  }

  /**
   * Delete a role
   */
  public async deleteRole(authUser: UserEntity, id: string): Promise<void> {
    const role = await this.roleRepository.findOneOrFail({ id });
    const project = await this.projectRepository.findOneOrFail({
      id: role.projectId,
    });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    await this.roleRepository.remove(role);
  }

  /**
   * Assign user to a role
   */
  public async assignUser(
    authUser: UserEntity,
    id: string,
    dto: AssignmentDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findOneOrFail({ id });
    const project = await this.projectRepository.findOneOrFail({
      id: role.projectId,
    });
    if (!project.isOwner(authUser)) {
      throw new UserNotRoleProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    if (!dto.assigneeId && !dto.assigneeEmail) {
      throw new NoAssigneeException();
    }
    if (dto.assigneeId && dto.assigneeId !== role.assigneeId) {
      const user = await this.userRepository.findOneOrFail({
        id: dto.assigneeId,
      });
      await this.assignExistingUser(project, role, user);
    }
    if (dto.assigneeEmail) {
      const user = await this.userRepository.findOne({
        email: dto.assigneeEmail,
      });
      if (!user) {
        await this.assignNewUser(project, role, dto.assigneeEmail);
      } else if (!role.isAssignee(user)) {
        await this.assignExistingUser(project, role, user);
      }
    }
    // TODO: should not need another query
    const roles = await this.roleRepository.find({ projectId: project.id });
    return new RoleDtoBuilder(role, project, roles, authUser).build();
  }

  /**
   * Assign a user that is already signed up.
   */
  private async assignExistingUser(
    project: ProjectEntity,
    role: RoleEntity,
    user: UserEntity,
  ): Promise<void> {
    const assignedRole = await this.roleRepository.findOne({
      id: Not(role.id),
      projectId: project.id,
      assigneeId: user.id,
    });
    if (assignedRole) {
      throw new AlreadyAssignedRoleSameProjectException();
    }
    role.assign(user);
    await this.roleRepository.save(role);
    await this.emailService.sendNewAssignmentEmail(user.email);
  }

  /**
   * Create and assign a user.
   */
  private async assignNewUser(
    project: ProjectEntity,
    role: RoleEntity,
    email: string,
  ): Promise<void> {
    const user = UserEntity.from({
      id: this.randomService.id(),
      email,
      firstName: '',
      lastName: '',
      lastLoginAt: 0,
    });
    await this.userRepository.save(user);

    role.assign(user);
    await this.roleRepository.save(role);
    await this.emailService.sendUnregisteredUserNewAssignmentEmail(user.email);
  }
}
