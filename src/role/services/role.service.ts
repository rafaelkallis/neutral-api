import { Injectable, Inject } from '@nestjs/common';
import { RandomService } from 'common';
import { UserEntity, UserRepository, USER_REPOSITORY } from 'user';
import {
  ProjectEntity,
  ProjectRepository,
  UserNotProjectOwnerException,
  PROJECT_REPOSITORY,
} from 'project';
import { RoleEntity } from 'role/entities/role.entity';
import {
  RoleRepository,
  ROLE_REPOSITORY,
} from 'role/repositories/role.repository';
import {
  PeerReviewRepository,
  PEER_REVIEW_REPOSITORY,
} from 'role/repositories/peer-review.repository';
import { RoleDto, RoleDtoBuilder } from 'role/dto/role.dto';
import { GetRolesQueryDto } from 'role/dto/get-roles-query.dto';
import { CreateRoleDto } from 'role/dto/create-role.dto';
import { UpdateRoleDto } from 'role/dto/update-role.dto';
import { AssignmentDto } from 'role/dto/assignment.dto';
import { ProjectNotFormationStateException } from 'role/exceptions/project-not-formation-state.exception';
import { CreateRoleOutsideFormationStateException } from 'role/exceptions/create-role-outside-formation-state.exception';
import { AlreadyAssignedRoleSameProjectException } from 'role/exceptions/already-assigned-role-same-project.exception';
import { NoAssigneeException } from 'role/exceptions/no-assignee.exception';
import { EmailSender, EMAIL_SENDER } from 'email';

@Injectable()
export class RoleService {
  private readonly userRepository: UserRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly peerReviewRepository: PeerReviewRepository;
  private readonly randomService: RandomService;
  private readonly emailSender: EmailSender;

  public constructor(
    @Inject(USER_REPOSITORY) userRepository: UserRepository,
    @Inject(PROJECT_REPOSITORY) projectRepository: ProjectRepository,
    @Inject(ROLE_REPOSITORY) roleRepository: RoleRepository,
    @Inject(PEER_REVIEW_REPOSITORY) peerReviewRepository: PeerReviewRepository,
    @Inject(EMAIL_SENDER) emailSender: EmailSender,
    randomService: RandomService,
  ) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.peerReviewRepository = peerReviewRepository;
    this.emailSender = emailSender;
    this.randomService = randomService;
  }

  /**
   * Get roles of a particular project
   */
  public async getRoles(
    authUser: UserEntity,
    query: GetRolesQueryDto,
  ): Promise<RoleDto[]> {
    const project = await this.projectRepository.findOne(query.projectId);
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    return Promise.all(
      projectRoles.map(async role =>
        RoleDtoBuilder.of(role)
          .withProject(project)
          .withProjectRoles(projectRoles)
          .withAuthUser(authUser)
          .build(),
      ),
    );
  }

  /**
   * Get the role with the given id
   */
  public async getRole(authUser: UserEntity, id: string): Promise<RoleDto> {
    const role = await this.roleRepository.findOne(id);
    const project = await this.projectRepository.findOne(role.projectId);
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    return RoleDtoBuilder.of(role)
      .withProject(project)
      .withProjectRoles(projectRoles)
      .withAuthUser(authUser)
      .addSentPeerReviews(async () =>
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
    const project = await this.projectRepository.findOne(dto.projectId);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new CreateRoleOutsideFormationStateException();
    }
    if (dto.assigneeId) {
      await this.userRepository.findOne(dto.assigneeId);
    }
    const role = this.roleRepository.createEntity({
      id: this.randomService.id(),
      projectId: project.id,
      assigneeId: dto.assigneeId || null,
      title: dto.title,
      description: dto.description,
      contribution: null,
      hasSubmittedPeerReviews: false,
    });
    await role.persist();
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    return RoleDtoBuilder.of(role)
      .withProject(project)
      .withProjectRoles(projectRoles)
      .withAuthUser(authUser)
      .build();
  }

  /**
   * Update a role
   */
  public async updateRole(
    authUser: UserEntity,
    id: string,
    body: UpdateRoleDto,
  ): Promise<RoleDto> {
    const role = await this.roleRepository.findOne(id);
    const project = await this.projectRepository.findOne(role.projectId);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    Object.assign(role, body);
    await role.persist();
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    return RoleDtoBuilder.of(role)
      .withProject(project)
      .withProjectRoles(projectRoles)
      .withAuthUser(authUser)
      .build();
  }

  /**
   * Delete a role
   */
  public async deleteRole(authUser: UserEntity, id: string): Promise<void> {
    const role = await this.roleRepository.findOne(id);
    const project = await this.projectRepository.findOne(role.projectId);
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
    const role = await this.roleRepository.findOne(id);
    const project = await this.projectRepository.findOne(role.projectId);
    if (!project.isOwner(authUser)) {
      throw new UserNotProjectOwnerException();
    }
    if (!project.isFormationState()) {
      throw new ProjectNotFormationStateException();
    }
    if (!dto.assigneeId && !dto.assigneeEmail) {
      throw new NoAssigneeException();
    }
    const projectRoles = await this.roleRepository.findByProjectId(project.id);
    if (dto.assigneeId && dto.assigneeId !== role.assigneeId) {
      const user = await this.userRepository.findOne(dto.assigneeId);
      await this.assignExistingUser(project, role, user, projectRoles);
    }
    if (dto.assigneeEmail) {
      const doesUserExist = await this.userRepository.existsByEmail(
        dto.assigneeEmail,
      );
      if (doesUserExist) {
        const user = await this.userRepository.findByEmail(dto.assigneeEmail);
        if (!role.isAssignee(user)) {
          await this.assignExistingUser(project, role, user, projectRoles);
        }
      } else {
        await this.assignNewUser(project, role, dto.assigneeEmail);
      }
    }
    return RoleDtoBuilder.of(role)
      .withProject(project)
      .withProjectRoles(projectRoles)
      .withAuthUser(authUser)
      .build();
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
    role.assigneeId = user.id;
    await role.persist();
    await this.emailSender.sendNewAssignmentEmail(user.email);
  }

  /**
   * Create and assign a user.
   */
  private async assignNewUser(
    project: ProjectEntity,
    role: RoleEntity,
    email: string,
  ): Promise<void> {
    const user = this.userRepository.createEntity({
      id: this.randomService.id(),
      email,
      firstName: '',
      lastName: '',
      lastLoginAt: 0,
    });
    await user.persist();

    role.assigneeId = user.id;
    await role.persist();
    await this.emailSender.sendUnregisteredUserNewAssignmentEmail(user.email);
  }
}
