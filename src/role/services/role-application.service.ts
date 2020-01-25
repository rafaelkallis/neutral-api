import { Injectable, Inject } from '@nestjs/common';
import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import {
  ProjectRepository,
  UserNotProjectOwnerException,
  PROJECT_REPOSITORY,
} from 'project';
import {
  RoleRepository,
  ROLE_REPOSITORY,
} from 'role/repositories/role.repository';
import {
  PeerReviewRepository,
  PEER_REVIEW_REPOSITORY,
} from 'role/repositories/peer-review.repository';
import { RoleDto } from 'role/dto/role.dto';
import { GetRolesQueryDto } from 'role/dto/get-roles-query.dto';
import { CreateRoleDto } from 'role/dto/create-role.dto';
import { UpdateRoleDto } from 'role/dto/update-role.dto';
import { AssignmentDto } from 'role/dto/assignment.dto';
import { NoAssigneeException } from 'role/exceptions/no-assignee.exception';
import { RoleDomainService } from 'role/services/role-domain.service';

@Injectable()
export class RoleApplicationService {
  private readonly roleDomain: RoleDomainService;
  private readonly userRepository: UserRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly peerReviewRepository: PeerReviewRepository;

  public constructor(
    roleDomain: RoleDomainService,
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(PROJECT_REPOSITORY) projectRepository: ProjectRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(PEER_REVIEW_REPOSITORY) peerReviewRepository: PeerReviewRepository,
  ) {
    this.roleDomain = roleDomain;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.peerReviewRepository = peerReviewRepository;
  }

  /**
   * Get roles of a particular project
   */
  public async getRoles(
    authUser: UserEntity,
    query: GetRolesQueryDto,
  ): Promise<RoleDto[]> {
    const project = await this.projectRepository.findById(query.projectId);
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
  public async getRole(authUser: UserEntity, id: string): Promise<RoleDto> {
    const role = await this.roleRepository.findById(id);
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
   * Create a role
   */
  public async createRole(
    authUser: UserEntity,
    dto: CreateRoleDto,
  ): Promise<RoleDto> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    const role = await this.roleDomain.createRole(dto, project);
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    return RoleDto.builder()
      .role(role)
      .project(project)
      .projectRoles(projectRoles)
      .authUser(authUser)
      .build();
  }

  /**
   * Update a role
   */
  public async updateRole(
    authUser: UserEntity,
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findById(id);
    const project = await this.projectRepository.findById(role.projectId);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.roleDomain.updateRole(project, role, updateRoleDto);
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    return RoleDto.builder()
      .role(role)
      .project(project)
      .projectRoles(projectRoles)
      .authUser(authUser)
      .build();
  }

  /**
   * Delete a role
   */
  public async deleteRole(authUser: UserEntity, id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    const project = await this.projectRepository.findById(role.projectId);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.roleDomain.deleteRole(project, role);
  }

  /**
   * Assign user to a role
   */
  public async assignUser(
    authUser: UserEntity,
    id: string,
    dto: AssignmentDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findById(id);
    const project = await this.projectRepository.findById(role.projectId);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!dto.assigneeId && !dto.assigneeEmail) {
      throw new NoAssigneeException();
    }
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    if (dto.assigneeId) {
      const user = await this.userRepository.findById(dto.assigneeId);
      await this.roleDomain.assignUser(project, role, user, projectRoles);
    } else if (dto.assigneeEmail) {
      await this.roleDomain.assignUserByEmailAndCreateIfNotExists(
        project,
        role,
        dto.assigneeEmail,
        projectRoles,
      );
    }
    return RoleDto.builder()
      .role(role)
      .project(project)
      .projectRoles(projectRoles)
      .authUser(authUser)
      .build();
  }
}
