import {
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Controller,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiImplicitParam,
  ApiImplicitQuery,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { Not } from 'typeorm';
import {
  ValidationPipe,
  AuthGuard,
  AuthUser,
  User,
  Role,
  UserRepository,
  ProjectRepository,
  RoleRepository,
  InsufficientPermissionsException,
  RandomService,
} from '../common';
import { GetRolesQueryDto } from './dto/get-roles-query.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { PatchRoleDto } from './dto/patch-role.dto';
import { SubmitPeerReviewsDto } from './dto/submit-peer-reviews.dto';
import { ProjectOwnerAssignmentException } from './exceptions/project-owner-assignment.exception';
import { InvalidPeerReviewsException } from './exceptions/invalid-peer-reviews.exception';

/**
 * Role Controller
 */
@Controller('roles')
@ApiUseTags('Roles')
export class RoleController {
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
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiImplicitQuery({ name: 'projectId' })
  @ApiOperation({ title: 'Get a list of roles for a project' })
  @ApiResponse({ status: 200, description: 'A list of roles' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  public async getRoles(
    @Query(ValidationPipe) queryDto: GetRolesQueryDto,
  ): Promise<Role[]> {
    const { projectId } = queryDto;
    await this.projectRepository.findOneOrFail(projectId);
    return this.roleRepository.find({ projectId });
  }

  /**
   * Get the role with the given id
   */
  @Get('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'id' })
  @ApiOperation({ title: 'Get a role' })
  @ApiResponse({ status: 200, description: 'A roles' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  public async getRole(@Param('id') id: string): Promise<Role> {
    return this.roleRepository.findOneOrFail(id);
  }

  /**
   * Create a role
   */
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Create a role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 403, description: 'User is not the project owner' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 404, description: 'Assignee not found' })
  public async createRole(
    @AuthUser() authUser: User,
    @Body(ValidationPipe) dto: CreateRoleDto,
  ): Promise<Role> {
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
  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Update a role' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Role updated succesfully' })
  @ApiResponse({
    status: 403,
    description: "Authenticated user is not the role's project owner",
  })
  public async patchRole(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: PatchRoleDto,
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
  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Delete a role' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({ status: 204, description: 'Role deleted succesfully' })
  @ApiResponse({
    status: 403,
    description: "Authenticated user is not the role's project owner",
  })
  public async deleteRole(
    @AuthUser() authUser: User,
    @Param('id') id: string,
  ): Promise<void> {
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
  @Post('/:id/submit-peer-reviews')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Submit peer reviews' })
  @ApiImplicitParam({ name: 'id' })
  @ApiResponse({
    status: 200,
    description: 'Peer reviews submitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid peer reviews' })
  public async submitPeerReviews(
    @AuthUser() authUser: User,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: SubmitPeerReviewsDto,
  ): Promise<void> {
    const role = await this.roleRepository.findOneOrFail({ id });
    if (role.assigneeId !== authUser.id) {
      throw new InsufficientPermissionsException();
    }

    /* if self review exists, it must be 0 */
    if (dto.peerReviews[role.id] && dto.peerReviews[role.id] !== 0) {
      throw new InvalidPeerReviewsException();
    }
    let otherRoles = await this.roleRepository.find({
      id: Not(role.id),
      projectId: role.projectId,
    });

    /* check if number of peer reviews matches the number of roles */
    if (otherRoles.length !== Object.values(dto.peerReviews).length) {
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
