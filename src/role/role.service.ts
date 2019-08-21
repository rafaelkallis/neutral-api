import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import {
  User,
  Role,
  UserRepository,
  ProjectRepository,
  ProjectState,
  RoleRepository,
  InsufficientPermissionsException,
  RandomService,
} from '../common';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';
import { ProjectOwnerAssignmentException } from './exceptions/project-owner-assignment.exception';
import { InvalidPeerReviewsException } from './exceptions/invalid-peer-reviews.exception';

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
  public async getRoles(dto: GetRolesQueryDto): Promise<Role[]> {
    await this.projectRepository.findOneOrFail({ id: dto.projectId });
    return this.roleRepository.find(dto);
  }

  /**
   * Get the role with the given id
   */
  public async getRole(id: string): Promise<Role> {
    return this.roleRepository.findOneOrFail(id);
  }

  /**
   * Create a role
   */
  public async createRole(authUser: User, dto: CreateRoleDto): Promise<Role> {
    const project = await this.projectRepository.findOneOrFail({
      id: dto.projectId,
    });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    if (dto.assigneeId) {
      if (dto.assigneeId === authUser.id) {
        throw new ProjectOwnerAssignmentException();
      }
      await this.userRepository.findOneOrFail({ id: dto.assigneeId });
    }
    const role = Role.from({
      id: this.randomService.id(),
      projectId: dto.projectId,
      assigneeId: dto.assigneeId || null,
      title: dto.title,
      description: dto.description,
    });
    return this.roleRepository.save(role);
  }

  /**
   * Update a role
   */
  public async updateRole(
    authUser: User,
    id: string,
    dto: UpdateRoleDto,
  ): Promise<Role> {
    const role = await this.roleRepository.findOneOrFail({ id });
    const project = await this.projectRepository.findOneOrFail({
      id: role.projectId,
    });
    if (project.ownerId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }
    if (dto.assigneeId && dto.assigneeId !== role.assigneeId) {
      await this.userRepository.findOneOrFail({ id: dto.assigneeId });
    }
    role.update(dto);
    return this.roleRepository.save(role);
  }

  /**
   * Delete a role
   */
  public async deleteRole(authUser: User, id: string): Promise<void> {
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
    authUser: User,
    id: string,
    dto: SubmitPeerReviewsDto,
  ): Promise<void> {
    const role = await this.roleRepository.findOneOrFail({ id });
    if (role.assigneeId !== authUser.id) {
      throw new InsufficientPermissionsException();
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
  }
}
