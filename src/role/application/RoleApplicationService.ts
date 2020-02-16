import { Injectable, Inject } from '@nestjs/common';
import { UserModel, UserRepository, USER_REPOSITORY } from 'user';
import { UserNotProjectOwnerException } from 'project/application/exceptions/UserNotProjectOwnerException';
import { RoleRepository, ROLE_REPOSITORY } from 'role/domain/RoleRepository';
import {
  PeerReviewRepository,
  PEER_REVIEW_REPOSITORY,
} from 'role/domain/PeerReviewRepository';
import { RoleDto } from 'project/application/dto/RoleDto';
import { GetRolesQueryDto } from 'project/application/GetRolesQueryDto';
import { CreateRoleDto } from 'project/application/dto/CreateRoleDto';
import { UpdateRoleDto } from 'project/application/dto/UpdateRoleDto';
import { AssignmentDto } from 'project/application/dto/AssignmentDto';
import { NoAssigneeException } from 'project/application/exceptions/NoAssigneeException';
import { RoleDomainService } from 'role/domain/RoleDomainService';
import { Email } from 'user/domain/value-objects/Email';
import { Id } from 'common/domain/value-objects/Id';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from 'project/domain/ProjectRepository';

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
   * Create a role
   */
  public async createRole(
    authUser: UserModel,
    dto: CreateRoleDto,
  ): Promise<RoleDto> {
    const project = await this.projectRepository.findById(
      Id.from(dto.projectId),
    );
    if (!project.isCreator(authUser)) {
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
    authUser: UserModel,
    roleId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findById(Id.from(roleId));
    const project = await this.projectRepository.findById(role.projectId);
    if (!project.isCreator(authUser)) {
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
  public async deleteRole(authUser: UserModel, roleId: string): Promise<void> {
    const role = await this.roleRepository.findById(Id.from(roleId));
    const project = await this.projectRepository.findById(role.projectId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    await this.roleDomain.deleteRole(project, role);
  }

  /**
   * Assign user to a role
   */
  public async assignUser(
    authUser: UserModel,
    roleId: string,
    dto: AssignmentDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findById(Id.from(roleId));
    const project = await this.projectRepository.findById(role.projectId);
    if (!project.isCreator(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!dto.assigneeId && !dto.assigneeEmail) {
      throw new NoAssigneeException();
    }
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    if (dto.assigneeId) {
      const user = await this.userRepository.findById(Id.from(dto.assigneeId));
      await this.roleDomain.assignUser(project, role, user, projectRoles);
    } else if (dto.assigneeEmail) {
      await this.roleDomain.assignUserByEmailAndCreateIfNotExists(
        project,
        role,
        Email.from(dto.assigneeEmail),
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
