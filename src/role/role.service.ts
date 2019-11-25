import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';

import {
  UserEntity,
  RoleEntity,
  UserRepository,
  ProjectRepository,
  ProjectState,
  RoleRepository,
  InsufficientPermissionsException,
  RandomService,
} from '../common';
import { RoleDto, RoleDtoBuilder } from './dto/role.dto';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ProjectNotFormationStateException } from './exceptions/project-not-formation-state.exception';
import { ProjectOwnerAssignmentException } from './exceptions/project-owner-assignment.exception';
import { CreateRoleOutsideFormationStateException } from './exceptions/create-role-outside-formation-state.exception';
import { UserNotRoleProjectOwnerException } from './exceptions/user-not-role-project-owner.exception';
import { ProjectOwnerRoleAssignmentException } from './exceptions/project-owner-role-assignment.exception';
import { AlreadyAssignedRoleSameProjectException } from './exceptions/already-assigned-role-same-project.exception';

@Injectable()
export class RoleService {
  private readonly userRepository: UserRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly randomService: RandomService;

  public constructor(
    userRepository: UserRepository,
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
    randomService: RandomService,
  ) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.randomService = randomService;
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
      new RoleDtoBuilder(role)
        .exposeContribution(
          role.isAssignee(authUser) || project.isOwner(authUser),
        )
        .exposePeerReviews(
          role.isAssignee(authUser) || project.isOwner(authUser),
        )
        .build(),
    );
  }

  /**
   * Get the role with the given id
   */
  public async getRole(authUser: UserEntity, id: string): Promise<RoleDto> {
    const role = await this.roleRepository.findOneOrFail(id);
    const project = await this.projectRepository.findOneOrFail(role.projectId);
    return new RoleDtoBuilder(role)
      .exposeContribution(
        role.isAssignee(authUser) || project.isOwner(authUser),
      )
      .exposePeerReviews(role.isAssignee(authUser) || project.isOwner(authUser))
      .build();
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
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    if (project.state !== ProjectState.FORMATION) {
      throw new CreateRoleOutsideFormationStateException();
    }
    if (dto.assigneeId) {
      if (dto.assigneeId === authUser.id) {
        throw new ProjectOwnerAssignmentException();
      }
      await this.userRepository.findOneOrFail({ id: dto.assigneeId });
    }
    let role = RoleEntity.from({
      id: this.randomService.id(),
      projectId: dto.projectId,
      assigneeId: dto.assigneeId || null,
      title: dto.title,
      description: dto.description,
      contribution: null,
      peerReviews: [],
    });
    role = await this.roleRepository.save(role);
    const roleDto = new RoleDtoBuilder(role)
      .exposeContribution()
      .exposePeerReviews()
      .build();
    return roleDto;
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
    if (project.ownerId !== authUser.id) {
      throw new UserNotRoleProjectOwnerException();
    }
    if (project.state !== ProjectState.FORMATION) {
      throw new ProjectNotFormationStateException();
    }
    if (body.assigneeId && body.assigneeId !== role.assigneeId) {
      await this.userRepository.findOneOrFail({ id: body.assigneeId });
      if (body.assigneeId === project.ownerId) {
        throw new ProjectOwnerRoleAssignmentException();
      }
      const assignedRole = await this.roleRepository.findOne({
        id: Not(role.id),
        projectId: project.id,
        assigneeId: body.assigneeId,
      });
      if (assignedRole) {
        throw new AlreadyAssignedRoleSameProjectException();
      }
    }
    role.update(body);
    await this.roleRepository.save(role);
    return new RoleDtoBuilder(role)
      .exposeContribution()
      .exposePeerReviews()
      .build();
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
}
