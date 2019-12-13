import { Injectable } from '@nestjs/common';
import {
  InsufficientPermissionsException,
  RandomService,
  EmailService,
} from 'common';
import { UserEntity, UserRepository } from 'user';
import { ProjectEntity, ProjectRepository } from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import { RoleRepository } from 'role/repositories/role.repository';
import { RoleDto, RoleDtoBuilder } from 'role/dto/role.dto';
import { GetRolesQueryDto } from 'role/dto/get-roles-query.dto';
import { CreateRoleDto } from 'role/dto/create-role.dto';
import { UpdateRoleDto } from 'role/dto/update-role.dto';
import { AssignmentDto } from 'role/dto/assignment.dto';
import { ProjectNotFormationStateException } from 'role/exceptions/project-not-formation-state.exception';
import { ProjectOwnerAssignmentException } from 'role/exceptions/project-owner-assignment.exception';
import { CreateRoleOutsideFormationStateException } from 'role/exceptions/create-role-outside-formation-state.exception';
import { UserNotRoleProjectOwnerException } from 'role/exceptions/user-not-role-project-owner.exception';
import { AlreadyAssignedRoleSameProjectException } from 'role/exceptions/already-assigned-role-same-project.exception';
import { NoAssigneeException } from 'role/exceptions/no-assignee.exception';

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
    const project = await this.projectRepository.findOne({
      id: query.projectId,
    });
    const roles = await project.getRoles();
    // TODO sent peer reviews should be fetched, but inside builder?
    return Promise.all(
      roles.map(async role =>
        new RoleDtoBuilder(role, project, authUser).build(),
      ),
    );
  }

  /**
   * Get the role with the given id
   */
  public async getRole(authUser: UserEntity, id: string): Promise<RoleDto> {
    const role = await this.roleRepository.findOne({ id });
    // TODO role.project.roles possible?
    const project = await role.getProject();
    return new RoleDtoBuilder(role, project, authUser)
      .addSentPeerReviews(async () => role.getSentPeerReviews())
      .addReceivedPeerReviews(async () => role.getReceivedPeerReviews())
      .build();
  }

  /**
   * Create a role
   */
  public async createRole(
    authUser: UserEntity,
    dto: CreateRoleDto,
  ): Promise<RoleDto> {
    const project = await this.projectRepository.findOne({
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
      await this.userRepository.findOne({ id: dto.assigneeId });
    }
    const role = RoleEntity.from({
      id: this.randomService.id(),
      projectId: project.id,
      assigneeId: dto.assigneeId || null,
      title: dto.title,
      description: dto.description,
      contribution: null,
    });
    await this.roleRepository.insert(role);
    return new RoleDtoBuilder(role, project, authUser).build();
  }

  /**
   * Update a role
   */
  public async updateRole(
    authUser: UserEntity,
    id: string,
    body: UpdateRoleDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findOne({ id });
    const project = await role.getProject();
    if (!project.isOwner(authUser)) {
      throw new UserNotRoleProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    role.update(body);
    await this.roleRepository.update(role);
    // TODO: check if role.project.roles is possible
    return new RoleDtoBuilder(role, project, authUser).build();
  }

  /**
   * Delete a role
   */
  public async deleteRole(authUser: UserEntity, id: string): Promise<void> {
    const role = await this.roleRepository.findOne({ id });
    // TODO check if role.project.roles possible
    const project = await role.getProject();
    if (!project.isOwner(authUser)) {
      throw new InsufficientPermissionsException();
    }
    await this.roleRepository.delete(role);
  }

  /**
   * Assign user to a role
   */
  public async assignUser(
    authUser: UserEntity,
    id: string,
    dto: AssignmentDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findOne({ id });
    // TODO check if role.project.roles possible
    const project = await role.getProject();
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
      const user = await this.userRepository.findOne({
        id: dto.assigneeId,
      });
      await this.assignExistingUser(project, role, user);
    }
    if (dto.assigneeEmail) {
      const doesUserExist = await this.userRepository.exists({
        email: dto.assigneeEmail,
      });
      if (doesUserExist) {
        const user = await this.userRepository.findOne({
          email: dto.assigneeEmail,
        });
        if (!role.isAssignee(user)) {
          await this.assignExistingUser(project, role, user);
        }
      } else {
        await this.assignNewUser(project, role, dto.assigneeEmail);
      }
    }
    return new RoleDtoBuilder(role, project, authUser).build();
  }

  /**
   * Assign a user that is already signed up.
   */
  private async assignExistingUser(
    project: ProjectEntity,
    role: RoleEntity,
    user: UserEntity,
  ): Promise<void> {
    const roles = await project.getRoles();
    if (roles.some(role => role.isAssignee(user))) {
      throw new AlreadyAssignedRoleSameProjectException();
    }
    role.assign(user);
    await this.roleRepository.update(role);
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
    await this.userRepository.insert(user);

    role.assign(user);
    await this.roleRepository.update(role);
    await this.emailService.sendUnregisteredUserNewAssignmentEmail(user.email);
  }
}
