import { Injectable } from '@nestjs/common';
import { RandomService, EmailService } from 'common';
import { UserEntity, UserRepository } from 'user';
import {
  ProjectEntity,
  ProjectRepository,
  UserNotProjectOwnerException,
} from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import { RoleRepository } from 'role/repositories/role.repository';
import { RoleDto, RoleDtoBuilder } from 'role/dto/role.dto';
import { GetRolesQueryDto } from 'role/dto/get-roles-query.dto';
import { CreateRoleDto } from 'role/dto/create-role.dto';
import { UpdateRoleDto } from 'role/dto/update-role.dto';
import { AssignmentDto } from 'role/dto/assignment.dto';
import { ProjectNotFormationStateException } from 'role/exceptions/project-not-formation-state.exception';
import { CreateRoleOutsideFormationStateException } from 'role/exceptions/create-role-outside-formation-state.exception';
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
    const projectRoles = await project.getRoles();
    return Promise.all(
      projectRoles.map(async role =>
        new RoleDtoBuilder(role, project, projectRoles, authUser).build(),
      ),
    );
  }

  /**
   * Get the role with the given id
   */
  public async getRole(authUser: UserEntity, id: string): Promise<RoleDto> {
    const role = await this.roleRepository.findOne({ id });
    const project = await role.getProject();
    const projectRoles = await project.getRoles();
    return new RoleDtoBuilder(role, project, projectRoles, authUser)
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
      throw new UserNotProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new CreateRoleOutsideFormationStateException();
    }
    if (dto.assigneeId) {
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
    const projectRoles = await project.getRoles();
    return new RoleDtoBuilder(role, project, projectRoles, authUser).build();
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
      throw new UserNotProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    role.update(body);
    await this.roleRepository.update(role);
    const projectRoles = await project.getRoles();
    return new RoleDtoBuilder(role, project, projectRoles, authUser).build();
  }

  /**
   * Delete a role
   */
  public async deleteRole(authUser: UserEntity, id: string): Promise<void> {
    const role = await this.roleRepository.findOne({ id });
    const project = await role.getProject();
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
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
    const project = await role.getProject();
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    if (!dto.assigneeId && !dto.assigneeEmail) {
      throw new NoAssigneeException();
    }
    const projectRoles = await project.getRoles();
    if (dto.assigneeId && dto.assigneeId !== role.assigneeId) {
      const user = await this.userRepository.findOne({
        id: dto.assigneeId,
      });
      await this.assignExistingUser(project, role, user, projectRoles);
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
          await this.assignExistingUser(project, role, user, projectRoles);
        }
      } else {
        await this.assignNewUser(project, role, dto.assigneeEmail);
      }
    }
    return new RoleDtoBuilder(role, project, projectRoles, authUser).build();
  }

  /**
   * Assign a user that is already signed up.
   */
  private async assignExistingUser(
    project: ProjectEntity,
    role: RoleEntity,
    user: UserEntity,
    projectRoles: RoleEntity[],
  ): Promise<void> {
    if (projectRoles.some(r => r.isAssignee(user))) {
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
