import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import {
  UserEntity,
  RoleEntity,
  PeerReviews,
  UserRepository,
  ProjectEntity,
  ProjectRepository,
  ProjectState,
  RoleRepository,
  InsufficientPermissionsException,
  RandomService,
  ContributionsModelService,
  TeamSpiritModelService,
} from '../common';
import { RoleDto, RoleDtoBuilder } from './dto/role.dto';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';
import { ProjectOwnerAssignmentException } from './exceptions/project-owner-assignment.exception';
import { InvalidPeerReviewsException } from './exceptions/invalid-peer-reviews.exception';
import { PeerReviewsAlreadySubmittedException } from './exceptions/peer-reviews-already-submitted.exception';
import { CreateRoleOutsideFormationStateException } from './exceptions/create-role-outside-formation-state.exception';

@Injectable()
export class RoleService {
  private readonly userRepository: UserRepository;
  private readonly projectRepository: ProjectRepository;
  private readonly roleRepository: RoleRepository;
  private readonly randomService: RandomService;
  private readonly contributionsModelService: ContributionsModelService;
  private readonly teamSpiritModelService: TeamSpiritModelService;

  public constructor(
    userRepository: UserRepository,
    projectRepository: ProjectRepository,
    roleRepository: RoleRepository,
    randomService: RandomService,
    contributionsModelService: ContributionsModelService,
    teamSpiritModelService: TeamSpiritModelService,
  ) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.roleRepository = roleRepository;
    this.randomService = randomService;
    this.contributionsModelService = contributionsModelService;
    this.teamSpiritModelService = teamSpiritModelService;
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
    const roleDtos = roles.map(role =>
      new RoleDtoBuilder(role)
        .exposePeerReviews(
          this.isRoleAssigneeOrProjectOwner(authUser, role, project),
        )
        .build(),
    );
    return roleDtos;
  }

  /**
   * Get the role with the given id
   */
  public async getRole(authUser: UserEntity, id: string): Promise<RoleDto> {
    const role = await this.roleRepository.findOneOrFail(id);
    const project = await this.projectRepository.findOneOrFail(role.projectId);
    const roleDto = new RoleDtoBuilder(role)
      .exposePeerReviews(
        this.isRoleAssigneeOrProjectOwner(authUser, role, project),
      )
      .build();
    return roleDto;
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
      peerReviews: null,
    });
    role = await this.roleRepository.save(role);
    const roleDto = new RoleDtoBuilder(role).exposePeerReviews().build();
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
    let role = await this.roleRepository.findOneOrFail({ id });
    const project = await this.projectRepository.findOneOrFail({
      id: role.projectId,
    });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    if (body.assigneeId && body.assigneeId !== role.assigneeId) {
      await this.userRepository.findOneOrFail({ id: body.assigneeId });
    }
    role.update(body);
    role = await this.roleRepository.save(role);
    const roleDto = new RoleDtoBuilder(role).exposePeerReviews().build();
    return roleDto;
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
   * Call to submit reviews over one's project peers.
   */
  public async submitPeerReviews(
    authUser: UserEntity,
    id: string,
    dto: SubmitPeerReviewsDto,
  ): Promise<void> {
    const role = await this.roleRepository.findOneOrFail({ id });
    if (role.assigneeId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    if (role.peerReviews) {
      throw new PeerReviewsAlreadySubmittedException();
    }
    const project = await this.projectRepository.findOneOrFail({
      id: role.projectId,
    });
    if (project.state !== ProjectState.PEER_REVIEW) {
      throw new InvalidPeerReviewsException();
    }

    /* self review must be 0 */
    if (dto.peerReviews[role.id] !== 0) {
      throw new InvalidPeerReviewsException();
    }
    let otherRoles = await this.roleRepository.find({
      id: Not(role.id),
      projectId: role.projectId,
    });

    /* check if number of peer reviews matches the number of roles */
    if (otherRoles.length + 1 !== Object.values(dto.peerReviews).length) {
      throw new InvalidPeerReviewsException();
    }

    /* check if peer review ids match other role ids */
    for (const otherRole of otherRoles) {
      if (!dto.peerReviews[otherRole.id]) {
        throw new InvalidPeerReviewsException();
      }
    }

    role.peerReviews = dto.peerReviews;
    await this.roleRepository.save(role);

    /* is final peer review? */
    if (otherRoles.every(otherRole => Boolean(otherRole.peerReviews))) {
      /* compute relative contributions */
      const peerReviews: Record<string, PeerReviews> = {
        [role.id]: role.peerReviews,
      };
      for (const otherRole of otherRoles) {
        peerReviews[otherRole.id] = otherRole.peerReviews as PeerReviews;
        peerReviews[otherRole.id][otherRole.id] = 0;
      }
      project.contributions = this.contributionsModelService.computeContributions(
        peerReviews,
      );
      project.teamSpirit = this.teamSpiritModelService.computeTeamSpirit(
        peerReviews,
      );
      project.state = ProjectState.FINISHED;
      await this.projectRepository.save(project);
    }
  }

  private isRoleAssigneeOrProjectOwner(
    user: UserEntity,
    role: RoleEntity,
    project: ProjectEntity,
  ): boolean {
    return role.assigneeId === user.id || project.ownerId === user.id;
  }
}
